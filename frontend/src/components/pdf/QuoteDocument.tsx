import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { QuoteData, QuoteCalculations } from '../../types/quote';

interface QuoteDocumentProps {
  quote: QuoteData;
  calculations: QuoteCalculations;
}

// ── Palette ───────────────────────────────────────────────────────────────────
const C = {
  primary:      '#0369a1',
  primaryLight: '#e0f2fe',
  dark:         '#0f172a',
  medium:       '#334155',
  light:        '#64748b',
  border:       '#e2e8f0',
  bg:           '#f8fafc',
  white:        '#ffffff',
  red:          '#dc2626',
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (n: number): string =>
  n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';

const fmtDate = (dateStr: string): string => {
  if (!dateStr) return '—';
  try {
    return new Intl.DateTimeFormat('fr-FR').format(new Date(dateStr + 'T12:00:00'));
  } catch {
    return dateStr;
  }
};

const addDays = (dateStr: string, days: number): string => {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr + 'T12:00:00');
    d.setDate(d.getDate() + days);
    return new Intl.DateTimeFormat('fr-FR').format(d);
  } catch {
    return '—';
  }
};

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  page: {
    paddingTop: 45,
    paddingBottom: 65,
    paddingHorizontal: 40,
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: C.dark,
    backgroundColor: C.white,
  },

  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 18 },
  emitterBlock: { flex: 1, paddingRight: 16 },
  emitterName: { fontSize: 13, fontFamily: 'Helvetica-Bold', color: C.dark, marginBottom: 5 },
  emitterLine: { fontSize: 8.5, color: C.medium, marginBottom: 2, lineHeight: 1.4 },
  emitterLegal: { fontSize: 7.5, color: C.light, marginTop: 7, lineHeight: 1.5 },
  devisBlock: { alignItems: 'flex-end', minWidth: 190 },
  devisTitle: { fontSize: 30, fontFamily: 'Helvetica-Bold', color: C.primary, letterSpacing: 3, marginBottom: 8 },
  devisMetaRow: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 3 },
  devisMetaLabel: { fontSize: 8, color: C.light, marginRight: 4 },
  devisMetaValue: { fontSize: 8.5, fontFamily: 'Helvetica-Bold', color: C.dark },

  // Dividers
  dividerPrimary: { borderTopWidth: 2, borderTopColor: C.primary, marginBottom: 16 },
  dividerLight: { borderTopWidth: 1, borderTopColor: C.border, marginVertical: 10 },

  // Client block
  clientSection: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 18 },
  clientBox: {
    borderWidth: 1, borderColor: C.border, borderRadius: 4,
    padding: 12, minWidth: 210, backgroundColor: C.bg,
  },
  clientBoxLabel: {
    fontSize: 7, fontFamily: 'Helvetica-Bold', color: C.primary,
    textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 7,
  },
  clientName: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: C.dark, marginBottom: 2 },
  clientLine: { fontSize: 8.5, color: C.medium, lineHeight: 1.5 },

  // Table
  tableHeader: {
    flexDirection: 'row', backgroundColor: C.primary,
    borderRadius: 3, paddingVertical: 7, paddingHorizontal: 5, marginBottom: 1,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 6, paddingHorizontal: 5,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  tableRowAlt: { backgroundColor: C.bg },
  thText: { fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: C.white },
  tdText: { fontSize: 8.5, color: C.medium },
  tdBold: { fontSize: 8.5, fontFamily: 'Helvetica-Bold', color: C.dark },

  // Column widths
  colDesc:     { flex: 3 },
  colQty:      { width: 30, textAlign: 'right' },
  colUnit:     { width: 38, paddingLeft: 4 },
  colPrice:    { width: 56, textAlign: 'right' },
  colDiscount: { width: 36, textAlign: 'right' },
  colVat:      { width: 30, textAlign: 'right' },
  colTotal:    { width: 62, textAlign: 'right' },

  // Financial summary
  summarySection: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 },
  summaryBox: { minWidth: 250 },
  summaryRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 4, paddingHorizontal: 8,
  },
  summaryLabel: { fontSize: 8.5, color: C.medium },
  summaryValue: { fontSize: 8.5, fontFamily: 'Helvetica-Bold', color: C.dark },
  summaryRed:   { fontSize: 8.5, fontFamily: 'Helvetica-Bold', color: C.red },
  summaryDivider: { borderTopWidth: 1, borderTopColor: C.border, marginVertical: 4 },
  totalRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    backgroundColor: C.primary, borderRadius: 4,
    paddingVertical: 9, paddingHorizontal: 8, marginTop: 5,
  },
  totalLabel: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: C.white },
  totalValue: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: C.white },

  // Terms
  termsSection: { marginTop: 20, borderTopWidth: 2, borderTopColor: C.border, paddingTop: 12 },
  termsTitle: {
    fontSize: 8.5, fontFamily: 'Helvetica-Bold', color: C.primary,
    textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 8,
  },
  termsRow: { flexDirection: 'row', marginBottom: 4 },
  termsLabel: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: C.medium, width: 130 },
  termsValue: { fontSize: 8, color: C.dark, flex: 1 },
  termsNote:  { fontSize: 8, color: C.medium, fontStyle: 'italic', marginTop: 5 },
  termsInsurance: { fontSize: 7.5, color: C.light, fontStyle: 'italic', marginTop: 6 },

  // Signature
  sigSection: {
    marginTop: 20, borderWidth: 1, borderColor: C.border,
    borderRadius: 4, padding: 14,
  },
  sigTitle:       { fontSize: 9, fontFamily: 'Helvetica-Bold', color: C.dark, marginBottom: 3 },
  sigInstruction: { fontSize: 8, color: C.light, marginBottom: 16 },
  sigRow:         { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  sigField:       { flex: 1, marginHorizontal: 6 },
  sigLabel:       { fontSize: 7.5, color: C.light, marginBottom: 4 },
  sigLine:        { borderBottomWidth: 1, borderBottomColor: C.border, height: 28 },

  // Footer
  footer: {
    position: 'absolute', bottom: 28, left: 40, right: 40,
    borderTopWidth: 1, borderTopColor: C.border, paddingTop: 7,
  },
  footerText: { fontSize: 7, color: C.light, textAlign: 'center' },
});

// ── Component ─────────────────────────────────────────────────────────────────
export function QuoteDocument({ quote, calculations }: QuoteDocumentProps): JSX.Element {
  const { admin, emitter, client, items, terms } = quote;
  const {
    lineTotalsHT,
    totalHTBeforeDiscount,
    globalDiscountAmount,
    totalHT,
    vatBreakdown,
    totalTTC,
  } = calculations;

  const validityDate = addDays(admin.issueDate, admin.validityDays);
  const depositAmount = (totalTTC * terms.depositPercentage) / 100;

  const footerParts = [
    emitter.companyName || null,
    emitter.siret        ? `SIRET : ${emitter.siret}`        : null,
    emitter.apeCode      ? `APE : ${emitter.apeCode}`        : null,
    emitter.rcsCity      ? `RCS ${emitter.rcsCity}`               : null,
    emitter.vatNumber    ? `N° TVA : ${emitter.vatNumber}` : null,
  ].filter(Boolean).join('   •   ');

  return (
    <Document>
      <Page size="A4" style={s.page}>

        {/* ── HEADER ─────────────────────────────────────────────── */}
        <View style={s.header}>
          {/* Left — emitter */}
          <View style={s.emitterBlock}>
            <Text style={s.emitterName}>{emitter.companyName || 'Votre Entreprise'}</Text>
            {emitter.address     ? <Text style={s.emitterLine}>{emitter.address}</Text>          : null}
            {(emitter.postalCode || emitter.city) &&
              <Text style={s.emitterLine}>{emitter.postalCode} {emitter.city}</Text>}
            {emitter.phone       ? <Text style={s.emitterLine}>Tél : {emitter.phone}</Text>  : null}
            {emitter.email       ? <Text style={s.emitterLine}>{emitter.email}</Text>              : null}
            {(emitter.siret || emitter.apeCode) &&
              <Text style={s.emitterLegal}>
                {[
                  emitter.siret   ? `SIRET : ${emitter.siret}`   : null,
                  emitter.apeCode ? `APE : ${emitter.apeCode}`   : null,
                ].filter(Boolean).join('   ')}
              </Text>}
            {emitter.rcsCity     ? <Text style={s.emitterLegal}>RCS {emitter.rcsCity}</Text>      : null}
            {emitter.vatNumber   ? <Text style={s.emitterLegal}>N° TVA : {emitter.vatNumber}</Text> : null}
          </View>

          {/* Right — DEVIS metadata */}
          <View style={s.devisBlock}>
            <Text style={s.devisTitle}>DEVIS</Text>
            <View style={s.devisMetaRow}>
              <Text style={s.devisMetaLabel}>N°</Text>
              <Text style={s.devisMetaValue}>{admin.quoteNumber || '—'}</Text>
            </View>
            <View style={s.devisMetaRow}>
              <Text style={s.devisMetaLabel}>Date :</Text>
              <Text style={s.devisMetaValue}>{fmtDate(admin.issueDate)}</Text>
            </View>
            <View style={s.devisMetaRow}>
              <Text style={s.devisMetaLabel}>Valable jusqu'au :</Text>
              <Text style={s.devisMetaValue}>{validityDate}</Text>
            </View>
          </View>
        </View>

        {/* ── Blue divider ───────────────────────────────────────── */}
        <View style={s.dividerPrimary} />

        {/* ── CLIENT ─────────────────────────────────────────────── */}
        <View style={s.clientSection}>
          <View style={s.clientBox}>
            <Text style={s.clientBoxLabel}>Destinataire</Text>
            <Text style={s.clientName}>{client.name || '—'}</Text>
            {client.company && <Text style={s.clientLine}>{client.company}</Text>}
            {client.billingAddress && <Text style={s.clientLine}>{client.billingAddress}</Text>}
            {(client.billingPostalCode || client.billingCity) &&
              <Text style={s.clientLine}>{client.billingPostalCode} {client.billingCity}</Text>}
            {client.useDifferentDelivery && (
              <>
                <Text style={[s.clientLine, { marginTop: 6, fontFamily: 'Helvetica-Bold' }]}>Livraison :</Text>
                {client.deliveryAddress   && <Text style={s.clientLine}>{client.deliveryAddress}</Text>}
                {(client.deliveryPostalCode || client.deliveryCity) &&
                  <Text style={s.clientLine}>{client.deliveryPostalCode} {client.deliveryCity}</Text>}
              </>
            )}
          </View>
        </View>

        {/* ── ITEMS TABLE ─────────────────────────────────────────── */}
        {/* Header */}
        <View style={s.tableHeader}>
          <View style={s.colDesc}><Text style={s.thText}>DÉSIGNATION</Text></View>
          <View style={s.colQty}><Text style={s.thText}>QTÉ</Text></View>
          <View style={s.colUnit}><Text style={s.thText}>UNITÉ</Text></View>
          <View style={s.colPrice}><Text style={s.thText}>PU HT</Text></View>
          <View style={s.colDiscount}><Text style={s.thText}>REMISE</Text></View>
          <View style={s.colVat}><Text style={s.thText}>TVA</Text></View>
          <View style={s.colTotal}><Text style={s.thText}>TOTAL HT</Text></View>
        </View>

        {/* Rows */}
        {items.map((item, i) => (
          <View key={item.id} style={[s.tableRow, i % 2 !== 0 ? s.tableRowAlt : {}]}>
            <View style={s.colDesc}><Text style={s.tdText}>{item.description || '—'}</Text></View>
            <View style={s.colQty}>
              <Text style={s.tdText}>{item.quantity.toLocaleString('fr-FR')}</Text>
            </View>
            <View style={s.colUnit}><Text style={s.tdText}>{item.unit}</Text></View>
            <View style={s.colPrice}>
              <Text style={s.tdText}>
                {item.unitPriceHT.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
              </Text>
            </View>
            <View style={s.colDiscount}>
              <Text style={s.tdText}>{item.discount > 0 ? `${item.discount} %` : '—'}</Text>
            </View>
            <View style={s.colVat}><Text style={s.tdText}>{item.vatRate} %</Text></View>
            <View style={s.colTotal}>
              <Text style={s.tdBold}>
                {lineTotalsHT[i].toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
              </Text>
            </View>
          </View>
        ))}

        {items.length === 0 && (
          <View style={[s.tableRow, { justifyContent: 'center', paddingVertical: 14 }]}>
            <Text style={[s.tdText, { color: C.light }]}>Aucune prestation renseignée</Text>
          </View>
        )}

        {/* ── FINANCIAL SUMMARY ───────────────────────────────────── */}
        <View style={s.summarySection}>
          <View style={s.summaryBox}>
            {admin.globalDiscount > 0 && (
              <View style={s.summaryRow}>
                <Text style={s.summaryLabel}>Total HT (avant remise)</Text>
                <Text style={s.summaryValue}>{fmt(totalHTBeforeDiscount)}</Text>
              </View>
            )}
            {admin.globalDiscount > 0 && (
              <View style={s.summaryRow}>
                <Text style={s.summaryLabel}>Remise globale ({admin.globalDiscount} %)</Text>
                <Text style={s.summaryRed}>−{fmt(globalDiscountAmount)}</Text>
              </View>
            )}
            <View style={s.summaryRow}>
              <Text style={s.summaryLabel}>Total HT</Text>
              <Text style={s.summaryValue}>{fmt(totalHT)}</Text>
            </View>
            {vatBreakdown.map(({ rate, amount }) => (
              <View key={rate} style={s.summaryRow}>
                <Text style={s.summaryLabel}>TVA {rate} %</Text>
                <Text style={s.summaryValue}>{fmt(amount)}</Text>
              </View>
            ))}
            <View style={s.summaryDivider} />
            <View style={s.totalRow}>
              <Text style={s.totalLabel}>TOTAL TTC</Text>
              <Text style={s.totalValue}>{fmt(totalTTC)}</Text>
            </View>
          </View>
        </View>

        {/* ── TERMS ───────────────────────────────────────────────── */}
        <View style={s.termsSection}>
          <Text style={s.termsTitle}>Modalités d'exécution et de règlement</Text>

          {terms.startDate && (
            <View style={s.termsRow}>
              <Text style={s.termsLabel}>Date de début :</Text>
              <Text style={s.termsValue}>{fmtDate(terms.startDate)}</Text>
            </View>
          )}
          {terms.estimatedDuration && (
            <View style={s.termsRow}>
              <Text style={s.termsLabel}>Durée estimée :</Text>
              <Text style={s.termsValue}>{terms.estimatedDuration}</Text>
            </View>
          )}
          {terms.paymentConditions && (
            <View style={s.termsRow}>
              <Text style={s.termsLabel}>Conditions de règlement :</Text>
              <Text style={s.termsValue}>{terms.paymentConditions}</Text>
            </View>
          )}
          {terms.depositPercentage > 0 && (
            <View style={s.termsRow}>
              <Text style={s.termsLabel}>Acompte demandé :</Text>
              <Text style={s.termsValue}>
                {terms.depositPercentage} % — {fmt(depositAmount)}
              </Text>
            </View>
          )}
          {terms.notes ? <Text style={s.termsNote}>{terms.notes}</Text> : null}
          {emitter.insurance ? (
            <Text style={s.termsInsurance}>Assurance décennale : {emitter.insurance}</Text>
          ) : null}
        </View>

        {/* ── SIGNATURE ───────────────────────────────────────────── */}
        <View style={s.sigSection}>
          <Text style={s.sigTitle}>Bon pour accord</Text>
          <Text style={s.sigInstruction}>
            À retourner signé avec la mention « Lu et approuvé ».
            {terms.depositPercentage > 0 ? ` Acompte joint : ${fmt(depositAmount)}.` : ''}
          </Text>
          <View style={s.sigRow}>
            <View style={s.sigField}>
              <Text style={s.sigLabel}>Date</Text>
              <View style={s.sigLine} />
            </View>
            <View style={[s.sigField, { flex: 2 }]}>
              <Text style={s.sigLabel}>
                Signature (précédée de la mention « Lu et approuvé »)
              </Text>
              <View style={s.sigLine} />
            </View>
          </View>
        </View>

        {/* ── FOOTER (fixed on every page) ────────────────────────── */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>{footerParts}</Text>
        </View>
      </Page>
    </Document>
  );
}
