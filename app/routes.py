from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
from Bio import SeqIO, AlignIO
from Bio.Align import PairwiseAligner
from Bio.Phylo.TreeConstruction import DistanceCalculator, DistanceTreeConstructor
from Bio import Phylo
import os
import json
import uuid
from datetime import datetime

# Importar módulos existentes
from app.multiple_aligner import align_multiple_sequences
from app.tree_builder import construir_nj_tree
from app.ml_tree import construir_ml_tree
from app.tree_comparator import compare_trees, convert_newick_to_json

main = Blueprint('main', __name__)

# Almacenamiento temporal de sesiones
sessions = {}

@main.route('/api/upload_fasta', methods=['POST'])
def upload_fasta():
    """Subir un archivo FASTA con múltiples secuencias"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No se encontró archivo'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No se seleccionó archivo'}), 400
        
        if not file.filename.lower().endswith(('.fasta', '.fas', '.fa')):
            return jsonify({'error': 'El archivo debe ser formato FASTA'}), 400
        
        # Generar ID de sesión único
        session_id = str(uuid.uuid4())
        
        # Guardar archivo
        filename = secure_filename(file.filename)
        filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], f"{session_id}_{filename}")
        file.save(filepath)
        
        # Leer secuencias del archivo FASTA
        sequences = {}
        try:
            records = SeqIO.parse(filepath, 'fasta')
            for record in records:
                sequences[record.id] = {
                    'id': record.id,
                    'description': record.description,
                    'sequence': str(record.seq),
                    'length': len(record.seq)
                }
        except Exception as e:
            return jsonify({'error': f'Error al procesar archivo FASTA: {str(e)}'}), 400
        
        if len(sequences) < 3:
            return jsonify({'error': 'Se requieren al menos 3 secuencias para construir árboles filogenéticos'}), 400
        
        # Almacenar datos de la sesión
        sessions[session_id] = {
            'filename': filename,
            'filepath': filepath,
            'sequences': sequences,
            'created_at': datetime.now().isoformat(),
            'alignment': None,
            'trees': {}
        }
        
        return jsonify({
            'session_id': session_id,
            'filename': filename,
            'sequences_count': len(sequences),
            'sequences': list(sequences.keys())
        })
        
    except Exception as e:
        return jsonify({'error': f'Error interno: {str(e)}'}), 500

@main.route('/api/align/<session_id>', methods=['POST'])
def align_sequences(session_id):
    """Generar alineamiento múltiple de las secuencias"""
    try:
        if session_id not in sessions:
            return jsonify({'error': 'Sesión no encontrada'}), 404
        
        session_data = sessions[session_id]
        sequences = session_data['sequences']
        
        # Crear archivo FASTA temporal para el alineamiento
        temp_fasta = os.path.join(current_app.config['RESULTS_FOLDER'], f"{session_id}_temp.fasta")
        with open(temp_fasta, 'w') as f:
            for seq_id, seq_data in sequences.items():
                f.write(f">{seq_id}\n{seq_data['sequence']}\n")
        
        # Realizar alineamiento múltiple
        aligned_file = os.path.join(current_app.config['RESULTS_FOLDER'], f"{session_id}_aligned.fasta")
        align_multiple_sequences(temp_fasta, aligned_file)
        
        # Leer el alineamiento resultante
        alignment_data = {}
        try:
            aligned_records = SeqIO.parse(aligned_file, 'fasta')
            for record in aligned_records:
                alignment_data[record.id] = str(record.seq)
        except Exception as e:
            return jsonify({'error': f'Error al leer alineamiento: {str(e)}'}), 500
        
        # Actualizar sesión
        sessions[session_id]['alignment'] = {
            'file_path': aligned_file,
            'sequences': alignment_data,
            'length': len(list(alignment_data.values())[0]) if alignment_data else 0
        }
        
        # Limpiar archivo temporal
        if os.path.exists(temp_fasta):
            os.remove(temp_fasta)
        
        return jsonify({
            'status': 'success',
            'alignment_length': sessions[session_id]['alignment']['length'],
            'aligned_sequences': alignment_data
        })
        
    except Exception as e:
        return jsonify({'error': f'Error en alineamiento: {str(e)}'}), 500

@main.route('/api/build_tree/<session_id>/<method>', methods=['POST'])
def build_tree(session_id, method):
    """Construir árbol filogenético usando NJ o ML"""
    try:
        if session_id not in sessions:
            return jsonify({'error': 'Sesión no encontrada'}), 404
        
        session_data = sessions[session_id]
        
        if not session_data.get('alignment'):
            return jsonify({'error': 'Primero debe realizar el alineamiento'}), 400
        
        if method not in ['nj', 'ml']:
            return jsonify({'error': 'Método debe ser "nj" o "ml"'}), 400
        
        alignment_file = session_data['alignment']['file_path']
        
        if method == 'nj':
            tree_newick, tree_file = construir_nj_tree(alignment_file, session_id)
        elif method == 'ml':
            tree_newick, tree_file = construir_ml_tree(alignment_file, session_id)
        
        # Convertir árbol a formato JSON para D3.js
        tree_json = convert_newick_to_json(tree_newick)
        
        # Guardar en sesión
        sessions[session_id]['trees'][method] = {
            'newick': tree_newick,
            'json': tree_json,
            'file_path': tree_file,
            'created_at': datetime.now().isoformat()
        }
        
        return jsonify({
            'status': 'success',
            'method': method,
            'newick': tree_newick,
            'tree_json': tree_json
        })
        
    except Exception as e:
        return jsonify({'error': f'Error construyendo árbol {method}: {str(e)}'}), 500

@main.route('/api/compare_trees/<session_id>', methods=['POST'])
def compare_trees_endpoint(session_id):
    """Comparar dos árboles filogenéticos"""
    try:
        if session_id not in sessions:
            return jsonify({'error': 'Sesión no encontrada'}), 404
        
        data = request.get_json()
        method1 = data.get('method1')
        method2 = data.get('method2')
        
        if not method1 or not method2:
            return jsonify({'error': 'Se requieren ambos métodos para comparar'}), 400
        
        session_data = sessions[session_id]
        trees = session_data.get('trees', {})
        
        if method1 not in trees or method2 not in trees:
            return jsonify({'error': 'Uno o ambos árboles no han sido construidos'}), 400
        
        tree1_newick = trees[method1]['newick']
        tree2_newick = trees[method2]['newick']
        
        # Realizar comparación
        comparison_result = compare_trees(tree1_newick, tree2_newick)
        
        return jsonify({
            'status': 'success',
            'method1': method1,
            'method2': method2,
            'comparison': comparison_result
        })
        
    except Exception as e:
        return jsonify({'error': f'Error comparando árboles: {str(e)}'}), 500

@main.route('/api/get_tree/<session_id>/<method>', methods=['GET'])
def get_tree(session_id, method):
    """Obtener árbol específico"""
    try:
        if session_id not in sessions:
            return jsonify({'error': 'Sesión no encontrada'}), 404
        
        session_data = sessions[session_id]
        trees = session_data.get('trees', {})
        
        if method not in trees:
            return jsonify({'error': f'Árbol {method} no encontrado'}), 404
        
        return jsonify({
            'status': 'success',
            'method': method,
            'newick': trees[method]['newick'],
            'tree_json': trees[method]['json'],
            'created_at': trees[method]['created_at']
        })
        
    except Exception as e:
        return jsonify({'error': f'Error obteniendo árbol: {str(e)}'}), 500

@main.route('/api/session/<session_id>', methods=['GET'])
def get_session_info(session_id):
    """Obtener información completa de una sesión"""
    try:
        if session_id not in sessions:
            return jsonify({'error': 'Sesión no encontrada'}), 404
        
        session_data = sessions[session_id]
        
        return jsonify({
            'session_id': session_id,
            'filename': session_data['filename'],
            'sequences_count': len(session_data['sequences']),
            'sequences': list(session_data['sequences'].keys()),
            'has_alignment': session_data.get('alignment') is not None,
            'available_trees': list(session_data.get('trees', {}).keys()),
            'created_at': session_data['created_at']
        })
        
    except Exception as e:
        return jsonify({'error': f'Error obteniendo información de sesión: {str(e)}'}), 500

@main.route('/api/sessions', methods=['GET'])
def list_sessions():
    """Listar todas las sesiones activas"""
    try:
        session_list = []
        for session_id, data in sessions.items():
            session_list.append({
                'session_id': session_id,
                'filename': data['filename'],
                'sequences_count': len(data['sequences']),
                'has_alignment': data.get('alignment') is not None,
                'trees_count': len(data.get('trees', {})),
                'created_at': data['created_at']
            })
        
        return jsonify({
            'sessions': session_list,
            'total': len(session_list)
        })
        
    except Exception as e:
        return jsonify({'error': f'Error listando sesiones: {str(e)}'}), 500

# Ruta de test para verificar que la API está funcionando
@main.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'message': 'Filogenia Dashboard API funcionando correctamente',
        'timestamp': datetime.now().isoformat()
    })

# Guia de endpoints de la API
@main.route('/')
def dashboard():
    return jsonify({
        'message': 'Filogenia Dashboard API',
        'version': '2.0',
        'endpoints': {
            'upload': '/api/upload_fasta',
            'align': '/api/align/<session_id>',
            'build_tree': '/api/build_tree/<session_id>/<method>',
            'compare_trees': '/api/compare_trees/<session_id>',
            'get_tree': '/api/get_tree/<session_id>/<method>',
            'session_info': '/api/session/<session_id>',
            'list_sessions': '/api/sessions',
            'health': '/api/health'
        }
    })
