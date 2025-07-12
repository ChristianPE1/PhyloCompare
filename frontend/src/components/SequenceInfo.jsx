import React from 'react';
import { RefreshCw, FileText, Dna } from 'lucide-react';

const SequenceInfo = ({ sessionData, onReset }) => {
  return (
    <div className="card">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Información de secuencias
          </h2>
          <p className="text-gray-600 mt-1">
            Archivo: {sessionData.filename}
          </p>
        </div>
        <button
          onClick={onReset}
          className="btn-secondary flex items-center space-x-2"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Nuevo archivo</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Estadísticas generales */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center">
            <FileText className="h-6 w-6 text-blue-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-blue-900">Total de secuencias</p>
              <p className="text-2xl font-bold text-blue-600">{sessionData.sequences_count}</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center">
            <Dna className="h-6 w-6 text-green-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-green-900">Estado</p>
              <p className="text-lg font-semibold text-green-600">Listo para alineamiento</p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center">
            <div className="h-6 w-6 bg-purple-600 rounded mr-3 flex items-center justify-center">
              <span className="text-white text-xs font-bold">ID</span>
            </div>
            <div>
              <p className="text-sm font-medium text-purple-900">Sesión</p>
              <p className="text-xs font-mono text-purple-600 truncate">
                {sessionData.session_id.slice(0, 8)}...
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de secuencias */}
      <div className="mt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-3">
          Secuencias identificadas
        </h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {sessionData.sequences.map((seqName, index) => (
              <div
                key={index}
                className="bg-white px-3 py-2 rounded border text-sm font-mono text-gray-700 truncate"
                title={seqName}
              >
                {seqName}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">
          <strong>Siguiente paso:</strong> Realizar alineamiento múltiple de las secuencias 
          para poder construir los árboles filogenéticos.
        </p>
      </div>
    </div>
  );
};

export default SequenceInfo;
