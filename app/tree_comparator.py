from Bio import Phylo
from Bio.Phylo.TreeConstruction import DistanceCalculator
import json
import os
from io import StringIO

def compare_trees(tree1_newick, tree2_newick):
    """
    Comparar dos árboles filogenéticos y devolver similitudes/diferencias
    """
    try:
        # Leer árboles desde strings Newick
        tree1 = Phylo.read(StringIO(tree1_newick), "newick")
        tree2 = Phylo.read(StringIO(tree2_newick), "newick")
        
        # Extraer terminales (hojas) de ambos árboles
        terminals1 = [terminal.name for terminal in tree1.get_terminals()]
        terminals2 = [terminal.name for terminal in tree2.get_terminals()]
        
        # Analizar coincidencias y diferencias en terminales
        common_terminals = list(set(terminals1) & set(terminals2))
        unique_tree1 = list(set(terminals1) - set(terminals2))
        unique_tree2 = list(set(terminals2) - set(terminals1))
        
        # Calcular distancia Robinson-Foulds simplificada
        rf_distance = calculate_rf_distance(tree1, tree2)
        
        # Analizar topología
        topology_analysis = analyze_topology(tree1, tree2)
        
        # Comparar longitudes de ramas
        branch_comparison = compare_branch_lengths(tree1, tree2)
        
        # Extraer información de soporte (bootstrap)
        support_comparison = compare_support_values(tree1, tree2)
        
        comparison_result = {
            'terminals': {
                'common': common_terminals,
                'unique_tree1': unique_tree1,
                'unique_tree2': unique_tree2,
                'total_common': len(common_terminals),
                'total_unique_tree1': len(unique_tree1),
                'total_unique_tree2': len(unique_tree2)
            },
            'rf_distance': rf_distance,
            'topology': topology_analysis,
            'branch_lengths': branch_comparison,
            'support_values': support_comparison,
            'similarity_score': calculate_similarity_score(tree1, tree2, common_terminals)
        }
        
        return comparison_result
        
    except Exception as e:
        raise Exception(f"Error comparando árboles: {str(e)}")

def calculate_rf_distance(tree1, tree2):
    """
    Calcular distancia Robinson-Foulds simplificada
    """
    try:
        # Obtener clados de cada árbol
        clades1 = set()
        clades2 = set()
        
        for clade in tree1.find_clades():
            if not clade.is_terminal():
                terminals = sorted([t.name for t in clade.get_terminals()])
                if len(terminals) > 1:
                    clades1.add(tuple(terminals))
        
        for clade in tree2.find_clades():
            if not clade.is_terminal():
                terminals = sorted([t.name for t in clade.get_terminals()])
                if len(terminals) > 1:
                    clades2.add(tuple(terminals))
        
        # Calcular diferencia simétrica
        common_clades = clades1 & clades2
        unique_clades1 = clades1 - clades2
        unique_clades2 = clades2 - clades1
        
        rf_distance = len(unique_clades1) + len(unique_clades2)
        max_distance = len(clades1) + len(clades2)
        
        return {
            'distance': rf_distance,
            'max_distance': max_distance,
            'normalized': rf_distance / max_distance if max_distance > 0 else 0,
            'common_clades': len(common_clades),
            'unique_clades_tree1': len(unique_clades1),
            'unique_clades_tree2': len(unique_clades2)
        }
        
    except Exception:
        return {'distance': 0, 'normalized': 0, 'error': 'No se pudo calcular RF distance'}

def analyze_topology(tree1, tree2):
    """
    Analizar diferencias topológicas entre árboles
    """
    try:
        # Contar nodos internos
        internal_nodes1 = len([c for c in tree1.find_clades() if not c.is_terminal()])
        internal_nodes2 = len([c for c in tree2.find_clades() if not c.is_terminal()])
        
        # Calcular profundidad máxima
        max_depth1 = tree1.depths().get(max(tree1.depths().keys()), 0)
        max_depth2 = tree2.depths().get(max(tree2.depths().keys()), 0)
        
        return {
            'internal_nodes_tree1': internal_nodes1,
            'internal_nodes_tree2': internal_nodes2,
            'max_depth_tree1': max_depth1,
            'max_depth_tree2': max_depth2,
            'depth_difference': abs(max_depth1 - max_depth2)
        }
        
    except Exception:
        return {'error': 'No se pudo analizar topología'}

def compare_branch_lengths(tree1, tree2):
    """
    Comparar longitudes de ramas entre árboles
    """
    try:
        # Obtener longitudes de ramas
        branches1 = [c.branch_length for c in tree1.find_clades() if c.branch_length is not None]
        branches2 = [c.branch_length for c in tree2.find_clades() if c.branch_length is not None]
        
        if not branches1 or not branches2:
            return {'error': 'No hay longitudes de ramas disponibles'}
        
        import statistics
        
        return {
            'tree1': {
                'count': len(branches1),
                'mean': statistics.mean(branches1),
                'median': statistics.median(branches1),
                'min': min(branches1),
                'max': max(branches1)
            },
            'tree2': {
                'count': len(branches2),
                'mean': statistics.mean(branches2),
                'median': statistics.median(branches2),
                'min': min(branches2),
                'max': max(branches2)
            },
            'difference': {
                'mean_diff': abs(statistics.mean(branches1) - statistics.mean(branches2)),
                'median_diff': abs(statistics.median(branches1) - statistics.median(branches2))
            }
        }
        
    except Exception:
        return {'error': 'No se pudo comparar longitudes de ramas'}

def compare_support_values(tree1, tree2):
    """
    Comparar valores de soporte (bootstrap) entre árboles
    """
    try:
        # Obtener valores de confianza
        support1 = [c.confidence for c in tree1.find_clades() if c.confidence is not None]
        support2 = [c.confidence for c in tree2.find_clades() if c.confidence is not None]
        
        if not support1 or not support2:
            return {'info': 'No hay valores de soporte disponibles'}
        
        import statistics
        
        return {
            'tree1': {
                'count': len(support1),
                'mean': statistics.mean(support1),
                'median': statistics.median(support1),
                'min': min(support1),
                'max': max(support1)
            },
            'tree2': {
                'count': len(support2),
                'mean': statistics.mean(support2),
                'median': statistics.median(support2),
                'min': min(support2),
                'max': max(support2)
            },
            'difference': {
                'mean_diff': abs(statistics.mean(support1) - statistics.mean(support2)),
                'median_diff': abs(statistics.median(support1) - statistics.median(support2))
            }
        }
        
    except Exception:
        return {'info': 'No se pudo comparar valores de soporte'}

def calculate_similarity_score(tree1, tree2, common_terminals):
    """
    Calcular un puntaje de similitud general entre árboles
    """
    try:
        # Factores para el cálculo de similitud
        terminal_similarity = len(common_terminals) / max(
            len([t for t in tree1.get_terminals()]),
            len([t for t in tree2.get_terminals()])
        ) if common_terminals else 0
        
        # Considerar RF distance normalizada
        rf_info = calculate_rf_distance(tree1, tree2)
        rf_similarity = 1 - rf_info.get('normalized', 1)
        
        # Puntaje combinado (ponderado)
        overall_similarity = (terminal_similarity * 0.6) + (rf_similarity * 0.4)
        
        return {
            'terminal_similarity': round(terminal_similarity, 3),
            'topological_similarity': round(rf_similarity, 3),
            'overall_similarity': round(overall_similarity, 3),
            'similarity_percentage': round(overall_similarity * 100, 1)
        }
        
    except Exception:
        return {'overall_similarity': 0, 'error': 'No se pudo calcular similitud'}

def convert_newick_to_json(newick_string):
    """
    Convertir formato Newick a JSON para visualización con D3.js
    """
    try:
        tree = Phylo.read(StringIO(newick_string), "newick")
        
        def clade_to_dict(clade):
            """Convertir recursivamente un clado a diccionario"""
            result = {
                'name': clade.name if clade.name else f"Node_{id(clade)}",
                'branch_length': float(clade.branch_length) if clade.branch_length else 0.0,
                'confidence': float(clade.confidence) if clade.confidence else None,
                'is_terminal': clade.is_terminal()
            }
            
            if not clade.is_terminal():
                result['children'] = [clade_to_dict(child) for child in clade.clades]
            
            return result
        
        # Convertir árbol completo
        tree_json = clade_to_dict(tree.root)
        
        # Agregar metadatos del árbol
        tree_json['metadata'] = {
            'total_terminals': len(tree.get_terminals()),
            'total_nodes': len(list(tree.find_clades())),
            'max_depth': len(tree.get_path(tree.get_terminals()[0])) if tree.get_terminals() else 0
        }
        
        return tree_json
        
    except Exception as e:
        raise Exception(f"Error convirtiendo Newick a JSON: {str(e)}")

def save_comparison_result(comparison_result, output_path):
    """
    Guardar resultado de comparación en archivo JSON
    """
    try:
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(comparison_result, f, indent=2, ensure_ascii=False)
        return True
    except Exception as e:
        raise Exception(f"Error guardando comparación: {str(e)}")
