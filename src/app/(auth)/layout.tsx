import Logo from '@/app/admin/_components/logo';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import React from 'react';

import { loggedInUser } from '@/lib/middlewares/auth';

const AuthLayout = async ({ children }: { children: React.ReactNode }) => {
  const user = await loggedInUser();

  if (user) {
    redirect('/');
  }

  return (
    <div className="h-svh flex">
      <div className="flex flex-col gap-4 p-6 md:p-8 w-full lg:w-1/2 overflow-y-auto">
        <div className="flex justify-center gap-2 md:justify-start">
          <Logo />
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-[400px]">{children}</div>
        </div>
      </div>
      <div className="relative bg-muted hidden lg:block w-1/2">
        <Image src="/images/auth-image.jpg" alt="Image" fill className="size-full object-cover" />
      </div>
    </div>
  );
};

export default AuthLayout;
