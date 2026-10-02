import React from 'react';
import svgPaths from '../../imports/svg-i0cn6locks';

// ===================================================
// INVOICE TEMPLATE — Templatised, data-driven
// Uses CSS variables from /styles/globals.css
// Typography: Inter Tight only (via semantic elements)
// ===================================================

// ———————————————————————————————————
// DATA INTERFACES
// ———————————————————————————————————

export interface BillParty {
  label: string;          // "BILL TO" or "BILL BY"
  companyName: string;
  gstin: string;
  address: string;
  email: string;
  phone: string;
}

export interface LineItem {
  name: string;
  description?: string;
  hsn: string;
  amount: number;
  qty: number;
  total: number;
}

export interface TaxLine {
  label: string;
  amount: number;
}

export interface BankDetails {
  accountNumber: string;
  ifsc: string;
  accountType: string;
  bank: string;
  swiftCode: string;
}

export interface SignatureBlock {
  companyLine: string;    // "For Wug Web Services Pvt Ltd"
  signerName: string;
  signerTitle: string;    // "DIN:08983258"
}

export interface InvoiceData {
  invoiceNumber: string;
  date: string;
  billTo: BillParty;
  billBy: BillParty;
  countryOfSupply: string;
  placeOfSupply: string;
  poNumber: string;
  lineItems: LineItem[];
  subtotal: number;
  taxes: TaxLine[];
  totalAmount: number;
  totalInWords: string;
  notes?: string;
  bankDetails: BankDetails;
  signature: SignatureBlock;
  terms: string[];
  showQrCode?: boolean;
}

// ———————————————————————————————————
// HELPERS
// ———————————————————————————————————

function formatCurrency(value: number, currency = '₹'): string {
  return `${currency}${value.toLocaleString('en-IN')}`;
}

// ———————————————————————————————————
// SVG SUB-COMPONENTS (from Figma import)
// ———————————————————————————————————

function LogoIcon({ size = 56 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 70.0062 70"
      fill="none"
      style={{ display: 'block' }}
    >
      <path d={svgPaths.p3bb5ce50} fill="var(--primary)" />
      <path d={svgPaths.p964e100} fill="var(--primary-foreground)" />
      <path d={svgPaths.p29503600} fill="var(--primary-foreground)" />
      <path d={svgPaths.p2ff38f00} fill="var(--primary-foreground)" />
      <path d={svgPaths.p17e6abc0} fill="var(--accent)" />
      <path d={svgPaths.p10fdcb00} fill="var(--accent)" />
      <path d={svgPaths.p2a1d32a5} fill="var(--accent)" />
    </svg>
  );
}

function MailIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
      <path d={svgPaths.p3ab03300} fill="var(--foreground)" />
    </svg>
  );
}

function PhoneIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
      <path d={svgPaths.p33d080b0} fill="var(--foreground)" />
    </svg>
  );
}

function QrCodeBlock() {
  return (
    <div style={{ backgroundColor: 'var(--secondary)', borderRadius: 'var(--radius-md)', padding: '8px' }}>
      <svg width={64} height={64} viewBox="0 0 68.324 68.324" fill="none" style={{ display: 'block' }}>
        <path d={svgPaths.p2561f700} fill="var(--foreground)" />
      </svg>
    </div>
  );
}

function WugwebTextLogo() {
  return (
    <svg width={117} height={27} viewBox="0 0 116.977 27.2993" fill="none" style={{ display: 'block' }}>
      <path d={svgPaths.p36a49a80} fill="var(--foreground)" />
      <path d={svgPaths.p3f901800} fill="var(--foreground)" />
      <path d={svgPaths.p2b12cc00} fill="var(--foreground)" />
      <path d={svgPaths.p236dc200} fill="var(--muted-foreground)" />
      <path d={svgPaths.p951a210} fill="var(--muted-foreground)" />
      <path d={svgPaths.p1ca1540} fill="var(--muted-foreground)" />
    </svg>
  );
}

// ———————————————————————————————————
// BILL PARTY CARD
// ———————————————————————————————————

function BillPartyCard({ party }: { party: BillParty }) {
  return (
    <div
      style={{
        flex: 1,
        backgroundColor: 'var(--secondary)',
        borderRadius: 'var(--radius-md)',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      {/* Label */}
      <h6 style={{ color: 'var(--foreground)', letterSpacing: '0.05em' }}>
        {party.label}
      </h6>

      {/* Company Name */}
      <p style={{ color: 'var(--foreground)', fontWeight: 'var(--font-weight-semibold)' } as React.CSSProperties}>
        {party.companyName}
      </p>

      {/* GSTIN */}
      <div style={{ display: 'flex', gap: '4px', alignItems: 'baseline' }}>
        <span style={{ color: 'var(--foreground)', fontSize: 'var(--text-xs)' }}>GSTIN:</span>
        <span style={{ color: 'var(--muted-foreground)', fontSize: 'var(--text-xs)' }}>{party.gstin}</span>
      </div>

      {/* Address */}
      <p style={{ color: 'var(--muted-foreground)', fontSize: 'var(--text-xs)', lineHeight: '1.4' }}>
        {party.address}
      </p>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Email */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <MailIcon />
        <span style={{ color: 'var(--muted-foreground)', fontSize: 'var(--text-xs)' }}>{party.email}</span>
      </div>

      {/* Phone */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <PhoneIcon />
        <span style={{ color: 'var(--muted-foreground)', fontSize: 'var(--text-xs)' }}>{party.phone}</span>
      </div>
    </div>
  );
}

// ———————————————————————————————————
// MAIN TEMPLATE
// ———————————————————————————————————

export function InvoiceTemplate({ data }: { data: InvoiceData }) {
  return (
    <div
      style={{
        backgroundColor: 'var(--card)',
        color: 'var(--card-foreground)',
        maxWidth: '595px',
        margin: '0 auto',
        fontFamily: "'Inter Tight', sans-serif",
        position: 'relative',
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
      }}
    >
      {/* ============================
          HEADER
          ============================ */}
      <div style={{ padding: '28px 32px 0 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          {/* Left: Title + Meta */}
          <div>
            <h1 style={{
              color: 'var(--foreground)',
              fontSize: '36px',
              fontWeight: 'var(--font-weight-bold)',
              lineHeight: 1.1,
              margin: 0,
            } as React.CSSProperties}>
              invoice
            </h1>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '12px' }}>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'baseline' }}>
                <span style={{
                  color: 'var(--foreground)',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 'var(--font-weight-semibold)',
                } as React.CSSProperties}>
                  Invoice No:
                </span>
                <span style={{ color: 'var(--muted-foreground)', fontSize: 'var(--text-xs)' }}>
                  {data.invoiceNumber}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'baseline' }}>
                <span style={{
                  color: 'var(--foreground)',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 'var(--font-weight-semibold)',
                } as React.CSSProperties}>
                  Date:
                </span>
                <span style={{ color: 'var(--muted-foreground)', fontSize: 'var(--text-xs)' }}>
                  {data.date}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Logo */}
          <LogoIcon size={56} />
        </div>
      </div>

      {/* ============================
          BILL TO / BILL BY
          ============================ */}
      <div style={{ padding: '20px 32px', display: 'flex', gap: '11px' }}>
        <BillPartyCard party={data.billTo} />
        <BillPartyCard party={data.billBy} />
      </div>

      {/* ============================
          SUPPLY INFO ROW
          ============================ */}
      <div style={{ padding: '0 32px 16px 32px' }}>
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '4px', alignItems: 'baseline' }}>
            <span style={{
              color: 'var(--foreground)',
              fontSize: 'var(--text-xs)',
              fontWeight: 'var(--font-weight-semibold)',
            } as React.CSSProperties}>
              Country of Supply:
            </span>
            <span style={{ color: 'var(--muted-foreground)', fontSize: 'var(--text-xs)' }}>
              {data.countryOfSupply}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '4px', alignItems: 'baseline' }}>
            <span style={{
              color: 'var(--foreground)',
              fontSize: 'var(--text-xs)',
              fontWeight: 'var(--font-weight-semibold)',
            } as React.CSSProperties}>
              Place of Supply:
            </span>
            <span style={{ color: 'var(--muted-foreground)', fontSize: 'var(--text-xs)' }}>
              {data.placeOfSupply}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '4px', alignItems: 'baseline' }}>
            <span style={{
              color: 'var(--foreground)',
              fontSize: 'var(--text-xs)',
              fontWeight: 'var(--font-weight-semibold)',
            } as React.CSSProperties}>
              PO Number:
            </span>
            <span style={{ color: 'var(--muted-foreground)', fontSize: 'var(--text-xs)' }}>
              {data.poNumber || '—'}
            </span>
          </div>
        </div>
      </div>

      {/* ============================
          LINE ITEMS TABLE
          ============================ */}
      <div style={{ padding: '0 32px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          {/* Header row — dark background, accent text */}
          <thead>
            <tr>
              {['Item', 'HSN', 'Amount', 'Qty', 'Total'].map((col) => (
                <th
                  key={col}
                  style={{
                    backgroundColor: 'var(--primary)',
                    color: 'var(--accent)',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 'var(--font-weight-semibold)',
                    padding: '8px 12px',
                    textAlign: col === 'Item' ? 'left' : 'right',
                    borderRadius:
                      col === 'Item' ? 'var(--radius-md) 0 0 0' :
                      col === 'Total' ? '0 var(--radius-md) 0 0' : '0',
                  } as React.CSSProperties}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.lineItems.map((item, idx) => (
              <tr
                key={idx}
                style={{
                  backgroundColor: 'var(--secondary)',
                  borderBottom: idx < data.lineItems.length - 1 ? '1px solid var(--card)' : 'none',
                }}
              >
                <td style={{ padding: '10px 12px' }}>
                  <p style={{
                    color: 'var(--foreground)',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 'var(--font-weight-semibold)',
                    margin: 0,
                  } as React.CSSProperties}>
                    {item.name}
                  </p>
                  {item.description && (
                    <p style={{
                      color: 'var(--muted-foreground)',
                      fontSize: 'var(--text-xs)',
                      margin: '2px 0 0',
                    }}>
                      {item.description}
                    </p>
                  )}
                </td>
                <td style={{ padding: '10px 12px', textAlign: 'right', borderLeft: '1px solid var(--card)' }}>
                  <span style={{ color: 'var(--foreground)', fontSize: 'var(--text-xs)' }}>{item.hsn}</span>
                </td>
                <td style={{ padding: '10px 12px', textAlign: 'right', borderLeft: '1px solid var(--card)' }}>
                  <span style={{ color: 'var(--foreground)', fontSize: 'var(--text-xs)' }}>
                    {formatCurrency(item.amount)}
                  </span>
                </td>
                <td style={{ padding: '10px 12px', textAlign: 'right', borderLeft: '1px solid var(--card)' }}>
                  <span style={{ color: 'var(--foreground)', fontSize: 'var(--text-xs)' }}>
                    {String(item.qty).padStart(2, '0')}
                  </span>
                </td>
                <td style={{ padding: '10px 12px', textAlign: 'right', borderLeft: '1px solid var(--card)' }}>
                  <span style={{
                    color: 'var(--foreground)',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 'var(--font-weight-semibold)',
                  } as React.CSSProperties}>
                    {formatCurrency(item.total)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ============================
          TOTALS SECTION
          ============================ */}
      <div style={{ padding: '20px 32px 0 32px', display: 'flex', justifyContent: 'flex-end' }}>
        <div style={{ minWidth: '240px' }}>
          {/* Subtotal */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '4px 0' }}>
            <span style={{
              color: 'var(--foreground)',
              fontSize: 'var(--text-xs)',
              fontWeight: 'var(--font-weight-medium)',
            } as React.CSSProperties}>
              Subtotal
            </span>
            <span style={{ color: 'var(--muted-foreground)', fontSize: 'var(--text-xs)' }}>
              {formatCurrency(data.subtotal)}
            </span>
          </div>

          {/* Tax lines */}
          {data.taxes.map((tax, idx) => (
            <div
              key={idx}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '4px 0' }}
            >
              <span style={{
                color: 'var(--foreground)',
                fontSize: 'var(--text-xs)',
                fontWeight: 'var(--font-weight-medium)',
              } as React.CSSProperties}>
                {tax.label}
              </span>
              <span style={{ color: 'var(--muted-foreground)', fontSize: 'var(--text-xs)' }}>
                {formatCurrency(tax.amount)}
              </span>
            </div>
          ))}

          {/* Total Amount — dark box */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: 'var(--primary)',
              borderRadius: 'var(--radius-md)',
              padding: '10px 16px',
              marginTop: '8px',
            }}
          >
            <span style={{
              color: 'var(--accent)',
              fontSize: '14px',
              fontWeight: 'var(--font-weight-semibold)',
            } as React.CSSProperties}>
              Total Amount
            </span>
            <span style={{
              color: 'var(--primary-foreground)',
              fontSize: '14px',
              fontWeight: 'var(--font-weight-bold)',
            } as React.CSSProperties}>
              {formatCurrency(data.totalAmount)}
            </span>
          </div>
        </div>
      </div>

      {/* ============================
          TOTAL IN WORDS
          ============================ */}
      <div style={{ padding: '12px 32px 0 32px', display: 'flex', justifyContent: 'flex-end' }}>
        <div
          style={{
            minWidth: '240px',
            backgroundColor: 'var(--secondary)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 16px',
          }}
        >
          <span style={{
            color: 'var(--foreground)',
            fontSize: 'var(--text-xs)',
            fontWeight: 'var(--font-weight-semibold)',
            display: 'block',
          } as React.CSSProperties}>
            Total In Words
          </span>
          <span style={{ color: 'var(--foreground)', fontSize: 'var(--text-xs)' }}>
            {data.totalInWords}
          </span>
        </div>
      </div>

      {/* ============================
          NOTES
          ============================ */}
      {data.notes && (
        <div style={{ padding: '24px 32px 0 32px' }}>
          <p style={{
            color: 'var(--foreground)',
            fontSize: 'var(--text-xs)',
            fontWeight: 'var(--font-weight-semibold)',
            margin: '0 0 4px',
          } as React.CSSProperties}>
            Notes
          </p>
          <p style={{
            color: 'var(--muted-foreground)',
            fontSize: '8px',
            fontStyle: 'italic',
            margin: 0,
          }}>
            {data.notes}
          </p>
        </div>
      )}

      {/* ============================
          BANK DETAILS / QR / SIGNATURE
          ============================ */}
      <div
        style={{
          padding: '24px 32px',
          display: 'grid',
          gridTemplateColumns: data.showQrCode !== false ? 'auto 1fr 1fr' : '1fr 1fr',
          gap: '24px',
          alignItems: 'start',
        }}
      >
        {/* QR Code */}
        {data.showQrCode !== false && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <p style={{
              color: 'var(--foreground)',
              fontSize: 'var(--text-xs)',
              fontWeight: 'var(--font-weight-semibold)',
              margin: 0,
            } as React.CSSProperties}>
              Scan & Pay
            </p>
            <QrCodeBlock />
          </div>
        )}

        {/* Bank Details */}
        <div>
          <p style={{
            color: 'var(--foreground)',
            fontSize: 'var(--text-xs)',
            fontWeight: 'var(--font-weight-semibold)',
            margin: '0 0 8px',
          } as React.CSSProperties}>
            Bank Details
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {([
              ['Account Number', data.bankDetails.accountNumber],
              ['IFSC', data.bankDetails.ifsc],
              ['Account Type', data.bankDetails.accountType],
              ['Bank', data.bankDetails.bank],
              ['Swift Code / BIC', data.bankDetails.swiftCode],
            ] as [string, string][]).map(([label, value]) => (
              <div key={label} style={{ display: 'flex', gap: '12px', alignItems: 'baseline' }}>
                <span style={{
                  color: 'var(--foreground)',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 'var(--font-weight-semibold)',
                  minWidth: '100px',
                } as React.CSSProperties}>
                  {label}
                </span>
                <span style={{ color: 'var(--muted-foreground)', fontSize: 'var(--text-xs)' }}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Signature */}
        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
          <p style={{
            color: 'var(--foreground)',
            fontSize: 'var(--text-xs)',
            fontStyle: 'italic',
            margin: '0 0 24px',
          }}>
            {data.signature.companyLine}
          </p>
          <p style={{
            color: 'var(--foreground)',
            fontSize: 'var(--text-xs)',
            fontWeight: 'var(--font-weight-semibold)',
            margin: 0,
          } as React.CSSProperties}>
            {data.signature.signerName}
          </p>
          <span style={{ color: 'var(--foreground)', fontSize: 'var(--text-xs)' }}>
            {data.signature.signerTitle}
          </span>
        </div>
      </div>

      {/* ============================
          FOOTER — Terms + Logo
          ============================ */}
      <div
        style={{
          backgroundColor: 'var(--secondary)',
          padding: '16px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
        }}
      >
        <div>
          <p style={{
            color: 'var(--foreground)',
            fontSize: 'var(--text-xs)',
            fontWeight: 'var(--font-weight-semibold)',
            margin: '0 0 4px',
          } as React.CSSProperties}>
            Terms & Conditions
          </p>
          {data.terms.map((term, idx) => (
            <p
              key={idx}
              style={{
                color: 'var(--muted-foreground)',
                fontSize: '9px',
                fontStyle: 'italic',
                margin: 0,
                lineHeight: 1.6,
              }}
            >
              {term}
            </p>
          ))}
        </div>
        <WugwebTextLogo />
      </div>
    </div>
  );
}
