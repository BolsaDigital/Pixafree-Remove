import React from 'react';

import SettingsMenu from './_components/settings-menu';

const SettingsLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <div className="space-y-1 border-b pb-7 mb-7">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Configure your settings to get the most out of your experience.
        </p>
      </div>
      {/* MODIFICACIONES AQUÍ: Reducir el gap y ajustar el ancho del contenido principal */}
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 items-start"> {/* Reducido de gap-7/10 a gap-4/6 */}
        <aside className="w-full lg:w-3xs"> {/* Mantener el ancho del aside si es el deseado */}
          <SettingsMenu />
        </aside>
        {/* Eliminar max-w-xl para permitir que ocupe más espacio, o ajustarlo a un valor más grande si es necesario */}
        <main className="flex-1 w-full lg:max-w-3xl"> {/* Cambiado de max-w-xl a lg:max-w-3xl o simplemente flex-1 w-full */}
          {children}
        </main>
      </div>
    </div>
  );
};

export default SettingsLayout;
