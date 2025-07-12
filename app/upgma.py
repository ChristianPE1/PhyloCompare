import numpy as np

class Node:
    def __init__(self, name, left=None, right=None, distance=0.0, count=1):
        self.name = name
        self.left = left
        self.right = right
        self.distance = distance
        self.count = count

    def __repr__(self):
        if self.left and self.right:
            return f"({self.left}:{self.distance:.2f},{self.right}:{self.distance:.2f})"
        return self.name

def upgma(distance_matrix, labels):
    clusters = [Node(name=label) for label in labels]
    n = len(clusters)
    matrix = np.array(distance_matrix)

    while len(clusters) > 1:
        # Buscar el par más cercano
        min_val = float('inf')
        x, y = 0, 1
        for i in range(len(matrix)):
            for j in range(i):
                if matrix[i][j] < min_val:
                    min_val = matrix[i][j]
                    x, y = i, j

        # Combinar clusters
        new_name = f"{clusters[x].name}+{clusters[y].name}"
        new_node = Node(new_name, left=clusters[x], right=clusters[y],
                        distance=min_val / 2,
                        count=clusters[x].count + clusters[y].count)

        # Nueva fila/columna de distancias
        new_row = []
        for k in range(len(matrix)):
            if k != x and k != y:
                d = (matrix[x][k] * clusters[x].count + matrix[y][k] * clusters[y].count) / \
                    (clusters[x].count + clusters[y].count)
                new_row.append(d)

        # Eliminar y reemplazar en matriz y clusters
        indices = sorted([x, y], reverse=True)
        for idx in indices:
            del clusters[idx]
            matrix = np.delete(matrix, idx, axis=0)
            matrix = np.delete(matrix, idx, axis=1)

        clusters.append(new_node)

        # Agregar nueva fila y columna
        new_row = np.array(new_row)
        matrix = np.vstack([matrix, new_row])
        new_col = np.append(new_row, 0.0).reshape(-1, 1)
        matrix = np.hstack([matrix, new_col])

    return clusters[0]  # el nodo raíz del árbol
