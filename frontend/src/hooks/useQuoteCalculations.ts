import { useMemo } from 'react';
import type { QuoteLineItem, QuoteCalculations, VatBreakdownEntry } from '../types/quote';

/**
 * Derives all financial figures from the raw line items and global discount.
 *
 * Calculation order:
 *  1. Per-line HT = qty × unit price × (1 − line discount %)
 *  2. Sum of line HTs → totalHTBeforeDiscount
 *  3. Global discount applied on the sum → totalHT
 *  4. Per-line VAT = lineHT × (1 − global discount %) × VAT rate
 *  5. Group VAT amounts by rate for the breakdown table
 */
export function useQuoteCalculations(
  items: QuoteLineItem[],
  globalDiscount: number,
): QuoteCalculations {
  return useMemo<QuoteCalculations>(() => {
    // Step 1 – per-line HT totals after line-level discount
    const lineTotalsHT = items.map(({ quantity, unitPriceHT, discount }) => {
      const gross = quantity * unitPriceHT;
      return gross * (1 - discount / 100);
    });

    // Step 2 – subtotal before global discount
    const totalHTBeforeDiscount = lineTotalsHT.reduce((acc, v) => acc + v, 0);

    // Step 3 – global discount
    const globalDiscountAmount = totalHTBeforeDiscount * (globalDiscount / 100);
    const totalHT = totalHTBeforeDiscount - globalDiscountAmount;

    // Step 4 – VAT breakdown (global discount applied proportionally per line)
    const vatMap = new Map<number, number>();
    items.forEach(({ vatRate }, index) => {
      const lineHTAfterAll = lineTotalsHT[index] * (1 - globalDiscount / 100);
      const vatAmount = lineHTAfterAll * (vatRate / 100);
      vatMap.set(vatRate, (vatMap.get(vatRate) ?? 0) + vatAmount);
    });

    const vatBreakdown: VatBreakdownEntry[] = Array.from(vatMap.entries())
      .map(([rate, amount]) => ({ rate, amount }))
      .sort((a, b) => a.rate - b.rate);

    const totalVat = vatBreakdown.reduce((acc, { amount }) => acc + amount, 0);
    const totalTTC = totalHT + totalVat;

    return {
      lineTotalsHT,
      totalHTBeforeDiscount,
      globalDiscountAmount,
      totalHT,
      vatBreakdown,
      totalVat,
      totalTTC,
    };
  }, [items, globalDiscount]);
}
