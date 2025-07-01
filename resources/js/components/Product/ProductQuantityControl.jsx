import React from 'react';
import { Button, IconButton, Typography, Box } from '@mui/material';
import { Add, Remove } from '@mui/icons-material';

const ProductQuantityControl = ({
  count,
  handleAdd,
  handleIncrease,
  handleDecrease
}) => {
  return (
    <Box mt={2} display="flex">
      {count > 0 ? (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            background: theme => theme.palette.primary.main,
            borderRadius: '4px',
            padding: '2px 4px',
            color: 'white',
            width: '140px',
            justifyContent: 'space-between',
          }}
        >
          <IconButton size="small" onClick={handleDecrease} style={{ color: 'white', padding: '4px' }}>
            <Remove />
          </IconButton>
          <Typography variant="body2" component="div" style={{ margin: '0 8px', color: 'white' }}>
            {count}
          </Typography>
          <IconButton size="small" onClick={handleIncrease} style={{ color: 'white', padding: '4px' }}>
            <Add />
          </IconButton>
        </Box>
      ) : (
        <Button
          variant="contained"
          size="small"
          color="primary"
          onClick={handleAdd}
          style={{ height: '36px', minWidth: '150px' }}
        >
          Add
        </Button>
      )}
    </Box>
  );
};

export default ProductQuantityControl;
