import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-center text-sm text-gray-600">
          <p>© 2025 Filogenia Dashboard. Desarrollado para análisis filogenético comparativo.</p>
          <p className="mt-1">Implementa algoritmos Neighbor-Joining y Máxima Verosimilitud</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
