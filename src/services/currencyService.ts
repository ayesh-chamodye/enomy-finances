import axios from 'axios';

// Using ExchangeRate-API for currency conversion
// You'll need to sign up for a free API key at https://www.exchangerate-api.com/
const API_KEY = '37d4b8ce3b3dbdf134669df2';
const BASE_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}`;

export interface ExchangeRates {
  base: string;
  rates: Record<string, number>;
  time_last_updated: number;
}

export interface ConversionResult {
  fromCurrency: string;
  toCurrency: string;
  amount: number;
  result: number;
  rate: number;
  timestamp: number;
}

// Fetch latest exchange rates for a base currency
export const getExchangeRates = async (baseCurrency: string = 'USD'): Promise<ExchangeRates> => {
  try {
    const response = await axios.get(`${BASE_URL}/latest/${baseCurrency}`);
    
    if (response.data.result === 'success') {
      return {
        base: response.data.base_code,
        rates: response.data.conversion_rates,
        time_last_updated: response.data.time_last_update_unix
      };
    }
    throw new Error('Failed to fetch exchange rates');
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    throw error;
  }
};

// Convert amount from one currency to another
export const convertCurrency = async (
  fromCurrency: string,
  toCurrency: string,
  amount: number
): Promise<ConversionResult> => {
  try {
    const rates = await getExchangeRates(fromCurrency);
    const rate = rates.rates[toCurrency];
    
    if (!rate) {
      throw new Error(`Exchange rate not available for ${toCurrency}`);
    }
    
    const result = amount * rate;
    
    return {
      fromCurrency,
      toCurrency,
      amount,
      result,
      rate,
      timestamp: Date.now()
    };
  } catch (error) {
    console.error('Error converting currency:', error);
    throw error;
  }
};

// Get supported currencies list
export const getSupportedCurrencies = async (): Promise<string[]> => {
  try {
    const rates = await getExchangeRates();
    return Object.keys(rates.rates);
  } catch (error) {
    console.error('Error fetching supported currencies:', error);
    throw error;
  }
};

// Save conversion to user history
export const saveConversionToHistory = async (
  userId: string, 
  conversion: ConversionResult
): Promise<void> => {
  // This would typically save to Firebase or another backend
  // Implementation will be handled in the component
};
