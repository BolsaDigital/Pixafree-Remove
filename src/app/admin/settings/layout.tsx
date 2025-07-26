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
      {/* MODIFICACIONES AQUÍ: Ajustar el layout para que el main ocupe el espacio restante */}
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 items-start w-full"> {/* Añadir w-full al contenedor flex */}
        <aside className="w-full lg:w-3xs flex-shrink-0"> {/* Añadir flex-shrink-0 para que el aside no se encoja */}
          <SettingsMenu />
        </aside>
        {/* Asegurarse de que el main ocupe el espacio restante sin un max-width restrictivo */}
        {/* Si lg:max-w-3xl sigue siendo muy restrictivo, puedes probar con lg:max-w-full o simplemente eliminarlo */}
        <main className="flex-1 w-full"> {/* Eliminar lg:max-w-xl o lg:max-w-3xl para que ocupe todo el espacio disponible */}
          {children}
        </main>
      </div>
    </div>
  );
};

export default SettingsLayout;