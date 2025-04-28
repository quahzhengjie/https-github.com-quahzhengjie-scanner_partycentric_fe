// src/pages/index.tsx
import React from 'react';
import { useRouter } from 'next/router';
import { 
  Box, 
  Button, 
  Container, 
  Grid, 
  Typography, 
  Card, 
  CardContent, 
//   Alert, 
//   Fade,
  Divider,
  Paper
} from '@mui/material';
import { 
  PersonAdd as PersonAddIcon, 
  ManageAccounts as ManageAccountsIcon,
 // Info as InfoIcon
} from '@mui/icons-material';
import Header from '../components/Header';

const Home: React.FC = () => {
    const router = useRouter();

    const handleOnboarding = () => {
        router.push('/onboarding');
    }

    const handleKyc = () => {
        router.push('/kyc');
    }

    return (
        <div className="min-h-screen bg-darkBackground text-darkText flex flex-col">
            <Header />
            <Container 
                maxWidth="lg" 
                className="flex-grow py-8"
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    height: {
                        xs: 'calc(100vh - 56px)', // Mobile header height
                        sm: 'calc(100vh - 64px)'  // Desktop header height
                    }
                }}
            >
                {/* Demo Notice
                <Fade in={true} timeout={1000}>
                    <Alert 
                        severity="info" 
                        icon={<InfoIcon />}
                        sx={{ 
                            mb: 4, 
                            borderRadius: 2,
                            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                        }}
                    >
                        <Typography variant="body1">
                            <strong>Demo Environment:</strong> This application uses mock data that resets to default when the page refreshes.
                        </Typography>
                    </Alert>
                </Fade> */}

                {/* Welcome Section */}
                <Paper 
                    elevation={0}
                    sx={{ 
                        bgcolor: 'transparent',
                        mb: 6, 
                        px: 3, 
                        pt: 2,
                        pb: 3,
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 3
                    }}
                >
                    <Typography 
                        variant="h3" 
                        component="h1" 
                        fontWeight="bold"
                        sx={{ 
                            mb: 2,
                            background: 'linear-gradient(90deg, #4776E6 0%, #8E54E9 100%)',
                            backgroundClip: 'text',
                            textFillColor: 'transparent',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}
                    >
                        Customer Management Portal
                    </Typography>
                    <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                        Streamline your customer onboarding and KYC processes with our unified platform
                    </Typography>
                    <Divider sx={{ mb: 3, opacity: 0.3 }} />
                    <Typography variant="body1">
                        Select an option below to get started with customer management tasks.
                    </Typography>
                </Paper>

                {/* Main Options */}
                <Grid 
                    container 
                    spacing={4} 
                    sx={{ 
                        flexGrow: 1,
                        alignItems: 'stretch'
                    }}
                >
                    <Grid item xs={12} md={6}>
                        <Card 
                            sx={{ 
                                height: '100%', 
                                display: 'flex', 
                                flexDirection: 'column',
                                transition: 'transform 0.3s, box-shadow 0.3s',
                                '&:hover': {
                                    transform: 'translateY(-10px)',
                                    boxShadow: '0 12px 20px rgba(0,0,0,0.2)'
                                },
                                bgcolor: '#2A3049',
                                borderRadius: 3,
                                overflow: 'hidden'
                            }}
                        >
                            <Box 
                                sx={{ 
                                    height: 12, 
                                    bgcolor: '#4CAF50' 
                                }} 
                            />
                            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 4 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                                    <PersonAddIcon sx={{ fontSize: 60, color: '#4CAF50' }} />
                                </Box>
                                <Typography 
                                    variant="h4" 
                                    component="h2" 
                                    align="center" 
                                    gutterBottom 
                                    fontWeight="bold"
                                >
                                    Customer Onboarding
                                </Typography>
                                <Typography variant="body1" sx={{ mb: 4 }} align="center">
                                    Register new customers and start their onboarding journey. 
                                    Collect personal information and initiate document collection.
                                </Typography>
                                <Box sx={{ mt: 'auto', textAlign: 'center' }}>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        size="large"
                                        onClick={handleOnboarding}
                                        startIcon={<PersonAddIcon />}
                                        sx={{ 
                                            py: 1.5,
                                            px: 4,
                                            borderRadius: 2,
                                            fontWeight: 'bold',
                                            boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                                            transition: 'transform 0.2s',
                                            '&:hover': {
                                                transform: 'translateY(-3px)'
                                            }
                                        }}
                                    >
                                        Start Onboarding
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Card 
                            sx={{ 
                                height: '100%', 
                                display: 'flex', 
                                flexDirection: 'column',
                                transition: 'transform 0.3s, box-shadow 0.3s',
                                '&:hover': {
                                    transform: 'translateY(-10px)',
                                    boxShadow: '0 12px 20px rgba(0,0,0,0.2)'
                                },
                                bgcolor: '#2A3049',
                                borderRadius: 3,
                                overflow: 'hidden'
                            }}
                        >
                            <Box 
                                sx={{ 
                                    height: 12, 
                                    bgcolor: '#2196F3' 
                                }} 
                            />
                            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 4 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                                    <ManageAccountsIcon sx={{ fontSize: 60, color: '#2196F3' }} />
                                </Box>
                                <Typography 
                                    variant="h4" 
                                    component="h2" 
                                    align="center" 
                                    gutterBottom 
                                    fontWeight="bold"
                                >
                                    Customer Management
                                </Typography>
                                <Typography variant="body1" sx={{ mb: 4 }} align="center">
                                    Search for existing customers, validate their documents, 
                                    and manage their KYC status for ongoing compliance.
                                </Typography>
                                <Box sx={{ mt: 'auto', textAlign: 'center' }}>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        size="large"
                                        onClick={handleKyc}
                                        startIcon={<ManageAccountsIcon />}
                                        sx={{ 
                                            py: 1.5,
                                            px: 4,
                                            borderRadius: 2,
                                            fontWeight: 'bold',
                                            boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                                            transition: 'transform 0.2s',
                                            '&:hover': {
                                                transform: 'translateY(-3px)'
                                            }
                                        }}
                                    >
                                        Manage Customers
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Footer Note */}
                <Box 
                    sx={{ 
                        mt: 4, 
                        textAlign: 'center',
                        opacity: 0.7
                    }}
                >
                    <Typography variant="body2" color="text.secondary">
                        © 2025 BKB Scanner System • Proof of Concept Demo
                    </Typography>
                </Box>
            </Container>
        </div>
    );
};

export default Home;