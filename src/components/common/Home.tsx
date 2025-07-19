import React from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Button, 
  Paper,
  Card,
  CardContent,
  CardMedia,
  Grid
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import SavingsIcon from '@mui/icons-material/Savings';
import SecurityIcon from '@mui/icons-material/Security';
import { useAuth } from '../../contexts/AuthContext';
import heroLogo from '../../assets/images/logo.png';

const Home = () => {
  const { currentUser } = useAuth();

  return (
    <>
      {/* Hero Section */}
      <Box 
        sx={{ 
          bgcolor: 'primary.main', 
          color: 'white', 
          py: 8,
          borderRadius: { xs: 0, md: '0 0 50px 50px' }
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Typography 
                variant="h2" 
                component="h1" 
                sx={{ 
                  fontWeight: 'bold',
                  mb: 2,
                  fontSize: { xs: '2.5rem', md: '3.5rem' }
                }}
              >
                Smart Financial Solutions for Everyone
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: 4,
                  opacity: 0.9,
                  maxWidth: '90%'
                }}
              >
                Manage your finances, convert currencies, and plan your savings with our powerful tools.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {currentUser ? (
                  <Button 
                    variant="contained" 
                    color="secondary" 
                    size="large"
                    component={RouterLink}
                    to="/dashboard"
                    sx={{ px: 4, py: 1.5 }}
                  >
                    Go to Dashboard
                  </Button>
                ) : (
                  <>
                    <Button 
                      variant="contained" 
                      color="secondary" 
                      size="large"
                      component={RouterLink}
                      to="/register"
                      sx={{ px: 4, py: 1.5 }}
                    >
                      Get Started
                    </Button>
                    <Button 
                      variant="outlined" 
                      color="inherit" 
                      size="large"
                      component={RouterLink}
                      to="/login"
                      sx={{ px: 4, py: 1.5 }}
                    >
                      Sign In
                    </Button>
                  </>
                )}
              </Box>
            </Grid>
            <Grid item xs={12} md={6} sx={{ display: { xs: 'none', md: 'block' } }}>
              <Box
                component="img"
                src={heroLogo}
                alt="Financial Management"
                sx={{
                  width: '100%',
                  maxHeight: '400px',
                  objectFit: 'contain'
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography 
          variant="h4" 
          component="h2" 
          align="center" 
          gutterBottom
          sx={{ 
            fontWeight: 'bold',
            mb: 6
          }}
        >
          Our Features
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Card 
              elevation={3}
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.3s',
                '&:hover': {
                  transform: 'translateY(-8px)'
                },
                borderRadius: 2
              }}
            >
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                <CurrencyExchangeIcon sx={{ fontSize: 60, color: 'primary.main' }} />
              </Box>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="h3" align="center">
                  Currency Converter
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Convert between multiple currencies with real-time exchange rates. Save your conversion history for future reference.
                </Typography>
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <Button 
                    variant="outlined" 
                    color="primary"
                    component={RouterLink}
                    to="/currency-converter"
                  >
                    Convert Currency
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card 
              elevation={3}
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.3s',
                '&:hover': {
                  transform: 'translateY(-8px)'
                },
                borderRadius: 2
              }}
            >
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                <SavingsIcon sx={{ fontSize: 60, color: 'primary.main' }} />
              </Box>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="h3" align="center">
                  Savings Calculator
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Plan your financial future with our powerful savings calculator. See how your investments grow over time with compound interest.
                </Typography>
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <Button 
                    variant="outlined" 
                    color="primary"
                    component={RouterLink}
                    to="/savings-calculator"
                  >
                    Calculate Savings
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card 
              elevation={3}
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.3s',
                '&:hover': {
                  transform: 'translateY(-8px)'
                },
                borderRadius: 2
              }}
            >
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                <SecurityIcon sx={{ fontSize: 60, color: 'primary.main' }} />
              </Box>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="h3" align="center">
                  Secure Dashboard
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Keep track of your financial activities with a personalized dashboard. View your history and manage your account securely.
                </Typography>
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <Button 
                    variant="outlined" 
                    color="primary"
                    component={RouterLink}
                    to={currentUser ? "/dashboard" : "/register"}
                  >
                    {currentUser ? "View Dashboard" : "Sign Up"}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box sx={{ bgcolor: 'grey.100', py: 8 }}>
        <Container maxWidth="md">
          <Paper 
            elevation={3}
            sx={{ 
              p: 4, 
              textAlign: 'center',
              borderRadius: 2,
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              color: 'white'
            }}
          >
            <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
              Ready to take control of your finances?
            </Typography>
            <Typography variant="body1" paragraph sx={{ mb: 4, opacity: 0.9 }}>
              Join thousands of users who are already managing their finances smarter with Enomy Finances.
            </Typography>
            <Button 
              variant="contained" 
              color="secondary" 
              size="large"
              component={RouterLink}
              to={currentUser ? "/dashboard" : "/register"}
              sx={{ px: 4, py: 1.5 }}
            >
              {currentUser ? "Go to Dashboard" : "Create Free Account"}
            </Button>
          </Paper>
        </Container>
      </Box>
    </>
  );
}

export default Home;
