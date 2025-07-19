// src/config/fonts.ts

// Importa Inter desde Google Fonts, que es la fuente por defecto y accesible.
import { Inter } from 'next/font/google';

// Exporta la fuente Inter. Se mantiene el nombre 'fontGeist' para compatibilidad
// con cualquier otro archivo que pueda estar referenciando este nombre.
export const fontGeist = Inter({
  subsets: ['latin'], // Define los subconjuntos de caracteres a cargar (ej. para soporte de idiomas)
  variable: '--font-inter', // Define una variable CSS personalizada para la fuente,
                            // lo que permite usarla fácilmente con Tailwind CSS (ej. font-inter)
});

// Si tu proyecto necesita otras fuentes de Google Fonts, las añadirías aquí de forma similar.
// Ejemplo:
// import { Roboto_Mono } from 'next/font/google';
// export const fontMono = Roboto_Mono({
//   subsets: ['latin'],
//   variable: '--font-mono',
// });
