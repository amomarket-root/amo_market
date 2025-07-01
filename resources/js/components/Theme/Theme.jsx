import { createTheme } from "@mui/material/styles";
import "./css/theme.css";

const Theme = createTheme({
  palette: {
    primary: {
      main: "#9F63FF",
    },
    success: {
      main: "#10d915",
    },
    error: {
      main: "#f27474",
    },
    warning: {
      main: "#f7e119",
    },
    secondary: {
      main: "#0f85d9",
    },
  },
  typography: {
    fontFamily: "'Poppins', sans-serif", // Apply Poppins font globally
  },
});

export default Theme;
