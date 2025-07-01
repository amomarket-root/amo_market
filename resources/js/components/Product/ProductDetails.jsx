import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Box, Typography, Chip, Divider, Grid, Paper, Skeleton } from '@mui/material';
import { AccessTime, ArrowRight } from '@mui/icons-material';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { addToCart } from '../Cart/cartService';
import {getCartItemsFromLocalStorage,updateLocalCartItems, getCartSummary} from '../Cart/cartHelpers';
import LoginModal from '../Auth/LoginModal';
import axios from 'axios';
import CartButton from '../Cart/CartButton';
import ProductImages from './ProductImages';
import ProductUnitOptions from './ProductUnitOptions';
import ProductQuantityControl from './ProductQuantityControl';
import ProductInformation from './ProductInformation';
import CustomerSupportFeatures from './CustomerSupportFeatures';

const ProductDetails = () => {
  const theme = useTheme();
  const { productId } = useParams();
  const isSm = useMediaQuery(theme.breakpoints.down("sm"));
  const isXs = useMediaQuery(theme.breakpoints.down("xs"));
  const isMobile = isXs || isSm;
  const apiUrl = import.meta.env.VITE_API_URL;

  // State declarations
  const [categoryName, setCategoryName] = useState('');
  const [visibleImages, setVisibleImages] = useState(0);
  const [mainImage, setMainImage] = useState(null);
  const [productName, setProductName] = useState('');
  const [aboutProduct, setAboutProduct] = useState('');
  const [subCategoryName, setSubCategoryName] = useState('');
  const [deliveryTime, setDeliveryTime] = useState(0);
  const [sellingPrice, setSellingPrice] = useState(null);
  const [originalPrice, setOriginalPrice] = useState(null);
  const [discount, setDiscount] = useState(null);
  const [weight, setWeight] = useState('');
  const [productFlavour, setProductFlavour] = useState('');
  const [productIngredients, setProductIngredients] = useState('');
  const [productAttraction, setProductAttraction] = useState('');
  const [sellingPriceUnitTwo, setSellingPriceUnitTwo] = useState('');
  const [originalPriceUnitTwo, setOriginalPriceUnitTwo] = useState('');
  const [discountUnitTwo, setDiscountUnitTwo] = useState('');
  const [weightUnitTwo, setWeightUnitTwo] = useState('');
  const [sellingPriceUnitThree, setSellingPriceUnitThree] = useState('');
  const [originalPriceUnitThree, setOriginalPriceUnitThree] = useState('');
  const [discountUnitThree, setDiscountUnitThree] = useState('');
  const [weightUnitThree, setWeightUnitThree] = useState('');
  const [productType, setProductType] = useState('');
  const [productKeyFeatures, setProductKeyFeatures] = useState('');
  const [productFssaiLicense, setProductFssaiLicense] = useState('');
  const [productOtherLicense, setProductOtherLicense] = useState('');
  const [productSelfLife, setProductSelfLife] = useState('');
  const [productManufacturerDetails, setProductManufacturerDetails] = useState('');
  const [productCountryOfOrigin, setProductCountryOfOrigin] = useState('');
  const [productStateOfOrigin, setProductStateOfOrigin] = useState('');
  const [productSeller, setProductSeller] = useState('');
  const [productSellerFssai, setProductSellerFssai] = useState('');
  const [productReturnPolicy, setProductReturnPolicy] = useState('');
  const [productDisclaimer, setProductDisclaimer] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(0);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [cartVisible, setCartVisible] = useState(false);

  useEffect(() => {
    const cartItems = getCartItemsFromLocalStorage();
    const productCount = cartItems[productId]?.count || 0;
    setCount(productCount);

    const fetchProductDetails = async () => {
      try {
        const response = await axios.get(`${apiUrl}/portal/product_details`, {
          params: {
            product_id: productId,
          },
        });
        setMainImage(response.data.data.image);
        setProductName(response.data.data.name);
        setAboutProduct(response.data.data.about_product);
        setSubCategoryName(response.data.data.sub_category.name);
        setCategoryName(response.data.data.sub_category.category.name);
        setDeliveryTime(response.data.data.delivery_time);
        setSellingPrice(response.data.data.price);
        setOriginalPrice(response.data.data.original_price);
        setDiscount(response.data.data.discount);
        setWeight(response.data.data.weight);
        setProductIngredients(response.data.data.product_information[0].product_Ingredients);
        setProductFlavour(response.data.data.product_information[0].product_flavour);
        setProductAttraction(response.data.data.product_information[0].product_attraction);
        setSellingPriceUnitTwo(response.data.data.product_information[0].second_unit_price);
        setOriginalPriceUnitTwo(response.data.data.product_information[0].second_unit_original_price);
        setDiscountUnitTwo(response.data.data.product_information[0].second_unit_discount);
        setWeightUnitTwo(response.data.data.product_information[0].second_unit_weight);
        setSellingPriceUnitThree(response.data.data.product_information[0].third_unit_price);
        setOriginalPriceUnitThree(response.data.data.product_information[0].third_unit_original_price);
        setDiscountUnitThree(response.data.data.product_information[0].third_unit_discount);
        setWeightUnitThree(response.data.data.product_information[0].third_unit_weight);
        setProductType(response.data.data.product_information[0].product_type);
        setProductKeyFeatures(response.data.data.product_information[0].key_features);
        setProductFssaiLicense(response.data.data.product_information[0].fssai_license);
        setProductOtherLicense(response.data.data.product_information[0].other_license);
        setProductSelfLife(response.data.data.product_information[0].shelf_life);
        setProductManufacturerDetails(response.data.data.product_information[0].manufacturer_details);
        setProductCountryOfOrigin(response.data.data.product_information[0].country_of_origin);
        setProductStateOfOrigin(response.data.data.product_information[0].state_of_origin);
        setProductSeller(response.data.data.product_information[0].seller);
        setProductSellerFssai(response.data.data.product_information[0].seller_fssai);
        setProductReturnPolicy(response.data.data.product_information[0].return_policy);
        setProductDisclaimer(response.data.data.product_information[0].disclaimer);

        const allImages = [
          response.data.data.product_information[0].product_image_one,
          response.data.data.product_information[0].product_image_two,
          response.data.data.product_information[0].product_image_three,
          response.data.data.product_information[0].product_image_four,
          response.data.data.product_information[0].product_image_five,
          ...response.data.data.product_information[0].product_extra_image.split(','),
        ];
        setImages(allImages);

        const cartSummary = await getCartSummary(apiUrl);
        setCartVisible(cartSummary.totalQuantity > 0);
      } catch (error) {
        console.error('Error fetching product details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [productId, apiUrl]);

  useEffect(() => {
    const handleCartChange = () => {
      const cartItems = getCartItemsFromLocalStorage();
      const productCount = cartItems[productId]?.count || 0;
      setCount(productCount);
    };

    window.addEventListener('cartChange', handleCartChange);
    return () => {
      window.removeEventListener('cartChange', handleCartChange);
    };
  }, [productId]);

  const handleNext = () => {
    if (visibleImages < images.length - 5) {
      setVisibleImages(visibleImages + 1);
    }
  };

  const handlePrev = () => {
    if (visibleImages > 0) {
      setVisibleImages(visibleImages - 1);
    }
  };

  const handleThumbnailClick = (img) => {
    setMainImage(img);
  };

  const handleAdd = async () => {
    try {
      const portal_token = localStorage.getItem('portal_token');
      if (!portal_token) {
        setLoginModalOpen(true);
        return;
      }

      const cartItems = updateLocalCartItems(productId, 1);
      setCount(cartItems[productId]?.count || 1);

      await addToCart(productId, 1);
      window.dispatchEvent(new Event('cartChange'));
      setCartVisible(true);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const handleIncrease = async () => {
    try {
      const cartItems = updateLocalCartItems(productId, 1);
      setCount(cartItems[productId]?.count || 1);

      const portal_token = localStorage.getItem('portal_token');
      if (portal_token) {
        await addToCart(productId, 1);
        window.dispatchEvent(new Event('cartChange'));
      }
      setCartVisible(true);
    } catch (error) {
      console.error('Error increasing quantity:', error);
    }
  };

  const handleDecrease = async () => {
    try {
      const cartItems = updateLocalCartItems(productId, -1);
      const newCount = cartItems[productId]?.count || 0;
      setCount(newCount);

      const portal_token = localStorage.getItem('portal_token');
      if (portal_token) {
        await addToCart(productId, -1);
        window.dispatchEvent(new Event('cartChange'));
      }

      const updatedCartSummary = await getCartSummary(apiUrl);
      setCartVisible(updatedCartSummary.totalQuantity > 0);
    } catch (error) {
      console.error('Error decreasing quantity:', error);
    }
  };

  return (
    <Container sx={{ maxWidth: '100%', p: 2, padding: '0px' }} maxWidth={false}>
      {cartVisible && <CartButton />}

      <Grid container spacing={2}>
        {/* Left Column - Product Image and Thumbnails */}
        <Grid item xs={12} sm={6.5}>
          <ProductImages
            mainImage={mainImage}
            images={images}
            loading={loading}
            isMobile={isMobile}
            visibleImages={visibleImages}
            handleThumbnailClick={handleThumbnailClick}
            handleNext={handleNext}
            handlePrev={handlePrev}
          />
        </Grid>

        {/* Right Column - Product Details */}
        <Grid item xs={12} sm={5.5}>
          {loading ? (
            <>
              <Skeleton variant="text" width="60%" height={40} />
              <Skeleton variant="text" width="40%" height={30} />
              <Skeleton variant="text" width="50%" height={30} />
              <Skeleton variant="rectangular" width="100%" height={100} sx={{ mt: 2 }} />
            </>
          ) : (
            <>
              {categoryName && subCategoryName && productName && (
                <Box display="flex" alignItems="center" mb={2}>
                  <Typography variant="body2" color="textSecondary">
                    Home / {categoryName} / {subCategoryName} / {productName}
                  </Typography>
                </Box>
              )}
              {categoryName && (
                <Typography variant="h5" sx={{ fontWeight: 'bold' }} gutterBottom>
                  {productName}
                </Typography>
              )}
              {deliveryTime?.trim() && (
                <Typography variant="body2" color="textSecondary" style={{ lineHeight: '24px', display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                  <AccessTime style={{ marginRight: '5px', fontSize: '20px', verticalAlign: 'sub' }} /> {deliveryTime} min.
                </Typography>
              )}
              {productIngredients && (
                <Typography variant="body1" gutterBottom mb={1}>
                  {productIngredients}
                </Typography>
              )}
              {productAttraction && <Chip label={productAttraction} color="success" sx={{ mr: 1 }} />}
              {productFlavour && <Chip label={productFlavour} color="secondary" />}
              <Typography variant="h6" sx={{ fontWeight: 'bold' }} color="#f27474" mt={2} mb={1}>
                Explore All Related Products <ArrowRight style={{ marginLeft: '3px', fontSize: '20px', verticalAlign: 'sub' }} />
              </Typography>
              <Divider sx={{ color: '#616161f5', fontWeight: 'bold' }}>Price Section</Divider>
              <Box mt={2}>
                <Typography variant="body1" sx={{ color: '#363237', fontWeight: 'bold', marginBottom: '15px' }} mt={1}>
                  Select Unit
                </Typography>

                <ProductUnitOptions
                  theme={theme}
                  isMobile={isMobile}
                  weight={weight}
                  discount={discount}
                  sellingPrice={sellingPrice}
                  originalPrice={originalPrice}
                  weightUnitTwo={weightUnitTwo}
                  discountUnitTwo={discountUnitTwo}
                  sellingPriceUnitTwo={sellingPriceUnitTwo}
                  originalPriceUnitTwo={originalPriceUnitTwo}
                  weightUnitThree={weightUnitThree}
                  discountUnitThree={discountUnitThree}
                  sellingPriceUnitThree={sellingPriceUnitThree}
                  originalPriceUnitThree={originalPriceUnitThree}
                />

                <Typography variant="body2" color="textSecondary" mt={2} mb={2}>
                  Inclusive of all taxes
                </Typography>

                <ProductQuantityControl
                  count={count}
                  handleAdd={handleAdd}
                  handleIncrease={handleIncrease}
                  handleDecrease={handleDecrease}
                />
              </Box>
            </>
          )}
        </Grid>
      </Grid>

      {/* Bottom Section - Product Information */}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6.5}>
          {loading ? (
            <>
              <Skeleton variant="text" width="30%" height={40} />
              <Skeleton variant="rectangular" width="100%" height={200} sx={{ mt: 2 }} />
            </>
          ) : (
            <ProductInformation
              aboutProduct={aboutProduct}
              productType={productType}
              productKeyFeatures={productKeyFeatures}
              weight={weight}
              productIngredients={productIngredients}
              productCountryOfOrigin={productCountryOfOrigin}
              productStateOfOrigin={productStateOfOrigin}
              productFssaiLicense={productFssaiLicense}
              productOtherLicense={productOtherLicense}
              productSelfLife={productSelfLife}
              productManufacturerDetails={productManufacturerDetails}
              productSeller={productSeller}
              productSellerFssai={productSellerFssai}
              productReturnPolicy={productReturnPolicy}
              productDisclaimer={productDisclaimer}
            />
          )}
        </Grid>

        {/* Right Column - Customer Support and Features */}
        <Grid item xs={12} sm={5.5}>
          {loading ? (
            <>
              <Skeleton variant="text" width="30%" height={40} />
              <Skeleton variant="rectangular" width="100%" height={200} sx={{ mt: 2 }} />
            </>
          ) : (
            <CustomerSupportFeatures />
          )}
        </Grid>
      </Grid>

      {/* Render LoginModal */}
      <LoginModal open={loginModalOpen} onClose={() => setLoginModalOpen(false)} />
    </Container>
  );
};

export default ProductDetails;
