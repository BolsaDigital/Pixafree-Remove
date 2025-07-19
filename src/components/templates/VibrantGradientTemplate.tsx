// src/components/templates/VibrantGradientTemplate.tsx
import React from 'react';

interface ProductTemplateProps {
  imageUrl: string; // La URL de la imagen del producto sin fondo
}

const VibrantGradientTemplate: React.FC<ProductTemplateProps> = ({ imageUrl }) => {
  return (
    <div
      className="relative w-[550px] h-[550px] rounded-2xl overflow-hidden flex items-center justify-center p-10"
      style={{
        backgroundImage: 'linear-gradient(to bottom right, #ff7e5f, #feb47b)', // Degradado vibrante (naranja a durazno)
        boxShadow: '0 15px 30px rgba(255, 126, 95, 0.4)', // Sombra colorida
      }}
    >
      {/* Forma abstracta de fondo */}
      <div
        className="absolute top-1/4 left-1/4 w-[200px] h-[200px] bg-white rounded-full opacity-10"
        style={{ transform: 'rotate(45deg) scale(1.2)' }}
      ></div>
      <div
        className="absolute bottom-1/4 right-1/4 w-[150px] h-[150px] bg-white rounded-full opacity-15"
        style={{ transform: 'rotate(-30deg) scale(0.8)' }}
      ></div>

      {/* Contenedor principal de la imagen del producto */}
      <div className="relative z-10 w-full h-full flex items-center justify-center">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Producto vibrante"
            className="max-w-[80%] max-h-[80%] object-contain drop-shadow-xl"
          />
        ) : (
          <div className="text-white text-lg animate-pulse">Cargando producto...</div>
        )}
      </div>

      {/* Slogan o elemento de marca */}
      <div className="absolute top-6 right-6 text-white text-base font-bold tracking-widest">
        VIBRANT
      </div>
    </div>
  );
};

export default VibrantGradientTemplate;