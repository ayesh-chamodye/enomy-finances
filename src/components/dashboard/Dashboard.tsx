import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Grid, 
  Card, 
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
  Button
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useNavigate } from 'react-router-dom';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import SavingsIcon from '@mui/icons-material/Savings';

interface ConversionHistory {
  fromCurrency: string;
  toCurrency: string;
  amount: number;
  result: number;
  rate: number;
  timestamp: string;
}

interface SavingsCalculation {
  initialAmount: number;
  monthlyContribution: number;
  interestRate: number;
  years: number;
  finalAmount: number;
  totalInterest: number;
  timestamp: string;
}

interface UserData {
  email: string;
  conversionHistory: ConversionHistory[];
  savingsCalculations: SavingsCalculation[];
}

const Dashboard: React.FC = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        const userRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          setUserData(userSnap.data() as UserData);
        } else {
          console.log('No user data found');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  // Format currency for display
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(value);
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Dashboard
        </Typography>
        <Button variant="outlined" color="primary" onClick={handleLogout}>
          Logout
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Quick Actions */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Button 
                  variant="contained" 
                  fullWidth 
                  startIcon={<CurrencyExchangeIcon />}
                  onClick={() => navigate('/currency-converter')}
                  sx={{ py: 1.5 }}
                >
                  Currency Converter
                </Button>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Button 
                  variant="contained" 
                  fullWidth 
                  startIcon={<SavingsIcon />}
                  onClick={() => navigate('/savings-calculator')}
                  sx={{ py: 1.5 }}
                >
                  Savings Calculator
                </Button>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Button 
                  variant="contained" 
                  fullWidth 
                  startIcon={<AccountBalanceWalletIcon />}
                  onClick={() => navigate('/profile')}
                  sx={{ py: 1.5 }}
                >
                  Profile Settings
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Recent Currency Conversions */}
        <Grid item xs={12} md={6}>
          <Card elevation={2} sx={{ height: '100%', borderRadius: 2 }}>
            <CardHeader 
              title="Recent Currency Conversions" 
              sx={{ 
                backgroundColor: 'primary.light', 
                color: 'white',
                '& .MuiCardHeader-title': { fontSize: '1.2rem' }
              }} 
            />
            <CardContent>
              {userData?.conversionHistory && userData.conversionHistory.length > 0 ? (
                <List>
                  {userData.conversionHistory
                    .slice()
                    .reverse()
                    .slice(0, 5)
                    .map((conversion, index) => (
                      <React.Fragment key={index}>
                        <ListItem>
                          <ListItemText
                            primary={
                              <Typography variant="body1">
                                {formatCurrency(conversion.amount)} {conversion.fromCurrency} → {formatCurrency(conversion.result)} {conversion.toCurrency}
                              </Typography>
                            }
                            secondary={formatDate(conversion.timestamp)}
                          />
                        </ListItem>
                        {index < Math.min(userData.conversionHistory.length - 1, 4) && <Divider />}
                      </React.Fragment>
                    ))}
                </List>
              ) : (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <Typography variant="body1" color="text.secondary">
                    No conversion history yet
                  </Typography>
                  <Button 
                    variant="text" 
                    color="primary" 
                    onClick={() => navigate('/currency-converter')}
                    sx={{ mt: 1 }}
                  >
                    Make your first conversion
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Savings Calculations */}
        <Grid item xs={12} md={6}>
          <Card elevation={2} sx={{ height: '100%', borderRadius: 2 }}>
            <CardHeader 
              title="Recent Savings Calculations" 
              sx={{ 
                backgroundColor: 'success.light', 
                color: 'white',
                '& .MuiCardHeader-title': { fontSize: '1.2rem' }
              }} 
            />
            <CardContent>
              {userData?.savingsCalculations && userData.savingsCalculations.length > 0 ? (
                <List>
                  {userData.savingsCalculations
                    .slice()
                    .reverse()
                    .slice(0, 5)
                    .map((calculation, index) => (
                      <React.Fragment key={index}>
                        <ListItem>
                          <ListItemText
                            primary={
                              <Typography variant="body1">
                                {formatCurrency(calculation.initialAmount)} → {formatCurrency(calculation.finalAmount)} ({calculation.years} years)
                              </Typography>
                            }
                            secondary={`${calculation.interestRate}% interest, ${formatCurrency(calculation.monthlyContribution)}/month - ${formatDate(calculation.timestamp)}`}
                          />
                        </ListItem>
                        {index < Math.min(userData.savingsCalculations.length - 1, 4) && <Divider />}
                      </React.Fragment>
                    ))}
                </List>
              ) : (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <Typography variant="body1" color="text.secondary">
                    No savings calculations yet
                  </Typography>
                  <Button 
                    variant="text" 
                    color="primary" 
                    onClick={() => navigate('/savings-calculator')}
                    sx={{ mt: 1 }}
                  >
                    Calculate your savings
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
