import React, { useState, useRef } from 'react';
import { Upload, File, AlertCircle } from 'lucide-react';
import { phylogenyAPI } from '../services/api';

const FileUploader = ({ onUpload }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = async (file) => {
    setError('');
    
    // Validar tipo de archivo
    const validExtensions = ['.fasta', '.fas', '.fa'];
    const fileName = file.name.toLowerCase();
    const isValidFile = validExtensions.some(ext => fileName.endsWith(ext));
    
    if (!isValidFile) {
      setError('Por favor, selecciona un archivo FASTA válido (.fasta, .fas, .fa)');
      return;
    }

    // Validar tamaño de archivo (máximo 16MB)
    if (file.size > 16 * 1024 * 1024) {
      setError('El archivo es demasiado grande. Máximo 16MB permitido.');
      return;
    }

    setIsUploading(true);

    try {
      const response = await phylogenyAPI.uploadFasta(file);

      if (response) {
        onUpload(response);
      }
    } catch (err) {
      console.error('Error uploading file:', err);
      setError(
        err.response?.data?.error || err.message ||
        'Error al subir el archivo. Por favor, inténtalo de nuevo.'
      );
    } finally {
      setIsUploading(false);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      {/* Drag and Drop Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${isDragging 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${isUploading ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".fasta,.fas,.fa"
          onChange={handleFileSelect}
          className="hidden"
        />

        {isUploading ? (
          <div className="flex flex-col items-center">
            <div className="loader mb-4"></div>
            <p className="text-gray-600">Subiendo archivo...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <Upload className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Subir archivo FASTA
            </h3>
            <p className="text-gray-600 mb-4">
              Arrastra tu archivo aquí o haz clic para seleccionar
            </p>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <File className="h-4 w-4" />
              <span>Formatos soportados: .fasta, .fas, .fa</span>
            </div>
            <p className="text-xs text-gray-400 mt-2">Máximo 16MB</p>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-medium text-red-800">Error</h4>
            <p className="text-sm text-red-600 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* File Requirements */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="text-sm font-medium text-blue-800 mb-2">Requisitos del archivo</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Archivo en formato FASTA (.fasta, .fas, .fa)</li>
          <li>• Mínimo 3 secuencias para construcción de árboles</li>
          <li>• Secuencias del mismo tipo (ADN, ARN o proteínas)</li>
          <li>• Tamaño máximo: 16MB</li>
        </ul>
      </div>
    </div>
  );
};

export default FileUploader;
