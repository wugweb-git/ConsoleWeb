import React from 'react';

// ===================================================
// THERMAL RECEIPT — StayWeb PMS
// 302px thermal-printer width, data-driven
// ===================================================

export interface ThermalReceiptLineItem {
  name: string;
  qty: number;
  amount: number;
}

export interface ThermalReceiptTax {
  label: string;
  amount: number;
}

export interface ThermalReceiptData {
  propertyName: string;
  propertyAddress: string;
  propertyPhone: string;
  title: string; // "Payment Receipt", "Room Bill", etc.
  date: string;
  guestName: string;
  bookingId: string;
  roomType: string;
  stayRange: string;
  lineItems: ThermalReceiptLineItem[];
  subtotal: number;
  taxes: ThermalReceiptTax[];
  total: number;
  currency: string;
  paymentMethod: string;
  thankYouMessage?: string;
  footerText?: string;
}

// ———————————————————
// HELPERS
// ———————————————————

function DashedDivider() {
  return (
    <div
      style={{
        borderTop: '1px dashed var(--border)',
        margin: '10px 0',
        width: '100%',
      }}
    />
  );
}

function KeyValueRow({
  label,
  value,
  mono = false,
  valueBold = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
  valueBold?: boolean;
}) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <span
        style={{
          fontFamily: "'Inter Tight', sans-serif",
          fontSize: '10px',
          fontWeight: 'var(--font-weight-regular)',
          color: 'var(--muted-foreground)',
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: mono ? 'Cousine, monospace' : "'Inter Tight', sans-serif",
          fontSize: '10px',
          fontWeight: valueBold
            ? 'var(--font-weight-bold)'
            : 'var(--font-weight-medium)',
          color: 'var(--card-foreground)',
        }}
      >
        {value}
      </span>
    </div>
  );
}

function fmt(n: number): string {
  return n.toFixed(2);
}

// ———————————————————
// MAIN COMPONENT
// ———————————————————

export function ThermalReceipt({ data }: { data: ThermalReceiptData }) {
  return (
    <div
      style={{
        width: '302px',
        backgroundColor: 'var(--card)',
        fontFamily: "'Inter Tight', sans-serif",
        padding: '20px 16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {/* Property Header */}
      <p
        style={{
          fontSize: 'var(--text-base)',
          fontWeight: 'var(--font-weight-bold)',
          color: 'var(--card-foreground)',
          margin: '0 0 2px',
          textAlign: 'center',
        }}
      >
        {data.propertyName}
      </p>
      <p
        style={{
          fontSize: '9px',
          fontWeight: 'var(--font-weight-regular)',
          color: 'var(--muted-foreground)',
          margin: 0,
          textAlign: 'center',
        }}
      >
        {data.propertyAddress}
      </p>
      <p
        style={{
          fontSize: '9px',
          fontWeight: 'var(--font-weight-regular)',
          color: 'var(--muted-foreground)',
          margin: '0 0 4px',
          textAlign: 'center',
        }}
      >
        Tel: {data.propertyPhone}
      </p>

      <DashedDivider />

      {/* Receipt Title */}
      <p
        style={{
          fontSize: 'var(--text-sm)',
          fontWeight: 'var(--font-weight-bold)',
          color: 'var(--card-foreground)',
          margin: 0,
          textAlign: 'center',
          letterSpacing: '2px',
          textTransform: 'uppercase',
        }}
      >
        {data.title}
      </p>

      <DashedDivider />

      {/* Booking Info */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '3px' }}>
        <KeyValueRow label="Date" value={data.date} mono />
        <KeyValueRow label="Guest" value={data.guestName} />
        <KeyValueRow label="Booking" value={`#${data.bookingId}`} mono valueBold />
        <KeyValueRow label="Room" value={data.roomType} />
        <KeyValueRow label="Stay" value={data.stayRange} />
      </div>

      <DashedDivider />

      {/* Line Items */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span
            style={{
              fontFamily: "'Inter Tight', sans-serif",
              fontSize: '9px',
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--card-foreground)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              flex: 1,
            }}
          >
            Item
          </span>
          <span
            style={{
              fontFamily: "'Inter Tight', sans-serif",
              fontSize: '9px',
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--card-foreground)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              width: '30px',
              textAlign: 'right',
            }}
          >
            Qty
          </span>
          <span
            style={{
              fontFamily: "'Inter Tight', sans-serif",
              fontSize: '9px',
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--card-foreground)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              width: '70px',
              textAlign: 'right',
            }}
          >
            Amount
          </span>
        </div>

        {/* Items */}
        {data.lineItems.map((item, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
            }}
          >
            <span
              style={{
                fontFamily: "'Inter Tight', sans-serif",
                fontSize: '10px',
                fontWeight: 'var(--font-weight-regular)',
                color: 'var(--card-foreground)',
                flex: 1,
              }}
            >
              {item.name}
            </span>
            <span
              style={{
                fontFamily: 'Cousine, monospace',
                fontSize: '10px',
                fontWeight: 'var(--font-weight-regular)',
                color: 'var(--card-foreground)',
                width: '30px',
                textAlign: 'right',
              }}
            >
              {item.qty}
            </span>
            <span
              style={{
                fontFamily: 'Cousine, monospace',
                fontSize: '10px',
                fontWeight: 'var(--font-weight-regular)',
                color: 'var(--card-foreground)',
                width: '70px',
                textAlign: 'right',
              }}
            >
              {fmt(item.amount)}
            </span>
          </div>
        ))}
      </div>

      <DashedDivider />

      {/* Totals */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span
            style={{
              fontFamily: "'Inter Tight', sans-serif",
              fontSize: '10px',
              fontWeight: 'var(--font-weight-regular)',
              color: 'var(--muted-foreground)',
            }}
          >
            Subtotal
          </span>
          <span
            style={{
              fontFamily: 'Cousine, monospace',
              fontSize: '10px',
              fontWeight: 'var(--font-weight-regular)',
              color: 'var(--card-foreground)',
            }}
          >
            {fmt(data.subtotal)}
          </span>
        </div>

        {data.taxes.map((tax, idx) => (
          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span
              style={{
                fontFamily: "'Inter Tight', sans-serif",
                fontSize: '10px',
                fontWeight: 'var(--font-weight-regular)',
                color: 'var(--muted-foreground)',
              }}
            >
              {tax.label}
            </span>
            <span
              style={{
                fontFamily: 'Cousine, monospace',
                fontSize: '10px',
                fontWeight: 'var(--font-weight-regular)',
                color: 'var(--card-foreground)',
              }}
            >
              {fmt(tax.amount)}
            </span>
          </div>
        ))}

        {/* Total line */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            borderTop: '1px solid var(--foreground)',
            paddingTop: '6px',
            marginTop: '2px',
          }}
        >
          <span
            style={{
              fontFamily: "'Inter Tight', sans-serif",
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--card-foreground)',
            }}
          >
            TOTAL
          </span>
          <span
            style={{
              fontFamily: 'Cousine, monospace',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--card-foreground)',
            }}
          >
            {data.currency} {fmt(data.total)}
          </span>
        </div>
      </div>

      <DashedDivider />

      {/* Payment Method */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
        <span
          style={{
            fontFamily: "'Inter Tight', sans-serif",
            fontSize: '10px',
            fontWeight: 'var(--font-weight-regular)',
            color: 'var(--muted-foreground)',
          }}
        >
          Paid via
        </span>
        <span
          style={{
            fontFamily: "'Inter Tight', sans-serif",
            fontSize: '10px',
            fontWeight: 'var(--font-weight-medium)',
            color: 'var(--card-foreground)',
          }}
        >
          {data.paymentMethod}
        </span>
      </div>

      <DashedDivider />

      {/* Thank You */}
      <p
        style={{
          fontSize: '9px',
          fontWeight: 'var(--font-weight-regular)',
          color: 'var(--muted-foreground)',
          textAlign: 'center',
          margin: '4px 0 0',
        }}
      >
        {data.thankYouMessage || 'Thank you for your stay!'}
      </p>

      {/* Footer */}
      <p
        style={{
          fontSize: '8px',
          fontWeight: 'var(--font-weight-regular)',
          color: 'var(--muted-foreground)',
          textAlign: 'center',
          margin: '8px 0 0',
        }}
      >
        {data.footerText || 'Powered by StayWeb PMS'}
      </p>
    </div>
  );
}
