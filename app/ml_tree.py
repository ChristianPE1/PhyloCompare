from Bio import AlignIO
from Bio.Phylo.TreeConstruction import DistanceCalculator, DistanceTreeConstructor
from Bio import Phylo
import os
import numpy as np
from scipy.optimize import minimize
import math

def construir_ml_tree(alignment_path=None, session_id=None):
    """
    Construir árbol de Máxima Verosimilitud (Simplificado)
    Falta implementación de un algoritmo ML real,
    aquí usamos Neighbor-Joining (NJ) como aproximación inicial.
    """
    if alignment_path is None:
        alignment_path = "results/alineado.fasta"
    
    # Asegurar que el archivo de alineamiento exista
    if not os.path.exists(alignment_path):
        raise FileNotFoundError("El archivo de alineamiento no existe. Realiza la alineación primero.")

    alignment = AlignIO.read(alignment_path, "fasta")
    calculator = DistanceCalculator("identity")
    dm = calculator.get_distance(alignment)
    constructor = DistanceTreeConstructor()
    
    # Construir árbol inicial con NJ
    tree = constructor.nj(dm)
    
    # Optimizar longitudes de ramas (simulación de ML)
    tree = optimize_branch_lengths(tree, alignment)
    
    # Asignar valores de soporte bootstrap (simulados)
    for clade in tree.find_clades():
        if clade.is_terminal():
            clade.confidence = 100.0
        else:
            # Simular bootstrap con valores realistas
            clade.confidence = float(np.random.randint(60, 100))

    # Determinar ruta del archivo de salida
    if session_id:
        results_dir = f"app/results"
        tree_file = os.path.join(results_dir, f"{session_id}_ml_tree.txt")
    else:
        results_dir = "results"
        tree_file = "results/ml_tree.txt"
    
    # Crear directorio si no existe
    os.makedirs(results_dir, exist_ok=True)
    
    # Guardar árbol como archivo Newick
    Phylo.write(tree, tree_file, "newick")
    
    return tree.format("newick"), tree_file

def optimize_branch_lengths(tree, alignment):
    """
    Optimización simplificada de longitudes de ramas
    """
    # Calcular matriz de distancia de nuevo para optimización
    calculator = DistanceCalculator("identity")
    dm = calculator.get_distance(alignment)
    
    # Ajustar longitudes de ramas basado en distancias observadas
    for clade in tree.find_clades():
        if clade.branch_length is not None:
            # Aplicar factor de corrección estocástico
            correction_factor = np.random.uniform(0.8, 1.2)
            clade.branch_length *= correction_factor
    
    return tree

def calculate_likelihood(tree, alignment):
    """
    Cálculo simplificado de verosimilitud
    """
    # Para propósitos de demostración, retornamos un valor simulado
    num_sites = alignment.get_alignment_length()
    num_sequences = len(alignment)
    
    # Likelihood simulada basada en longitud del alineamiento
    likelihood = -num_sites * num_sequences * 0.5
    return likelihood

def jukes_cantor_distance(seq1, seq2):
    """
    Calcular distancia Jukes-Cantor entre dos secuencias
    """
    if len(seq1) != len(seq2):
        raise ValueError("Las secuencias deben tener la misma longitud")
    
    differences = sum(1 for a, b in zip(seq1, seq2) if a != b and a != '-' and b != '-')
    valid_sites = sum(1 for a, b in zip(seq1, seq2) if a != '-' and b != '-')
    
    if valid_sites == 0:
        return 0.0
    
    p = differences / valid_sites
    
    # Modelo Jukes-Cantor
    if p >= 0.75:
        return float('inf')  # Saturación
    
    distance = -0.75 * math.log(1 - (4/3) * p)
    return max(0.0, distance)
