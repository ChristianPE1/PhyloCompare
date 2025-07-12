import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const TreeVisualization = ({ trees }) => {
  const njTreeRef = useRef(null);
  const mlTreeRef = useRef(null);

  useEffect(() => {
    if (trees.nj) {
      drawTree(njTreeRef.current, trees.nj.tree_json, 'NJ');
    }
  }, [trees.nj]);

  useEffect(() => {
    if (trees.ml) {
      drawTree(mlTreeRef.current, trees.ml.tree_json, 'ML');
    }
  }, [trees.ml]);

  const drawTree = (container, treeData, method) => {
    if (!container || !treeData) return;

    // Limpiar contenedor
    d3.select(container).selectAll("*").remove();

    const width = 500;
    const height = 400;
    const margin = { top: 20, right: 120, bottom: 20, left: 120 };

    const svg = d3.select(container)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("class", "phylo-tree");

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Crear layout de árbol
    const treeLayout = d3.tree()
      .size([height - margin.top - margin.bottom, width - margin.left - margin.right]);

    // Convertir datos a jerarquía de D3
    const root = d3.hierarchy(treeData);
    
    // Calcular posiciones
    treeLayout(root);

    // Dibujar enlaces
    g.selectAll(".link")
      .data(root.descendants().slice(1))
      .enter().append("path")
      .attr("class", "link")
      .attr("d", d => {
        return `M${d.y},${d.x}C${(d.y + d.parent.y) / 2},${d.x} ${(d.y + d.parent.y) / 2},${d.parent.x} ${d.parent.y},${d.parent.x}`;
      });

    // Dibujar nodos
    const node = g.selectAll(".node")
      .data(root.descendants())
      .enter().append("g")
      .attr("class", "node")
      .attr("transform", d => `translate(${d.y},${d.x})`);

    // Círculos para nodos
    node.append("circle")
      .attr("r", 4)
      .style("fill", d => d.children ? "#555" : "#2563eb")
      .style("stroke", "#fff")
      .style("stroke-width", 2);

    // Etiquetas
    node.append("text")
      .attr("dy", ".35em")
      .attr("x", d => d.children ? -8 : 8)
      .attr("text-anchor", d => d.children ? "end" : "start")
      .attr("class", "label")
      .text(d => d.data.name)
      .style("font-size", "11px")
      .style("font-family", "monospace");

    // Bootstrap values para nodos internos
    node.filter(d => d.children && d.data.confidence)
      .append("text")
      .attr("dy", "-0.8em")
      .attr("x", 0)
      .attr("text-anchor", "middle")
      .attr("class", "bootstrap")
      .text(d => Math.round(d.data.confidence))
      .style("font-size", "9px")
      .style("fill", "#666");

    // Título del árbol
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", 15)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .text(`Árbol ${method}`);
  };

  return (
    <div className="card">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Visualización de árboles
      </h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {trees.nj && (
          <div className="border border-gray-200 rounded-lg p-4">
            <div ref={njTreeRef}></div>
            <div className="mt-3 text-sm text-gray-600">
              <p><strong>Neighbor-Joining:</strong> Método de distancia rápido</p>
              <p>Nodos internos muestran valores de soporte</p>
            </div>
          </div>
        )}

        {trees.ml && (
          <div className="border border-gray-200 rounded-lg p-4">
            <div ref={mlTreeRef}></div>
            <div className="mt-3 text-sm text-gray-600">
              <p><strong>Máxima Verosimilitud:</strong> Método probabilístico</p>
              <p>Números indican valores de bootstrap</p>
            </div>
          </div>
        )}
      </div>

      {/* Información adicional */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-sm font-medium text-blue-900 mb-2">Cómo interpretar los árboles</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>Nodos terminales (hojas):</strong> Representan las secuencias originales</li>
          <li>• <strong>Nodos internos:</strong> Representan ancestros comunes hipotéticos</li>
          <li>• <strong>Longitud de ramas:</strong> Proporcional a la distancia evolutiva</li>
          <li>• <strong>Valores de soporte:</strong> Indican confianza en la agrupación (0-100%)</li>
        </ul>
      </div>
    </div>
  );
};

export default TreeVisualization;
