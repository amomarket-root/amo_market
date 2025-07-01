import React, { useState, useEffect } from "react";
import { alpha } from "@mui/material/styles"; // Import alpha utility
import axios from "axios";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Popper from "@mui/material/Popper";
import { useNavigate } from "react-router-dom"; // Import useNavigate

const SearchComponent = () => {
    const apiUrl = import.meta.env.VITE_API_URL;
    const [placeholder, setPlaceholder] = useState("Search");
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState({
        products: [],
        categories: [],
        shops: [],
        sub_categories: [],
    });
    const navigate = useNavigate(); // Initialize useNavigate

    const placeholders = ['Search "milk"', 'Search "rice"', 'Search "apple"', 'Search "chocolate"', 'Search "bread"'];
    let index = 0;

    useEffect(() => {
        const interval = setInterval(() => {
            index = (index + 1) % placeholders.length; // Loop through the placeholders
            setPlaceholder(placeholders[index]);
        }, 3000); // Change every 3 seconds

        return () => clearInterval(interval); // Cleanup on unmount
    }, []);

    useEffect(() => {
        const fetchSearchResults = async () => {
            if (searchQuery) {
                try {
                    // Retrieve latitude and longitude from local storage
                    const latitude = localStorage.getItem('latitude');
                    const longitude = localStorage.getItem('longitude');
                    const radius = 2; // Example radius in kilometers

                    // Make the API request with location parameters
                    const response = await axios.get(`${apiUrl}/portal/search`, {
                        params: {
                            query: searchQuery,
                            latitude: latitude,
                            longitude: longitude,
                            radius: radius,
                        }
                    });

                    setSearchResults(response.data);
                } catch (error) {
                    console.error("There was an error fetching the search results!", error);
                }
            } else {
                // Clear search results if the search query is empty
                setSearchResults({
                    products: [],
                    categories: [],
                    shops: [],
                    sub_categories: [],
                });
            }
        };

        fetchSearchResults();
    }, [searchQuery]);

    // Combine all search results into a single array for Autocomplete
    const allResults = [
        ...searchResults.products.map(product => ({ ...product, type: 'product' })),
        ...searchResults.categories.map(category => ({ ...category, type: 'category' })),
        ...searchResults.shops.map(shop => ({ ...shop, type: 'shop' })),
        ...searchResults.sub_categories.map(subCategory => ({ ...subCategory, type: 'sub_category' })),
    ];

    const handleResultClick = (option) => {
        if (option.type === 'category') {
            // Navigate to the category route with the category ID
            navigate(`/all_product/${option.id}`);
        }
        if (option.type === 'sub_category') {
            // Navigate to the sub-category route with the sub-category ID
            navigate(`/all_product/subcategory/${option.category_id}`);
        }
        if (option.type === 'product') {
            // Navigate to the product route with the product ID
            navigate(`/product-details/${option.id}`);
        }
        if (option.type === 'shop') {
            // Navigate to the shop route with the shop ID
            navigate(`/shop_product_list/${option.id}`);
        }
    };

    return (
        <Autocomplete
            size="small"
            freeSolo
            options={allResults}
            getOptionLabel={(option) => option.name}
            onInputChange={(event, newValue) => {
                setSearchQuery(newValue);
            }}
            onChange={(event, value) => {
                if (value) {
                    handleResultClick(value);
                }
            }}
            renderOption={(props, option) => (
                <ListItem
                    {...props}
                    key={`${option.type}-${option.id}`}
                    sx={{ width: "100%" }} // Full width for each list item
                >
                    <ListItemText
                        primary={option.name}
                        primaryTypographyProps={{ style: { color: 'black' } }}
                    />
                    <ListItemAvatar>
                        <Avatar src={option.image} alt={option.name} sx={{ borderRadius: '4px' }} />
                    </ListItemAvatar>
                </ListItem>
            )}
            renderInput={(params) => (
                <TextField
                    {...params}
                    placeholder={placeholder}
                    InputProps={{
                        ...params.InputProps,
                        startAdornment: <img
                            src="/image/search.gif" // Ensure to replace this with the correct path to the GIF
                            alt="Search"
                            style={{ width: '32px', height: '32px', }} // Adjust the size and margin as needed
                            loading="eager"
                            decoding="async"
                        />,
                    }}
                    sx={{
                        width: "100%",
                        maxWidth: "50ch", // Limit the width of the search box
                        "& .MuiOutlinedInput-root": {
                            borderRadius: 16, // Rounded corners
                            backgroundColor: alpha("#000000", 0.05), // Use alpha for background color
                            "&:hover": {
                                backgroundColor: alpha("#000000", 0.1), // Use alpha for hover background
                            },
                            border: `1px solid ${alpha("#000000", 0.15)}`, // Use alpha for border color
                        },
                    }}
                />
            )}
            sx={{
                width: "100%",
                maxWidth: "50ch", // Limit the width of the Autocomplete component
            }}
            PopperComponent={(props) => (
                <Popper
                    {...props}
                    sx={{
                        width: "100%", // Full width for the dropdown
                        zIndex: 1500, // Ensure it appears above other elements
                    }}
                />
            )}
        />
    );
};

export default SearchComponent;
