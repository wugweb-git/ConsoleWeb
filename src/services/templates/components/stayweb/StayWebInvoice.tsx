import React from 'react';
import { Hotel } from 'lucide-react';

// ===================================================
// A4 TAX INVOICE — StayWeb PMS Style
// Full-width card-based layout with grid metadata,
// line items table, totals, and footer.
// ===================================================

export interface InvoiceField {
  label: string;
  value: string;
  mono?: boolean; // Use Cousine monospace for the value
  span?: number;  // grid-column span
}

export interface InvoiceLineItem {
  description: string;
  sacCode: string;
  amount: number;
  taxRate: number;
  taxAmount: number;
  total: number;
}

export interface InvoiceTotalLine {
  label: string;
  amount: number;
  bold?: boolean;
}

export interface StayWebInvoiceData {
  // Header
  companyName: string;
  companyAddress: string;
  invoiceNumber: string;
  date: string;

  // Metadata grid (2-col)
  metaFields: InvoiceField[];

  // Customer
  customerName: string;

  // Stay details (4-col row)
  hotelName: string;
  hotelCity: string;
  checkIn: string;
  checkOut: string;

  // Line items
  lineItems: InvoiceLineItem[];

  // Totals
  totals: InvoiceTotalLine[];
  grandTotal: number;
  currency: string;
  amountInWords: string;

  // Footer
  footerText?: string;
}

// ———————————————————
// HELPERS
// ———————————————————

function DottedDivider() {
  return (
    <div
      style={{
        width: '100%',
        borderTop: '1px dotted var(--border)',
        margin: 0,
      }}
    />
  );
}

function FieldPair({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
      <p
        style={{
          fontFamily: "'Inter Tight', sans-serif",
          fontSize: 'var(--text-xs)',
          fontWeight: 'var(--font-weight-regular)',
          color: 'var(--muted-foreground)',
          margin: 0,
          lineHeight: '16px',
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontFamily: mono ? 'Cousine, monospace' : "'Inter Tight', sans-serif",
          fontSize: 'var(--text-sm)',
          fontWeight: 'var(--font-weight-semibold)',
          color: 'var(--card-foreground)',
          margin: 0,
          lineHeight: '18px',
          letterSpacing: mono ? '0.3px' : undefined,
        }}
      >
        {value}
      </p>
    </div>
  );
}

function fmt(n: number): string {
  return n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ———————————————————
// HOTEL ICON (inline SVG matching the Figma reference)
// ———————————————————

function HotelIcon() {
  return (
    <div
      style={{
        width: '56px',
        height: '56px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--muted)',
        borderRadius: 'var(--radius-md)',
        flexShrink: 0,
      }}
    >
      <Hotel
        style={{ width: '28px', height: '28px', color: 'var(--muted-foreground)' }}
        strokeWidth={2}
      />
    </div>
  );
}

// ———————————————————
// MAIN COMPONENT
// ———————————————————

export function StayWebInvoice({ data }: { data: StayWebInvoiceData }) {
  return (
    <article
      style={{
        width: '100%',
        maxWidth: '620px',
        margin: '0 auto',
        fontFamily: "'Inter Tight', sans-serif",
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* ==========================
          HEADER BAR
          ========================== */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '18px 6px',
          backgroundColor: 'var(--muted)',
          borderBottom: '1px solid var(--border)',
          position: 'relative',
        }}
      >
        <div
          style={{
            width: '576px',
            maxWidth: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <HotelIcon />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <p
                style={{
                  fontWeight: 'var(--font-weight-semibold)',
                  fontSize: '20px',
                  color: 'var(--card-foreground)',
                  margin: 0,
                  lineHeight: '24px',
                  whiteSpace: 'nowrap',
                }}
              >
                {data.companyName.split(' — ')[0] || data.companyName}
              </p>
              <p
                style={{
                  fontWeight: 'var(--font-weight-regular)',
                  fontSize: '14px',
                  color: 'var(--muted-foreground)',
                  margin: 0,
                  lineHeight: '21px',
                }}
              >
                Tax Invoice
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* ==========================
          BODY
          ========================== */}

      {/* Title Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '18px 32px',
          borderBottom: '1px solid var(--border)',
          backgroundColor: 'var(--card)',
        }}
      >
        <p
          style={{
            fontSize: 'var(--text-lg)',
            fontWeight: 'var(--font-weight-bold)',
            color: 'var(--card-foreground)',
            margin: 0,
            letterSpacing: '1px',
          }}
        >
          TAX INVOICE
        </p>
        <div style={{ textAlign: 'right' }}>
          <p
            style={{
              fontFamily: 'Cousine, monospace',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--card-foreground)',
              margin: 0,
            }}
          >
            {data.invoiceNumber}
          </p>
          <p
            style={{
              fontSize: 'var(--text-xs)',
              fontWeight: 'var(--font-weight-regular)',
              color: 'var(--muted-foreground)',
              margin: '2px 0 0',
            }}
          >
            {data.date}
          </p>
        </div>
      </div>

      {/* Company Info */}
      <div
        style={{
          padding: '14px 32px',
          backgroundColor: 'var(--card)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <p
          style={{
            fontSize: 'var(--text-xs)',
            fontWeight: 'var(--font-weight-bold)',
            color: 'var(--card-foreground)',
            margin: 0,
            lineHeight: '16px',
          }}
        >
          {data.companyName}
        </p>
        <p
          style={{
            fontSize: 'var(--text-xs)',
            fontWeight: 'var(--font-weight-regular)',
            color: 'var(--muted-foreground)',
            margin: '2px 0 0',
            lineHeight: '16px',
          }}
        >
          {data.companyAddress}
        </p>
      </div>

      {/* Metadata Grid */}
      <div style={{ padding: '16px 32px 18px', backgroundColor: 'var(--card)' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px 28px',
          }}
        >
          {data.metaFields.map((field, idx) =>
            field.span && field.span > 1 ? (
              <div key={idx} style={{ gridColumn: `span ${field.span}` }}>
                <FieldPair label={field.label} value={field.value} mono={field.mono} />
              </div>
            ) : (
              <FieldPair
                key={idx}
                label={field.label}
                value={field.value}
                mono={field.mono}
              />
            )
          )}
        </div>
      </div>

      {/* Customer Name */}
      <div style={{ padding: '0 32px', backgroundColor: 'var(--card)' }}>
        <DottedDivider />
        <div style={{ padding: '12px 0' }}>
          <p
            style={{
              fontSize: 'var(--text-xs)',
              fontWeight: 'var(--font-weight-regular)',
              color: 'var(--muted-foreground)',
              margin: 0,
              lineHeight: '16px',
            }}
          >
            Customer Name
          </p>
          <p
            style={{
              fontSize: 'var(--text-base)',
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--card-foreground)',
              margin: '2px 0 0',
            }}
          >
            {data.customerName}
          </p>
        </div>
        <DottedDivider />
      </div>

      {/* Hotel / Stay Details */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1.2fr 1.2fr',
          gap: '10px',
          padding: '12px 32px',
          backgroundColor: 'var(--card)',
        }}
      >
        <FieldPair label="Hotel Name" value={data.hotelName} />
        <FieldPair label="Hotel City" value={data.hotelCity} />
        <FieldPair label="Check-in" value={data.checkIn} />
        <FieldPair label="Check-out" value={data.checkOut} />
      </div>

      {/* Line Items Table */}
      <div style={{ padding: '0 32px', backgroundColor: 'var(--card)' }}>
        <DottedDivider />
        <table style={{ width: '100%', borderCollapse: 'collapse', margin: '12px 0' }}>
          <thead>
            <tr>
              {['Description', 'SAC', 'Amount', 'Tax', 'Total'].map((col) => (
                <th
                  key={col}
                  style={{
                    fontFamily: "'Inter Tight', sans-serif",
                    fontSize: 'var(--text-xs)',
                    fontWeight: 'var(--font-weight-bold)',
                    color: 'var(--muted-foreground)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    textAlign: col === 'Description' ? 'left' : 'right',
                    padding: '6px 0',
                    borderBottom: '1px solid var(--foreground)',
                  }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.lineItems.map((item, idx) => (
              <tr key={idx}>
                <td
                  style={{
                    padding: '8px 8px 8px 0',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 'var(--font-weight-regular)',
                    color: 'var(--card-foreground)',
                    borderBottom:
                      idx < data.lineItems.length - 1
                        ? '1px dotted var(--border)'
                        : 'none',
                  }}
                >
                  {item.description}
                </td>
                <td
                  style={{
                    padding: '8px 0',
                    fontFamily: 'Cousine, monospace',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 'var(--font-weight-regular)',
                    color: 'var(--card-foreground)',
                    textAlign: 'right',
                    borderBottom:
                      idx < data.lineItems.length - 1
                        ? '1px dotted var(--border)'
                        : 'none',
                  }}
                >
                  {item.sacCode}
                </td>
                <td
                  style={{
                    padding: '8px 0',
                    fontFamily: 'Cousine, monospace',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 'var(--font-weight-regular)',
                    color: 'var(--card-foreground)',
                    textAlign: 'right',
                    borderBottom:
                      idx < data.lineItems.length - 1
                        ? '1px dotted var(--border)'
                        : 'none',
                  }}
                >
                  {fmt(item.amount)}
                </td>
                <td
                  style={{
                    padding: '8px 0',
                    fontFamily: 'Cousine, monospace',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 'var(--font-weight-regular)',
                    color: 'var(--muted-foreground)',
                    textAlign: 'right',
                    borderBottom:
                      idx < data.lineItems.length - 1
                        ? '1px dotted var(--border)'
                        : 'none',
                  }}
                >
                  {fmt(item.taxAmount)}
                </td>
                <td
                  style={{
                    padding: '8px 0',
                    fontFamily: 'Cousine, monospace',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 'var(--font-weight-semibold)',
                    color: 'var(--card-foreground)',
                    textAlign: 'right',
                    borderBottom:
                      idx < data.lineItems.length - 1
                        ? '1px dotted var(--border)'
                        : 'none',
                  }}
                >
                  {fmt(item.total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div
        style={{
          padding: '0 32px 16px',
          backgroundColor: 'var(--card)',
          display: 'flex',
          justifyContent: 'flex-end',
        }}
      >
        <div style={{ minWidth: '240px' }}>
          {data.totals.map((line, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                padding: '3px 0',
              }}
            >
              <span
                style={{
                  fontSize: 'var(--text-xs)',
                  fontWeight: line.bold
                    ? 'var(--font-weight-bold)'
                    : 'var(--font-weight-regular)',
                  color: line.bold
                    ? 'var(--card-foreground)'
                    : 'var(--muted-foreground)',
                }}
              >
                {line.label}
              </span>
              <span
                style={{
                  fontFamily: 'Cousine, monospace',
                  fontSize: 'var(--text-xs)',
                  fontWeight: line.bold
                    ? 'var(--font-weight-bold)'
                    : 'var(--font-weight-regular)',
                  color: 'var(--card-foreground)',
                }}
              >
                {fmt(line.amount)}
              </span>
            </div>
          ))}

          {/* Grand Total */}
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
            <span
              style={{
                fontSize: '14px',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--primary-foreground)',
              }}
            >
              Grand Total
            </span>
            <span
              style={{
                fontFamily: 'Cousine, monospace',
                fontSize: '14px',
                fontWeight: 'var(--font-weight-bold)',
                color: 'var(--primary-foreground)',
              }}
            >
              {data.currency} {fmt(data.grandTotal)}
            </span>
          </div>

          {/* Amount in Words */}
          <div
            style={{
              backgroundColor: 'var(--secondary)',
              borderRadius: 'var(--radius-md)',
              padding: '8px 16px',
              marginTop: '8px',
            }}
          >
            <p
              style={{
                fontSize: 'var(--text-xs)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--card-foreground)',
                margin: 0,
              }}
            >
              Amount in Words
            </p>
            <p
              style={{
                fontSize: 'var(--text-xs)',
                fontWeight: 'var(--font-weight-regular)',
                color: 'var(--card-foreground)',
                margin: '2px 0 0',
              }}
            >
              {data.amountInWords}
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer
        style={{
          padding: '14px 32px',
          backgroundColor: 'var(--muted)',
          borderTop: '1px solid var(--border)',
          textAlign: 'center',
        }}
      >
        <p
          style={{
            fontSize: '9px',
            fontWeight: 'var(--font-weight-regular)',
            color: 'var(--muted-foreground)',
            margin: 0,
          }}
        >
          {data.footerText ||
            'This is a computer-generated invoice and does not require a signature. Powered by StayWeb PMS.'}
        </p>
      </footer>
    </article>
  );
}
