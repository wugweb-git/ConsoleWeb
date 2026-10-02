import React, { useState, useEffect } from 'react';
import {
  Layers,
  FileText,
  Printer,
  Award,
  UtensilsCrossed,
  GraduationCap,
  Briefcase,
  Receipt,
  Download,
  Eye,
  Edit2,
  Plus,
  Trash2,
} from 'lucide-react';

// Invoice
import { InvoiceTemplate } from '../invoice/InvoiceTemplate';
import type { InvoiceData, LineItem, TaxLine } from '../invoice/InvoiceTemplate';

// StayWeb
import { ThermalReceipt } from '../stayweb/ThermalReceipt';
import type { ThermalReceiptData } from '../stayweb/ThermalReceipt';
import { KOTReceipt } from '../stayweb/KOTReceipt';
import type { KOTData } from '../stayweb/KOTReceipt';
import { StayWebInvoice } from '../stayweb/StayWebInvoice';
import type { StayWebInvoiceData } from '../stayweb/StayWebInvoice';

// HR Letters
import { HRLetterTemplate } from '../hr-letters/HRLetterTemplate';
import type { HRLetterData, HRLetterCompany, HRLetterSignatory } from '../hr-letters/HRLetterTemplate';

// ============================================
// TYPES
// ============================================

export type TemplateFamily = 'invoice' | 'stayweb' | 'hr-letters';
type StayWebTab = 'thermal' | 'kot' | 'a4-invoice';
type HRTab = 'experience' | 'relieving' | 'internship' | 'offer';

interface TemplateFamilyConfig {
  id: TemplateFamily;
  label: string;
  description: string;
  icon: React.ElementType;
  count: number;
}

const families: TemplateFamilyConfig[] = [
  { id: 'invoice', label: 'Invoice', description: 'Wugweb GST-compliant tax invoice', icon: Receipt, count: 1 },
  { id: 'stayweb', label: 'StayWeb Hospitality', description: 'Thermal receipt, KOT ticket, A4 tax invoice', icon: Printer, count: 3 },
  { id: 'hr-letters', label: 'HR Letters', description: 'Experience, relieving, internship, offer letters', icon: Award, count: 4 },
];

// ============================================
// SAMPLE DATA
// ============================================

// — Invoice sample —
function createSampleInvoice(): InvoiceData {
  return {
    invoiceNumber: 'WWAD03102024',
    date: 'October 03, 2024',
    billTo: {
      label: 'BILL TO',
      companyName: 'Adneto Technology Private Limited',
      gstin: '09AAYCA6225E1ZD',
      address: 'MG-10D, GF, Block-10, Eldeco Mystic Greens, Omicron 1, Gautam Buddha Nagar, Noida, Uttar Pradesh-201310, India',
      email: 'kushal@adneto.in',
      phone: '+91 97174 83505',
    },
    billBy: {
      label: 'BILL BY',
      companyName: 'Wug Web Services Private Limited',
      gstin: '09AACCW8229J1ZU',
      address: 'WeWork Berger Delhi One, Floor 19, C 001-A2, Sector 16-B, Gautam Buddha Nagar, Noida, Uttar Pradesh - 201310, India',
      email: 'vedanshu@wugweb.com',
      phone: '+91 88021 39220',
    },
    countryOfSupply: 'India',
    placeOfSupply: 'UP (09)',
    poNumber: '-',
    lineItems: [
      { name: 'Milestones 3', description: 'Experience Design for Adneto Product Suite', hsn: '998392', amount: 50000, qty: 1, total: 59000 },
    ],
    subtotal: 50000,
    taxes: [
      { label: 'CGST @9%', amount: 9000 },
      { label: 'SGST @9%', amount: 9000 },
    ],
    totalAmount: 59000,
    totalInWords: 'Fifty Nine Thousand Rupees only',
    notes: 'Timelines and other details as mentioned on the email',
    bankDetails: { accountNumber: '250010051989', ifsc: 'INDB0000546', accountType: 'Current', bank: 'IndusInd Bank', swiftCode: 'INDBINBB' },
    signature: { companyLine: 'For Wug Web Services Pvt Ltd', signerName: 'Vedanshu Srivastava', signerTitle: 'DIN:08983258' },
    terms: ['Please pay within 14 days from the date of invoice', 'Please quote invoice number for any issues'],
    showQrCode: true,
  };
}

// — StayWeb samples —
const sampleThermal: ThermalReceiptData = {
  propertyName: 'Castle Suites by Haven Homes',
  propertyAddress: '12th Floor, Prestige Towers, MG Road, Bangalore, Karnataka, 560001',
  propertyPhone: '+91 80 4567 8900',
  title: 'Payment Receipt',
  date: '20 Feb 2026',
  guestName: 'Vedanshu Srivastava',
  bookingId: 'NH77201466598932',
  roomType: 'Deluxe King Suite',
  stayRange: 'Fri, 20 Feb 2026 — Sat, 21 Feb 2026',
  lineItems: [
    { name: 'Deluxe King Suite x2 nights', qty: 1, amount: 640 },
    { name: 'Room Service — Dinner', qty: 1, amount: 85 },
    { name: 'Minibar Charges', qty: 1, amount: 42 },
  ],
  subtotal: 767,
  taxes: [{ label: 'Tax (18%)', amount: 138.06 }],
  total: 905.06,
  currency: 'INR',
  paymentMethod: 'UPI — PhonePe',
  thankYouMessage: 'Thank you for your stay!',
  footerText: 'Powered by StayWeb PMS',
};

const sampleKOT: KOTData = {
  kotNumber: 'KOT-0187',
  orderType: 'Dine-in',
  table: 'T-12',
  server: 'James R.',
  time: '6:42 PM',
  propertyName: 'Castle Suites by Haven Homes',
  items: [
    { name: 'Grilled Salmon', qty: 2, note: 'No sauce' },
    { name: 'Caesar Salad', qty: 1 },
    { name: 'Mushroom Risotto', qty: 1, note: 'Extra parmesan' },
    { name: 'Garlic Bread', qty: 2 },
    { name: 'Chocolate Fondant', qty: 1, note: 'Allergies: nuts' },
  ],
  totalItems: 7,
  footerText: 'Powered by StayWeb PMS',
};

const sampleStayWebInvoice: StayWebInvoiceData = {
  companyName: 'STAYWEB (INDIA) PRIVATE LIMITED',
  companyAddress: '19th Floor, Epitome Building No.5, DLF Cybercity, DLF Phase III, Gurgaon, Haryana, 122001',
  invoiceNumber: 'M06HL26I16800463',
  date: '20 Feb 2026',
  metaFields: [
    { label: 'Booking ID', value: 'NH77201466598932', mono: true },
    { label: 'PAN', value: 'AADCM5146R', mono: true },
    { label: 'Invoice No.', value: 'M06HL26I16800463', mono: true },
    { label: 'HSN/SAC', value: '998552', mono: true },
    { label: 'Date', value: '20 Feb 2026' },
    { label: 'GSTIN', value: '06AADCM5146R1ZZ', mono: true },
    { label: 'Place of Supply', value: 'Haryana' },
    { label: 'CIN', value: 'U63040HR2000PTC090846', mono: true },
    { label: 'Transactional Type/Category', value: 'REG/B2C', mono: true },
    { label: 'Service Description', value: 'Reservation service for accommodation' },
    { label: 'Transactional Details', value: 'RG', mono: true },
    { label: 'Tax Payable under RCM', value: 'No' },
    { label: 'Advanced Receipt Voucher No.', value: 'M06HL26A10981513', mono: true, span: 2 },
  ],
  customerName: 'Vedanshu Srivastava',
  hotelName: 'Castle Suites by Haven Homes',
  hotelCity: 'BANGALORE',
  checkIn: 'Fri, 20 Feb 2026',
  checkOut: 'Sat, 21 Feb 2026',
  lineItems: [
    { description: 'Room Charges — Deluxe King Suite (2 nights)', sacCode: '998552', amount: 640, taxRate: 18, taxAmount: 115.2, total: 755.2 },
    { description: 'Room Service — Dinner', sacCode: '996331', amount: 85, taxRate: 18, taxAmount: 15.3, total: 100.3 },
    { description: 'Minibar Charges', sacCode: '996332', amount: 42, taxRate: 18, taxAmount: 7.56, total: 49.56 },
  ],
  totals: [
    { label: 'Subtotal', amount: 767 },
    { label: 'CGST @9%', amount: 69.03 },
    { label: 'SGST @9%', amount: 69.03 },
  ],
  grandTotal: 905.06,
  currency: 'INR',
  amountInWords: 'Indian Rupees Nine Hundred Five and Six Paise Only',
  footerText: 'This is a computer-generated invoice and does not require a signature. Powered by StayWeb PMS',
};

// — HR samples —
const wugwebCompany: HRLetterCompany = {
  name: 'Wug Web Services Private Limited',
  address: ['WeWork Berger Delhi One, Floor 19, C 001/A2,', 'Sector 16B, Noida, Uttar Pradesh- 201301'],
  cin: 'U72900UP2020PTC138834',
  email: 'hello@wugweb.com',
  phone: '+91 120 311 2337',
};

const vedanshuSignatory: HRLetterSignatory = {
  name: 'Vedanshu Srivastava',
  title: 'Founder & Director',
  signingNote: 'Signing on behalf of Wugweb',
  email: 'vedanshu@wugweb.com',
  mobile: '+91 88021 39220',
};

const hrLetters: Record<HRTab, HRLetterData> = {
  experience: {
    company: wugwebCompany, title: 'Experience Certificate', titleSuffix: 'Ms. Saavi Garg', date: '29 August 2025', signatory: vedanshuSignatory,
    bodyParagraphs: [
      [], [{ text: 'To Whom It May Concern,', bold: true }], [],
      [{ text: 'This is to certify that Ms. Saavi Garg was employed as Associate Consultant at Wug Web Services Private Limited or Wugweb from ' }, { text: '5 August 2024 to 29 August 2025', bold: true }, { text: '.' }],
      [],
      [{ text: 'During her tenure, Ms. Garg reported to ' }, { text: 'Amitabh Bhatnagar', bold: true }, { text: ' (email: amitabh@wugweb.com). Her responsibilities included analyzing client requirements, developing solutions, and collaborating with teams to ensure project success in a hybrid work environment.' }],
      [], [{ text: 'We wish Ms. Saavi Garg the best in her future endeavors.' }], [],
    ],
  },
  relieving: {
    company: wugwebCompany, title: 'Relieving Letter', date: '29 August 2025', signatory: vedanshuSignatory,
    bodyParagraphs: [
      [], [{ text: 'To Whom It May Concern,', bold: true }], [],
      [{ text: 'This is to certify that Ms. Saavi Garg, employed as ' }, { text: 'Associate Consultant', bold: true }, { text: ' at Wug Web Services Private Limited, has been relieved from her duties effective ' }, { text: '29 August 2025', bold: true }, { text: '.' }],
      [],
      [{ text: 'She has completed all exit formalities, including the return of company property and clearance of any dues.' }],
      [], [{ text: 'We appreciate Ms. Saavi Garg\'s contributions and wish her success in her future endeavors.' }], [],
    ],
  },
  internship: {
    company: wugwebCompany, title: 'Internship Certificate', titleSuffix: 'Ms. Saavi Garg', date: '5 August 2024', signatory: vedanshuSignatory,
    bodyParagraphs: [
      [], [{ text: 'To Whom It May Concern,', bold: true }], [],
      [{ text: 'This is to certify that ' }, { text: 'Ms. Saavi Garg', bold: true }, { text: ' successfully completed her internship at Wug Web Services Private Limited as an ' }, { text: 'Associate Consultant Intern', bold: true }, { text: '.' }],
      [],
      [{ text: 'Her internship commenced on ' }, { text: '1 May 2024', bold: true }, { text: ' and concluded on ' }, { text: '31 July 2024', bold: true }, { text: ', spanning a duration of three months.' }],
      [],
      [{ text: 'Based on her outstanding performance, Ms. Garg was subsequently offered a full-time position as ' }, { text: 'Associate Consultant', bold: true }, { text: ' effective ' }, { text: '5 August 2024', bold: true }, { text: '.' }],
      [], [{ text: 'We wish Ms. Saavi Garg continued success in her career.' }], [],
    ],
  },
  offer: {
    company: wugwebCompany, title: 'Offer of Employment as Associate Consultant', date: '25 July 2024', signatory: vedanshuSignatory,
    bodyParagraphs: [
      [], [{ text: 'To Whom It May Concern,', bold: true }], [],
      [{ text: 'This is to certify that ' }, { text: 'Ms. Saavi Garg', bold: true }, { text: ' has been appointed as ' }, { text: 'Associate Consultant', bold: true }, { text: ' at Wug Web Services Private Limited.' }],
      [{ text: 'Her employment commenced on ' }, { text: '5 August 2024', bold: true }, { text: '.' }],
      [],
      [{ text: 'Compensation: ' }, { text: 'INR 6,00,000 (Rupees Six Lakhs Only)', bold: true }, { text: ' per annum, paid in accordance with payroll policies.' }],
      [],
      [{ text: 'She reports to ' }, { text: 'Amitabh Bhatnagar', bold: true }, { text: ' (amitabh@wugweb.com).' }],
      [], [{ text: 'We are excited about the contributions Ms. Saavi Garg will make to our organization.' }],
    ],
  },
};

// ============================================
// INVOICE EDITOR HELPERS
// ============================================

const inputStyle: React.CSSProperties = {
  backgroundColor: 'var(--input-background)',
  border: '1px solid var(--border)',
  color: 'var(--foreground)',
  borderRadius: 'var(--radius-md)',
  padding: '6px 10px',
  width: '100%',
  outline: 'none',
};

const labelStyle: React.CSSProperties = {
  color: 'var(--muted-foreground)',
  display: 'block',
  marginBottom: '4px',
};

const sectionCard: React.CSSProperties = {
  backgroundColor: 'var(--card)',
  boxShadow: 'var(--elevation-sm)',
  borderRadius: 'var(--radius-lg)',
  padding: '20px',
  marginBottom: '16px',
};

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ flex: 1, minWidth: '180px' }}>
      <label style={labelStyle}>{label}</label>
      <input type="text" value={value} onChange={e => onChange(e.target.value)} style={inputStyle} />
    </div>
  );
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div style={{ flex: 1, minWidth: '100px' }}>
      <label style={labelStyle}>{label}</label>
      <input type="number" value={value} onChange={e => onChange(Number(e.target.value))} style={inputStyle} />
    </div>
  );
}

// ============================================
// TEMPLATE MANAGER COMPONENT
// ============================================

interface TemplateManagerProps {
  initialFamily?: TemplateFamily;
}

export function TemplateManager({ initialFamily = 'invoice' }: TemplateManagerProps) {
  const [activeFamily, setActiveFamily] = useState<TemplateFamily>(initialFamily);

  // Sync when navigated from sidebar with a different initialFamily
  React.useEffect(() => {
    setActiveFamily(initialFamily);
  }, [initialFamily]);

  // StayWeb sub-tab
  const [staywebTab, setStaywebTab] = useState<StayWebTab>('thermal');
  // HR sub-tab
  const [hrTab, setHrTab] = useState<HRTab>('experience');
  // Invoice edit mode
  const [invoiceMode, setInvoiceMode] = useState<'preview' | 'edit'>('preview');
  const [invoice, setInvoice] = useState<InvoiceData>(createSampleInvoice);

  // StayWeb edit mode
  const [staywebMode, setStaywebMode] = useState<'preview' | 'edit'>('preview');
  const [thermal, setThermal] = useState<ThermalReceiptData>(sampleThermal);
  const [kot, setKot] = useState<KOTData>(sampleKOT);
  const [staywebInv, setStaywebInv] = useState<StayWebInvoiceData>(sampleStayWebInvoice);

  // HR edit mode
  const [hrMode, setHrMode] = useState<'preview' | 'edit'>('preview');
  const [hrData, setHrData] = useState<Record<HRTab, HRLetterData>>(hrLetters);

  // Invoice field updaters
  function updateField<K extends keyof InvoiceData>(key: K, value: InvoiceData[K]) {
    setInvoice(prev => ({ ...prev, [key]: value }));
  }
  function updateBillParty(which: 'billTo' | 'billBy', field: string, value: string) {
    setInvoice(prev => ({ ...prev, [which]: { ...prev[which], [field]: value } }));
  }
  function updateLineItem(idx: number, field: keyof LineItem, value: string | number) {
    setInvoice(prev => {
      const items = [...prev.lineItems];
      items[idx] = { ...items[idx], [field]: value };
      return { ...prev, lineItems: items };
    });
  }
  function addLineItem() {
    setInvoice(prev => ({
      ...prev,
      lineItems: [...prev.lineItems, { name: '', description: '', hsn: '', amount: 0, qty: 1, total: 0 }],
    }));
  }
  function removeLineItem(idx: number) {
    setInvoice(prev => ({ ...prev, lineItems: prev.lineItems.filter((_, i) => i !== idx) }));
  }
  function updateTax(idx: number, field: keyof TaxLine, value: string | number) {
    setInvoice(prev => {
      const taxes = [...prev.taxes];
      taxes[idx] = { ...taxes[idx], [field]: value };
      return { ...prev, taxes };
    });
  }
  function addTax() {
    setInvoice(prev => ({ ...prev, taxes: [...prev.taxes, { label: '', amount: 0 }] }));
  }
  function removeTax(idx: number) {
    setInvoice(prev => ({ ...prev, taxes: prev.taxes.filter((_, i) => i !== idx) }));
  }
  function updateBankDetail(field: string, value: string) {
    setInvoice(prev => ({ ...prev, bankDetails: { ...prev.bankDetails, [field]: value } }));
  }
  function updateSignature(field: string, value: string) {
    setInvoice(prev => ({ ...prev, signature: { ...prev.signature, [field]: value } }));
  }

  // Sub-tab configs
  const staywebTabs: { id: StayWebTab; label: string; icon: React.ElementType }[] = [
    { id: 'thermal', label: 'Thermal Receipt', icon: Printer },
    { id: 'kot', label: 'KOT Ticket', icon: UtensilsCrossed },
    { id: 'a4-invoice', label: 'A4 Tax Invoice', icon: FileText },
  ];

  const hrTabs: { id: HRTab; label: string; icon: React.ElementType }[] = [
    { id: 'experience', label: 'Experience', icon: Award },
    { id: 'relieving', label: 'Relieving', icon: FileText },
    { id: 'internship', label: 'Internship', icon: GraduationCap },
    { id: 'offer', label: 'Offer Letter', icon: Briefcase },
  ];

  // ─── Render sub-tab bar ───
  function SubTabBar<T extends string>({
    tabs,
    active,
    onChange,
  }: {
    tabs: { id: T; label: string; icon: React.ElementType }[];
    active: T;
    onChange: (id: T) => void;
  }) {
    return (
      <div
        className="flex gap-1 mb-6"
        style={{ backgroundColor: 'var(--muted)', borderRadius: 'var(--radius-lg)', padding: '4px', width: 'fit-content' }}
      >
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className="flex items-center gap-2 px-4 py-2 transition-all"
              style={{
                backgroundColor: isActive ? 'var(--card)' : 'transparent',
                color: isActive ? 'var(--foreground)' : 'var(--muted-foreground)',
                borderRadius: 'var(--radius-md)',
                boxShadow: isActive ? 'var(--elevation-sm)' : 'none',
                fontWeight: isActive ? 'var(--font-weight-medium)' : 'var(--font-weight-regular)',
              }}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // ─── Render template preview area ───
  function renderPreviewShell(children: React.ReactNode, wide?: boolean) {
    return (
      <div
        className="flex justify-center py-8"
        style={{ backgroundColor: 'var(--muted)', borderRadius: 'var(--radius-lg)', minHeight: '500px' }}
      >
        {wide ? (
          <div style={{ padding: '0 16px', width: '100%', maxWidth: '660px' }}>{children}</div>
        ) : (
          children
        )}
      </div>
    );
  }

  // ─── Invoice bill-party form ───
  function renderBillPartyForm(which: 'billTo' | 'billBy', title: string) {
    const party = invoice[which];
    return (
      <div style={{ ...sectionCard, flex: 1 }}>
        <h4 style={{ color: 'var(--foreground)', marginBottom: '12px' }}>{title}</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Field label="Company Name" value={party.companyName} onChange={v => updateBillParty(which, 'companyName', v)} />
          <Field label="GSTIN" value={party.gstin} onChange={v => updateBillParty(which, 'gstin', v)} />
          <div>
            <label style={labelStyle}>Address</label>
            <textarea value={party.address} onChange={e => updateBillParty(which, 'address', e.target.value)} rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Field label="Email" value={party.email} onChange={v => updateBillParty(which, 'email', v)} />
            <Field label="Phone" value={party.phone} onChange={v => updateBillParty(which, 'phone', v)} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8" style={{ minHeight: 'calc(100vh - 5rem)' }}>
      {/* ════════════════════════════════
          PAGE HEADER
          ════════════════════════════════ */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 flex items-center justify-center"
            style={{ backgroundColor: 'var(--primary)', borderRadius: 'var(--radius-lg)' }}
          >
            <Layers className="w-5 h-5" style={{ color: 'var(--primary-foreground)' }} />
          </div>
          <div>
            <h2 style={{ color: 'var(--foreground)' }}>Template Manager</h2>
            <p style={{ color: 'var(--muted-foreground)' }}>
              Design, preview, and manage all document templates in one place
            </p>
          </div>
        </div>

        {/* Context actions for invoice edit mode */}
        {activeFamily === 'invoice' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setInvoiceMode(invoiceMode === 'preview' ? 'edit' : 'preview')}
              className="flex items-center gap-2 px-4 py-2.5 transition-opacity hover:opacity-80"
              style={{
                backgroundColor: invoiceMode === 'edit' ? 'var(--primary)' : 'var(--muted)',
                color: invoiceMode === 'edit' ? 'var(--primary-foreground)' : 'var(--foreground)',
                borderRadius: 'var(--radius-lg)',
              }}
            >
              {invoiceMode === 'preview'
                ? <><Edit2 className="w-4 h-4" /><span>Edit</span></>
                : <><Eye className="w-4 h-4" /><span>Preview</span></>
              }
            </button>
            <button
              className="flex items-center gap-2 px-4 py-2.5 transition-opacity hover:opacity-80"
              style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)', borderRadius: 'var(--radius-lg)' }}
              onClick={() => window.print()}
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        )}

        {/* Context actions for StayWeb edit mode */}
        {activeFamily === 'stayweb' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setStaywebMode(staywebMode === 'preview' ? 'edit' : 'preview')}
              className="flex items-center gap-2 px-4 py-2.5 transition-opacity hover:opacity-80"
              style={{
                backgroundColor: staywebMode === 'edit' ? 'var(--primary)' : 'var(--muted)',
                color: staywebMode === 'edit' ? 'var(--primary-foreground)' : 'var(--foreground)',
                borderRadius: 'var(--radius-lg)',
              }}
            >
              {staywebMode === 'preview'
                ? <><Edit2 className="w-4 h-4" /><span>Edit</span></>
                : <><Eye className="w-4 h-4" /><span>Preview</span></>
              }
            </button>
            <button
              className="flex items-center gap-2 px-4 py-2.5 transition-opacity hover:opacity-80"
              style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)', borderRadius: 'var(--radius-lg)' }}
              onClick={() => window.print()}
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        )}

        {/* Context actions for HR Letters edit mode */}
        {activeFamily === 'hr-letters' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setHrMode(hrMode === 'preview' ? 'edit' : 'preview')}
              className="flex items-center gap-2 px-4 py-2.5 transition-opacity hover:opacity-80"
              style={{
                backgroundColor: hrMode === 'edit' ? 'var(--primary)' : 'var(--muted)',
                color: hrMode === 'edit' ? 'var(--primary-foreground)' : 'var(--foreground)',
                borderRadius: 'var(--radius-lg)',
              }}
            >
              {hrMode === 'preview'
                ? <><Edit2 className="w-4 h-4" /><span>Edit</span></>
                : <><Eye className="w-4 h-4" /><span>Preview</span></>
              }
            </button>
            <button
              className="flex items-center gap-2 px-4 py-2.5 transition-opacity hover:opacity-80"
              style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)', borderRadius: 'var(--radius-lg)' }}
              onClick={() => window.print()}
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        )}
      </div>

      {/* ════════════════════════════════
          FAMILY SELECTOR — Horizontal cards
          ════════════════════════════════ */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {families.map(f => {
          const Icon = f.icon;
          const isActive = activeFamily === f.id;
          return (
            <button
              key={f.id}
              onClick={() => setActiveFamily(f.id)}
              className="flex items-center gap-3 px-4 py-3.5 text-left transition-all"
              style={{
                backgroundColor: isActive ? 'var(--primary)' : 'var(--card)',
                color: isActive ? 'var(--primary-foreground)' : 'var(--foreground)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--elevation-sm)',
                border: isActive ? 'none' : '1px solid var(--border)',
              }}
            >
              <Icon
                className="w-5 h-5 flex-shrink-0"
                style={{ color: isActive ? 'var(--primary-foreground)' : 'var(--muted-foreground)' }}
              />
              <div className="flex-1 min-w-0">
                <p style={{ fontWeight: 'var(--font-weight-medium)', color: 'inherit' }}>{f.label}</p>
                <span style={{ color: isActive ? 'rgba(255,255,255,0.7)' : 'var(--muted-foreground)' }}>{f.description}</span>
              </div>
              <div
                className="px-2 py-0.5 flex-shrink-0"
                style={{
                  backgroundColor: isActive ? 'rgba(255,255,255,0.15)' : 'var(--muted)',
                  borderRadius: 'var(--radius-full)',
                  color: isActive ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
                }}
              >
                <span>{f.count}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* ════════════════════════════════
          INVOICE FAMILY
          ════════════════════════════════ */}
      {activeFamily === 'invoice' && (
        <>
          {invoiceMode === 'preview' ? (
            renderPreviewShell(<InvoiceTemplate data={invoice} />)
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' }}>
              {/* Edit form */}
              <div>
                <div style={sectionCard}>
                  <h4 style={{ color: 'var(--foreground)', marginBottom: '12px' }}>Invoice Details</h4>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <Field label="Invoice Number" value={invoice.invoiceNumber} onChange={v => updateField('invoiceNumber', v)} />
                    <Field label="Date" value={invoice.date} onChange={v => updateField('date', v)} />
                  </div>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
                    <Field label="Country of Supply" value={invoice.countryOfSupply} onChange={v => updateField('countryOfSupply', v)} />
                    <Field label="Place of Supply" value={invoice.placeOfSupply} onChange={v => updateField('placeOfSupply', v)} />
                    <Field label="PO Number" value={invoice.poNumber} onChange={v => updateField('poNumber', v)} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                  {renderBillPartyForm('billTo', 'Bill To')}
                  {renderBillPartyForm('billBy', 'Bill By')}
                </div>
                <div style={sectionCard}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h4 style={{ color: 'var(--foreground)' }}>Line Items</h4>
                    <button onClick={addLineItem} className="flex items-center gap-1 px-3 py-1.5" style={{ backgroundColor: 'var(--muted)', color: 'var(--foreground)', borderRadius: 'var(--radius-md)' }}>
                      <Plus className="w-3.5 h-3.5" /><small>Add Item</small>
                    </button>
                  </div>
                  {invoice.lineItems.map((item, idx) => (
                    <div key={idx} style={{ backgroundColor: 'var(--secondary)', borderRadius: 'var(--radius-md)', padding: '12px', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '8px' }}>
                        <Field label="Name" value={item.name} onChange={v => updateLineItem(idx, 'name', v)} />
                        <Field label="Description" value={item.description || ''} onChange={v => updateLineItem(idx, 'description', v)} />
                      </div>
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                        <Field label="HSN" value={item.hsn} onChange={v => updateLineItem(idx, 'hsn', v)} />
                        <NumberField label="Amount" value={item.amount} onChange={v => updateLineItem(idx, 'amount', v)} />
                        <NumberField label="Qty" value={item.qty} onChange={v => updateLineItem(idx, 'qty', v)} />
                        <NumberField label="Total" value={item.total} onChange={v => updateLineItem(idx, 'total', v)} />
                        <button onClick={() => removeLineItem(idx)} className="p-2" style={{ color: 'var(--destructive)', borderRadius: 'var(--radius-md)' }}>
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={sectionCard}>
                  <h4 style={{ color: 'var(--foreground)', marginBottom: '12px' }}>Totals & Taxes</h4>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
                    <NumberField label="Subtotal" value={invoice.subtotal} onChange={v => updateField('subtotal', v)} />
                    <NumberField label="Total Amount" value={invoice.totalAmount} onChange={v => updateField('totalAmount', v)} />
                  </div>
                  <Field label="Total In Words" value={invoice.totalInWords} onChange={v => updateField('totalInWords', v)} />
                  <div style={{ marginTop: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <label style={{ color: 'var(--muted-foreground)' }}>Tax Lines</label>
                      <button onClick={addTax} className="flex items-center gap-1 px-2 py-1" style={{ backgroundColor: 'var(--muted)', color: 'var(--foreground)', borderRadius: 'var(--radius-md)' }}>
                        <Plus className="w-3 h-3" /><small>Add Tax</small>
                      </button>
                    </div>
                    {invoice.taxes.map((tax, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', marginBottom: '6px' }}>
                        <Field label="Label" value={tax.label} onChange={v => updateTax(idx, 'label', v)} />
                        <NumberField label="Amount" value={tax.amount} onChange={v => updateTax(idx, 'amount', v)} />
                        <button onClick={() => removeTax(idx)} className="p-2" style={{ color: 'var(--destructive)', borderRadius: 'var(--radius-md)' }}>
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={sectionCard}>
                  <h4 style={{ color: 'var(--foreground)', marginBottom: '12px' }}>Bank Details</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <Field label="Account Number" value={invoice.bankDetails.accountNumber} onChange={v => updateBankDetail('accountNumber', v)} />
                      <Field label="IFSC" value={invoice.bankDetails.ifsc} onChange={v => updateBankDetail('ifsc', v)} />
                    </div>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <Field label="Account Type" value={invoice.bankDetails.accountType} onChange={v => updateBankDetail('accountType', v)} />
                      <Field label="Bank" value={invoice.bankDetails.bank} onChange={v => updateBankDetail('bank', v)} />
                      <Field label="Swift Code" value={invoice.bankDetails.swiftCode} onChange={v => updateBankDetail('swiftCode', v)} />
                    </div>
                  </div>
                </div>
                <div style={sectionCard}>
                  <h4 style={{ color: 'var(--foreground)', marginBottom: '12px' }}>Signature & Footer</h4>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
                    <Field label="Company Line" value={invoice.signature.companyLine} onChange={v => updateSignature('companyLine', v)} />
                    <Field label="Signer Name" value={invoice.signature.signerName} onChange={v => updateSignature('signerName', v)} />
                    <Field label="Signer Title / DIN" value={invoice.signature.signerTitle} onChange={v => updateSignature('signerTitle', v)} />
                  </div>
                  <div style={{ marginTop: '10px' }}>
                    <Field label="Notes" value={invoice.notes || ''} onChange={v => updateField('notes', v)} />
                  </div>
                  <div style={{ marginTop: '10px' }}>
                    <label style={labelStyle}>Terms & Conditions (one per line)</label>
                    <textarea
                      value={invoice.terms.join('\n')}
                      onChange={e => updateField('terms', e.target.value.split('\n'))}
                      rows={3}
                      style={{ ...inputStyle, resize: 'vertical' }}
                    />
                  </div>
                </div>
              </div>
              {/* Live preview */}
              <div style={{ position: 'sticky', top: '100px' }}>
                <div style={{ transform: 'scale(0.75)', transformOrigin: 'top center' }}>
                  <InvoiceTemplate data={invoice} />
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ════════════════════════════════
          STAYWEB FAMILY
          ════════════════════════════════ */}
      {activeFamily === 'stayweb' && (
        <>
          <SubTabBar tabs={staywebTabs} active={staywebTab} onChange={setStaywebTab} />
          {staywebMode === 'preview' ? (
            <>
              {staywebTab === 'thermal' && renderPreviewShell(<ThermalReceipt data={thermal} />)}
              {staywebTab === 'kot' && renderPreviewShell(<KOTReceipt data={kot} />)}
              {staywebTab === 'a4-invoice' && renderPreviewShell(<StayWebInvoice data={staywebInv} />, true)}
            </>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' }}>
              {/* Edit form */}
              <div>
                {staywebTab === 'thermal' && (
                  <>
                    <div style={sectionCard}>
                      <h4 style={{ color: 'var(--foreground)', marginBottom: '12px' }}>Property Details</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <Field label="Property Name" value={thermal.propertyName} onChange={v => setThermal(p => ({ ...p, propertyName: v }))} />
                        <Field label="Address" value={thermal.propertyAddress} onChange={v => setThermal(p => ({ ...p, propertyAddress: v }))} />
                        <Field label="Phone" value={thermal.propertyPhone} onChange={v => setThermal(p => ({ ...p, propertyPhone: v }))} />
                      </div>
                    </div>
                    <div style={sectionCard}>
                      <h4 style={{ color: 'var(--foreground)', marginBottom: '12px' }}>Receipt Info</h4>
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <Field label="Title" value={thermal.title} onChange={v => setThermal(p => ({ ...p, title: v }))} />
                        <Field label="Date" value={thermal.date} onChange={v => setThermal(p => ({ ...p, date: v }))} />
                      </div>
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
                        <Field label="Guest Name" value={thermal.guestName} onChange={v => setThermal(p => ({ ...p, guestName: v }))} />
                        <Field label="Booking ID" value={thermal.bookingId} onChange={v => setThermal(p => ({ ...p, bookingId: v }))} />
                      </div>
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
                        <Field label="Room Type" value={thermal.roomType} onChange={v => setThermal(p => ({ ...p, roomType: v }))} />
                        <Field label="Stay Range" value={thermal.stayRange} onChange={v => setThermal(p => ({ ...p, stayRange: v }))} />
                      </div>
                    </div>
                    <div style={sectionCard}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <h4 style={{ color: 'var(--foreground)' }}>Line Items</h4>
                        <button onClick={() => setThermal(p => ({ ...p, lineItems: [...p.lineItems, { name: '', qty: 1, amount: 0 }] }))} className="flex items-center gap-1 px-3 py-1.5" style={{ backgroundColor: 'var(--muted)', color: 'var(--foreground)', borderRadius: 'var(--radius-md)' }}>
                          <Plus className="w-3.5 h-3.5" /><small>Add Item</small>
                        </button>
                      </div>
                      {thermal.lineItems.map((item, idx) => (
                        <div key={idx} style={{ backgroundColor: 'var(--secondary)', borderRadius: 'var(--radius-md)', padding: '12px', marginBottom: '8px', display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                          <Field label="Name" value={item.name} onChange={v => { const items = [...thermal.lineItems]; items[idx] = { ...items[idx], name: v }; setThermal(p => ({ ...p, lineItems: items })); }} />
                          <NumberField label="Qty" value={item.qty} onChange={v => { const items = [...thermal.lineItems]; items[idx] = { ...items[idx], qty: v }; setThermal(p => ({ ...p, lineItems: items })); }} />
                          <NumberField label="Amount" value={item.amount} onChange={v => { const items = [...thermal.lineItems]; items[idx] = { ...items[idx], amount: v }; setThermal(p => ({ ...p, lineItems: items })); }} />
                          <button onClick={() => setThermal(p => ({ ...p, lineItems: p.lineItems.filter((_, i) => i !== idx) }))} className="p-2" style={{ color: 'var(--destructive)', borderRadius: 'var(--radius-md)' }}>
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div style={sectionCard}>
                      <h4 style={{ color: 'var(--foreground)', marginBottom: '12px' }}>Totals & Footer</h4>
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <NumberField label="Subtotal" value={thermal.subtotal} onChange={v => setThermal(p => ({ ...p, subtotal: v }))} />
                        <NumberField label="Total" value={thermal.total} onChange={v => setThermal(p => ({ ...p, total: v }))} />
                      </div>
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
                        <Field label="Currency" value={thermal.currency} onChange={v => setThermal(p => ({ ...p, currency: v }))} />
                        <Field label="Payment Method" value={thermal.paymentMethod} onChange={v => setThermal(p => ({ ...p, paymentMethod: v }))} />
                      </div>
                      <div style={{ marginTop: '10px' }}>
                        <Field label="Thank You Message" value={thermal.thankYouMessage} onChange={v => setThermal(p => ({ ...p, thankYouMessage: v }))} />
                      </div>
                    </div>
                  </>
                )}

                {staywebTab === 'kot' && (
                  <>
                    <div style={sectionCard}>
                      <h4 style={{ color: 'var(--foreground)', marginBottom: '12px' }}>KOT Details</h4>
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <Field label="KOT Number" value={kot.kotNumber} onChange={v => setKot(p => ({ ...p, kotNumber: v }))} />
                        <Field label="Order Type" value={kot.orderType} onChange={v => setKot(p => ({ ...p, orderType: v }))} />
                      </div>
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
                        <Field label="Table" value={kot.table} onChange={v => setKot(p => ({ ...p, table: v }))} />
                        <Field label="Server" value={kot.server} onChange={v => setKot(p => ({ ...p, server: v }))} />
                        <Field label="Time" value={kot.time} onChange={v => setKot(p => ({ ...p, time: v }))} />
                      </div>
                      <div style={{ marginTop: '10px' }}>
                        <Field label="Property Name" value={kot.propertyName} onChange={v => setKot(p => ({ ...p, propertyName: v }))} />
                      </div>
                    </div>
                    <div style={sectionCard}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <h4 style={{ color: 'var(--foreground)' }}>Items</h4>
                        <button onClick={() => setKot(p => ({ ...p, items: [...p.items, { name: '', qty: 1 }] }))} className="flex items-center gap-1 px-3 py-1.5" style={{ backgroundColor: 'var(--muted)', color: 'var(--foreground)', borderRadius: 'var(--radius-md)' }}>
                          <Plus className="w-3.5 h-3.5" /><small>Add Item</small>
                        </button>
                      </div>
                      {kot.items.map((item, idx) => (
                        <div key={idx} style={{ backgroundColor: 'var(--secondary)', borderRadius: 'var(--radius-md)', padding: '12px', marginBottom: '8px', display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                          <Field label="Name" value={item.name} onChange={v => { const items = [...kot.items]; items[idx] = { ...items[idx], name: v }; setKot(p => ({ ...p, items })); }} />
                          <NumberField label="Qty" value={item.qty} onChange={v => { const items = [...kot.items]; items[idx] = { ...items[idx], qty: v }; setKot(p => ({ ...p, items })); }} />
                          <Field label="Note" value={item.note || ''} onChange={v => { const items = [...kot.items]; items[idx] = { ...items[idx], note: v || undefined }; setKot(p => ({ ...p, items })); }} />
                          <button onClick={() => setKot(p => ({ ...p, items: p.items.filter((_, i) => i !== idx) }))} className="p-2" style={{ color: 'var(--destructive)', borderRadius: 'var(--radius-md)' }}>
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {staywebTab === 'a4-invoice' && (
                  <>
                    <div style={sectionCard}>
                      <h4 style={{ color: 'var(--foreground)', marginBottom: '12px' }}>Company & Invoice</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <Field label="Company Name" value={staywebInv.companyName} onChange={v => setStaywebInv(p => ({ ...p, companyName: v }))} />
                        <Field label="Company Address" value={staywebInv.companyAddress} onChange={v => setStaywebInv(p => ({ ...p, companyAddress: v }))} />
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <Field label="Invoice Number" value={staywebInv.invoiceNumber} onChange={v => setStaywebInv(p => ({ ...p, invoiceNumber: v }))} />
                          <Field label="Date" value={staywebInv.date} onChange={v => setStaywebInv(p => ({ ...p, date: v }))} />
                        </div>
                      </div>
                    </div>
                    <div style={sectionCard}>
                      <h4 style={{ color: 'var(--foreground)', marginBottom: '12px' }}>Stay Details</h4>
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <Field label="Customer Name" value={staywebInv.customerName} onChange={v => setStaywebInv(p => ({ ...p, customerName: v }))} />
                        <Field label="Hotel Name" value={staywebInv.hotelName} onChange={v => setStaywebInv(p => ({ ...p, hotelName: v }))} />
                      </div>
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
                        <Field label="Hotel City" value={staywebInv.hotelCity} onChange={v => setStaywebInv(p => ({ ...p, hotelCity: v }))} />
                        <Field label="Check-In" value={staywebInv.checkIn} onChange={v => setStaywebInv(p => ({ ...p, checkIn: v }))} />
                        <Field label="Check-Out" value={staywebInv.checkOut} onChange={v => setStaywebInv(p => ({ ...p, checkOut: v }))} />
                      </div>
                    </div>
                    <div style={sectionCard}>
                      <h4 style={{ color: 'var(--foreground)', marginBottom: '12px' }}>Totals</h4>
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <NumberField label="Grand Total" value={staywebInv.grandTotal} onChange={v => setStaywebInv(p => ({ ...p, grandTotal: v }))} />
                        <Field label="Currency" value={staywebInv.currency} onChange={v => setStaywebInv(p => ({ ...p, currency: v }))} />
                      </div>
                      <div style={{ marginTop: '10px' }}>
                        <Field label="Amount In Words" value={staywebInv.amountInWords} onChange={v => setStaywebInv(p => ({ ...p, amountInWords: v }))} />
                      </div>
                    </div>
                  </>
                )}
              </div>
              {/* Live preview */}
              <div style={{ position: 'sticky', top: '100px' }}>
                <div style={{ transform: staywebTab === 'a4-invoice' ? 'scale(0.65)' : 'scale(0.85)', transformOrigin: 'top center' }}>
                  {staywebTab === 'thermal' && <ThermalReceipt data={thermal} />}
                  {staywebTab === 'kot' && <KOTReceipt data={kot} />}
                  {staywebTab === 'a4-invoice' && <StayWebInvoice data={staywebInv} />}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ════════════════════════════════
          HR LETTERS FAMILY
          ════════════════════════════════ */}
      {activeFamily === 'hr-letters' && (
        <>
          <SubTabBar tabs={hrTabs} active={hrTab} onChange={setHrTab} />
          {hrMode === 'preview' ? (
            <div
              className="flex justify-center py-8"
              style={{ backgroundColor: 'var(--muted)', borderRadius: 'var(--radius-lg)', minHeight: '860px' }}
            >
              <div style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.08)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                <HRLetterTemplate data={hrData[hrTab]} />
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' }}>
              {/* Edit form */}
              <div>
                <div style={sectionCard}>
                  <h4 style={{ color: 'var(--foreground)', marginBottom: '12px' }}>Letter Details</h4>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <Field label="Title" value={hrData[hrTab].title} onChange={v => setHrData(prev => ({ ...prev, [hrTab]: { ...prev[hrTab], title: v } }))} />
                    <Field label="Date" value={hrData[hrTab].date} onChange={v => setHrData(prev => ({ ...prev, [hrTab]: { ...prev[hrTab], date: v } }))} />
                  </div>
                  {hrData[hrTab].titleSuffix !== undefined && (
                    <div style={{ marginTop: '10px' }}>
                      <Field label="Title Suffix (Employee Name)" value={hrData[hrTab].titleSuffix || ''} onChange={v => setHrData(prev => ({ ...prev, [hrTab]: { ...prev[hrTab], titleSuffix: v } }))} />
                    </div>
                  )}
                </div>
                <div style={sectionCard}>
                  <h4 style={{ color: 'var(--foreground)', marginBottom: '12px' }}>Company</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <Field label="Company Name" value={hrData[hrTab].company.name} onChange={v => setHrData(prev => ({ ...prev, [hrTab]: { ...prev[hrTab], company: { ...prev[hrTab].company, name: v } } }))} />
                    <Field label="CIN" value={hrData[hrTab].company.cin} onChange={v => setHrData(prev => ({ ...prev, [hrTab]: { ...prev[hrTab], company: { ...prev[hrTab].company, cin: v } } }))} />
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <Field label="Email" value={hrData[hrTab].company.email} onChange={v => setHrData(prev => ({ ...prev, [hrTab]: { ...prev[hrTab], company: { ...prev[hrTab].company, email: v } } }))} />
                      <Field label="Phone" value={hrData[hrTab].company.phone} onChange={v => setHrData(prev => ({ ...prev, [hrTab]: { ...prev[hrTab], company: { ...prev[hrTab].company, phone: v } } }))} />
                    </div>
                  </div>
                </div>
                <div style={sectionCard}>
                  <h4 style={{ color: 'var(--foreground)', marginBottom: '12px' }}>Signatory</h4>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <Field label="Name" value={hrData[hrTab].signatory.name} onChange={v => setHrData(prev => ({ ...prev, [hrTab]: { ...prev[hrTab], signatory: { ...prev[hrTab].signatory, name: v } } }))} />
                    <Field label="Title" value={hrData[hrTab].signatory.title} onChange={v => setHrData(prev => ({ ...prev, [hrTab]: { ...prev[hrTab], signatory: { ...prev[hrTab].signatory, title: v } } }))} />
                  </div>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
                    <Field label="Signing Note" value={hrData[hrTab].signatory.signingNote} onChange={v => setHrData(prev => ({ ...prev, [hrTab]: { ...prev[hrTab], signatory: { ...prev[hrTab].signatory, signingNote: v } } }))} />
                    <Field label="Email" value={hrData[hrTab].signatory.email} onChange={v => setHrData(prev => ({ ...prev, [hrTab]: { ...prev[hrTab], signatory: { ...prev[hrTab].signatory, email: v } } }))} />
                    <Field label="Mobile" value={hrData[hrTab].signatory.mobile} onChange={v => setHrData(prev => ({ ...prev, [hrTab]: { ...prev[hrTab], signatory: { ...prev[hrTab].signatory, mobile: v } } }))} />
                  </div>
                </div>
                <div style={sectionCard}>
                  <h4 style={{ color: 'var(--foreground)', marginBottom: '12px' }}>Body Content</h4>
                  <p style={{ color: 'var(--muted-foreground)', marginBottom: '12px' }}>
                    Edit the letter body as plain text. Bold formatting from the template will be preserved in preview.
                  </p>
                  <textarea
                    value={hrData[hrTab].bodyParagraphs
                      .map(p => p.map(s => s.text).join(''))
                      .filter(line => line.length > 0)
                      .join('\n\n')}
                    onChange={e => {
                      const paragraphs = e.target.value.split('\n\n').map(line => line.length > 0 ? [{ text: line }] : []);
                      setHrData(prev => ({ ...prev, [hrTab]: { ...prev[hrTab], bodyParagraphs: paragraphs } }));
                    }}
                    rows={12}
                    style={{ ...inputStyle, resize: 'vertical' }}
                  />
                </div>
              </div>
              {/* Live preview */}
              <div style={{ position: 'sticky', top: '100px' }}>
                <div style={{ transform: 'scale(0.7)', transformOrigin: 'top center' }}>
                  <HRLetterTemplate data={hrData[hrTab]} />
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}