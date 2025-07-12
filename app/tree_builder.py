from Bio import AlignIO
from Bio.Phylo.TreeConstruction import DistanceCalculator, DistanceTreeConstructor
from Bio import Phylo
from app.upgma import upgma
import os
import matplotlib.pyplot as plt

def calcular_matriz_distancia(path_alineado="results/alineado.fasta"):
    alignment = AlignIO.read(path_alineado, "fasta")
    calculator = DistanceCalculator("identity")
    dm = calculator.get_distance(alignment)

    labels = dm.names
    matrix = [[dm[i, j] for j in labels] for i in labels]
    return matrix, labels

def construir_upgma_tree():
    # Asegurar que el archivo de alineamiento exista
    if not os.path.exists("results/alineado.fasta"):
        raise FileNotFoundError("El archivo de alineamiento no existe. Realiza la alineación primero.")

    matrix, labels = calcular_matriz_distancia("results/alineado.fasta")
    tree = upgma(matrix, labels)

    # Guardar como texto plano (Newick-like)
    os.makedirs("results", exist_ok=True)
    path = "results/upgma_tree.txt"
    with open(path, "w") as f:
        f.write(str(tree))
    guardar_arbol_como_imagen("results/upgma_tree.txt", "static/arbol.png")

    return str(tree)

def construir_nj_tree(alignment_path=None, session_id=None):
    """
    Construir árbol Neighbor-Joining
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
    tree = constructor.nj(dm)

    # Determinar ruta del archivo de salida
    if session_id:
        results_dir = f"app/results"
        tree_file = os.path.join(results_dir, f"{session_id}_nj_tree.txt")
    else:
        results_dir = "results"
        tree_file = "results/nj_tree.txt"
    
    # Crear directorio si no existe
    os.makedirs(results_dir, exist_ok=True)
    
    # Guardar árbol como archivo Newick
    Phylo.write(tree, tree_file, "newick")
    
    # Generar imagen (opcional, para compatibilidad)
    if not session_id:
        guardar_arbol_como_imagen(tree_file, "static/arbol.png")

    return tree.format("newick"), tree_file

def guardar_arbol_como_imagen(path_newick, output_path="static/arbol.png"):
    tree = Phylo.read(path_newick, "newick")
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    fig = plt.figure(figsize=(8, 6))
    Phylo.draw(tree, do_show=False)
    plt.savefig(output_path)
    plt.close(fig)
