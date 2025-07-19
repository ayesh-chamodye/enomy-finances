import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Box, 
  Paper, 
  Grid, 
  Slider,
  InputAdornment,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  CircularProgress
} from '@mui/material';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../../services/firebase';

interface SavingsProjection {
  year: number;
  savings: number;
  interest: number;
  totalContributions: number;
}

const SavingsCalculator: React.FC = () => {
  const [initialAmount, setInitialAmount] = useState<number>(1000);
  const [monthlyContribution, setMonthlyContribution] = useState<number>(100);
  const [interestRate, setInterestRate] = useState<number>(5);
  const [years, setYears] = useState<number>(10);
  const [projections, setProjections] = useState<SavingsProjection[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { currentUser } = useAuth();

  // Calculate savings projection when inputs change
  useEffect(() => {
    calculateProjection();
  }, [initialAmount, monthlyContribution, interestRate, years]);

  // Calculate compound interest and generate projection data
  const calculateProjection = () => {
    const yearlyData: SavingsProjection[] = [];
    let currentSavings = initialAmount;
    let totalContributions = initialAmount;
    const monthlyRate = interestRate / 100 / 12;

    for (let year = 1; year <= years; year++) {
      let yearlyInterest = 0;
      
      // Calculate monthly compounding for the year
      for (let month = 1; month <= 12; month++) {
        const monthlyInterest = currentSavings * monthlyRate;
        yearlyInterest += monthlyInterest;
        currentSavings += monthlyInterest + monthlyContribution;
        totalContributions += monthlyContribution;
      }

      yearlyData.push({
        year,
        savings: Math.round(currentSavings),
        interest: Math.round(yearlyInterest),
        totalContributions: Math.round(totalContributions)
      });
    }

    setProjections(yearlyData);
  };

  // Save calculation to user history
  const saveCalculation = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      const userRef = doc(db, 'users', currentUser.uid);
      
      await updateDoc(userRef, {
        savingsCalculations: arrayUnion({
          initialAmount,
          monthlyContribution,
          interestRate,
          years,
          finalAmount: projections[projections.length - 1]?.savings || 0,
          totalInterest: projections.reduce((sum, p) => sum + p.interest, 0),
          timestamp: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('Error saving calculation:', error);
    } finally {
      setLoading(false);
    }
  };

  // Format currency for display
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Handle year selection change
  const handleYearChange = (event: SelectChangeEvent<number>) => {
    setYears(Number(event.target.value));
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4, fontWeight: 'bold', color: 'primary.main' }}>
          Savings & Investment Calculator
        </Typography>
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Input Parameters
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography gutterBottom>Initial Amount</Typography>
              <TextField
                fullWidth
                type="number"
                value={initialAmount}
                onChange={(e) => setInitialAmount(Number(e.target.value))}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography gutterBottom>Monthly Contribution</Typography>
              <TextField
                fullWidth
                type="number"
                value={monthlyContribution}
                onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography gutterBottom>
                Annual Interest Rate: {interestRate}%
              </Typography>
              <Slider
                value={interestRate}
                onChange={(_, value) => setInterestRate(value as number)}
                min={0}
                max={20}
                step={0.1}
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => `${value}%`}
              />
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <FormControl fullWidth>
                <InputLabel id="years-select-label">Investment Period</InputLabel>
                <Select
                  labelId="years-select-label"
                  value={years}
                  label="Investment Period"
                  onChange={handleYearChange}
                >
                  <MenuItem value={1}>1 Year</MenuItem>
                  <MenuItem value={5}>5 Years</MenuItem>
                  <MenuItem value={10}>10 Years</MenuItem>
                  <MenuItem value={15}>15 Years</MenuItem>
                  <MenuItem value={20}>20 Years</MenuItem>
                  <MenuItem value={30}>30 Years</MenuItem>
                </Select>
              </FormControl>
            </Box>
            
            {currentUser && (
              <Button
                variant="contained"
                color="primary"
                onClick={saveCalculation}
                disabled={loading}
                sx={{ mt: 2 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Save Calculation'}
              </Button>
            )}
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Projection Summary
            </Typography>
            
            {projections.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Paper elevation={1} sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.light', color: 'white' }}>
                      <Typography variant="body2">Final Amount</Typography>
                      <Typography variant="h6">
                        {formatCurrency(projections[projections.length - 1].savings)}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6}>
                    <Paper elevation={1} sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light', color: 'white' }}>
                      <Typography variant="body2">Total Interest</Typography>
                      <Typography variant="h6">
                        {formatCurrency(projections.reduce((sum, p) => sum + p.interest, 0))}
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
            )}
            
            <Box sx={{ height: 300, mt: 4 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={projections}
                  margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="year" 
                    label={{ value: 'Years', position: 'insideBottom', offset: -5 }} 
                  />
                  <YAxis 
                    tickFormatter={(value) => `$${value.toLocaleString()}`}
                    width={80}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
                    labelFormatter={(label) => `Year ${label}`}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="savings" 
                    name="Total Savings" 
                    stroke="#8884d8" 
                    activeDot={{ r: 8 }} 
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="totalContributions" 
                    name="Contributions" 
                    stroke="#82ca9d" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default SavingsCalculator;
