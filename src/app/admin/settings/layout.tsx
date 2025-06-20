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
      <div className="flex flex-col lg:flex-row gap-7 lg:gap-10 items-start">
        <aside className="w-full lg:w-3xs">
          <SettingsMenu />
        </aside>
        <main className="flex-1 w-full max-w-full lg:max-w-xl">{children}</main>
      </div>
    </div>
  );
};

export default SettingsLayout;
