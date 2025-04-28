import React from "react";
import { useRouter } from "next/router";
import { AppBar, Toolbar, Typography, Box } from "@mui/material";
import Image from "next/image";

const Header: React.FC = () => {
    const router = useRouter();
    return (
        <AppBar position="static" className="bg-darkBackground">
            <Toolbar>
                <Box 
                    sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        cursor: 'pointer' 
                    }} 
                    onClick={() => router.push('/')}
                >
                    <Image 
                        src="/whitelogo.svg"
                        alt="Company Logo" 
                        width={60} // Default width
                        height={60} // Default height
                        style={{ width: "auto", height: "auto" }} // Allows scaling
                    />

                    <Typography 
                        variant="h6" 
                        component="div" 
                        sx={{ 
                            flexGrow: 1, 
                            lineHeight: '1.2', // Adjust line height
                            marginTop: '2px' // Move text slightly down
                        }}
                    >
                        Customer Management Portal
                    </Typography>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Header;
