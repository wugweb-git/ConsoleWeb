/**
 * Notification Triggers for StayWeb
 *
 * Fire-and-forget notification dispatchers called after booking events.
 * SMS, WhatsApp, and inventory sync are all non-blocking.
 */

import { apiClient } from '../src/api/client';

// ── SMS Templates ──────────────────────────────────────────────────────────

function bookingConfirmationSMS(data: { guestName: string; checkIn: string; checkOut: string; roomInfo?: string; propertyName?: string }) {
  return `Dear ${data.guestName}, your booking at ${data.propertyName || 'our property'} is confirmed. Check-in: ${data.checkIn}, Check-out: ${data.checkOut}${data.roomInfo ? `. Room: ${data.roomInfo}` : ''}. We look forward to hosting you!`;
}

function checkInReminderSMS(data: { guestName: string; checkIn: string; propertyName?: string }) {
  return `Hi ${data.guestName}, reminder: your check-in at ${data.propertyName || 'our property'} is tomorrow (${data.checkIn}). See you soon!`;
}

function paymentReceiptSMS(data: { guestName: string; amount: number; invoiceId?: string }) {
  return `Dear ${data.guestName}, payment of Rs${data.amount} received${data.invoiceId ? ` (Ref: ${data.invoiceId})` : ''}. Thank you!`;
}

function checkoutThanksSMS(data: { guestName: string; propertyName?: string }) {
  return `Thank you for staying with us, ${data.guestName}! We hope you enjoyed your time at ${data.propertyName || 'our property'}. Please leave us a review.`;
}

// ── WhatsApp Templates ─────────────────────────────────────────────────────

function bookingConfirmationWhatsApp(data: { guestName: string; checkIn: string; checkOut: string; roomInfo?: string; propertyName?: string; qrCheckInUrl?: string }) {
  let msg = `Hi ${data.guestName}! Your booking at *${data.propertyName || 'our property'}* is confirmed.\n\nCheck-in: ${data.checkIn}\nCheck-out: ${data.checkOut}`;
  if (data.roomInfo) msg += `\nRoom: ${data.roomInfo}`;
  if (data.qrCheckInUrl) msg += `\n\nSelf check-in: ${data.qrCheckInUrl}`;
  return msg;
}

// ── Email Templates (HTML) ─────────────────────────────────────────────────
// Hardcoded colors allowed in email HTML per guidelines (email/print exemption)

function bookingConfirmationEmailHTML(data: BookingEmailData) {
  // Build social links for footer
  const socialLinks: string[] = [];
  if (data.socialFacebook) socialLinks.push(`<a href="${data.socialFacebook}" style="color:#7d7d7d;text-decoration:none;font-weight:600;">Facebook</a>`);
  if (data.socialInstagram) socialLinks.push(`<a href="${data.socialInstagram}" style="color:#7d7d7d;text-decoration:none;font-weight:600;">Instagram</a>`);
  if (data.socialX) socialLinks.push(`<a href="${data.socialX}" style="color:#7d7d7d;text-decoration:none;font-weight:600;">X</a>`);
  if (data.tripAdvisorUrl) socialLinks.push(`<a href="${data.tripAdvisorUrl}" style="color:#7d7d7d;text-decoration:none;font-weight:600;">TripAdvisor</a>`);
  if (data.googleBusinessUrl) socialLinks.push(`<a href="${data.googleBusinessUrl}" style="color:#7d7d7d;text-decoration:none;font-weight:600;">Google</a>`);
  const socialHtml = socialLinks.length > 0 ? `<p style="margin:12px 0 8px;font-size:13px;">${socialLinks.join(' &middot; ')}</p>` : '';

  const mapsUrl = data.googleMapsUrl || data.googleBusinessUrl || '';
  const mapsSection = mapsUrl ? `<div style="text-align:center;margin:24px 0 0;"><a href="${mapsUrl}" style="display:inline-block;background:#2b2b2b;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:600;">📍 Open in Google Maps</a></div>` : '';

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  body { font-family: 'Inter Tight', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 40px 20px; -webkit-font-smoothing: antialiased; }
  .wrapper { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.08); border: 1px solid #dfdfdf; }
  .header { background-color: #2b2b2b; padding: 48px 32px; text-align: center; }
  .header h1 { color: #ffffff; font-size: 28px; font-weight: 700; margin: 0 0 8px 0; letter-spacing: -0.5px; }
  .header p { color: #ffbe1a; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin: 0; }
  .content { padding: 40px 32px; color: #292621; }
  h2 { font-size: 22px; font-weight: 700; margin: 0 0 16px 0; color: #2b2b2b; letter-spacing: -0.3px; }
  p { font-size: 16px; line-height: 1.6; margin: 0 0 20px 0; color: #444444; }
  .card { background-color: #f9f9f9; border: 1px solid #dfdfdf; border-radius: 12px; padding: 24px; margin: 32px 0; }
  table { width: 100%; border-collapse: collapse; }
  td { padding: 14px 0; border-bottom: 1px solid #e5e5e5; font-size: 15px; }
  tr:last-child td { border-bottom: none; padding-bottom: 0; }
  tr:first-child td { padding-top: 0; }
  .label { color: #7d7d7d; font-weight: 500; }
  .value { color: #292621; font-weight: 700; text-align: right; }
  .btn-container { text-align: center; margin: 40px 0 20px; }
  .btn { display: inline-block; background-color: #ffbe1a; color: #000000; font-size: 16px; font-weight: 700; text-decoration: none; padding: 16px 36px; border-radius: 8px; }
  .footer { text-align: center; padding: 32px; background-color: #f9f9f9; border-top: 1px solid #dfdfdf; color: #7d7d7d; }
  .footer p { font-size: 13px; margin: 0 0 8px 0; color: #7d7d7d; }
</style></head><body>
<div class="wrapper">
  <div class="header"><h1>Booking Confirmed!</h1><p>${data.propertyName || 'StayWeb PMS'}</p></div>
  <div class="content">
    <h2>Hello ${data.guestName},</h2>
    <p>Your booking is confirmed. We look forward to hosting you and ensuring you have a fantastic stay!</p>
    <div class="card">
      <table>
        <tr><td class="label">Booking ID</td><td class="value">${data.bookingId}</td></tr>
        <tr><td class="label">Check-in</td><td class="value">${data.checkIn}</td></tr>
        <tr><td class="label">Check-out</td><td class="value">${data.checkOut}</td></tr>
        ${data.roomType ? `<tr><td class="label">Room / Bed</td><td class="value">${data.roomType}</td></tr>` : ''}
        ${data.guestCount ? `<tr><td class="label">Guests</td><td class="value">${data.guestCount}</td></tr>` : ''}
        ${data.totalAmount ? `<tr><td class="label">Total Amount</td><td class="value">₹${data.totalAmount.toLocaleString('en-IN')}</td></tr>` : ''}
      </table>
    </div>
    <div class="card" style="margin-top:0;">
      <p style="font-size:14px;font-weight:700;color:#2b2b2b;margin:0 0 8px;">${data.propertyName || ''}</p>
      ${data.propertyAddress ? `<p style="font-size:14px;color:#444;margin:0 0 4px;">${data.propertyAddress}</p>` : ''}
      ${data.propertyPhone ? `<p style="font-size:14px;color:#444;margin:0;">📞 ${data.propertyPhone}</p>` : ''}
      ${mapsSection}
    </div>
  </div>
  <div class="footer">
    <p style="font-size:15px;color:#2b2b2b;font-weight:600;margin-bottom:12px;">We look forward to welcoming you!</p>
    ${socialHtml}
    ${data.propertyEmail ? `<p>${data.propertyEmail}</p>` : ''}
    <p style="color:#aaa;font-size:12px;margin-top:12px;">Powered by StayWeb PMS</p>
  </div>
</div></body></html>`;
}

function paymentReceiptEmailHTML(data: {
  guestName: string; bookingId: string; receiptNumber?: string;
  paidAmount: number; paymentDate: string; paymentMethod?: string;
  propertyName?: string; propertyEmail?: string;
}) {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  body { font-family: 'Inter Tight', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 40px 20px; -webkit-font-smoothing: antialiased; }
  .wrapper { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.08); border: 1px solid #dfdfdf; }
  .header { background-color: #2b2b2b; padding: 48px 32px; text-align: center; }
  .header h1 { color: #ffffff; font-size: 28px; font-weight: 700; margin: 0 0 8px 0; letter-spacing: -0.5px; }
  .header p { color: #ffbe1a; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin: 0; }
  .content { padding: 40px 32px; color: #292621; }
  h2 { font-size: 22px; font-weight: 700; margin: 0 0 16px 0; color: #2b2b2b; letter-spacing: -0.3px; }
  p { font-size: 16px; line-height: 1.6; margin: 0 0 20px 0; color: #444444; }
  .card { background-color: #f9f9f9; border: 1px solid #dfdfdf; border-radius: 12px; padding: 24px; margin: 32px 0; }
  table { width: 100%; border-collapse: collapse; }
  td { padding: 14px 0; border-bottom: 1px solid #e5e5e5; font-size: 15px; }
  tr:last-child td { border-bottom: none; padding-bottom: 0; }
  tr:first-child td { padding-top: 0; }
  .label { color: #7d7d7d; font-weight: 500; }
  .value { color: #292621; font-weight: 700; text-align: right; }
  .footer { text-align: center; padding: 32px; background-color: #f9f9f9; border-top: 1px solid #dfdfdf; color: #7d7d7d; }
  .footer p { font-size: 13px; margin: 0 0 8px 0; color: #7d7d7d; }
</style></head><body>
<div class="wrapper">
  <div class="header"><h1>Payment Received</h1><p>${data.propertyName || 'StayWeb PMS'}</p></div>
  <div class="content">
    <h2>Dear ${data.guestName},</h2>
    <p>Thank you! We've successfully received your recent payment for your stay.</p>
    <div class="card">
      <table>
        ${data.receiptNumber ? `<tr><td class="label">Receipt #</td><td class="value">${data.receiptNumber}</td></tr>` : ''}
        <tr><td class="label">Booking ID</td><td class="value">${data.bookingId}</td></tr>
        <tr><td class="label">Amount Paid</td><td class="value">₹${data.paidAmount.toLocaleString('en-IN')}</td></tr>
        <tr><td class="label">Date</td><td class="value">${data.paymentDate}</td></tr>
        ${data.paymentMethod ? `<tr><td class="label">Method</td><td class="value">${data.paymentMethod}</td></tr>` : ''}
      </table>
    </div>
  </div>
  <div class="footer">
    <p><strong>${data.propertyName || ''}</strong>${data.propertyEmail ? '<br>' + data.propertyEmail : ''}</p>
  </div>
</div></body></html>`;
}

// ── Trigger Functions ──────────────────────────────────────────────────────

export interface BookingNotificationData {
  guestName: string;
  guestPhone?: string;
  guestEmail?: string;
  checkIn: string;
  checkOut: string;
  roomInfo?: string;
  propertyName?: string;
  qrCheckInUrl?: string;
}

/**
 * Send booking confirmation SMS (fire-and-forget).
 * Called after a booking is successfully created.
 */
export function triggerBookingConfirmationSMS(data: BookingNotificationData) {
  if (!data.guestPhone) return;
  const content = bookingConfirmationSMS(data);
  apiClient.fetch('/brevo/sms/send', {
    method: 'POST',
    body: JSON.stringify({ recipient: data.guestPhone, content, tag: 'booking-confirmation' }),
  }).catch(err => console.warn('[SMS Trigger] Booking confirmation failed (non-blocking):', err));
}

/**
 * Send booking confirmation WhatsApp (fire-and-forget).
 */
export function triggerBookingConfirmationWhatsApp(data: BookingNotificationData) {
  if (!data.guestPhone) return;
  const text = bookingConfirmationWhatsApp(data);
  apiClient.fetch('/communication/whatsapp/send', {
    method: 'POST',
    body: JSON.stringify({ recipientNumber: data.guestPhone, text, tag: 'booking-confirmation' }),
  }).catch(err => console.warn('[WhatsApp Trigger] Booking confirmation failed (non-blocking):', err));
}

/**
 * Send check-in reminder SMS (fire-and-forget).
 */
export function triggerCheckInReminderSMS(data: { guestName: string; guestPhone?: string; checkIn: string; propertyName?: string }) {
  if (!data.guestPhone) return;
  const content = checkInReminderSMS(data);
  apiClient.fetch('/brevo/sms/send', {
    method: 'POST',
    body: JSON.stringify({ recipient: data.guestPhone, content, tag: 'checkin-reminder' }),
  }).catch(err => console.warn('[SMS Trigger] Check-in reminder failed:', err));
}

/**
 * Send payment receipt SMS (fire-and-forget).
 */
export function triggerPaymentReceiptSMS(data: { guestName: string; guestPhone?: string; amount: number; invoiceId?: string }) {
  if (!data.guestPhone) return;
  const content = paymentReceiptSMS(data);
  apiClient.fetch('/brevo/sms/send', {
    method: 'POST',
    body: JSON.stringify({ recipient: data.guestPhone, content, tag: 'payment-receipt' }),
  }).catch(err => console.warn('[SMS Trigger] Payment receipt failed:', err));
}

/**
 * Send checkout thank you SMS (fire-and-forget).
 */
export function triggerCheckoutThanksSMS(data: { guestName: string; guestPhone?: string; propertyName?: string }) {
  if (!data.guestPhone) return;
  const content = checkoutThanksSMS(data);
  apiClient.fetch('/brevo/sms/send', {
    method: 'POST',
    body: JSON.stringify({ recipient: data.guestPhone, content, tag: 'checkout-thanks' }),
  }).catch(err => console.warn('[SMS Trigger] Checkout thanks failed:', err));
}

/**
 * Trigger cross-channel inventory sync after a booking event.
 * Call after booking create/cancel to push availability to OTAs.
 */
export function triggerInventorySync(data: { roomTypeId?: string; action: 'booked' | 'cancelled'; dates?: string[] }) {
  if (!data.roomTypeId) return;
  apiClient.fetch('/inventory/sync-channels', {
    method: 'POST',
    body: JSON.stringify(data),
  }).catch(err => console.warn('[Inventory Sync] Channel sync failed (non-blocking):', err));
}

/**
 * Trigger pricing distribution to all connected OTA channels.
 * Call after pricing rules are saved.
 */
export function triggerPricingDistribution() {
  apiClient.fetch('/pricing/distribute', {
    method: 'POST',
    body: JSON.stringify({}),
  }).catch(err => console.warn('[Pricing] Distribution failed (non-blocking):', err));
}

// ── Email trigger functions ────────────────────────────────────────────────

export interface BookingEmailData {
  guestName: string;
  guestEmail?: string;
  bookingId: string;
  checkIn: string;
  checkOut: string;
  roomType?: string;
  guestCount?: number;
  totalAmount?: number;
  propertyName?: string;
  propertyAddress?: string;
  propertyPhone?: string;
  propertyEmail?: string;
  // Social & review links (included in email footer)
  socialFacebook?: string;
  socialInstagram?: string;
  socialX?: string;
  tripAdvisorUrl?: string;
  googleBusinessUrl?: string;
  googleMapsUrl?: string;
  replyToEmail?: string;
}

/**
 * Send booking confirmation email via Brevo (fire-and-forget).
 * Called after a booking is successfully created.
 */
export function triggerBookingConfirmationEmail(data: BookingEmailData) {
  if (!data.guestEmail) return;
  const subject = `Your Booking at ${data.propertyName || 'our property'} is Confirmed!`;
  const htmlContent = bookingConfirmationEmailHTML(data);
  apiClient.fetch('/brevo/send', {
    method: 'POST',
    body: JSON.stringify({
      toEmail: data.guestEmail,
      toName: data.guestName,
      templateId: 'booking-confirm',
      subject,
      htmlContent,
    }),
  }).catch(err => console.warn('[Email Trigger] Booking confirmation email failed (non-blocking):', err));
}

export interface PaymentEmailData {
  guestName: string;
  guestEmail?: string;
  bookingId: string;
  receiptNumber?: string;
  paidAmount: number;
  paymentDate: string;
  paymentMethod?: string;
  propertyName?: string;
  propertyEmail?: string;
}

/**
 * Send payment receipt email via Brevo (fire-and-forget).
 * Called after a payment is successfully recorded.
 */
export function triggerPaymentReceiptEmail(data: PaymentEmailData) {
  if (!data.guestEmail) return;
  const subject = `Payment Received — ${data.receiptNumber ? 'Receipt #' + data.receiptNumber : 'Booking #' + data.bookingId}`;
  const htmlContent = paymentReceiptEmailHTML(data);
  apiClient.fetch('/brevo/send', {
    method: 'POST',
    body: JSON.stringify({
      toEmail: data.guestEmail,
      toName: data.guestName,
      templateId: 'payment-receipt',
      subject,
      htmlContent,
    }),
  }).catch(err => console.warn('[Email Trigger] Payment receipt email failed (non-blocking):', err));
}