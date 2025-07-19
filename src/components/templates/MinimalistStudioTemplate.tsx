// src/components/templates/MinimalistStudioTemplate.tsx
import React from 'react';

interface ProductTemplateProps {
  imageUrl: string; // La URL de la imagen del producto sin fondo
}

const MinimalistStudioTemplate: React.FC<ProductTemplateProps> = ({ imageUrl }) => {
  return (
    <div
      className="relative w-[550px] h-[550px] bg-white rounded-xl shadow-lg overflow-hidden flex flex-col items-center justify-center p-10"
      style={{
        backgroundImage: 'linear-gradient(to bottom, #f0f4f8, #e0e6eb)', // Degradado de gris claro a blanco roto
      }}
    >
      {/* Piso/Plataforma sutil */}
      <div
        className="absolute bottom-0 left-0 w-full h-[30%] bg-gray-100"
        style={{
          background: 'linear-gradient(to top, #dce2e6, #f0f4f8)', // Degradado para el "piso"
          borderRadius: '0 0 10px 10px' // Bordes redondeados inferiores
        }}
      ></div>

      {/* Contenedor principal de la imagen del producto */}
      <div className="relative z-10 w-full h-full flex items-center justify-center">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Producto minimalista de estudio"
            className="max-w-[75%] max-h-[75%] object-contain drop-shadow-2xl" // Sombra más fuerte
          />
        ) : (
          <div className="text-gray-400 text-lg animate-pulse">Cargando producto...</div>
        )}
      </div>

      {/* Marca o logo en la esquina */}
      <div className="absolute top-6 left-6 text-gray-500 font-semibold text-sm">
        PIXAFREE STUDIO
      </div>
    </div>
  );
};

export default MinimalistStudioTemplate;