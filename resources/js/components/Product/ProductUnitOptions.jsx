import React from 'react';
import { Grid, Typography, Box, Chip } from '@mui/material';

const ProductUnitOptions = ({
  theme,
  isMobile,
  weight,
  discount,
  sellingPrice,
  originalPrice,
  weightUnitTwo,
  discountUnitTwo,
  sellingPriceUnitTwo,
  originalPriceUnitTwo,
  weightUnitThree,
  discountUnitThree,
  sellingPriceUnitThree,
  originalPriceUnitThree
}) => {
  return (
    <Grid container spacing={3}>
      {weight && (
        <Grid item xs={4}>
          <UnitOptionBox
            theme={theme}
            isMobile={isMobile}
            weight={weight}
            discount={discount}
            sellingPrice={sellingPrice}
            originalPrice={originalPrice}
          />
        </Grid>
      )}
      {weightUnitTwo && (
        <Grid item xs={4}>
          <UnitOptionBox
            theme={theme}
            isMobile={isMobile}
            weight={weightUnitTwo}
            discount={discountUnitTwo}
            sellingPrice={sellingPriceUnitTwo}
            originalPrice={originalPriceUnitTwo}
          />
        </Grid>
      )}
      {weightUnitThree && (
        <Grid item xs={4}>
          <UnitOptionBox
            theme={theme}
            isMobile={isMobile}
            weight={weightUnitThree}
            discount={discountUnitThree}
            sellingPrice={sellingPriceUnitThree}
            originalPrice={originalPriceUnitThree}
          />
        </Grid>
      )}
    </Grid>
  );
};

const UnitOptionBox = ({ theme, isMobile, weight, discount, sellingPrice, originalPrice }) => (
  <Box
    sx={{
      border: '1px solid',
      borderColor: theme.palette.success.main,
      background: '#d1f0d2',
      borderRadius: '10px',
      padding: '6px',
      textAlign: 'center',
      height: isMobile ? 85 : 70,
      minWidth: '100px',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      position: 'relative',
    }}
  >
    <Chip
      label={`${discount} OFF`}
      sx={{
        background: theme.palette.success.main,
        color: '#fff',
        position: 'absolute',
        top: '-12px',
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: '10px',
        height: '20px',
      }}
    />
    <Typography variant="body1" sx={{ color: '#616161f5', fontWeight: 'bold' }} color="textPrimary" mt={1.5}>
      {weight}
    </Typography>
    <Typography variant="body2" sx={{ color: '#616161f5', fontWeight: 'bold' }} color="textSecondary">
      ₹{sellingPrice} MRP <s>₹{originalPrice}</s>
    </Typography>
  </Box>
);

export default ProductUnitOptions;
