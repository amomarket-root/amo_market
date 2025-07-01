import React from 'react';
import { Typography, Box, Divider, Avatar } from '@mui/material';

const CustomerSupportFeatures = () => {
  const features = [
    {
      icon: '/image/delivery_box_1.png',
      title: 'Superfast Delivery',
      description: 'Get your order delivered to your doorstep at the earliest from shop near you.',
    },
    {
      icon: '/image/best_Price_2.png',
      title: 'Best Prices & Offers',
      description: 'Best price destination with offers directly from the manufacturers.',
    },
    {
      icon: '/image/wide_3.png',
      title: 'Wide Assortment',
      description: 'Choose from 5000+ products across food, personal care, household & other categories.',
    },
    {
      icon: '/image/cashback_4.png',
      title: 'Cash Back !',
      description: 'Earn cash back rewards on every order you place, making your shopping experience more rewarding and cost-effective. Shop more, save more!',
    },
    {
      icon: '/image/rewards_5.png',
      title: 'Refer and Earn !',
      description: 'Earn rewards by referring your friends and family. Share the joy of shopping, and get exclusive bonuses for every successful referral. It\'s a win-win for everyone!',
    },
    {
      icon: '/image/five_delivery_6.png',
      title: 'First 3 Deliveries Free!',
      description: 'Enjoy the convenience of having your first 3 orders delivered for free! Start shopping now and take advantage of this limited-time offer.',
    },
  ];

  return (
    <>
      <Divider sx={{ color: '#616161f5', fontWeight: 'bold', marginTop: '20px', marginBottom: '10px' }}>Need Help / Support ?</Divider>
      <Box sx={{ marginLeft: '10px' }}>
        <Typography variant="h6" sx={{ color: '#363237', fontWeight: 'bold', marginTop: '10px', marginBottom: '4px' }} gutterBottom>
          Customer Care Details :
        </Typography>
        <Typography variant="body2" color="textSecondary" display="block">
          Email : info@amomarket.com
        </Typography>
        <Typography variant="body2" color="textSecondary" display="block">
          Phone : +91 70083 92889
        </Typography>
        <Typography variant="body2" color="textSecondary" display="block">
          Whatsapp(B) : +91 70083 92889
        </Typography>
        <Typography variant="body2" color="textSecondary" display="block">
          Telegram(B) : +91 70083 92889
        </Typography>
      </Box>
      <Box sx={{ marginLeft: '10px', marginTop: '20px' }}>
        <Typography variant="h6" sx={{ color: '#363237', fontWeight: 'bold', marginTop: '10px', marginBottom: '4px' }} gutterBottom>
          Why shop from us?
        </Typography>
        {features.map((feature, index) => (
          <Box key={index} display="flex" alignItems="center" mt={1} mb={2}>
            <Avatar src={feature.icon} sx={{ width: 70, height: 70, marginRight: '16px', borderRadius: '2px' }} loading="eager"
              decoding="async" />
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                {feature.title}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {feature.description}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </>
  );
};

export default CustomerSupportFeatures;
