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
      {/* MODIFICACIONES AQUÍ: Usar un layout de dos columnas más explícito */}
      <div className="flex flex-col lg:flex-row w-full"> {/* Eliminar gap aquí, el espaciado será con padding */}
        <aside className="w-full lg:w-64 lg:pr-6 flex-shrink-0"> {/* lg:w-64 (256px) para un ancho fijo en desktop, lg:pr-6 para padding derecho */}
          <SettingsMenu />
        </aside>
        {/* El main ocupará el espacio restante y tendrá su propio padding izquierdo */}
        <main className="flex-1 w-full lg:pl-6"> {/* lg:pl-6 para padding izquierdo, esto crea el "gap" */}
          {children}
        </main>
      </div>
    </div>
  );
};

export default SettingsLayout;
