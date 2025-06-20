import React from 'react';

import Footer from './(frontend)/_components/footer';
import Header from './(frontend)/_components/header';
import NotFound from './(frontend)/_components/not-found';

export const metadata = {
  title: '404 - Not Found',
  description: 'Sorry, the page you are looking for does not exist.',
};

const NotFoundPage = () => {
  return (
    <main>
      <Header />
      <NotFound />
      <Footer />
    </main>
  );
};

export default NotFoundPage;
