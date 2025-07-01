import React from "react";
import { Card, Box, Typography, IconButton } from "@mui/material";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";

const PaymentMethodCard = ({ method, onClick, isComingSoon }) => {
  return (
    <Card
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 1,
        padding: 2,
        height: "80px",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        borderRadius: "12px",
        cursor: "pointer",
        backgroundColor: "#f5f5f5", // light grey background
      }}
      onClick={onClick}
    >
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <IconButton>{method.icon}</IconButton>
        <Box>
          <Typography variant="subtitle1" fontWeight="bold">
            {method.title}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {method.description}
          </Typography>
        </Box>
      </Box>
      <Box sx={{ display: "flex", alignItems: "center" }}>
        {isComingSoon && (
          <Box
            sx={{
              backgroundColor: "#ffebee", // Light red background
              color: "#d32f2f", // Dark red text
              padding: "3px 6px",
              borderRadius: "10px",
              fontWeight: "bold",
              marginRight: 1,
            }}
          >
            <Typography sx={{textAlign:"center"}} variant="body2">Coming Soon</Typography>
          </Box>
        )}
        <IconButton>
          <ArrowRightIcon />
        </IconButton>
      </Box>
    </Card>
  );
};

export default PaymentMethodCard;
