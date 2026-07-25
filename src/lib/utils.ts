import { CURRENCIES, type Currency } from './types';

export function formatPrice(priceInPkr: number, currencyCode: string): string {
  const currency: Currency | undefined = CURRENCIES.find((c) => c.code === currencyCode);
  if (!currency) return `Rs. ${priceInPkr.toLocaleString()}`;
  const converted = priceInPkr * currency.rate;
  const decimals = currency.code === 'PKR' ? 0 : 2;
  return `${currency.symbol} ${converted.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function generateOrderNumber(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `OX-${ts}-${rand}`;
}

export function effectivePrice(price: number, salePrice: number | null): number {
  return salePrice && salePrice < price ? salePrice : price;
}

export function discountPercent(price: number, salePrice: number | null): number | null {
  if (!salePrice || salePrice >= price) return null;
  return Math.round(((price - salePrice) / price) * 100);
}
