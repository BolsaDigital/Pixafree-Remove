/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración de ESLint para ignorar errores durante la compilación.
  // Esto puede ayudar a que el proyecto compile incluso si hay advertencias de ESLint,
  // pero es mejor resolver las advertencias en desarrollo.
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Deshabilita los indicadores de desarrollo (como el de compilación).
  // Next.js 15.x deprecó la configuración booleana, ahora espera un objeto.
  devIndicators: {
    buildActivity: false,
  },
  // Redirecciones para rutas específicas.
  // Útil para manejar rutas antiguas o reorganizar la estructura de la URL.
  redirects: async () => {
    return [
      {
        source: '/admin/settings',
        destination: '/admin/settings/general',
        permanent: true, // Redirección permanente (código 308)
      },
    ];
  },
  // Configuración para la optimización de imágenes remotas.
  // Permite cargar imágenes desde cualquier dominio HTTPS o HTTP.
  // Para producción, es recomendable ser más específico con los hostnames.
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Permite cualquier hostname HTTPS
      },
      {
        protocol: 'http',
        hostname: '**', // Permite cualquier hostname HTTP (usar con precaución en producción)
      },
    ],
  },
  // Configuración de Webpack para el servidor.
  // Esto es crucial para librerías como 'canvas' o 'konva' que pueden tener dependencias nativas
  // que no deben ser empaquetadas en el bundle del cliente.
  webpack: (config, { isServer }) => {
    // Si es el lado del servidor (Node.js), añade 'canvas' a los externos.
    // Esto evita que Webpack intente empaquetar el módulo 'canvas',
    // que es una dependencia nativa y debe ser manejada por Node.js.
    if (isServer) {
      config.externals = [...(config.externals || []), 'canvas'];
    }
    return config;
  },
  // Puedes añadir otras configuraciones que ya tuvieras aquí, por ejemplo:
  // reactStrictMode: true, // Habilita el modo estricto de React para detectar problemas potenciales
  // swcMinify: true,     // Habilita la minificación con SWC (más rápido que Terser)
};

export default nextConfig;