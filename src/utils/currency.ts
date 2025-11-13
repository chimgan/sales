import { Currency } from '../types';

export const getCurrencySymbol = (currency: Currency): string => {
  const symbols: Record<Currency, string> = {
    TRY: '₺',
    USD: '$',
    EUR: '€',
    RUB: '₽',
  };
  return symbols[currency];
};

export const formatPrice = (price: number, currency: Currency): string => {
  const symbol = getCurrencySymbol(currency);
  return `${symbol}${price.toLocaleString()}`;
};
