import React, { useState } from 'react';
import { TreePine, Play, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { phylogenyAPI } from '../services/api';

const TreeBuilder = ({ sessionId, onTreeBuilt, trees }) => {
  const [buildingTrees, setBuildingTrees] = useState({});
  const [errors, setErrors] = useState({});

  const buildTree = async (method) => {
    setBuildingTrees(prev => ({ ...prev, [method]: true }));
    setErrors(prev => ({ ...prev, [method]: '' }));

    try {
      const response = await phylogenyAPI.buildTree(sessionId, method);
      
      if (response.status === 'success') {
        onTreeBuilt(method, response);
      }
    } catch (err) {
      console.error(`Error building ${method} tree:`, err);
      setErrors(prev => ({
        ...prev,
        [method]: err.response?.data?.error || err.message ||
                  `Error construyendo árbol ${method.toUpperCase()}. Inténtalo de nuevo.`
      }));
    } finally {
      setBuildingTrees(prev => ({ ...prev, [method]: false }));
    }
  };

  const getMethodInfo = (method) => {
    const info = {
      nj: {
        name: 'Neighbor-Joining',
        description: 'Algoritmo rápido basado en distancias que produce árboles no enraizados.',
        complexity: 'Baja',
        time: '~30s'
      },
      ml: {
        name: 'Máxima Verosimilitud',
        description: 'Método probabilístico que busca el árbol más probable dados los datos.',
        complexity: 'Alta',
        time: '~2-5min'
      }
    };
    return info[method];
  };

  return (
    <div className="card">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Construcción de árboles filogenéticos
      </h2>
      
      <p className="text-gray-600 mb-6">
        Construye árboles filogenéticos usando diferentes algoritmos para comparar las topologías resultantes.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Neighbor-Joining */}
        <TreeMethodCard
          method="nj"
          methodInfo={getMethodInfo('nj')}
          isBuilding={buildingTrees.nj}
          isBuilt={!!trees.nj}
          error={errors.nj}
          onBuild={() => buildTree('nj')}
        />

        {/* Maximum Likelihood */}
        <TreeMethodCard
          method="ml"
          methodInfo={getMethodInfo('ml')}
          isBuilding={buildingTrees.ml}
          isBuilt={!!trees.ml}
          error={errors.ml}
          onBuild={() => buildTree('ml')}
        />
      </div>

      {/* Progress Summary */}
      {Object.keys(trees).length > 0 && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
            <div>
              <p className="text-green-900 font-medium">
                {Object.keys(trees).length} de 2 árboles construidos
              </p>
              <p className="text-green-700 text-sm">
                {Object.keys(trees).length >= 2 
                  ? 'Puedes proceder a comparar los árboles'
                  : 'Construye al menos 2 árboles para comparar'
                }
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const TreeMethodCard = ({ method, methodInfo, isBuilding, isBuilt, error, onBuild }) => {
  return (
    <div className="border border-gray-200 rounded-lg p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <TreePine className="h-6 w-6 text-blue-600" />
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              {methodInfo.name}
            </h3>
            <p className="text-sm text-gray-600">
              {method.toUpperCase()}
            </p>
          </div>
        </div>
        
        {isBuilt && (
          <CheckCircle className="h-6 w-6 text-green-500" />
        )}
      </div>

      <p className="text-gray-600 text-sm mb-4">
        {methodInfo.description}
      </p>

      <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
        <span>Complejidad: {methodInfo.complexity}</span>
        <span>Tiempo estimado: {methodInfo.time}</span>
      </div>

      {!isBuilt && !isBuilding && (
        <button
          onClick={onBuild}
          className="w-full btn-primary flex items-center justify-center space-x-2"
        >
          <Play className="h-4 w-4" />
          <span>Construir árbol</span>
        </button>
      )}

      {isBuilding && (
        <div className="w-full p-3 bg-blue-50 rounded-lg flex items-center space-x-3">
          <div className="loader"></div>
          <div>
            <p className="text-blue-900 text-sm font-medium">
              Construyendo árbol {method.toUpperCase()}...
            </p>
            <p className="text-blue-700 text-xs">
              Tiempo estimado: {methodInfo.time}
            </p>
          </div>
        </div>
      )}

      {isBuilt && (
        <div className="w-full p-3 bg-green-50 rounded-lg flex items-center space-x-3">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <div>
            <p className="text-green-900 text-sm font-medium">
              Árbol {method.toUpperCase()} completado
            </p>
            <p className="text-green-700 text-xs">
              Listo para visualización y comparación
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="w-full p-3 bg-red-50 rounded-lg flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-red-900 text-sm font-medium">Error</p>
            <p className="text-red-700 text-xs">{error}</p>
            <button
              onClick={onBuild}
              className="mt-2 text-xs text-red-800 underline hover:no-underline"
            >
              Intentar de nuevo
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TreeBuilder;
