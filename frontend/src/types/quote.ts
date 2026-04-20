/**
 * Core domain types for the quote (devis) feature.
 * All monetary values are stored as numbers (floating-point euros).
 */

export type VatRate = 0 | 5.5 | 10 | 20;

export type ItemUnit =
  | 'unité'
  | 'heure'
  | 'jour'
  | 'forfait'
  | 'mois'
  | 'm²'
  | 'kg'
  | 'litre';

// ── Emitter ──────────────────────────────────────────────────────────────────

export interface QuoteEmitter {
  companyName: string;
  address: string;
  postalCode: string;
  city: string;
  phone: string;
  email: string;
  siret: string;
  apeCode: string;
  rcsCity: string;
  vatNumber: string;
  insurance: string; // Assurance décennale (BTP artisans)
}

// ── Client ────────────────────────────────────────────────────────────────────

export interface QuoteClient {
  name: string;
  company: string;
  billingAddress: string;
  billingPostalCode: string;
  billingCity: string;
  useDifferentDelivery: boolean;
  deliveryAddress: string;
  deliveryPostalCode: string;
  deliveryCity: string;
}

// ── Line Items ────────────────────────────────────────────────────────────────

export interface QuoteLineItem {
  id: string;
  description: string;
  quantity: number;
  unit: ItemUnit;
  unitPriceHT: number;
  vatRate: VatRate;
  discount: number; // percentage 0–100 per line
}

// ── Administrative ────────────────────────────────────────────────────────────

export interface QuoteAdminInfo {
  quoteNumber: string;
  issueDate: string;        // ISO date string
  validityDays: number;
  globalDiscount: number;   // percentage applied to total HT
}

// ── Terms & Execution ─────────────────────────────────────────────────────────

export interface QuoteTerms {
  startDate: string;
  estimatedDuration: string;
  paymentConditions: string;
  depositPercentage: number;
  notes: string;
}

// ── Assembled Quote ───────────────────────────────────────────────────────────

export interface QuoteData {
  admin: QuoteAdminInfo;
  emitter: QuoteEmitter;
  client: QuoteClient;
  items: QuoteLineItem[];
  terms: QuoteTerms;
}

// ── Calculations ──────────────────────────────────────────────────────────────

export interface VatBreakdownEntry {
  rate: number;
  amount: number;
}

export interface QuoteCalculations {
  lineTotalsHT: number[];           // per-line HT after line discount
  totalHTBeforeDiscount: number;
  globalDiscountAmount: number;
  totalHT: number;                  // after global discount
  vatBreakdown: VatBreakdownEntry[];
  totalVat: number;
  totalTTC: number;
}
