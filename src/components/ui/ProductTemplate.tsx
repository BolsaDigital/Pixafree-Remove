// src/components/ProductTemplate.tsx
import React from 'react';

interface ProductTemplateProps {
  imageUrl: string; // La URL de la imagen del producto sin fondo
  templateName?: string; // Un nombre para identificar la plantilla (opcional)
  children?: React.ReactNode; // Para cualquier contenido adicional dentro de la plantilla
}

const ProductTemplate: React.FC<ProductTemplateProps> = ({ imageUrl, templateName = "Base Template", children }) => {
  return (
    <div
      className="relative w-[500px] h-[500px] bg-white shadow-xl rounded-lg overflow-hidden p-8 flex items-center justify-center flex-col"
      style={{ backgroundImage: 'linear-gradient(to bottom right, #f0f0f0, #e0e0e0)' }} // Un fondo básico de ejemplo
    >
      {/* Nombre de la plantilla (opcional, para visualización interna) */}
      {templateName && (
        <div className="absolute top-4 left-4 text-gray-500 text-sm">
          {templateName}
        </div>
      )}

      {/* Área donde se mostrará el producto sin fondo */}
      <div className="relative w-full h-full flex items-center justify-center">
        {imageUrl ? (
          // Ajusta estos estilos según cómo quieras que se vea el producto en la plantilla
          <img
            src={imageUrl}
            alt="Producto sin fondo"
            className="max-w-[70%] max-h-[70%] object-contain"
          />
        ) : (
          <div className="text-gray-400">Cargando imagen del producto...</div>
        )}
      </div>

      {/* Aquí puedes añadir otros elementos de diseño de la plantilla
          como texto, formas, sombras, fondos más complejos, etc. */}
      {children}

      {/* Un ejemplo de un elemento decorativo simple */}
      <div className="absolute bottom-4 right-4 text-gray-300 text-lg">
        PIXAFREE
      </div>
    </div>
  );
};

export default ProductTemplate;