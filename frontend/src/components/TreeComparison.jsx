import React, { useState } from 'react';
import { GitCompare, Play, BarChart3, Users, CheckCircle, AlertCircle } from 'lucide-react';
import { phylogenyAPI } from '../services/api';

const TreeComparison = ({ sessionId, trees, onComparison, comparison }) => {
  const [isComparing, setIsComparing] = useState(false);
  const [error, setError] = useState('');
  const [selectedMethods, setSelectedMethods] = useState(['nj', 'ml']);

  const availableMethods = Object.keys(trees);

  const performComparison = async () => {
    if (selectedMethods.length < 2) {
      setError('Selecciona al menos 2 métodos para comparar');
      return;
    }

    setIsComparing(true);
    setError('');

    try {
      const response = await phylogenyAPI.compareTrees(sessionId, selectedMethods[0], selectedMethods[1]);

      if (response.status === 'success') {
        onComparison(response);
      }
    } catch (err) {
      console.error('Error comparing trees:', err);
      setError(
        err.response?.data?.error || err.message ||
        'Error durante la comparación. Por favor, inténtalo de nuevo.'
      );
    } finally {
      setIsComparing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Configuración de comparación */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Comparación de árboles filogenéticos
        </h2>
        
        <p className="text-gray-600 mb-6">
          Compara la topología y características de los árboles generados por diferentes métodos.
        </p>

        {availableMethods.length >= 2 ? (
          <div className="space-y-4">
            {/* Selector de métodos */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Métodos a comparar
              </label>
              <div className="grid grid-cols-2 gap-4">
                {availableMethods.map((method) => (
                  <label key={method} className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedMethods.includes(method)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedMethods(prev => [...prev, method]);
                        } else {
                          setSelectedMethods(prev => prev.filter(m => m !== method));
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-900">
                      {method.toUpperCase()} - {method === 'nj' ? 'Neighbor-Joining' : 'Máxima Verosimilitud'}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Botón de comparación */}
            <div className="flex items-center space-x-4">
              <button
                onClick={performComparison}
                disabled={isComparing || selectedMethods.length < 2}
                className="btn-primary flex items-center space-x-2"
              >
                <GitCompare className="h-4 w-4" />
                <span>Comparar árboles</span>
              </button>
              
              {selectedMethods.length < 2 && (
                <p className="text-sm text-amber-600">
                  Selecciona al menos 2 métodos para comparar
                </p>
              )}
            </div>

            {isComparing && (
              <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
                <div className="loader"></div>
                <div>
                  <p className="text-blue-900 font-medium">Comparando árboles...</p>
                  <p className="text-blue-700 text-sm">
                    Analizando topologías y calculando distancias Robinson-Foulds
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-amber-800">
              Se requieren al menos 2 árboles construidos para realizar comparaciones.
            </p>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-red-800">Error en comparación</h4>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* Resultados de comparación */}
      {comparison && (
        <ComparisonResults comparison={comparison} />
      )}
    </div>
  );
};

const ComparisonResults = ({ comparison }) => {
  const { comparison: data, method1, method2 } = comparison;

  return (
    <div className="space-y-6">
      {/* Resumen de similitud */}
      <div className="card">
        <div className="flex items-center space-x-3 mb-6">
          <CheckCircle className="h-6 w-6 text-green-600" />
          <h3 className="text-xl font-semibold text-gray-900">
            Resultados de la comparación
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center">
              <BarChart3 className="h-6 w-6 text-blue-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-blue-900">Similitud general</p>
                <p className="text-2xl font-bold text-blue-600">
                  {data.similarity_score?.similarity_percentage || 0}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Users className="h-6 w-6 text-green-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-green-900">Terminales comunes</p>
                <p className="text-2xl font-bold text-green-600">
                  {data.terminals?.total_common || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center">
              <GitCompare className="h-6 w-6 text-purple-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-purple-900">Distancia RF</p>
                <p className="text-2xl font-bold text-purple-600">
                  {data.rf_distance?.distance || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-sm text-gray-600">
          <p>
            Comparando: <strong>{method1?.toUpperCase()}</strong> vs <strong>{method2?.toUpperCase()}</strong>
          </p>
        </div>
      </div>

      {/* Análisis detallado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Terminales */}
        <div className="card">
          <h4 className="text-lg font-medium text-gray-900 mb-4">
            Análisis de terminales
          </h4>
          
          <div className="space-y-4">
            <div>
              <h5 className="text-sm font-medium text-green-800 mb-2">
                Terminales comunes ({data.terminals?.total_common || 0})
              </h5>
              <div className="bg-green-50 p-3 rounded max-h-32 overflow-y-auto custom-scrollbar">
                {data.terminals?.common?.length > 0 ? (
                  <div className="space-y-1">
                    {data.terminals.common.map((terminal, index) => (
                      <div key={index} className="text-xs font-mono text-green-700">
                        {terminal}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-green-600">No hay terminales comunes</p>
                )}
              </div>
            </div>

            {(data.terminals?.unique_tree1?.length > 0 || data.terminals?.unique_tree2?.length > 0) && (
              <div>
                <h5 className="text-sm font-medium text-amber-800 mb-2">
                  Terminales únicos
                </h5>
                <div className="space-y-2">
                  {data.terminals?.unique_tree1?.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-600">Solo en {method1?.toUpperCase()}:</p>
                      <div className="bg-amber-50 p-2 rounded">
                        {data.terminals.unique_tree1.map((terminal, index) => (
                          <div key={index} className="text-xs font-mono text-amber-700">
                            {terminal}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {data.terminals?.unique_tree2?.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-600">Solo en {method2?.toUpperCase()}:</p>
                      <div className="bg-amber-50 p-2 rounded">
                        {data.terminals.unique_tree2.map((terminal, index) => (
                          <div key={index} className="text-xs font-mono text-amber-700">
                            {terminal}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Topología */}
        <div className="card">
          <h4 className="text-lg font-medium text-gray-900 mb-4">
            Análisis topológico
          </h4>
          
          <div className="space-y-4">
            <div>
              <h5 className="text-sm font-medium text-gray-800 mb-2">
                Distancia Robinson-Foulds
              </h5>
              <div className="bg-gray-50 p-3 rounded">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Distancia:</p>
                    <p className="font-semibold">{data.rf_distance?.distance || 0}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Normalizada:</p>
                    <p className="font-semibold">
                      {((data.rf_distance?.normalized || 0) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {data.topology && (
              <div>
                <h5 className="text-sm font-medium text-gray-800 mb-2">
                  Características estructurales
                </h5>
                <div className="bg-gray-50 p-3 rounded">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Nodos internos {method1?.toUpperCase()}:</span>
                      <span className="font-semibold">{data.topology.internal_nodes_tree1}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Nodos internos {method2?.toUpperCase()}:</span>
                      <span className="font-semibold">{data.topology.internal_nodes_tree2}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Diferencia en profundidad:</span>
                      <span className="font-semibold">{data.topology.depth_difference}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Interpretación */}
      <div className="card">
        <h4 className="text-lg font-medium text-gray-900 mb-4">
          Interpretación de resultados
        </h4>
        
        <div className="space-y-3 text-sm">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded">
            <h5 className="font-medium text-blue-900 mb-1">Similitud general</h5>
            <p className="text-blue-800">
              {getSimilarityInterpretation(data.similarity_score?.similarity_percentage || 0)}
            </p>
          </div>
          
          <div className="p-3 bg-purple-50 border border-purple-200 rounded">
            <h5 className="font-medium text-purple-900 mb-1">Distancia Robinson-Foulds</h5>
            <p className="text-purple-800">
              {getRFInterpretation(data.rf_distance?.normalized || 0)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Funciones auxiliares para interpretación
const getSimilarityInterpretation = (percentage) => {
  if (percentage >= 90) return "Los árboles son muy similares, con topologías prácticamente idénticas.";
  if (percentage >= 70) return "Los árboles muestran buena concordancia, con algunas diferencias menores.";
  if (percentage >= 50) return "Los árboles tienen similitud moderada, con diferencias topológicas notables.";
  return "Los árboles muestran diferencias significativas en su topología.";
};

const getRFInterpretation = (normalized) => {
  if (normalized <= 0.1) return "Distancia muy baja: los árboles son topológicamente muy similares.";
  if (normalized <= 0.3) return "Distancia baja: diferencias menores en la agrupación de especies.";
  if (normalized <= 0.6) return "Distancia moderada: diferencias notables en la estructura del árbol.";
  return "Distancia alta: los árboles muestran topologías muy diferentes.";
};

export default TreeComparison;
