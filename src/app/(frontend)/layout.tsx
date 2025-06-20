import React from 'react';

import { loggedInUser } from '@/lib/middlewares/auth';

import Footer from './_components/footer';
import Header from './_components/header';

const FrontendLayout = async ({ children }: { children: React.ReactNode }) => {
  const user = await loggedInUser();

  return (
    <main>
      <Header initalUser={user || undefined} />
      {children}
      <Footer />
    </main>
  );
};

export default FrontendLayout;
