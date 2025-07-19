// src/components/templates/ModernProductTemplate.tsx
import React from 'react';

interface ProductTemplateProps {
  imageUrl: string; // La URL de la imagen del producto sin fondo
}

const ModernProductTemplate: React.FC<ProductTemplateProps> = ({ imageUrl }) => {
  return (
    <div 
      className="relative w-[550px] h-[550px] bg-white shadow-2xl rounded-2xl overflow-hidden flex items-center justify-center p-10 transform transition-all duration-300 ease-in-out"
      style={{ 
        backgroundImage: 'linear-gradient(to top right, #f8faff, #e6efff)', // Degradado de fondo suave
        // Puedes añadir estilos para sombra interna o bordes aquí
      }}
    >
      {/* Elementos de diseño de fondo (formas, degradados, etc.) */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10"
           style={{ 
             background: 'radial-gradient(circle at top left, #a7d9ff, transparent 50%)'
           }}></div>
      <div className="absolute bottom-0 right-0 w-full h-full opacity-10"
           style={{ 
             background: 'radial-gradient(circle at bottom right, #ffccf0, transparent 50%)'
           }}></div>

      {/* Contenedor principal de la imagen del producto */}
      <div className="relative z-10 w-full h-full flex items-center justify-center">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Producto moderno"
            className="max-w-[70%] max-h-[70%] object-contain drop-shadow-xl" // Sombra para el producto
          />
        ) : (
          <div className="text-gray-400 text-lg animate-pulse">Cargando producto...</div>
        )}
      </div>

      {/* Slogan o logo en la parte inferior */}
      <div className="absolute bottom-6 w-full text-center text-gray-500 font-light text-sm tracking-wider">
        PIXAFREE — Profesionalismo Simplificado
      </div>

      {/* Puedes añadir más elementos aquí */}
    </div>
  );
};

export default ModernProductTemplate;