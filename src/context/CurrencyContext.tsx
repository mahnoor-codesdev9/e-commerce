import { createContext, useContext, useState, type ReactNode } from 'react';
import { CURRENCIES, type Currency } from '@/lib/types';

type CurrencyContextType = {
  currency: Currency;
  setCurrency: (code: string) => void;
  format: (priceInPkr: number) => string;
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>(() => {
    const stored = localStorage.getItem('outrex-currency');
    return CURRENCIES.find((c) => c.code === stored) ?? CURRENCIES[0];
  });

  const setCurrency = (code: string) => {
    const found = CURRENCIES.find((c) => c.code === code);
    if (found) {
      setCurrencyState(found);
      localStorage.setItem('outrex-currency', code);
    }
  };

  const format = (priceInPkr: number) => {
    const converted = priceInPkr * currency.rate;
    const decimals = currency.code === 'PKR' ? 0 : 2;
    return `${currency.symbol} ${converted.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, format }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider');
  return ctx;
}
