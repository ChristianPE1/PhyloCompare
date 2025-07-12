import React, { useState } from 'react';
import FileUploader from './FileUploader';
import SequenceInfo from './SequenceInfo';
import AlignmentPanel from './AlignmentPanel';
import TreeBuilder from './TreeBuilder';
import TreeComparison from './TreeComparison';
import TreeVisualization from './TreeVisualization';

const Dashboard = () => {
  const [sessionData, setSessionData] = useState(null);
  const [currentStep, setCurrentStep] = useState('upload');
  const [trees, setTrees] = useState({});
  const [comparison, setComparison] = useState(null);

  const handleFileUpload = (data) => {
    setSessionData(data);
    setCurrentStep('sequences');
  };

  const handleAlignment = () => {
    setSessionData(prev => ({ ...prev, alignment: true }));
    setCurrentStep('trees');
  };

  const handleTreeBuilt = (method, treeData) => {
    setTrees(prev => ({
      ...prev,
      [method]: treeData
    }));
  };

  const handleComparison = (comparisonData) => {
    setComparison(comparisonData);
    setCurrentStep('comparison');
  };

  const resetDashboard = () => {
    setSessionData(null);
    setCurrentStep('upload');
    setTrees({});
    setComparison(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb / Progress */}
      <div className="mb-8">
        <div className="flex items-center space-x-4">
          <StepIndicator 
            step="upload" 
            currentStep={currentStep} 
            title="Subir FASTA"
            completed={!!sessionData}
          />
          <StepSeparator />
        <StepIndicator 
          step="sequences" 
          currentStep={currentStep} 
          title="Secuencias"
          completed={!!sessionData?.alignment}
        />
          <StepSeparator />
          <StepIndicator 
            step="trees" 
            currentStep={currentStep} 
            title="Árboles"
            completed={Object.keys(trees).length > 0}
          />
          <StepSeparator />
          <StepIndicator 
            step="comparison" 
            currentStep={currentStep} 
            title="Comparación"
            completed={!!comparison}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-8">
        {/* Step 1: File Upload */}
        {currentStep === 'upload' && (
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Subir archivo FASTA
            </h2>
            <p className="text-gray-600 mb-6">
              Sube un archivo FASTA que contenga múltiples secuencias para análisis filogenético. 
              Se requieren al menos 3 secuencias.
            </p>
            <FileUploader onUpload={handleFileUpload} />
          </div>
        )}

        {/* Step 2: Sequence Information */}
        {currentStep === 'sequences' && sessionData && (
          <div className="space-y-6">
            <SequenceInfo 
              sessionData={sessionData} 
              onReset={resetDashboard}
            />
            <AlignmentPanel 
              sessionId={sessionData.session_id}
              onAlignment={handleAlignment}
            />
          </div>
        )}

        {/* Step 3: Tree Building */}
        {currentStep === 'trees' && sessionData && (
          <div className="space-y-6">
            <TreeBuilder
              sessionId={sessionData.session_id}
              onTreeBuilt={handleTreeBuilt}
              trees={trees}
            />
            {Object.keys(trees).length > 0 && (
              <TreeVisualization trees={trees} />
            )}
            {/* Botón para pasar a comparación si hay al menos 2 árboles */}
            {Object.keys(trees).length >= 2 && (
              <div className="flex justify-end">
                <button
                  className="btn-primary flex items-center space-x-2"
                  onClick={() => setCurrentStep('comparison')}
                >
                  <span>Comparar árboles</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Tree Comparison */}
        {currentStep === 'comparison' && Object.keys(trees).length >= 2 && (
          <div className="space-y-6">
            <TreeComparison
              sessionId={sessionData.session_id}
              trees={trees}
              onComparison={handleComparison}
              comparison={comparison}
            />
          </div>
        )}
      </div>
    </div>
  );
};

// Componente para indicadores de pasos
const StepIndicator = ({ step, currentStep, title, completed }) => {
  const isActive = currentStep === step;
  const isCompleted = completed;

  return (
    <div className="flex items-center">
      <div
        className={`
          w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
          ${isCompleted 
            ? 'bg-green-500 text-white' 
            : isActive 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-600'
          }
        `}
      >
        {isCompleted ? '✓' : '○'}
      </div>
      <span 
        className={`
          ml-2 text-sm font-medium
          ${isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'}
        `}
      >
        {title}
      </span>
    </div>
  );
};

const StepSeparator = () => (
  <div className="w-8 h-px bg-gray-300"></div>
);

export default Dashboard;
