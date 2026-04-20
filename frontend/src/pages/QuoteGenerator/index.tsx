import { useState, useCallback, useEffect } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import {
  Building2, User, FileText, Wrench, Calculator,
  ClipboardList, Plus, Trash2, Download, ChevronRight,
  AlertCircle,
} from 'lucide-react';
import type {
  QuoteEmitter, QuoteClient, QuoteAdminInfo,
  QuoteLineItem, QuoteTerms, QuoteData, VatRate, ItemUnit,
} from '../../types/quote';
import { useQuoteCalculations } from '../../hooks/useQuoteCalculations';
import { QuoteDocument } from '../../components/pdf/QuoteDocument';

// ─── Constants ────────────────────────────────────────────────────────────────
const VAT_RATES: VatRate[]  = [0, 5.5, 10, 20];
const UNITS: ItemUnit[] = ['unité', 'heure', 'jour', 'forfait', 'mois', 'm²', 'kg', 'litre'];

const CLS = {
  input:  'w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2.5 text-slate-100 text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30 transition-all placeholder-slate-600',
  label:  'block text-[10px] font-semibold text-slate-500 mb-1.5 uppercase tracking-widest',
};

const SECTIONS = [
  { id: 'emitter',   label: 'Émetteur',       icon: Building2,     color: 'sky'     },
  { id: 'client',    label: 'Client',          icon: User,          color: 'violet'  },
  { id: 'admin',     label: 'Informations',    icon: FileText,      color: 'amber'   },
  { id: 'items',     label: 'Prestations',     icon: Wrench,        color: 'emerald' },
  { id: 'financial', label: 'Récapitulatif',   icon: Calculator,    color: 'rose'    },
  { id: 'terms',     label: 'Modalités',       icon: ClipboardList, color: 'orange'  },
] as const;

// ─── Initial state factories ────────────────────────────────────────────────
const mkQuoteNumber = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')}`;
};

const mkItem = (): QuoteLineItem => ({
  id: crypto.randomUUID(),
  description: '', quantity: 1, unit: 'unité',
  unitPriceHT: 0, vatRate: 20, discount: 0,
});

const DEFAULT_EMITTER: QuoteEmitter = {
  companyName: '', address: '', postalCode: '', city: '',
  phone: '', email: '', siret: '', apeCode: '', rcsCity: '', vatNumber: '', insurance: '',
};
const DEFAULT_CLIENT: QuoteClient = {
  name: '', company: '', billingAddress: '', billingPostalCode: '', billingCity: '',
  useDifferentDelivery: false, deliveryAddress: '', deliveryPostalCode: '', deliveryCity: '',
};
const DEFAULT_ADMIN: QuoteAdminInfo = {
  quoteNumber: mkQuoteNumber(),
  issueDate: new Date().toISOString().split('T')[0],
  validityDays: 30, globalDiscount: 0,
};
const DEFAULT_TERMS: QuoteTerms = {
  startDate: '', estimatedDuration: '', paymentConditions: '',
  depositPercentage: 0, notes: '',
};

// ─── Sub-components ─────────────────────────────────────────────────────────

/** Section wrapper card */
function SCard({ id, icon: Icon, title, desc, accent, children }: {
  id: string; icon: React.ElementType; title: string; desc: string;
  accent: string; children: React.ReactNode;
}) {
  return (
    <section id={id} className="mb-6 scroll-mt-24">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm overflow-hidden hover:border-slate-700 transition-colors">
        {/* Card header */}
        <div className={`flex items-center gap-3 px-6 py-4 border-b border-slate-800 bg-gradient-to-r from-slate-900 to-slate-900/40`}>
          <div className={`p-2 rounded-xl bg-${accent}-500/10 ring-1 ring-${accent}-500/20 text-${accent}-400`}>
            <Icon size={17} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-100">{title}</h2>
            <p className="text-[11px] text-slate-500 mt-0.5">{desc}</p>
          </div>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </section>
  );
}

/** Labelled form field */
function Field({ label, children, span2 }: { label: string; children: React.ReactNode; span2?: boolean }) {
  return (
    <div className={span2 ? 'col-span-2' : ''}>
      <label className={CLS.label}>{label}</label>
      {children}
    </div>
  );
}

/** Currency formatter (FR locale) */
const fmt = (n: number) =>
  n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '\u202f€';

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function QuoteGeneratorPage() {
  const [emitter, setEmitter] = useState<QuoteEmitter>(DEFAULT_EMITTER);
  const [client,  setClient]  = useState<QuoteClient>(DEFAULT_CLIENT);
  const [admin,   setAdmin]   = useState<QuoteAdminInfo>(DEFAULT_ADMIN);
  const [items,   setItems]   = useState<QuoteLineItem[]>([mkItem()]);
  const [terms,   setTerms]   = useState<QuoteTerms>(DEFAULT_TERMS);
  const [activeSection, setActiveSection] = useState('emitter');

  // ── Typed partial updaters ─────────────────────────────────────────────
  const upE = useCallback((p: Partial<QuoteEmitter>)    => setEmitter(v => ({ ...v, ...p })), []);
  const upC = useCallback((p: Partial<QuoteClient>)     => setClient(v  => ({ ...v, ...p })), []);
  const upA = useCallback((p: Partial<QuoteAdminInfo>)  => setAdmin(v   => ({ ...v, ...p })), []);
  const upT = useCallback((p: Partial<QuoteTerms>)      => setTerms(v   => ({ ...v, ...p })), []);

  const addItem    = useCallback(() => setItems(v => [...v, mkItem()]), []);
  const removeItem = useCallback((id: string) => setItems(v => v.filter(i => i.id !== id)), []);
  const updateItem = useCallback((id: string, patch: Partial<QuoteLineItem>) =>
    setItems(v => v.map(i => i.id === id ? { ...i, ...patch } : i)), []);

  // ── Calculations ───────────────────────────────────────────────────────
  const calc = useQuoteCalculations(items, admin.globalDiscount);

  // ── Active section tracker (IntersectionObserver) ──────────────────────
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        const visible = entries.find(e => e.isIntersecting);
        if (visible) setActiveSection(visible.target.id);
      },
      { rootMargin: '-30% 0px -60% 0px' },
    );
    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  // ── Assembled quote data ───────────────────────────────────────────────
  const quoteData: QuoteData = { admin, emitter, client, items, terms };

  const depositTTC = (calc.totalTTC * terms.depositPercentage) / 100;

  return (
    <div className="min-h-screen bg-[#070b13] text-slate-100">

      {/* ════════════════════════════════════════════════════════════════
          FIXED HEADER
      ════════════════════════════════════════════════════════════════ */}
      <header className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-5 
        bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/80">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-lg shadow-sky-500/30">
            <FileText size={14} className="text-white" />
          </div>
          <span className="text-sm font-semibold text-slate-200 hidden sm:block">Générateur de Devis</span>
          <ChevronRight size={13} className="text-slate-600 hidden sm:block" />
          <span className="text-xs text-slate-500 font-mono">{admin.quoteNumber}</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-1.5 mr-2">
            <span className="text-xs text-slate-500">Total TTC</span>
            <span className="text-sm font-bold text-sky-400 font-mono">{fmt(calc.totalTTC)}</span>
          </div>

          <PDFDownloadLink
            document={<QuoteDocument quote={quoteData} calculations={calc} />}
            fileName={`devis-${admin.quoteNumber || 'devis'}.pdf`}
            style={{ textDecoration: 'none' }}
          >
            {({ loading }) => (
              <span className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer
                ${loading
                  ? 'bg-slate-700 text-slate-400'
                  : 'bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white shadow-lg shadow-sky-600/20 hover:shadow-sky-500/30'
                }`}>
                <Download size={14} />
                {loading ? 'Préparation...' : 'Générer le PDF'}
              </span>
            )}
          </PDFDownloadLink>
        </div>
      </header>

      <div className="flex pt-14">

        {/* ════════════════════════════════════════════════════════════════
            FIXED SIDEBAR
        ════════════════════════════════════════════════════════════════ */}
        <aside className="fixed left-0 top-14 bottom-0 w-52 hidden lg:flex flex-col
          bg-slate-900/50 backdrop-blur-sm border-r border-slate-800/60">
          <div className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
            <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest px-3 mb-3">Sections</p>
            {SECTIONS.map(({ id, label, icon: Icon }) => {
              const isActive = activeSection === id;
              return (
                <a
                  key={id}
                  href={`#${id}`}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all
                    ${isActive
                      ? 'bg-sky-500/10 text-sky-400 ring-1 ring-sky-500/20'
                      : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/60'
                    }`}
                >
                  <Icon size={14} />
                  {label}
                  {isActive && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-sky-400" />
                  )}
                </a>
              );
            })}
          </div>

          {/* Mini total in sidebar */}
          <div className="border-t border-slate-800/60 p-4">
            <div className="rounded-xl bg-gradient-to-br from-sky-900/40 to-blue-900/20 border border-sky-800/30 p-3 text-center">
              <p className="text-[9px] text-sky-600 uppercase tracking-widest font-bold mb-1">Total TTC</p>
              <p className="text-base font-bold text-sky-300 font-mono">{fmt(calc.totalTTC)}</p>
              <p className="text-[9px] text-slate-600 mt-0.5">dont TVA {fmt(calc.totalVat)}</p>
            </div>
          </div>
        </aside>

        {/* ════════════════════════════════════════════════════════════════
            MAIN CONTENT
        ════════════════════════════════════════════════════════════════ */}
        <main className="flex-1 lg:ml-52 px-4 sm:px-8 py-8 max-w-4xl mx-auto w-full">

          {/* ── SECTION 1 · ÉMETTEUR ────────────────────────────────── */}
          <SCard id="emitter" icon={Building2} title="Votre Entreprise" desc="Informations légales de l'émetteur" accent="sky">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Raison sociale / Nom" span2>
                <input className={CLS.input} value={emitter.companyName}
                  onChange={e => upE({ companyName: e.target.value })}
                  placeholder="Ma Société SAS" />
              </Field>
              <Field label="Adresse" span2>
                <input className={CLS.input} value={emitter.address}
                  onChange={e => upE({ address: e.target.value })}
                  placeholder="123 Rue de la Paix" />
              </Field>
              <Field label="Code postal">
                <input className={CLS.input} value={emitter.postalCode}
                  onChange={e => upE({ postalCode: e.target.value })}
                  placeholder="75001" />
              </Field>
              <Field label="Ville">
                <input className={CLS.input} value={emitter.city}
                  onChange={e => upE({ city: e.target.value })}
                  placeholder="Paris" />
              </Field>
              <Field label="Téléphone">
                <input className={CLS.input} value={emitter.phone}
                  onChange={e => upE({ phone: e.target.value })}
                  placeholder="01 23 45 67 89" />
              </Field>
              <Field label="Email">
                <input className={CLS.input} type="email" value={emitter.email}
                  onChange={e => upE({ email: e.target.value })}
                  placeholder="contact@masociete.fr" />
              </Field>
              <Field label="N° SIRET">
                <input className={CLS.input} value={emitter.siret}
                  onChange={e => upE({ siret: e.target.value })}
                  placeholder="123 456 789 00012" />
              </Field>
              <Field label="Code APE / NAF">
                <input className={CLS.input} value={emitter.apeCode}
                  onChange={e => upE({ apeCode: e.target.value })}
                  placeholder="6201Z" />
              </Field>
              <Field label="Ville du RCS / RM">
                <input className={CLS.input} value={emitter.rcsCity}
                  onChange={e => upE({ rcsCity: e.target.value })}
                  placeholder="Paris" />
              </Field>
              <Field label="N° TVA intracommunautaire">
                <input className={CLS.input} value={emitter.vatNumber}
                  onChange={e => upE({ vatNumber: e.target.value })}
                  placeholder="FR12345678901" />
              </Field>
              <Field label="Assurance décennale (artisans BTP)" span2>
                <input className={CLS.input} value={emitter.insurance}
                  onChange={e => upE({ insurance: e.target.value })}
                  placeholder="Police n° XXX — Assureur SA — Garantie : travaux de..." />
              </Field>
            </div>
          </SCard>

          {/* ── SECTION 2 · CLIENT ──────────────────────────────────── */}
          <SCard id="client" icon={User} title="Client" desc="Informations du destinataire" accent="violet">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Nom / Prénom">
                <input className={CLS.input} value={client.name}
                  onChange={e => upC({ name: e.target.value })}
                  placeholder="Jean Dupont" />
              </Field>
              <Field label="Société (optionnel)">
                <input className={CLS.input} value={client.company}
                  onChange={e => upC({ company: e.target.value })}
                  placeholder="Entreprise Cliente SAS" />
              </Field>
              <Field label="Adresse de facturation" span2>
                <input className={CLS.input} value={client.billingAddress}
                  onChange={e => upC({ billingAddress: e.target.value })}
                  placeholder="456 Avenue des Champs" />
              </Field>
              <Field label="Code postal">
                <input className={CLS.input} value={client.billingPostalCode}
                  onChange={e => upC({ billingPostalCode: e.target.value })}
                  placeholder="75008" />
              </Field>
              <Field label="Ville">
                <input className={CLS.input} value={client.billingCity}
                  onChange={e => upC({ billingCity: e.target.value })}
                  placeholder="Paris" />
              </Field>

              {/* Toggle delivery address */}
              <div className="col-span-2 mt-1">
                <label className="flex items-center gap-2.5 cursor-pointer select-none w-fit">
                  <div
                    onClick={() => upC({ useDifferentDelivery: !client.useDifferentDelivery })}
                    className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer
                      ${client.useDifferentDelivery ? 'bg-sky-500' : 'bg-slate-700'}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform
                      ${client.useDifferentDelivery ? 'translate-x-4' : 'translate-x-0.5'}`} />
                  </div>
                  <span className="text-xs text-slate-400">Adresse de livraison différente</span>
                </label>
              </div>

              {client.useDifferentDelivery && (
                <>
                  <Field label="Adresse de livraison" span2>
                    <input className={CLS.input} value={client.deliveryAddress}
                      onChange={e => upC({ deliveryAddress: e.target.value })}
                      placeholder="789 Rue de la Livraison" />
                  </Field>
                  <Field label="Code postal">
                    <input className={CLS.input} value={client.deliveryPostalCode}
                      onChange={e => upC({ deliveryPostalCode: e.target.value })}
                      placeholder="75009" />
                  </Field>
                  <Field label="Ville">
                    <input className={CLS.input} value={client.deliveryCity}
                      onChange={e => upC({ deliveryCity: e.target.value })}
                      placeholder="Paris" />
                  </Field>
                </>
              )}
            </div>
          </SCard>

          {/* ── SECTION 3 · ADMIN INFO ──────────────────────────────── */}
          <SCard id="admin" icon={FileText} title="Informations du Devis" desc="Numérotation, dates et remise globale" accent="amber">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Numéro de devis">
                <input className={CLS.input} value={admin.quoteNumber}
                  onChange={e => upA({ quoteNumber: e.target.value })}
                  placeholder="2024-01-001" />
              </Field>
              <Field label="Date de création">
                <input className={CLS.input} type="date" value={admin.issueDate}
                  onChange={e => upA({ issueDate: e.target.value })} />
              </Field>
              <Field label="Durée de validité (jours)">
                <input className={CLS.input} type="number" min={1} value={admin.validityDays}
                  onChange={e => upA({ validityDays: parseInt(e.target.value) || 30 })} />
              </Field>
              <Field label="Remise globale (%)">
                <input className={CLS.input} type="number" min={0} max={100} step={0.1}
                  value={admin.globalDiscount}
                  onChange={e => upA({ globalDiscount: parseFloat(e.target.value) || 0 })} />
              </Field>
            </div>
          </SCard>

          {/* ── SECTION 4 · LINE ITEMS ──────────────────────────────── */}
          <SCard id="items" icon={Wrench} title="Prestations" desc="Détail des produits et services" accent="emerald">
            <div className="overflow-x-auto -mx-1">
              <table className="w-full min-w-[720px]">
                <thead>
                  <tr className="border-b border-slate-800">
                    {['Description', 'Qté', 'Unité', 'PU HT (€)', 'TVA', 'Remise %', 'Total HT', ''].map(h => (
                      <th key={h} className="pb-2.5 text-[9px] font-bold text-slate-600 uppercase tracking-widest text-left last:w-8">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={item.id} className="border-b border-slate-800/40 group">
                      {/* Description */}
                      <td className="py-2 pr-2">
                        <input className={CLS.input} value={item.description}
                          onChange={e => updateItem(item.id, { description: e.target.value })}
                          placeholder="Description de la prestation..." />
                      </td>
                      {/* Qty */}
                      <td className="py-2 px-1 w-20">
                        <input className={`${CLS.input} text-right`} type="number" min={0} step={0.01}
                          value={item.quantity}
                          onChange={e => updateItem(item.id, { quantity: parseFloat(e.target.value) || 0 })} />
                      </td>
                      {/* Unit */}
                      <td className="py-2 px-1 w-24">
                        <select className={CLS.input} value={item.unit}
                          onChange={e => updateItem(item.id, { unit: e.target.value as ItemUnit })}>
                          {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                      </td>
                      {/* Unit price HT */}
                      <td className="py-2 px-1 w-28">
                        <input className={`${CLS.input} text-right`} type="number" min={0} step={0.01}
                          value={item.unitPriceHT}
                          onChange={e => updateItem(item.id, { unitPriceHT: parseFloat(e.target.value) || 0 })} />
                      </td>
                      {/* VAT rate */}
                      <td className="py-2 px-1 w-20">
                        <select className={CLS.input} value={item.vatRate}
                          onChange={e => updateItem(item.id, { vatRate: parseFloat(e.target.value) as VatRate })}>
                          {VAT_RATES.map(r => <option key={r} value={r}>{r} %</option>)}
                        </select>
                      </td>
                      {/* Line discount */}
                      <td className="py-2 px-1 w-20">
                        <input className={`${CLS.input} text-right`} type="number" min={0} max={100} step={0.1}
                          value={item.discount}
                          onChange={e => updateItem(item.id, { discount: parseFloat(e.target.value) || 0 })} />
                      </td>
                      {/* Auto total */}
                      <td className="py-2 px-1 w-28 text-right">
                        <span className="text-sm font-semibold text-slate-200 font-mono tabular-nums">
                          {(calc.lineTotalsHT[idx] ?? 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                        </span>
                      </td>
                      {/* Remove */}
                      <td className="py-2 pl-1">
                        <button onClick={() => removeItem(item.id)}
                          className="p-1.5 rounded-lg text-slate-700 hover:text-red-400 hover:bg-red-400/10 transition-all opacity-0 group-hover:opacity-100">
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button onClick={addItem}
              className="mt-4 flex items-center gap-2 px-4 py-2 text-xs font-semibold text-emerald-400
                border border-emerald-500/20 hover:border-emerald-500/40 hover:bg-emerald-500/5
                rounded-lg transition-all">
              <Plus size={14} />
              Ajouter une ligne
            </button>

            {items.length === 0 && (
              <div className="flex items-center gap-2 mt-3 text-xs text-amber-500/80 bg-amber-500/5 border border-amber-500/10 rounded-lg px-4 py-2.5">
                <AlertCircle size={13} />
                Ajoutez au moins une prestation pour générer le devis.
              </div>
            )}
          </SCard>

          {/* ── SECTION 5 · FINANCIAL SUMMARY ───────────────────────── */}
          <SCard id="financial" icon={Calculator} title="Récapitulatif Financier" desc="Calculé automatiquement · non modifiable" accent="rose">
            <div className="flex justify-end">
              <div className="w-full max-w-sm">
                {/* HT before global discount */}
                {admin.globalDiscount > 0 && (
                  <div className="flex justify-between items-center py-2.5 border-b border-slate-800 text-sm">
                    <span className="text-slate-500">Total HT (avant remise)</span>
                    <span className="text-slate-300 font-mono tabular-nums">{fmt(calc.totalHTBeforeDiscount)}</span>
                  </div>
                )}
                {/* Global discount line */}
                {admin.globalDiscount > 0 && (
                  <div className="flex justify-between items-center py-2.5 border-b border-slate-800 text-sm">
                    <span className="text-slate-500">Remise globale ({admin.globalDiscount}\u00a0%)</span>
                    <span className="text-red-400 font-mono tabular-nums">− {fmt(calc.globalDiscountAmount)}</span>
                  </div>
                )}
                {/* Total HT */}
                <div className="flex justify-between items-center py-2.5 border-b border-slate-800 text-sm">
                  <span className="text-slate-400 font-medium">Total HT</span>
                  <span className="text-slate-200 font-semibold font-mono tabular-nums">{fmt(calc.totalHT)}</span>
                </div>
                {/* VAT breakdown */}
                {calc.vatBreakdown.map(({ rate, amount }) => (
                  <div key={rate} className="flex justify-between items-center py-2.5 border-b border-slate-800 text-sm">
                    <span className="text-slate-500">TVA {rate}\u00a0%</span>
                    <span className="text-slate-300 font-mono tabular-nums">{fmt(amount)}</span>
                  </div>
                ))}
                {/* Total TTC */}
                <div className="flex justify-between items-center mt-3 px-5 py-4
                  bg-gradient-to-r from-sky-600 to-blue-600 rounded-xl shadow-lg shadow-sky-600/20">
                  <span className="text-white font-bold">Total TTC</span>
                  <span className="text-white font-bold text-lg font-mono tabular-nums">{fmt(calc.totalTTC)}</span>
                </div>
              </div>
            </div>
          </SCard>

          {/* ── SECTION 6 · TERMS ───────────────────────────────────── */}
          <SCard id="terms" icon={ClipboardList} title="Modalités" desc="Délais, paiement et mentions légales" accent="orange">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Date de début">
                <input className={CLS.input} type="date" value={terms.startDate}
                  onChange={e => upT({ startDate: e.target.value })} />
              </Field>
              <Field label="Durée estimée">
                <input className={CLS.input} value={terms.estimatedDuration}
                  onChange={e => upT({ estimatedDuration: e.target.value })}
                  placeholder="ex: 3 semaines, 2 mois..." />
              </Field>
              <Field label="Conditions de paiement" span2>
                <input className={CLS.input} value={terms.paymentConditions}
                  onChange={e => upT({ paymentConditions: e.target.value })}
                  placeholder="ex: 30% à la commande, solde à réception de la facture" />
              </Field>
              <Field label="Acompte (%)">
                <input className={CLS.input} type="number" min={0} max={100} value={terms.depositPercentage}
                  onChange={e => upT({ depositPercentage: parseFloat(e.target.value) || 0 })} />
              </Field>
              {/* Auto-computed deposit amount */}
              <Field label="Montant acompte TTC">
                <div className={`${CLS.input} bg-slate-800/50 text-sky-400 font-mono tabular-nums cursor-default select-none`}>
                  {fmt(depositTTC)}
                </div>
              </Field>
              <Field label="Notes / Mentions particulières" span2>
                <textarea
                  className={`${CLS.input} resize-none h-20`}
                  value={terms.notes}
                  onChange={e => upT({ notes: e.target.value })}
                  placeholder="Informations complémentaires, conditions spécifiques, garanties..." />
              </Field>
            </div>

            {/* PDF CTA at bottom of form */}
            <div className="mt-6 pt-5 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-slate-500 text-center sm:text-left">
                Vérifiez tous les champs avant de générer le PDF.
              </p>
              <PDFDownloadLink
                document={<QuoteDocument quote={quoteData} calculations={calc} />}
                fileName={`devis-${admin.quoteNumber || 'devis'}.pdf`}
                style={{ textDecoration: 'none' }}
              >
                {({ loading }) => (
                  <span className={`inline-flex items-center gap-2 px-6 py-3 text-sm font-bold rounded-xl cursor-pointer transition-all
                    ${loading
                      ? 'bg-slate-700 text-slate-400'
                      : 'bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white shadow-xl shadow-sky-600/25 hover:shadow-sky-500/40 hover:scale-[1.02]'
                    }`}>
                    <Download size={16} />
                    {loading ? 'Génération en cours...' : 'Télécharger le Devis PDF'}
                  </span>
                )}
              </PDFDownloadLink>
            </div>
          </SCard>

          {/* Bottom spacing */}
          <div className="h-16" />
        </main>
      </div>
    </div>
  );
}
