import React, { useState } from 'react';
import { Play, CheckCircle, AlertCircle } from 'lucide-react';
import { phylogenyAPI } from '../services/api';

const AlignmentPanel = ({ sessionId, onAlignment }) => {
  const [isAligning, setIsAligning] = useState(false);
  const [alignmentData, setAlignmentData] = useState(null);
  const [error, setError] = useState('');

  const performAlignment = async () => {
    setIsAligning(true);
    setError('');

    try {
      const response = await phylogenyAPI.alignSequences(sessionId);
      
      if (response.status === 'success') {
        setAlignmentData(response);
        onAlignment();
      }
    } catch (err) {
      console.error('Error during alignment:', err);
      setError(
        err.response?.data?.error || err.message ||
        'Error durante el alineamiento. Por favor, inténtalo de nuevo.'
      );
    } finally {
      setIsAligning(false);
    }
  };

  return (
    <div className="card">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Alineamiento múltiple
      </h2>
      
      <p className="text-gray-600 mb-6">
        El alineamiento múltiple es necesario para identificar posiciones homólogas 
        entre las secuencias antes de construir los árboles filogenéticos.
      </p>

      {!alignmentData && !isAligning && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <button
            onClick={performAlignment}
            className="btn-primary flex items-center space-x-2"
            disabled={isAligning}
          >
            <Play className="h-4 w-4" />
            <span>Iniciar alineamiento</span>
          </button>
          
          <div className="text-sm text-gray-500">
            <p>Algoritmo: Alineamiento progresivo por pares</p>
          </div>
        </div>
      )}

      {isAligning && (
        <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
          <div className="loader"></div>
          <div>
            <p className="text-blue-900 font-medium">Realizando alineamiento...</p>
            <p className="text-blue-700 text-sm">
              Este proceso puede tomar unos momentos dependiendo del número de secuencias.
            </p>
          </div>
        </div>
      )}

      {alignmentData && (
        <div className="space-y-4">
          <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <div>
              <p className="text-green-900 font-medium">Alineamiento completado</p>
              <p className="text-green-700 text-sm">
                Longitud del alineamiento: {alignmentData.alignment_length} posiciones
              </p>
            </div>
          </div>

          {/* Vista previa del alineamiento */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">
              Vista previa del alineamiento
            </h3>
            <div className="bg-white rounded border p-3 max-h-64 overflow-auto custom-scrollbar">
              <div className="font-mono text-xs space-y-1">
                {Object.entries(alignmentData.aligned_sequences || {}).map(([name, sequence]) => (
                  <div key={name} className="flex">
                    <div className="w-24 text-gray-600 pr-2 truncate" title={name}>
                      {name}:
                    </div>
                    <div className="text-gray-800 break-all">
                      {sequence.substring(0, 80)}
                      {sequence.length > 80 && '...'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Mostrando los primeros 80 caracteres de cada secuencia alineada
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-medium text-red-800">Error en alineamiento</h4>
            <p className="text-sm text-red-600 mt-1">{error}</p>
            <button
              onClick={performAlignment}
              className="mt-3 text-sm text-red-800 underline hover:no-underline"
            >
              Intentar de nuevo
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlignmentPanel;
