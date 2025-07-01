import React from 'react';
import { Grid, Typography, Box, Divider } from '@mui/material';

const ProductInformation = ({
  aboutProduct,
  productType,
  productKeyFeatures,
  weight,
  productIngredients,
  productCountryOfOrigin,
  productStateOfOrigin,
  productFssaiLicense,
  productOtherLicense,
  productSelfLife,
  productManufacturerDetails,
  productSeller,
  productSellerFssai,
  productReturnPolicy,
  productDisclaimer
}) => {
  return (
    <>
      <Divider sx={{ color: '#616161f5', fontWeight: 'bold', marginTop: '20px', marginBottom: '10px' }}>About Product</Divider>
      {aboutProduct && (
        <div>
          <Typography variant="h5" sx={{ color: '#363237', fontWeight: 'bold' }} gutterBottom>
            Product Details :
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {aboutProduct}
          </Typography>
        </div>
      )}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={5.5}>
          <Box>
            {productType && (
              <div>
                <Typography variant="h6" sx={{ color: '#363237', fontWeight: 'bold', marginTop: '10px', marginBottom: '4px' }} gutterBottom>
                  Product Type:
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {productType}
                </Typography>
              </div>
            )}
            {productKeyFeatures && (
              <div>
                <Typography variant="h6" sx={{ color: '#363237', fontWeight: 'bold', marginTop: '10px', marginBottom: '4px' }} gutterBottom>
                  Key Features :
                </Typography>
                <Typography variant="body2" color="textSecondary" paragraph>
                  {productKeyFeatures}
                </Typography>
              </div>
            )}
            {weight && (
              <div>
                <Typography variant="h6" sx={{ color: '#363237', fontWeight: 'bold', marginTop: '10px', marginBottom: '4px' }} gutterBottom>
                  Weight :
                </Typography>
                <Typography variant="body2" color="textSecondary" paragraph>
                  {weight}
                </Typography>
              </div>
            )}
            {productIngredients && (
              <div>
                <Typography variant="h6" sx={{ color: '#363237', fontWeight: 'bold', marginTop: '10px', marginBottom: '4px' }} gutterBottom>
                  Ingredients :
                </Typography>
                <Typography variant="body2" color="textSecondary" paragraph>
                  {productIngredients}
                </Typography>
              </div>
            )}
            {productCountryOfOrigin && (
              <div>
                <Typography variant="h6" sx={{ color: '#363237', fontWeight: 'bold', marginTop: '10px', marginBottom: '4px' }} gutterBottom>
                  Country Of Origin :
                </Typography>
                <Typography variant="body2" color="textSecondary" paragraph>
                  {productCountryOfOrigin}
                </Typography>
              </div>
            )}
            {productStateOfOrigin && (
              <div>
                <Typography variant="h6" sx={{ color: '#363237', fontWeight: 'bold', marginTop: '10px', marginBottom: '4px' }} gutterBottom>
                  State Of Origin :
                </Typography>
                <Typography variant="body2" color="textSecondary" paragraph>
                  {productStateOfOrigin}
                </Typography>
              </div>
            )}
          </Box>
        </Grid>
        <Grid item xs={12} sm={1}>
          <Divider orientation="vertical" variant="middle" />
        </Grid>
        <Grid item xs={12} sm={5.5}>
          <Box>
            {productFssaiLicense && (
              <div>
                <Typography variant="h6" sx={{ color: '#363237', fontWeight: 'bold', marginTop: '10px', marginBottom: '4px' }} gutterBottom>
                  FSSAI License :
                </Typography>
                <Typography variant="body2" color="textSecondary" paragraph>
                  {productFssaiLicense}
                </Typography>
              </div>
            )}
            {productOtherLicense && (
              <div>
                <Typography variant="h6" sx={{ color: '#363237', fontWeight: 'bold', marginTop: '10px', marginBottom: '4px' }} gutterBottom>
                  Other License :
                </Typography>
                <Typography variant="body2" color="textSecondary" paragraph>
                  {productOtherLicense}
                </Typography>
              </div>
            )}
            {productSelfLife && (
              <div>
                <Typography variant="h6" sx={{ color: '#363237', fontWeight: 'bold', marginTop: '10px', marginBottom: '4px' }} gutterBottom>
                  Shelf Life / Expire :
                </Typography>
                <Typography variant="body2" color="textSecondary" paragraph>
                  {productSelfLife}
                </Typography>
              </div>
            )}
            {productManufacturerDetails && (
              <div>
                <Typography variant="h6" sx={{ color: '#363237', fontWeight: 'bold', marginTop: '10px', marginBottom: '4px' }} gutterBottom>
                  Manufacturer Details :
                </Typography>
                <Typography variant="body2" color="textSecondary" paragraph>
                  {productManufacturerDetails}
                </Typography>
              </div>
            )}
            {productManufacturerDetails && (
              <div>
                <Typography variant="h6" sx={{ color: '#363237', fontWeight: 'bold', marginTop: '10px', marginBottom: '4px' }} gutterBottom>
                  Seller :
                </Typography>
                <Typography variant="body2" color="textSecondary" paragraph>
                  {productSeller}
                </Typography>
              </div>
            )}
            {productManufacturerDetails && (
              <div>
                <Typography variant="h6" sx={{ color: '#363237', fontWeight: 'bold', marginTop: '10px', marginBottom: '4px' }} gutterBottom>
                  Seller FSSAI :
                </Typography>
                <Typography variant="body2" color="textSecondary" paragraph>
                  {productSellerFssai}
                </Typography>
              </div>
            )}
          </Box>
        </Grid>
      </Grid>
      {productReturnPolicy && (
        <div>
          <Typography variant="h6" sx={{ color: '#363237', fontWeight: 'bold', marginTop: '10px', marginBottom: '4px' }} gutterBottom>
            Return Policy :
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {productReturnPolicy}
          </Typography>
        </div>
      )}
      {productDisclaimer && (
        <div>
          <Typography variant="h6" sx={{ color: '#363237', fontWeight: 'bold', marginTop: '10px', marginBottom: '4px' }} gutterBottom>
            Disclaimer :
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {productDisclaimer}
          </Typography>
        </div>
      )}
    </>
  );
};

export default ProductInformation;
