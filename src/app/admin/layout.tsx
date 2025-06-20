import { AppSidebar } from '@/app/admin/_components/sidebar';
import { redirect } from 'next/navigation';

import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

import { loggedInUser } from '@/lib/middlewares/auth';

import DashboardHeader from './_components/sidebar/header';

const DashboardLayout = async ({ children }: { children: React.ReactNode }) => {
  const user = await loggedInUser(true);

  if (!user) {
    return redirect('/login');
  }

  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <SidebarInset>
        <DashboardHeader />
        <div className="flex flex-1 flex-col gap-4 px-4 sm:px-7 py-6 pb-10">
          <div className="max-w-7xl mx-auto w-full">{children}</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default DashboardLayout;
