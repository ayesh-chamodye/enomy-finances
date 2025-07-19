import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Box, 
  Paper, 
  Grid, 
  MenuItem, 
  InputAdornment,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import { 
  getExchangeRates, 
  convertCurrency, 
  getSupportedCurrencies,
  ConversionResult
} from '../../services/currencyService';
import { useAuth } from '../../contexts/AuthContext';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../../services/firebase';

const CurrencyConverter: React.FC = () => {
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [amount, setAmount] = useState('1');
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [currencies, setCurrencies] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { currentUser } = useAuth();

  // Fetch supported currencies on component mount
  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        setLoading(true);
        const supportedCurrencies = await getSupportedCurrencies();
        setCurrencies(supportedCurrencies);
      } catch (error) {
        setError('Failed to load currencies. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCurrencies();
  }, []);

  // Handle currency conversion
  const handleConvert = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const result = await convertCurrency(
        fromCurrency,
        toCurrency,
        Number(amount)
      );
      
      setConvertedAmount(result.result);
      setExchangeRate(result.rate);
      
      // Save conversion to history if user is logged in
      if (currentUser) {
        await saveConversionToHistory(result);
        setSuccess(true);
      }
    } catch (error) {
      setError('Failed to convert currency. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Save conversion to user's history in Firestore
  const saveConversionToHistory = async (conversion: ConversionResult) => {
    if (!currentUser) return;
    
    const userRef = doc(db, 'users', currentUser.uid);
    
    await updateDoc(userRef, {
      conversionHistory: arrayUnion({
        fromCurrency: conversion.fromCurrency,
        toCurrency: conversion.toCurrency,
        amount: conversion.amount,
        result: conversion.result,
        rate: conversion.rate,
        timestamp: new Date().toISOString()
      })
    });
  };

  // Swap currencies
  const handleSwapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setConvertedAmount(null);
  };

  // Handle Snackbar close
  const handleCloseSnackbar = () => {
    setSuccess(false);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4, fontWeight: 'bold', color: 'primary.main' }}>
          Currency Converter
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={5}>
            <Typography variant="subtitle1" gutterBottom>
              From
            </Typography>
            <TextField
              select
              fullWidth
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value)}
              disabled={loading || currencies.length === 0}
              sx={{ mb: 2 }}
            >
              {currencies.map((currency) => (
                <MenuItem key={currency} value={currency}>
                  {currency}
                </MenuItem>
              ))}
            </TextField>
            
            <TextField
              fullWidth
              label="Amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    {fromCurrency}
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={2} sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            mt: { xs: 2, md: 5 }
          }}>
            <Button 
              variant="outlined" 
              onClick={handleSwapCurrencies}
              disabled={loading}
              sx={{ borderRadius: '50%', minWidth: '56px', height: '56px' }}
            >
              <SwapHorizIcon />
            </Button>
          </Grid>
          
          <Grid item xs={12} md={5}>
            <Typography variant="subtitle1" gutterBottom>
              To
            </Typography>
            <TextField
              select
              fullWidth
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value)}
              disabled={loading || currencies.length === 0}
              sx={{ mb: 2 }}
            >
              {currencies.map((currency) => (
                <MenuItem key={currency} value={currency}>
                  {currency}
                </MenuItem>
              ))}
            </TextField>
            
            <TextField
              fullWidth
              label="Converted Amount"
              value={convertedAmount !== null ? convertedAmount.toFixed(2) : ''}
              disabled
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    {toCurrency}
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12} sx={{ mt: 3 }}>
            {exchangeRate !== null && (
              <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                Exchange Rate: 1 {fromCurrency} = {exchangeRate.toFixed(6)} {toCurrency}
              </Typography>
            )}
            
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={handleConvert}
              disabled={loading}
              fullWidth
              sx={{ py: 1.5 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Convert'}
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message="Conversion saved to history"
      />
    </Container>
  );
};

export default CurrencyConverter;
