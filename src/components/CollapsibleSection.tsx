// src/components/CollapsibleSection.tsx
'use client';

import React from 'react';
import { ChevronRight } from 'lucide-react'; // Asegúrate de que lucide-react esté instalado

// Importa los componentes de Radix UI que definiste en ui/collapsible.tsx
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface CollapsibleSectionProps {
  title: string;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  children: React.ReactNode;
  className?: string;
  icon?: React.ElementType; // Icono de lucide-react (ej. Sparkles, ImageIcon)
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ title, isOpen, setIsOpen, children, className, icon: Icon }) => {
  return (
    // Collapsible de Radix UI maneja el estado de apertura/cierre
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className={className}>
      {/* CollapsibleTrigger envuelve el botón que activa el colapso */}
      <CollapsibleTrigger asChild>
        <button
          className="w-full flex items-center justify-between p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-md"
          // La lógica de click se maneja por onOpenChange en Collapsible, no necesitamos un onClick aquí
        >
          <div className="flex items-center gap-2">
            {Icon && <Icon size={16} />} {/* Renderiza el icono si se proporciona */}
            {title}
          </div>
          {/* Icono de flecha que rota según el estado isOpen */}
          <ChevronRight size={16} className={`transform transition-transform ${isOpen ? 'rotate-90' : ''}`} />
        </button>
      </CollapsibleTrigger>
      {/* CollapsibleContent contiene el contenido que se muestra/oculta */}
      <CollapsibleContent>
        <div className="p-3 border-t border-gray-300 rounded-b-md">
          {children}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default CollapsibleSection;