import React from 'react';
import PrintStore from '../Service/PrintStore';
import CarService from '../Service/CarService';
import BeautyParlour from '../Service/BeautyParlour';
import TVRepair from '../Service/TVRepair';
import MensSalon from '../Service/MensSalon';
import MobileRepair from '../Service/MobileRepair';
import ACService from '../Service/ACService';
import HomeAppliance from '../Service/HomeAppliance';
import ProductsNotFound from './ProductsNotFound';

export const ServiceRenderer = ({ shopData, handleGoBack }) => {
    if (!shopData) return null;

    switch (shopData.shop_type) {
        case 'Internet Café':
            return <PrintStore
                shopId={shopData.shop_id}
                shopName={shopData.shop_name}
                shopType={shopData.shop_type}
            />;
        case 'Car Service Center':
            return <CarService
                shopId={shopData.shop_id}
                shopName={shopData.shop_name}
                shopType={shopData.shop_type}
            />;
        case 'Beauty Parlor':
            return <BeautyParlour
                shopId={shopData.shop_id}
                shopName={shopData.shop_name}
                shopType={shopData.shop_type}
            />;
        case 'TV Repair Services':
            return <TVRepair
                shopId={shopData.shop_id}
                shopName={shopData.shop_name}
                shopType={shopData.shop_type}
            />;
        case 'Salon / Barber Shop':
            return <MensSalon
                shopId={shopData.shop_id}
                shopName={shopData.shop_name}
                shopType={shopData.shop_type}
            />;
        case 'Mobile Repair Shop':
            return <MobileRepair
                shopId={shopData.shop_id}
                shopName={shopData.shop_name}
                shopType={shopData.shop_type}
            />;
        case 'AC Service Center':
            return <ACService
                shopId={shopData.shop_id}
                shopName={shopData.shop_name}
                shopType={shopData.shop_type}
            />;
        case 'Home Appliances Store':
            return <HomeAppliance
                shopId={shopData.shop_id}
                shopName={shopData.shop_name}
                shopType={shopData.shop_type}
            />;
        default:
            return <ProductsNotFound
                noProductsMessage="Service not available for this shop type"
                onGoBack={handleGoBack}
            />;
    }
};
