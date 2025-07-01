import React from 'react';
import { Card, CardMedia, CardContent, Typography, Button, IconButton, Tooltip } from '@mui/material';
import { AccessTime, Add, Remove } from '@mui/icons-material';
import { styled } from '@mui/system';
import { useTheme } from '@mui/material/styles';

const StyledCard = styled(Card)(({ theme }) => ({
    height: '280px',
    display: 'flex',
    margin: '4px 2px',
    flexDirection: 'column',
    justifyContent: 'space-between',
    position: 'relative',
    transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
    boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
    cursor: 'pointer',
    '&:hover': {
        transform: 'scale(1.05)',
        boxShadow: '0px 0px 20px rgba(0, 0, 0, 0.3)',
    },
}));

const ProductCard = ({ product, handleCardClick, handleAdd, handleIncrease, handleDecrease }) => {
    const theme = useTheme();
    return (
        <StyledCard key={product.id} onClick={() => handleCardClick(product.id)}>
            {product.discount && product.discount !== 'null' && product.discount !== 0 && (
                <Typography
                    style={{
                        position: 'absolute',
                        background: theme.palette.success.main,
                        color: 'white',
                        padding: '2px 5px',
                        borderRadius: '0 0 5px 5px',
                        top: 0,
                        right: 0
                    }}
                >
                    {product.discount} OFF
                </Typography>
            )}

            <CardMedia
                component="img"
                height="140"
                image={product.image}
                alt={product.name}
                style={{ objectFit: 'contain' }}
                loading="eager"
                decoding="async"
            />
            <CardContent style={{ padding: '10px', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                    <Typography variant="body2" color="textSecondary" style={{ lineHeight: '24px', display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                        <AccessTime style={{ marginRight: '5px', fontSize: '20px', verticalAlign: 'sub' }} /> {product.delivery_time} min.
                    </Typography>
                    <Tooltip title={product.name}>
                        <Typography
                            variant="body2"
                            component="div"
                            style={{
                                fontWeight: 'bold',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                maxWidth: '100%'
                            }}
                        >
                            {product.name}
                        </Typography>
                    </Tooltip>
                    <Typography variant="body2" color="text.secondary">
                        {product.volume}
                    </Typography>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                    <Typography variant="body2" color="text.primary">
                        {product.price}
                    </Typography>
                    {product.count > 0 ? (
                        <div style={{ display: 'flex', alignItems: 'center', background: theme.palette.primary.main, borderRadius: '4px', padding: '2px 4px', color: 'white' }}>
                            <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleDecrease(product.id); }} style={{ color: 'white', padding: '4px' }}>
                                <Remove />
                            </IconButton>
                            <Typography variant="body2" component="div" style={{ margin: '0 8px', color: 'white' }}>
                                {product.count}
                            </Typography>
                            <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleIncrease(product.id); }} style={{ color: 'white', padding: '4px' }}>
                                <Add />
                            </IconButton>
                        </div>
                    ) : (
                        <Button variant="outlined" size="small" color="primary" onClick={(e) => { e.stopPropagation(); handleAdd(product.id); }} style={{ height: '36px', minWidth: '64px' }}>
                            Add
                        </Button>
                    )}
                </div>
            </CardContent>
        </StyledCard>
    );
};

export default ProductCard; // Make sure this default export exists
