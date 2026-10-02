import React from 'react';
import svgPaths from '../../imports/svg-hcatgojhl4';
import imgSignature from 'figma:asset/7de6133843694918a5900b99657d56c8994d2640.png';

// ===================================================
// HR LETTER TEMPLATE — Wugweb
// Shared data-driven layout for Experience, Relieving,
// Internship, and Offer letters. 600px A4-style page.
// ===================================================

// ———————————————————
// DATA TYPES
// ———————————————————

export interface BodySegment {
  text: string;
  bold?: boolean;
}

/** A paragraph is an array of segments (inline runs with optional bold). */
export type BodyParagraph = BodySegment[];

export interface HRLetterCompany {
  name: string;
  /** Multi-line address (each string is a line) */
  address: string[];
  cin: string;
  email: string;
  phone: string;
}

export interface HRLetterSignatory {
  name: string;
  title: string;
  signingNote: string;
  email: string;
  mobile: string;
  /** Override the default signature image */
  signatureImageSrc?: string;
}

export interface HRLetterData {
  company: HRLetterCompany;
  /** Main title, e.g. "Relieving Letter" */
  title: string;
  /** Optional suffix rendered in regular weight, e.g. "Ms. Saavi Garg" */
  titleSuffix?: string;
  date: string;
  /** Each entry is a paragraph; empty array = blank line */
  bodyParagraphs: BodyParagraph[];
  signatory: HRLetterSignatory;
}

// ———————————————————
// SUB-COMPONENTS (internal)
// ———————————————————

/** Large header wordmark logo */
function LogoWordmark() {
  return (
    <div style={{ position: 'relative', width: '149.479px', height: '37.702px' }}>
      <svg
        style={{ position: 'absolute', display: 'block', width: '100%', height: '100%' }}
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 149.479 37.7015"
      >
        <g clipPath="url(#clip_logo_large)">
          <path d={svgPaths.p1e6cc7c0} fill="var(--foreground)" />
          <path d={svgPaths.p180576e0} fill="var(--foreground)" />
          <path d={svgPaths.p1d431c80} fill="var(--muted-foreground)" />
          <path d={svgPaths.p3249e000} fill="var(--muted-foreground)" />
          <path d={svgPaths.p2bef0e80} fill="var(--foreground)" />
          <path d={svgPaths.p3b2b1100} fill="var(--muted-foreground)" />
        </g>
        <defs>
          <clipPath id="clip_logo_large">
            <rect fill="white" height="37.7015" width="149.479" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

/** Small footer wordmark */
function LogoSmall() {
  return (
    <div style={{ position: 'relative', width: '60px', height: '15.133px' }}>
      <svg
        style={{ position: 'absolute', display: 'block', width: '100%', height: '100%' }}
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 60 15.1332"
      >
        <g clipPath="url(#clip_logo_small)">
          <path d={svgPaths.p28d73a00} fill="var(--foreground)" />
          <path d={svgPaths.p21e71900} fill="var(--foreground)" />
          <path d={svgPaths.p6375e00} fill="var(--muted-foreground)" />
          <path d={svgPaths.p17caf900} fill="var(--muted-foreground)" />
          <path d={svgPaths.p20c9b680} fill="var(--foreground)" />
          <path d={svgPaths.p3085b000} fill="var(--muted-foreground)" />
        </g>
        <defs>
          <clipPath id="clip_logo_small">
            <rect fill="white" height="15.1332" width="60" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

/** Circular icon badge (top-right of header) */
function IconBadge() {
  return (
    <div
      style={{
        width: '54px',
        height: '54px',
        borderRadius: '100px',
        backgroundColor: 'var(--foreground)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        flexShrink: 0,
      }}
    >
      <svg fill="none" viewBox="0 0 29.3333 22" style={{ width: '100%', height: '100%' }}>
        <path d={svgPaths.p3e4ae080} fill="var(--card)" />
        <path d={svgPaths.p3d09d720} fill="var(--card)" />
        <path d={svgPaths.p22434c80} fill="var(--accent)" />
        <path d={svgPaths.p183f9c00} fill="var(--accent)" />
      </svg>
    </div>
  );
}

// ———————————————————
// MAIN TEMPLATE
// ———————————————————

export function HRLetterTemplate({ data }: { data: HRLetterData }) {
  const sigSrc = data.signatory.signatureImageSrc || imgSignature;

  return (
    <div
      style={{
        width: '600px',
        minHeight: '800px',
        backgroundColor: 'var(--card)',
        fontFamily: "'Inter Tight', sans-serif",
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* ========================
          HEADER
          ======================== */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 30px',
          backgroundColor: 'var(--card)',
        }}
      >
        <div style={{ padding: '6px 0' }}>
          <LogoWordmark />
        </div>
        <IconBadge />
      </header>

      {/* ========================
          TITLE
          ======================== */}
      <div style={{ textAlign: 'center', padding: '0 50px' }}>
        <p
          style={{
            fontSize: '16px',
            fontWeight: 'var(--font-weight-semibold)',
            lineHeight: '15px',
            color: 'var(--neutral-7)',
            margin: 0,
          }}
        >
          {data.title}
          {data.titleSuffix && (
            <>
              {' – '}
              <span style={{ fontWeight: 'var(--font-weight-regular)' }}>
                {data.titleSuffix}
              </span>
            </>
          )}
        </p>
      </div>

      {/* ========================
          BODY
          ======================== */}
      <div
        style={{
          flex: 1,
          padding: '30px 50px 0 50px',
          color: 'var(--neutral-7)',
          fontSize: '11px',
          fontWeight: 'var(--font-weight-regular)',
          lineHeight: '15px',
        }}
      >
        {/* Date */}
        <p style={{ margin: '0 0 0 0' }}>
          <span style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--neutral-7)' }}>
            Date:{' '}
          </span>
          <span>{data.date}</span>
        </p>

        {/* Paragraphs */}
        <div style={{ marginTop: '15px' }}>
          {data.bodyParagraphs.map((paragraph, pIdx) => {
            // Empty paragraph = blank line spacer
            if (paragraph.length === 0) {
              return <div key={pIdx} style={{ height: '15px' }} />;
            }
            return (
              <p key={pIdx} style={{ margin: '0 0 0 0', lineHeight: '15px' }}>
                {paragraph.map((seg, sIdx) => (
                  <span
                    key={sIdx}
                    style={{
                      fontWeight: seg.bold
                        ? 'var(--font-weight-bold)'
                        : 'var(--font-weight-regular)',
                      lineHeight: '15px',
                    }}
                  >
                    {seg.text}
                  </span>
                ))}
              </p>
            );
          })}
        </div>

        {/* ========================
            SIGNATURE BLOCK
            ======================== */}
        <div style={{ marginTop: '40px' }}>
          {/* Signature image */}
          <div style={{ width: '168px', height: '109px', position: 'relative', overflow: 'hidden' }}>
            <img
              alt="Signature"
              src={sigSrc}
              style={{
                position: 'absolute',
                width: '108.85%',
                height: '124.82%',
                left: '-8.85%',
                top: '-0.08%',
                maxWidth: 'none',
              }}
            />
          </div>

          {/* Name + Title */}
          <p
            style={{
              fontSize: '11px',
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--foreground)',
              margin: '0',
              lineHeight: 'normal',
            }}
          >
            {data.signatory.name}
          </p>
          <p
            style={{
              fontSize: '11px',
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--foreground)',
              margin: '0',
              lineHeight: 'normal',
            }}
          >
            {data.signatory.title}
          </p>
          <p
            style={{
              fontSize: '8px',
              fontWeight: 'var(--font-weight-regular)',
              fontStyle: 'italic',
              color: 'var(--foreground)',
              margin: '0',
              lineHeight: '15px',
            }}
          >
            {data.signatory.signingNote}
          </p>

          {/* Contact */}
          <div style={{ marginTop: '12px' }}>
            <p style={{ fontSize: '9px', margin: 0, lineHeight: '15px', color: 'var(--foreground)' }}>
              <span style={{ fontWeight: 'var(--font-weight-semibold)' }}>E:</span>
              {'   '}
              <span>{data.signatory.email}</span>
            </p>
            <p style={{ fontSize: '9px', margin: 0, lineHeight: '15px', color: 'var(--foreground)' }}>
              <span style={{ fontWeight: 'var(--font-weight-semibold)' }}>M:</span>
              {' '}
              <span>{data.signatory.mobile}</span>
            </p>
          </div>
        </div>
      </div>

      {/* ========================
          FOOTER
          ======================== */}
      <footer
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 30px',
          backgroundColor: 'var(--secondary)',
          marginTop: 'auto',
        }}
      >
        {/* Left: Company info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '192px' }}>
          <p
            style={{
              fontSize: '11px',
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--foreground)',
              margin: 0,
              lineHeight: 'normal',
            }}
          >
            {data.company.name}
          </p>
          <div
            style={{
              fontSize: '9px',
              fontWeight: 'var(--font-weight-regular)',
              color: 'var(--neutral-6)',
              lineHeight: 'normal',
            }}
          >
            {data.company.address.map((line, i) => (
              <p key={i} style={{ margin: 0 }}>{line}</p>
            ))}
          </div>
          <p style={{ fontSize: '9px', margin: 0, lineHeight: 'normal', color: 'var(--neutral-6)' }}>
            <span style={{ fontWeight: 'var(--font-weight-bold)', color: 'var(--foreground)' }}>
              CIN{' '}
            </span>
            <span>{data.company.cin}</span>
          </p>
        </div>

        {/* Right: Contact + small logo */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end', width: '120px' }}>
          <p
            style={{
              fontSize: '10px',
              fontWeight: 'var(--font-weight-regular)',
              color: 'var(--neutral-6)',
              margin: 0,
              textAlign: 'right',
              lineHeight: 'normal',
            }}
          >
            {data.company.email}
          </p>
          <p
            style={{
              fontSize: '10px',
              fontWeight: 'var(--font-weight-regular)',
              color: 'var(--neutral-6)',
              margin: 0,
              textAlign: 'right',
              lineHeight: 'normal',
            }}
          >
            {data.company.phone}
          </p>
          <div style={{ padding: '2px 0' }}>
            <LogoSmall />
          </div>
        </div>
      </footer>
    </div>
  );
}
