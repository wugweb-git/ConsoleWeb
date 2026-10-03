import React from 'react';
import { AlertCircle, Mail, Send, Phone } from 'lucide-react';
import wugwebMark from 'figma:asset/c89b9883696b2665a7b45df31e52fdcf283cb1d3.png';
import { authHero, authModules, authHighlights, authContacts, authFooterLinks } from './content';

// ConsoleWeb sign-in frame, following Stayweb's sign-in screen:
// logo and form on the left (~40%), product panel on the right (~60%, large screens only).
export function AuthCard({ title, subtitle, children }: { title: string; subtitle?: React.ReactNode; children?: React.ReactNode }) {
  const hero = authHero;
  const modules = authModules;
  const highlights = authHighlights;
  const contacts = authContacts;
  const footerLinks = authFooterLinks;

  return (
    <div className="min-h-screen lg:h-screen bg-background flex flex-col lg:flex-row lg:overflow-hidden">
      {/* ─── LEFT: logo and form ─── */}
      <div className="lg:w-[40%] flex-shrink-0 flex flex-col overflow-y-auto px-6 sm:px-[56px] pt-12 lg:pt-[100px] pb-[24px]">
        <div className="w-full max-w-[400px] mx-auto flex flex-col h-full">
          <div className="flex items-center gap-3 animate-fade-in">
            <div className="w-[67px] h-[67px] rounded-[var(--radius-lg)] overflow-hidden bg-muted/30 border border-border flex items-center justify-center flex-shrink-0 transition-shadow duration-300 hover:shadow-md">
              <img src={wugwebMark} alt="Wugweb" className="w-full h-full object-cover" />
            </div>
            <span className="text-foreground text-[length:var(--text-xl)] font-[var(--font-weight-bold)] leading-none">Wugweb <span className="text-muted-foreground font-[var(--font-weight-medium)]">Console</span></span>
          </div>

          <div className="flex-1 flex flex-col justify-center py-10">
            <div className="mb-6 animate-slide-up" style={{ animationDelay: '0.05s', animationFillMode: 'both' }}>
              <h2 className="text-foreground mb-1">{title}</h2>
              {subtitle && (
                <p className="text-[length:var(--text-sm)] font-[var(--font-weight-regular)] text-muted-foreground">{subtitle}</p>
              )}
            </div>
            {children}
          </div>

          <div className="pt-6">
            <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-[length:var(--text-2xs)] font-[var(--font-weight-regular)] tracking-wider opacity-70">
              {footerLinks.map((link, i) => (
                <React.Fragment key={link.label}>
                  {i > 0 && <span className="text-border">•</span>}
                  <a
                    href={link.href}
                    target={link.href.startsWith('http') ? '_blank' : undefined}
                    rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className={`text-muted-foreground hover:text-primary transition-colors ${link.href.startsWith('mailto') ? 'underline underline-offset-2' : ''}`}
                  >
                    {link.label}
                  </a>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── RIGHT: product panel ─── */}
      <div className="hidden lg:flex lg:flex-1 bg-primary text-primary-foreground flex-col relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '24px 24px' }}
        />
        <div className="relative z-10 flex flex-col h-full px-[56px] pt-[100px] pb-[40px]">
          <div className="mb-auto animate-fade-in">
            <h1 className="text-primary-foreground leading-tight mb-3">
              {hero.titleLines.map((line, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <br />}
                  {line}
                </React.Fragment>
              ))}
            </h1>
            <p className="text-[length:var(--text-sm)] font-[var(--font-weight-regular)] text-primary-foreground/70 max-w-md leading-relaxed">
              {hero.description}
            </p>
          </div>

          <div className="mb-auto">
            <p className="text-[length:var(--text-sm)] font-[var(--font-weight-regular)] tracking-[0.15em] text-primary-foreground/40 mb-3">Key Modules</p>
            <div className="grid grid-cols-2 gap-2.5">
              {modules.map((mod, i) => (
                <div
                  key={mod.name}
                  className="flex items-center gap-2.5 p-3 rounded-[var(--radius-md)] bg-primary-foreground/[0.06] border border-primary-foreground/[0.08] hover:bg-primary-foreground/[0.12] hover:border-primary-foreground/[0.15] transition-all duration-200 cursor-default animate-stagger-in"
                  style={{ animationDelay: `${0.1 + i * 0.05}s` }}
                >
                  <div className="w-7 h-7 rounded-[var(--radius-sm)] bg-primary-foreground/10 flex items-center justify-center flex-shrink-0">
                    <mod.icon className="w-3.5 h-3.5 text-primary-foreground/80" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[length:var(--text-sm)] font-[var(--font-weight-medium)] text-primary-foreground leading-snug">{mod.name}</p>
                    <p className="text-[length:var(--text-xs)] font-[var(--font-weight-regular)] text-primary-foreground/50 leading-snug">{mod.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-5 mb-5">
            {highlights.map((h) => (
              <div key={h.label} className="flex items-center gap-1.5">
                <h.icon className="w-3.5 h-3.5 text-primary-foreground/50" />
                <span className="text-[length:var(--text-xs)] font-[var(--font-weight-medium)] text-primary-foreground/60">{h.label}</span>
              </div>
            ))}
          </div>

          <div className="rounded-[var(--radius-lg)] bg-primary-foreground/[0.06] border border-primary-foreground/[0.08] p-5">
            <div className="grid grid-cols-2 gap-6">
              {[contacts.sales, contacts.support].map((c) => (
                <div key={c.title}>
                  <p className="text-[length:var(--text-2xs)] font-[var(--font-weight-medium)] tracking-[0.15em] text-primary-foreground/40 mb-2">{c.title}</p>
                  <div className="space-y-1.5">
                    <a href={`mailto:${c.email}`} className="flex items-center gap-1.5 text-[length:var(--text-xs)] font-[var(--font-weight-medium)] text-primary-foreground/70 hover:text-primary-foreground transition-colors duration-200">
                      <Send className="w-3 h-3 flex-shrink-0 opacity-50" />
                      {c.email}
                    </a>
                    <a href={`tel:${c.tel}`} className="flex items-center gap-1.5 text-[length:var(--text-xs)] font-[var(--font-weight-medium)] text-primary-foreground/70 hover:text-primary-foreground transition-colors duration-200">
                      <Phone className="w-3 h-3 flex-shrink-0 opacity-50" />
                      {c.phone}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AuthError({ message }: { message: string }) {
  return (
    <div role="alert" className="mb-4 p-3 bg-error-bg border border-error-border rounded-[var(--radius-lg)] flex items-start gap-2.5 animate-slide-down">
      <AlertCircle className="w-4 h-4 text-error flex-shrink-0 mt-0.5" />
      <p className="text-[length:var(--text-sm)] font-[var(--font-weight-medium)] text-error-foreground">{message}</p>
    </div>
  );
}

export function AuthInfo({ message }: { message: React.ReactNode }) {
  return (
    <div className="mb-4 p-3 bg-success-bg border border-success-border rounded-[var(--radius-lg)] flex items-start gap-2.5 animate-slide-down">
      <Mail className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
      <p className="text-[length:var(--text-sm)] font-[var(--font-weight-medium)] text-success-foreground">{message}</p>
    </div>
  );
}

export const authLabelClass = 'block text-[length:var(--text-sm)] font-[var(--font-weight-medium)] text-card-foreground mb-1.5';
export const authIconClass = 'absolute left-3.5 top-1/2 transform -translate-y-1/2 w-[18px] h-[18px] text-muted-foreground';
export const authInputClass =
  'w-full pl-11 pr-4 py-2.5 border border-border rounded-[var(--radius-lg)] bg-input-background text-[length:var(--text-sm)] font-[var(--font-weight-regular)] text-foreground placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30 outline-none transition-all';
export const authPrimaryButtonClass =
  'w-full py-2.5 bg-primary text-primary-foreground rounded-[var(--radius-lg)] hover:bg-primary/90 transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 text-[length:var(--text-sm)] font-[var(--font-weight-semibold)] disabled:opacity-50 disabled:cursor-not-allowed';
export const authSecondaryButtonClass =
  'w-full py-2.5 border border-border rounded-[var(--radius-lg)] text-[length:var(--text-sm)] font-[var(--font-weight-medium)] text-card-foreground hover:bg-muted hover:border-muted-foreground/30 transition-all duration-200 flex items-center justify-center gap-2';
export const authLinkClass = 'text-[length:var(--text-sm)] font-[var(--font-weight-medium)] text-primary hover:text-primary/80 transition-colors';

export function AuthDivider() {
  return (
    <div className="my-5 flex items-center gap-4">
      <div className="flex-1 h-px bg-border" />
      <span className="text-[length:var(--text-xs)] font-[var(--font-weight-medium)] text-muted-foreground tracking-wider">or</span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

export function AuthSpinner() {
  return <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />;
}
