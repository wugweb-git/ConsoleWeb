import React from 'react';

// ===================================================
// KOT RECEIPT — StayWeb PMS
// Kitchen Order Ticket, 302px thermal-printer width
// ===================================================

export interface KOTItem {
  name: string;
  qty: number;
  note?: string; // "No sauce", "Extra parmesan", "Allergies: nuts"
}

export interface KOTData {
  kotNumber: string;
  orderType: string; // "Dine-in", "Room Service", "Takeaway"
  table: string;
  server: string;
  time: string;
  propertyName: string;
  items: KOTItem[];
  totalItems: number;
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
        margin: '8px 0',
        width: '100%',
      }}
    />
  );
}

function SolidDivider() {
  return (
    <div
      style={{
        borderTop: '2px solid var(--foreground)',
        margin: '8px 0',
        width: '100%',
      }}
    />
  );
}

// ———————————————————
// MAIN COMPONENT
// ———————————————————

export function KOTReceipt({ data }: { data: KOTData }) {
  return (
    <div
      style={{
        width: '302px',
        backgroundColor: 'var(--card)',
        fontFamily: "'Inter Tight', sans-serif",
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* KOT Header */}
      <div style={{ textAlign: 'center', marginBottom: '4px' }}>
        <p
          style={{
            fontSize: 'var(--text-lg)',
            fontWeight: 'var(--font-weight-bold)',
            color: 'var(--card-foreground)',
            margin: 0,
            letterSpacing: '3px',
            textTransform: 'uppercase',
          }}
        >
          KOT
        </p>
        <p
          style={{
            fontSize: '9px',
            fontWeight: 'var(--font-weight-regular)',
            color: 'var(--muted-foreground)',
            margin: '2px 0 0',
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}
        >
          Kitchen Order Ticket
        </p>
      </div>

      <DashedDivider />

      {/* KOT Number + Order Type Badge */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '2px',
        }}
      >
        <span
          style={{
            fontFamily: 'Cousine, monospace',
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-weight-bold)',
            color: 'var(--card-foreground)',
          }}
        >
          {data.kotNumber}
        </span>
        <span
          style={{
            fontFamily: "'Inter Tight', sans-serif",
            fontSize: 'var(--text-xs)',
            fontWeight: 'var(--font-weight-medium)',
            color: 'var(--card-foreground)',
            padding: '2px 8px',
            backgroundColor: 'var(--muted)',
            borderRadius: 'var(--radius-full)',
          }}
        >
          {data.orderType}
        </span>
      </div>

      {/* Meta Rows */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '3px',
          marginBottom: '2px',
        }}
      >
        {/* Table — emphasised */}
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span
            style={{
              fontFamily: "'Inter Tight', sans-serif",
              fontSize: '10px',
              fontWeight: 'var(--font-weight-regular)',
              color: 'var(--muted-foreground)',
            }}
          >
            Table
          </span>
          <span
            style={{
              fontFamily: 'Cousine, monospace',
              fontSize: 'var(--text-base)',
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--card-foreground)',
            }}
          >
            {data.table}
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span
            style={{
              fontFamily: "'Inter Tight', sans-serif",
              fontSize: '10px',
              fontWeight: 'var(--font-weight-regular)',
              color: 'var(--muted-foreground)',
            }}
          >
            Server
          </span>
          <span
            style={{
              fontFamily: "'Inter Tight', sans-serif",
              fontSize: '10px',
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--card-foreground)',
            }}
          >
            {data.server}
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span
            style={{
              fontFamily: "'Inter Tight', sans-serif",
              fontSize: '10px',
              fontWeight: 'var(--font-weight-regular)',
              color: 'var(--muted-foreground)',
            }}
          >
            Time
          </span>
          <span
            style={{
              fontFamily: 'Cousine, monospace',
              fontSize: '10px',
              fontWeight: 'var(--font-weight-regular)',
              color: 'var(--card-foreground)',
            }}
          >
            {data.time}
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span
            style={{
              fontFamily: "'Inter Tight', sans-serif",
              fontSize: '10px',
              fontWeight: 'var(--font-weight-regular)',
              color: 'var(--muted-foreground)',
            }}
          >
            Property
          </span>
          <span
            style={{
              fontFamily: "'Inter Tight', sans-serif",
              fontSize: '10px',
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--card-foreground)',
            }}
          >
            {data.propertyName}
          </span>
        </div>
      </div>

      <SolidDivider />

      {/* Order Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {data.items.map((item, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              padding: '6px 0',
              borderBottom:
                idx < data.items.length - 1
                  ? '1px dotted var(--border)'
                  : 'none',
            }}
          >
            <div style={{ flex: 1 }}>
              <p
                style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--card-foreground)',
                  margin: 0,
                }}
              >
                {item.name}
              </p>
              {item.note && (
                <p
                  style={{
                    fontSize: '9px',
                    fontWeight: 'var(--font-weight-regular)',
                    color: 'var(--accent)',
                    margin: '2px 0 0',
                    fontStyle: 'italic',
                  }}
                >
                  {item.note}
                </p>
              )}
            </div>
            <div
              style={{
                fontFamily: 'Cousine, monospace',
                fontSize: 'var(--text-lg)',
                fontWeight: 'var(--font-weight-bold)',
                color: 'var(--card-foreground)',
                minWidth: '36px',
                textAlign: 'right',
              }}
            >
              x{item.qty}
            </div>
          </div>
        ))}
      </div>

      <SolidDivider />

      {/* Total Items */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '4px',
        }}
      >
        <span
          style={{
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-weight-bold)',
            color: 'var(--card-foreground)',
            textTransform: 'uppercase',
          }}
        >
          Total Items
        </span>
        <span
          style={{
            fontFamily: 'Cousine, monospace',
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-weight-bold)',
            color: 'var(--card-foreground)',
          }}
        >
          {data.totalItems}
        </span>
      </div>

      <DashedDivider />

      {/* Footer */}
      <p
        style={{
          fontSize: '8px',
          fontWeight: 'var(--font-weight-regular)',
          color: 'var(--muted-foreground)',
          textAlign: 'center',
          margin: 0,
        }}
      >
        {data.footerText || 'Powered by StayWeb PMS'}
      </p>
    </div>
  );
}
