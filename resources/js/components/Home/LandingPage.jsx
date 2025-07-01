import React from 'react';
import Banner from './Banner';
import Category from './Category';
import RecommendShop from './RecommendShop';
import Services from './Services';
import Products from './Products';
import Advisement from './Advisement';

const LandingPage = () => {
  return (
    <>
      <Banner />
      <Advisement />
      <Category />
      <RecommendShop />
      <Services />
      <Products />
    </>
  );
};

export default LandingPage;
