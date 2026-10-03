/**
 * EmailNotificationSettings
 * Brevo transactional email — config, pre-built templates, test send, delivery log.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  Mail, Send, Eye, Save, AlertCircle, FileText,
  CheckCircle2, Loader2, RefreshCw, Clock, Zap,
  Trash2, ExternalLink, ShieldCheck, Info
} from 'lucide-react';
import { AlertBanner } from './ui/AlertBanner';
import { notifySuccess, notifyError } from '../utils/notify';
import { supabase } from '../utils/supabase/client';
import { projectId } from '../utils/supabase/info';

// ─── Types ────────────────────────────────────────────────────────────────────

interface BrevoConfig {
  senderName: string;
  senderEmail: string;
  replyTo: string;
  autoSendBookingConfirmation: boolean;
  autoSendPaymentReceipt: boolean;
  autoSendOTAResponse: boolean;
  autoSendCheckInReminder: boolean;
  reminderHoursBefore: number;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  type: 'booking' | 'payment' | 'ota';
  htmlContent: string;
}

interface LogEntry {
  id: string;
  toEmail: string;
  toName?: string;
  templateId: string;
  templateName: string;
  subject: string;
  type: 'test' | 'auto';
  status: 'delivered' | 'failed';
  messageId?: string;
  sentAt: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_CONFIG: BrevoConfig = {
  senderName: 'StayWeb PMS',
  senderEmail: 'stayweb@wugweb.studio',
  replyTo: '',
  autoSendBookingConfirmation: true,
  autoSendPaymentReceipt: true,
  autoSendOTAResponse: false,
  autoSendCheckInReminder: true,
  reminderHoursBefore: 24,
};

const BASE_HTML = (body: string) => `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  body { font-family: 'Inter Tight', sans-serif; background-color: var(--background, #ffffff); margin: 0; padding: 40px 20px; -webkit-font-smoothing: antialiased; }
  .wrapper { max-width: 600px; margin: 0 auto; background-color: var(--card, #ffffff); border-radius: var(--radius-lg, 16px); overflow: hidden; box-shadow: var(--elevation-md, 0 8px 32px rgba(0,0,0,0.08)); border: 1px solid var(--border, #dfdfdf); }
  .header { background-color: var(--primary, #2b2b2b); padding: 48px 32px; text-align: center; }
  .header h1 { color: var(--primary-foreground, #ffffff); font-size: var(--text-2xl, 28px); font-weight: var(--font-weight-bold, 700); margin: 0 0 8px 0; letter-spacing: -0.5px; }
  .header p { color: var(--accent, #ffbe1a); font-size: var(--text-sm, 14px); font-weight: var(--font-weight-semibold, 600); text-transform: uppercase; letter-spacing: 1px; margin: 0; }
  .content { padding: 40px 32px; color: var(--foreground, #292621); }
  h2 { font-size: var(--text-xl, 22px); font-weight: var(--font-weight-bold, 700); margin: 0 0 16px 0; color: var(--foreground, #292621); letter-spacing: -0.3px; }
  p { font-size: var(--text-base, 16px); line-height: 1.6; margin: 0 0 20px 0; color: var(--muted-foreground, #7d7d7d); }
  .card { background-color: var(--muted, #f4f4f4); border: 1px solid var(--border, #dfdfdf); border-radius: var(--radius-md, 12px); padding: 24px; margin: 32px 0; }
  table { width: 100%; border-collapse: collapse; }
  td { padding: 14px 0; border-bottom: 1px solid var(--border, #dfdfdf); font-size: var(--text-sm, 15px); }
  tr:last-child td { border-bottom: none; padding-bottom: 0; }
  tr:first-child td { padding-top: 0; }
  .label { color: var(--muted-foreground, #7d7d7d); font-weight: var(--font-weight-medium, 500); }
  .value { color: var(--foreground, #292621); font-weight: var(--font-weight-bold, 700); text-align: right; }
  .btn-container { text-align: center; margin: 40px 0 20px; }
  .btn { display: inline-block; background-color: var(--accent, #ffbe1a); color: var(--accent-foreground, #000000); font-size: var(--text-base, 16px); font-weight: var(--font-weight-bold, 700); text-decoration: none; padding: 16px 36px; border-radius: var(--radius-md, 8px); }
  .footer { text-align: center; padding: 32px; background-color: var(--muted, #f4f4f4); border-top: 1px solid var(--border, #dfdfdf); color: var(--muted-foreground, #7d7d7d); }
  .footer p { font-size: var(--text-xs, 13px); margin: 0 0 8px 0; color: var(--muted-foreground, #7d7d7d); }
</style></head><body>
<div class="wrapper">${body}</div></body></html>`;

const DEFAULT_TEMPLATES: EmailTemplate[] = [
  {
    id: 'booking-confirm',
    name: 'Booking Confirmation',
    subject: 'Your Booking at {{propertyName}} is Confirmed!',
    type: 'booking',
    htmlContent: BASE_HTML(`
  <div class="header"><h1>Booking Confirmed!</h1><p>{{propertyName}}</p></div>
  <div class="content">
    <h2>Hello {{guestName}},</h2>
    <p>Your booking is confirmed. We look forward to hosting you and ensuring you have a fantastic stay!</p>
    <div class="card">
      <table>
        <tr><td class="label">Booking ID</td><td class="value">{{bookingId}}</td></tr>
        <tr><td class="label">Check-in</td><td class="value">{{checkInDate}}</td></tr>
        <tr><td class="label">Check-out</td><td class="value">{{checkOutDate}}</td></tr>
        <tr><td class="label">Room / Bed</td><td class="value">{{roomType}}</td></tr>
        <tr><td class="label">Guests</td><td class="value">{{guestCount}}</td></tr>
        <tr><td class="label">Total Amount</td><td class="value">₹{{totalAmount}}</td></tr>
      </table>
    </div>
    <div class="btn-container">
      <a href="{{bookingLink}}" class="btn">View Booking Details</a>
    </div>
  </div>
  <div class="footer"><p><strong>{{propertyName}}</strong><br>{{propertyAddress}}</p><p>{{propertyPhone}} | {{propertyEmail}}</p></div>`),
  },
  {
    id: 'checkin-reminder',
    name: 'Check-in Reminder',
    subject: 'Reminder: Your Stay at {{propertyName}} Starts Tomorrow',
    type: 'booking',
    htmlContent: BASE_HTML(`
  <div class="header"><h1>Check-in Tomorrow!</h1><p>{{propertyName}}</p></div>
  <div class="content">
    <h2>Hi {{guestName}},</h2>
    <p>We're excited to welcome you tomorrow! Please remember to bring a valid government-issued photo ID for a smooth check-in process.</p>
    <div class="card">
      <table>
        <tr><td class="label">Check-in Date</td><td class="value">{{checkInDate}}</td></tr>
        <tr><td class="label">Check-in Time</td><td class="value">{{checkInTime}}</td></tr>
        <tr><td class="label">Booking ID</td><td class="value">{{bookingId}}</td></tr>
        <tr><td class="label">Room / Bed</td><td class="value">{{roomType}}</td></tr>
      </table>
    </div>
    <div class="btn-container">
      <a href="{{checkInLink}}" class="btn">Complete Web Check-in</a>
    </div>
  </div>
  <div class="footer"><p><strong>{{propertyName}}</strong><br>{{propertyAddress}}</p></div>`),
  },
  {
    id: 'payment-receipt',
    name: 'Payment Receipt',
    subject: 'Payment Received — Receipt #{{receiptNumber}}',
    type: 'payment',
    htmlContent: BASE_HTML(`
  <div class="header"><h1>Payment Received</h1><p>{{propertyName}}</p></div>
  <div class="content">
    <h2>Dear {{guestName}},</h2>
    <p>Thank you! We've successfully received your recent payment for your stay.</p>
    <div class="card">
      <table>
        <tr><td class="label">Receipt #</td><td class="value">{{receiptNumber}}</td></tr>
        <tr><td class="label">Booking ID</td><td class="value">{{bookingId}}</td></tr>
        <tr><td class="label">Amount Paid</td><td class="value">₹{{paidAmount}}</td></tr>
        <tr><td class="label">Date</td><td class="value">{{paymentDate}}</td></tr>
        <tr><td class="label">Method</td><td class="value">{{paymentMethod}}</td></tr>
      </table>
    </div>
  </div>
  <div class="footer"><p><strong>{{propertyName}}</strong><br>{{propertyEmail}}</p></div>`),
  },
  {
    id: 'payment-pending',
    name: 'Payment Pending',
    subject: 'Pending Payment for Booking #{{bookingId}}',
    type: 'payment',
    htmlContent: BASE_HTML(`
  <div class="header"><h1>Payment Pending</h1><p>{{propertyName}}</p></div>
  <div class="content">
    <h2>Dear {{guestName}},</h2>
    <p>This is a quick reminder that there is a pending balance on your booking. Please complete the payment to secure your reservation.</p>
    <div class="card">
      <table>
        <tr><td class="label">Booking ID</td><td class="value">{{bookingId}}</td></tr>
        <tr><td class="label">Amount Due</td><td class="value">₹{{amountDue}}</td></tr>
        <tr><td class="label">Due Date</td><td class="value">{{dueDate}}</td></tr>
      </table>
    </div>
    <div class="btn-container">
      <a href="{{paymentLink}}" class="btn">Pay ₹{{amountDue}} Now</a>
    </div>
  </div>
  <div class="footer"><p><strong>{{propertyName}}</strong><br>{{propertyEmail}}</p></div>`),
  },
  {
    id: 'ota-booking-confirmed',
    name: 'OTA Booking Confirmed',
    subject: 'New Booking from {{channelName}} — {{guestName}}',
    type: 'ota',
    htmlContent: BASE_HTML(`
  <div class="header"><h1>New OTA Booking</h1><p>{{propertyName}}</p></div>
  <div class="content">
    <h2>Booking via {{channelName}}</h2>
    <p>A new booking has been confirmed through <strong>{{channelName}}</strong>. Details are below.</p>
    <div class="card">
      <table>
        <tr><td class="label">Guest Name</td><td class="value">{{guestName}}</td></tr>
        <tr><td class="label">Check-in</td><td class="value">{{checkInDate}}</td></tr>
        <tr><td class="label">Check-out</td><td class="value">{{checkOutDate}}</td></tr>
        <tr><td class="label">Room / Bed</td><td class="value">{{roomType}}</td></tr>
        <tr><td class="label">Net Amount</td><td class="value">₹{{netAmount}}</td></tr>
      </table>
    </div>
  </div>
  <div class="footer"><p>StayWeb PMS · <strong>{{propertyName}}</strong></p></div>`),
  },
  {
    id: 'staff-invite',
    name: 'Staff Invitation',
    subject: 'Welcome to {{propertyName}} — Your Staff Account',
    type: 'booking',
    htmlContent: `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  body { font-family: 'Inter Tight', sans-serif; background: var(--muted, #f4f4f4); margin: 0; padding: 20px; display: flex; justify-content: center; color: var(--foreground, #292621); }
  .email-container { max-width: 600px; width: 100%; margin: 0 auto; display: block; }
  /* Essential flex polyfills */
  .flex { display: flex; }
  .flex-col { flex-direction: column; }
  .items-center { align-items: center; }
  .items-start { align-items: flex-start; }
  .justify-between { justify-content: space-between; }
  .justify-center { justify-content: center; }
  .w-full { width: 100%; }
  .size-full { width: 100%; height: 100%; }
  .relative { position: relative; }
  .absolute { position: absolute; }
  .shrink-0 { flex-shrink: 0; }
  .max-w-\\[548px\\] { max-width: 548px; }
  .max-w-\\[534px\\] { max-width: 534px; }
  .px-\\[32px\\] { padding-left: 32px; padding-right: 32px; }
  .py-\\[18px\\] { padding-top: 18px; padding-bottom: 18px; }
  .pt-\\[21px\\] { padding-top: 21px; }
  .pb-\\[12px\\] { padding-bottom: 12px; }
  .pb-\\[24px\\] { padding-bottom: 24px; }
  .pb-\\[32px\\] { padding-bottom: 32px; }
  .px-\\[21px\\] { padding-left: 21px; padding-right: 21px; }
  .py-\\[14px\\] { padding-top: 14px; padding-bottom: 14px; }
  .py-\\[10px\\] { padding-top: 10px; padding-bottom: 10px; }
  .px-\\[53px\\] { padding-left: 53px; padding-right: 53px; }
  .gap-\\[2px\\] { gap: 2px; }
  .gap-\\[4px\\] { gap: 4px; }
  .gap-\\[8px\\] { gap: 8px; }
  .gap-\\[9px\\] { gap: 9px; }
  .gap-\\[12px\\] { gap: 12px; }
  .gap-\\[15px\\] { gap: 15px; }
  .gap-\\[16px\\] { gap: 16px; }
  .box-border { box-sizing: border-box; }
  .m-0 { margin: 0; }
  .self-start { align-self: flex-start; }
  .leading-\\[16px\\] { line-height: 16px; }
  .leading-\\[17\\.5px\\] { line-height: 17.5px; }
  .leading-\\[18px\\] { line-height: 18px; }
  .leading-\\[19\\.6px\\] { line-height: 19.6px; }
  .leading-\\[20px\\] { line-height: 20px; }
  .leading-\\[21px\\] { line-height: 21px; }
  .leading-\\[22\\.4px\\] { line-height: 22.4px; }
  .leading-\\[24px\\] { line-height: 24px; }
  .leading-\\[26px\\] { line-height: 26px; }
  .tracking-\\[0\\.5px\\] { letter-spacing: 0.5px; }
  .uppercase { text-transform: uppercase; }
  .no-underline { text-decoration: none; }
  .underline { text-decoration: underline; }
  .overflow-clip { overflow: hidden; }
  .h-\\[40px\\] { height: 40px; }
  .h-\\[43px\\] { height: 43px; }
  .h-\\[100px\\] { height: 100px; }
  .h-0 { height: 0; }
  .h-px { height: 1px; }
  .size-\\[20px\\] { width: 20px; height: 20px; }
  .size-\\[28px\\] { width: 28px; height: 28px; }
  .size-\\[56px\\] { width: 56px; height: 56px; }
  .w-\\[100px\\] { width: 100px; }
  .h-\\[24px\\] { height: 24px; }
  .inset-0 { top: 0; right: 0; bottom: 0; left: 0; }
  .contents { display: contents; }
</style>
</head>
<body>
<div class="email-container">
<article class="flex flex-col items-start overflow-clip w-full" itemscope="" itemtype="https://schema.org/EmailMessage"><div class="flex flex-col w-full"><div class="flex flex-col w-full" style="background-color: var(--card, #ffffff);"><header class="h-[100px] w-full" itemscope="" itemtype="https://schema.org/Organization" style="border-radius: var(--radius-lg, 16px) var(--radius-lg, 16px) 0 0;"><div class="flex items-center justify-between px-[32px] py-[18px] size-full"><div class="flex gap-[15px] items-center"><div class="flex items-center justify-center px-[14px] shrink-0 size-[56px]" style="background-color: var(--muted, #f4f4f4); border-radius: var(--radius-md, 12px);"><div class="relative shrink-0 size-[28px] overflow-hidden rounded-md"><img src="{{property_logo}}" alt="Logo" class="block size-full" style="object-fit: contain; width: 100%; height: 100%;" /></div></div><div class="flex flex-col gap-[4px]"><p class="leading-[24px]" itemprop="name" style="font-size: var(--text-lg, 18px); font-weight: var(--font-weight-semibold, 600); color: var(--card-foreground, #292621);">{{propertyName}}</p><p class="leading-[21px]" style="font-size: var(--text-sm, 14px); font-weight: var(--font-weight-regular, 400); color: var(--muted-foreground, #7d7d7d);">Staff Account Invitation</p></div></div><nav class="flex gap-[12px] items-center" aria-label="Social media links"><a href="{{facebook_url}}" class="relative shrink-0 size-[20px]" aria-label="Facebook"><svg class="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20"><path d="M15 1.66667H12.5C11.3949 1.66667 10.3351 2.10565 9.55372 2.88706C8.77232 3.66846 8.33333 4.72826 8.33333 5.83333V8.33333H5.83333V11.6667H8.33333V18.3333H11.6667V11.6667H14.1667L15 8.33333H11.6667V5.83333C11.6667 5.61232 11.7545 5.40036 11.9107 5.24408C12.067 5.0878 12.279 5 12.5 5H15V1.66667Z" stroke="var(--muted-foreground)" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.66667"></path></svg></a><a href="{{twitter_url}}" class="relative shrink-0 size-[20px]" aria-label="Twitter"><svg class="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20"><path d="M18.3333 3.33333C18.3333 3.33333 17.75 5.08333 16.6667 6.16667C18 14.5 8.83333 20.5833 1.66667 15.8333C3.5 15.9167 5.33333 15.3333 6.66667 14.1667C2.5 12.9167 0.416667 8 2.5 4.16667C4.33333 6.33333 7.16667 7.58333 10 7.5C9.25 4 13.3333 2 15.8333 4.33333C16.75 4.33333 18.3333 3.33333 18.3333 3.33333Z" stroke="var(--muted-foreground)" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.66667"></path></svg></a><a href="{{instagram_url}}" class="relative shrink-0 size-[20px]" aria-label="Instagram"><svg class="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20"><g clip-path="url(#clip_social_ig)"><path d="M14.1667 1.66667H5.83333C3.53215 1.66667 1.66667 3.53215 1.66667 5.83333V14.1667C1.66667 16.4679 3.53215 18.3333 5.83333 18.3333H14.1667C16.4679 18.3333 18.3333 16.4679 18.3333 14.1667V5.83333C18.3333 3.53215 16.4679 1.66667 14.1667 1.66667Z" stroke="var(--muted-foreground)" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.66667"></path><path d="M13.3333 9.475C13.4362 10.1685 13.3177 10.8768 12.9948 11.4992C12.6719 12.1215 12.161 12.6262 11.5347 12.9414C10.9084 13.2566 10.1987 13.3663 9.50649 13.2549C8.81427 13.1436 8.1748 12.8167 7.67903 12.321C7.18326 11.8252 6.85644 11.1857 6.74506 10.4935C6.63367 9.80129 6.74339 9.09158 7.05861 8.46531C7.37382 7.83905 7.87849 7.32812 8.50082 7.0052C9.12315 6.68229 9.83146 6.56382 10.525 6.66667C11.2324 6.77157 11.8874 7.10122 12.3931 7.60692C12.8988 8.11262 13.2284 8.76756 13.3333 9.475Z" stroke="var(--muted-foreground)" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.66667"></path><path d="M14.5833 5.41667H14.5917" stroke="var(--muted-foreground)" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.66667"></path></g><defs><clipPath id="clip_social_ig"><rect fill="white" height="20" width="20"></rect></clipPath></defs></svg></a></nav></div></header><main class="flex flex-col w-full box-border" itemscope="" itemtype="https://schema.org/EmailMessage"><div class="flex flex-col gap-[12px] px-[40px] py-[24px] w-full box-border" style="background-color: var(--muted, #f4f4f4);"><section class="flex flex-col gap-[8px] w-full box-border" aria-label="Welcome message"><h2 class="leading-[26px] m-0" itemprop="name" style="font-size: var(--text-lg, 18px); font-weight: var(--font-weight-semibold, 600); color: var(--card-foreground, #292621);">Welcome to the team, {{name}}</h2><p class="leading-[20px] m-0 max-w-[548px]" itemprop="description" style="font-size: var(--text-sm, 14px); font-weight: var(--font-weight-regular, 400); color: var(--muted-foreground, #7d7d7d);">Your account has been created and you now have access to the StayWeb platform. Use the credentials below to sign in.</p></section><section class="flex flex-col gap-[12px] px-[21px] py-[16px] w-full box-border" aria-label="Account credentials" style="background-color: var(--card, #ffffff); border-radius: var(--radius-md, 12px);"><h3 class="leading-[17.5px] m-0" style="font-size: var(--text-sm, 14px); font-weight: var(--font-weight-semibold, 600); color: var(--card-foreground, #292621);">Account Credentials</h3><div class="flex flex-col gap-[12px] w-full box-border"><div class="flex flex-col gap-[2px] w-full box-border"><p class="leading-[18px] tracking-[0.5px] uppercase m-0" style="font-size: var(--text-xs, 12px); font-weight: var(--font-weight-medium, 500); color: var(--muted-foreground, #7d7d7d);">Email Address</p><p class="leading-[19.6px] m-0" style="font-size: var(--text-sm, 14px); font-weight: var(--font-weight-medium, 500); color: var(--card-foreground, #292621);">{{email}}</p></div><div class="flex flex-col gap-[2px] w-full box-border"><p class="leading-[18px] tracking-[0.5px] uppercase m-0" style="font-size: var(--text-xs, 12px); font-weight: var(--font-weight-medium, 500); color: var(--muted-foreground, #7d7d7d);">Temporary Password</p><div class="flex items-center px-[13px] py-[11px] w-full box-border" style="background-color: var(--card, #ffffff); border-radius: var(--radius-sm, 8px); border: 1px solid var(--border, #dfdfdf);"><p class="leading-[21px] tracking-[0.5px] m-0" style="font-family: Cousine, monospace; font-size: var(--text-sm, 14px); font-weight: var(--font-weight-bold, 700); color: var(--card-foreground, #292621);">{{password}}</p></div></div><div class="flex flex-col gap-[2px] w-full box-border"><p class="leading-[18px] tracking-[0.5px] uppercase m-0" style="font-size: var(--text-xs, 12px); font-weight: var(--font-weight-medium, 500); color: var(--muted-foreground, #7d7d7d);">Role</p><p class="leading-[19.6px] m-0" style="font-size: var(--text-sm, 14px); font-weight: var(--font-weight-medium, 500); color: var(--card-foreground, #292621);">{{role}}</p></div></div><a href="{{loginUrl}}" class="flex h-[40px] items-center justify-center px-[21px] py-[10px] no-underline box-border self-start" style="background-color: var(--primary, #2b2b2b); border-radius: var(--radius-md, 12px); color: var(--primary-foreground, #ffffff); font-size: var(--text-sm, 14px); font-weight: var(--font-weight-medium, 500);">Access Your Account</a></section></div><div class="flex flex-col gap-[16px] items-start px-[45px] py-[30px] w-full box-border" style="background-color: var(--card, #ffffff);"><div class="flex flex-col gap-[9px] w-full box-border"><p class="leading-[21px] m-0" style="font-size: var(--text-base, 16px); font-weight: var(--font-weight-semibold, 600); color: var(--card-foreground, #292621);">Need help getting started?</p><p class="leading-[22.4px] m-0" style="font-size: var(--text-sm, 14px); font-weight: var(--font-weight-regular, 400); color: var(--muted-foreground, #7d7d7d);">Please contact your property administrator or the StayWeb support team if you require assistance email <span style="font-weight: var(--font-weight-semibold, 600); color: var(--card-foreground, #292621);">📧 {{propertyEmail}}</span> or call at <span style="font-weight: var(--font-weight-semibold, 600); color: var(--card-foreground, #292621);">📞 {{propertyPhone}}</span> or visit <span style="font-weight: var(--font-weight-semibold, 600); color: var(--card-foreground, #292621);">📍{{propertyAddress}}</span> or</p></div><a href="{{google_maps_link}}" class="flex h-[40px] items-center justify-center px-[21px] py-[10px] no-underline box-border self-start" style="background-color: var(--primary, #2b2b2b); border-radius: var(--radius-md, 12px); color: var(--primary-foreground, #ffffff); font-size: var(--text-sm, 14px); font-weight: var(--font-weight-medium, 500);">Reach your destination</a></div></main></div><footer class="h-[100px] w-full" itemscope="" itemtype="https://schema.org/Organization" style="background-color: var(--primary, #2b2b2b); border-radius: 0 0 var(--radius-lg, 16px) var(--radius-lg, 16px);"><div class="flex flex-col items-start justify-between px-[30px] py-[18px] size-full"><div itemprop="logo"><div class="h-[24px] overflow-clip relative w-[100px]"><svg class="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 128 30"><path d="M16.8168 11.5718H11.0331C10.9912 11.0373 10.7345 10.618 10.263 10.314C9.80194 9.99956 9.26233 9.84234 8.64415 9.84234C8.0993 9.84234 7.63828 9.94191 7.26108 10.1411C6.88388 10.3297 6.69528 10.6075 6.69528 10.9744C6.69528 11.2364 6.8053 11.4827 7.02533 11.7133C7.25584 11.9439 7.70115 12.1169 8.36125 12.2322L11.9446 12.8611C13.7363 13.1755 15.0722 13.7206 15.9524 14.4962C16.843 15.2719 17.2883 16.3096 17.2883 17.6093C17.2883 18.8671 16.9216 19.9572 16.1881 20.8796C15.4547 21.7915 14.4488 22.499 13.1705 23.0021C11.9027 23.4948 10.4568 23.7411 8.83275 23.7411C6.15044 23.7411 4.04965 23.1961 2.53038 22.106C1.02158 21.0054 0.178122 19.5589 0 17.7665H6.25522C6.34952 18.3221 6.63242 18.7518 7.10392 19.0558C7.57542 19.3493 8.16217 19.496 8.86418 19.496C9.45093 19.496 9.93291 19.3964 10.3101 19.1973C10.6873 18.9981 10.8759 18.7204 10.8759 18.364C10.8759 17.7456 10.2053 17.3158 8.86418 17.0747L5.75229 16.5087C3.97107 16.1838 2.63515 15.5916 1.74455 14.7321C0.853937 13.8621 0.408632 12.7353 0.408632 11.3517C0.408632 10.1253 0.733443 9.08765 1.38306 8.23863C2.04316 7.38961 2.97568 6.74499 4.18062 6.30476C5.39604 5.85404 6.84197 5.62869 8.51841 5.62869C11.054 5.62869 13.05 6.15801 14.5064 7.21667C15.9733 8.26484 16.7434 9.71656 16.8168 11.5718Z" fill="var(--primary-foreground)"></path><path d="M28.7778 5.8488V10.4398H17.2103V5.8488H28.7778ZM19.4421 1.66659H25.7602V17.7665C25.7602 18.1334 25.8545 18.4111 26.0431 18.5998C26.2317 18.778 26.5355 18.8671 26.9546 18.8671C27.1432 18.8671 27.3633 18.8461 27.6147 18.8042C27.8767 18.7623 28.0653 18.7204 28.1805 18.6784L29.0921 23.1436C28.3691 23.3428 27.7143 23.4843 27.1275 23.5682C26.5408 23.652 25.9645 23.6939 25.3987 23.6939C23.4289 23.6939 21.941 23.2432 20.9352 22.3418C19.9398 21.4404 19.4421 20.1144 19.4421 18.364V1.66659Z" fill="var(--primary-foreground)"></path><path d="M34.8607 23.7097C33.7396 23.7097 32.7442 23.5262 31.8746 23.1594C31.0154 22.782 30.3448 22.216 29.8629 21.4613C29.3809 20.7066 29.1399 19.7476 29.1399 18.5841C29.1399 17.6198 29.3023 16.797 29.6271 16.1156C29.9519 15.4343 30.4077 14.8788 30.9945 14.4491C31.5812 14.0088 32.2623 13.6734 33.0376 13.4428C33.8234 13.2017 34.6721 13.0497 35.5837 12.9869C36.5686 12.9135 37.3544 12.8244 37.9412 12.7196C38.5384 12.6148 38.968 12.4628 39.23 12.2636C39.5024 12.054 39.6386 11.7815 39.6386 11.446V11.3832C39.6386 10.9324 39.4657 10.5865 39.1199 10.3455C38.7742 10.0939 38.3289 9.96812 37.784 9.96812C37.1763 9.96812 36.6839 10.0991 36.3067 10.3612C35.9295 10.6232 35.699 11.0268 35.6151 11.5718H29.8314C29.9048 10.5027 30.2401 9.5174 30.8373 8.61598C31.445 7.71455 32.3304 6.99131 33.4934 6.44626C34.6669 5.90121 36.1285 5.62869 37.8783 5.62869C39.1252 5.62869 40.2463 5.77543 41.2417 6.06892C42.2371 6.36241 43.0858 6.77119 43.7878 7.29528C44.4898 7.81937 45.0242 8.43255 45.3909 9.13482C45.7681 9.82661 45.9567 10.5761 45.9567 11.3832V23.4267H40.0472V20.9425H39.9215C39.5653 21.6028 39.1357 22.1374 38.6327 22.5462C38.1403 22.9445 37.5797 23.238 36.9511 23.4267C36.3224 23.6153 35.6256 23.7097 34.8607 23.7097ZM36.9039 19.7161C37.3859 19.7161 37.8364 19.6165 38.2555 19.4174C38.6851 19.2182 39.0309 18.9352 39.2928 18.5684C39.5653 18.191 39.7015 17.7351 39.7015 17.2005V15.754C39.5338 15.8169 39.3557 15.8798 39.1671 15.9427C38.9785 16.0056 38.7742 16.0632 38.5541 16.1156C38.3446 16.1681 38.1246 16.2152 37.8941 16.2572C37.674 16.2991 37.4383 16.341 37.1868 16.3829C36.6943 16.4563 36.291 16.5821 35.9766 16.7603C35.6728 16.928 35.4475 17.1376 35.3008 17.3892C35.1541 17.6303 35.0808 17.9028 35.0808 18.2068C35.0808 18.6994 35.2484 19.0767 35.5837 19.3388C35.9295 19.5903 36.3695 19.7161 36.9039 19.7161Z" fill="var(--primary-foreground)"></path><path d="M50.9709 29.9987C50.2479 30.0092 49.5564 29.9568 48.8963 29.8415C48.2362 29.7366 47.6599 29.5899 47.1675 29.4012L48.5506 24.9046L48.6449 24.936C49.3993 25.1876 50.0541 25.3029 50.6094 25.2819C51.1752 25.261 51.5577 25.0094 51.7567 24.5272L51.8825 24.2128L45.7216 5.8488H52.2911L55.1201 18.0181H55.3087L58.2006 5.8488H64.833L58.4206 24.9046C58.1063 25.8689 57.6452 26.7336 57.0375 27.4988C56.4403 28.2744 55.6492 28.8824 54.6643 29.3226C53.6794 29.7733 52.4483 29.9987 50.9709 29.9987Z" fill="var(--primary-foreground)"></path><path d="M68.3384 23.4267L63.9378 5.8488H70.2558L72.2676 16.5716H72.3933L74.6565 5.8488H80.7546L83.112 16.4773H83.2378L85.1552 5.8488H91.4733L87.0726 23.4267H80.2516L77.7998 13.9931H77.6112L75.1594 23.4267H68.3384Z" fill="#C9C9C9"></path><path d="M100.102 23.7411C98.2268 23.7411 96.608 23.3847 95.2459 22.672C93.8943 21.9487 92.857 20.911 92.134 19.5589C91.4111 18.2068 91.0496 16.5821 91.0496 14.6849C91.0496 12.8716 91.4111 11.2888 92.134 9.93667C92.8675 8.57405 93.8995 7.5154 95.2302 6.76071C96.5609 6.00603 98.1325 5.62869 99.9452 5.62869C101.276 5.62869 102.476 5.83832 103.544 6.25759C104.623 6.66638 105.546 7.26383 106.31 8.04996C107.075 8.82561 107.662 9.76897 108.071 10.88C108.479 11.9911 108.684 13.2489 108.684 14.6534V16.0999H92.9984V12.641H105.729L102.774 13.3642C102.774 12.6514 102.669 12.054 102.46 11.5718C102.25 11.0792 101.941 10.7071 101.533 10.4555C101.124 10.1935 100.616 10.0625 100.008 10.0625C99.4003 10.0625 98.8922 10.1935 98.4835 10.4555C98.0749 10.7071 97.7658 11.0792 97.5563 11.5718C97.3467 12.054 97.2419 12.6514 97.2419 13.3642V15.8798C97.2419 16.5716 97.3624 17.1743 97.6034 17.6879C97.8549 18.2015 98.2059 18.5998 98.6564 18.8828C99.107 19.1658 99.6309 19.3073 100.228 19.3073C100.658 19.3073 101.045 19.2497 101.391 19.1344C101.747 19.0086 102.051 18.8304 102.303 18.5998C102.554 18.3692 102.743 18.0915 102.868 17.7665H108.621C108.422 18.9824 107.955 20.0411 107.222 20.9425C106.499 21.8334 105.535 22.5252 104.33 23.0179C103.136 23.5 101.726 23.7411 100.102 23.7411Z" fill="#C9C9C9"></path><path d="M121.085 23.6468C120.267 23.6468 119.534 23.5105 118.884 23.238C118.245 22.9655 117.7 22.5986 117.25 22.1374C116.799 21.6657 116.454 21.1312 116.213 20.5337H116.055V23.4267H109.8V0H116.118V8.93043H116.213C116.443 8.33297 116.778 7.78268 117.218 7.27956C117.658 6.77643 118.203 6.37813 118.853 6.08464C119.513 5.78067 120.278 5.62869 121.148 5.62869C122.311 5.62869 123.411 5.9379 124.448 6.55632C125.496 7.17474 126.35 8.14954 127.01 9.48072C127.67 10.8014 128 12.5257 128 14.6534C128 16.6764 127.686 18.3535 127.057 19.6847C126.428 21.0159 125.59 22.0116 124.542 22.672C123.495 23.3218 122.342 23.6468 121.085 23.6468ZM118.759 18.8042C119.345 18.8042 119.838 18.6417 120.236 18.3168C120.645 17.9814 120.954 17.5045 121.163 16.8861C121.383 16.2572 121.493 15.5129 121.493 14.6534C121.493 13.7835 121.383 13.0393 121.163 12.4208C120.954 11.7919 120.645 11.3098 120.236 10.9744C119.838 10.6389 119.345 10.4712 118.759 10.4712C118.182 10.4712 117.685 10.6389 117.266 10.9744C116.846 11.3098 116.522 11.7919 116.291 12.4208C116.071 13.0393 115.961 13.7835 115.961 14.6534C115.961 15.5025 116.071 16.2362 116.291 16.8546C116.522 17.473 116.846 17.9552 117.266 18.3011C117.685 18.6365 118.182 18.8042 118.759 18.8042Z" fill="#C9C9C9"></path></svg></div></div><div class="flex flex-col gap-[8px] items-start w-full"><div class="h-0 w-full"><svg class="block w-full h-px" fill="none" preserveAspectRatio="none" viewBox="0 0 569 1"><line stroke="var(--primary-foreground)" stroke-opacity="0.1" x2="569" y1="0.5" y2="0.5"></line></svg></div><div class="flex items-center justify-between w-full"><p class="leading-[16px]" style="font-size: var(--text-xs, 12px); font-weight: var(--font-weight-medium, 500); color: var(--muted-foreground, #7d7d7d);">Powered by StayWeb PMS &nbsp;© {{currentYear}} Wugweb</p><nav class="flex items-center gap-[4px]" aria-label="Footer links" style="font-size: var(--text-xs, 12px); font-weight: var(--font-weight-regular, 400); color: var(--primary-foreground, #ffffff);"><a href="#" class="underline leading-[16px]" style="color: var(--primary-foreground, #ffffff);">View in browser</a><span class="leading-[16px]" style="color: var(--primary-foreground, #ffffff);"> I </span><a href="#" class="underline leading-[16px]" style="color: var(--primary-foreground, #ffffff);">Contact us</a><span class="leading-[16px]" style="color: var(--primary-foreground, #ffffff);"> l </span><a href="#" class="underline leading-[16px]" style="color: var(--primary-foreground, #ffffff);">Privacy Policy</a></nav></div></div></div></footer></div></article>
</div>
</body>
</html>`
  },
];

const TYPE_STYLES: Record<string, string> = {
  booking: 'bg-info-bg border-info-border text-info-foreground',
  payment: 'bg-success-bg border-success-border text-success-foreground',
  ota:     'bg-muted border-border text-foreground',
};

// ─── API helpers ──────────────────────────────────────────────────────────────

async function getAuthToken(): Promise<string | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token ?? null;
  } catch { return null; }
}

async function apiFetch(path: string, options: RequestInit = {}) {
  const token = await getAuthToken();
  if (!token) throw new Error('Not authenticated');
  const res = await fetch(
    `https://${projectId}.supabase.co/functions/v1/stayweb-api${path}`,
    {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    }
  );
  const json = await res.json();
  if (!json.success && json.error) throw new Error(json.error);
  return json;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-2.5 rounded-[var(--radius-md)] text-[length:var(--text-sm)] font-[var(--font-weight-semibold)] transition-all ${
        active
          ? 'bg-primary text-primary-foreground shadow-sm'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
      }`}
    >
      {children}
    </button>
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center justify-between gap-4 p-4 bg-muted/30 border border-border rounded-[var(--radius-lg)] cursor-pointer hover:bg-muted/50 transition-colors">
      <span className="text-[length:var(--text-sm)] font-[var(--font-weight-medium)] text-foreground">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
          checked ? 'bg-primary' : 'bg-muted-foreground/30'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-background shadow-sm transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </label>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function EmailNotificationSettings() {
  const [activeTab, setActiveTab] = useState<'config' | 'templates' | 'log'>('config');

  const [config, setConfig] = useState<BrevoConfig>(DEFAULT_CONFIG);
  const [configLoading, setConfigLoading] = useState(true);
  const [configSaving, setConfigSaving] = useState(false);

  // Templates
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Test send
  const [testEmail, setTestEmail] = useState('');
  const [testSending, setTestSending] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; messageId?: string; error?: string } | null>(null);

  // Delivery log
  const [deliveryLog, setDeliveryLog] = useState<LogEntry[]>([]);
  const [logLoading, setLogLoading] = useState(false);
  const [logClearing, setLogClearing] = useState(false);

  // Brevo status
  const [brevoConfigured, setBrevoConfigured] = useState<boolean | null>(null);

  const loadConfig = useCallback(async () => {
    setConfigLoading(true);
    try {
      const [statusRes, configRes] = await Promise.all([
        apiFetch('/brevo/status'),
        apiFetch('/brevo/config'),
      ]);
      setBrevoConfigured(statusRes.data?.configured ?? false);
      if (configRes.data && Object.keys(configRes.data).length > 0) {
        setConfig({ ...DEFAULT_CONFIG, ...configRes.data });
      }
    } catch (e: any) {
      console.error('[Brevo] Load error:', e.message);
      setBrevoConfigured(false);
    } finally {
      setConfigLoading(false);
    }
  }, []);

  const loadLog = useCallback(async () => {
    setLogLoading(true);
    try {
      const res = await apiFetch('/brevo/delivery-log');
      setDeliveryLog(Array.isArray(res.data) ? res.data : []);
    } catch (e: any) {
      console.error('[Brevo] Log load error:', e.message);
    } finally {
      setLogLoading(false);
    }
  }, []);

  useEffect(() => { loadConfig(); }, [loadConfig]);
  useEffect(() => {
    if (activeTab === 'log') loadLog();
  }, [activeTab, loadLog]);

  const saveConfig = async () => {
    setConfigSaving(true);
    try {
      await apiFetch('/brevo/config', { method: 'PUT', body: JSON.stringify(config) });
      notifySuccess('Settings saved');
    } catch (e: any) {
      notifyError(`Save failed: ${e.message}`);
    } finally {
      setConfigSaving(false);
    }
  };

  const fireTestSend = async () => {
    if (!selectedTemplate || !testEmail.trim()) return;
    setTestSending(true);
    setTestResult(null);
    try {
      const res = await apiFetch('/brevo/test-send', {
        method: 'POST',
        body: JSON.stringify({
          toEmail: testEmail.trim(),
          templateId: selectedTemplate.id,
          templateName: selectedTemplate.name,
          senderName: config.senderName,
          senderEmail: config.senderEmail,
          replyTo: config.replyTo || undefined,
          htmlContent: selectedTemplate.htmlContent,
        }),
      });
      setTestResult({ ok: true, messageId: res.data?.messageId });
      notifySuccess(`Test email sent to ${testEmail}`);
    } catch (e: any) {
      setTestResult({ ok: false, error: e.message });
      notifyError(`Test send failed: ${e.message}`);
    } finally {
      setTestSending(false);
    }
  };

  const clearLog = async () => {
    setLogClearing(true);
    try {
      await apiFetch('/brevo/delivery-log', { method: 'DELETE' });
      setDeliveryLog([]);
      notifySuccess('Log cleared');
    } catch (e: any) {
      notifyError(`Clear failed: ${e.message}`);
    } finally {
      setLogClearing(false);
    }
  };

  // ─── Render ─────────────────────────────────────────────────────────────────

  if (configLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 p-2 rounded-[var(--radius-md)] bg-muted border border-border">
          <TabButton active={activeTab === 'config'} onClick={() => setActiveTab('config')}>Config</TabButton>
          <TabButton active={activeTab === 'templates'} onClick={() => setActiveTab('templates')}>Templates</TabButton>
          <TabButton active={activeTab === 'log'} onClick={() => setActiveTab('log')}>Log</TabButton>
        </div>
        {brevoConfigured !== null && (
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[length:var(--text-xs)] font-[var(--font-weight-semibold)] border ${
            brevoConfigured
              ? 'bg-success-bg border-success-border text-success-foreground'
              : 'bg-error-bg border-error-border text-error-foreground'
          }`}>
            {brevoConfigured ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
            {brevoConfigured ? 'Brevo Connected' : 'BREVO_API_KEY not set'}
          </div>
        )}
      </div>

      {brevoConfigured === false && (
        <AlertBanner variant="warning" title="Brevo API key missing" description="Emails won't send until a valid BREVO_API_KEY is set on the server." />
      )}

      {/* ── CONFIG TAB ── */}
      {activeTab === 'config' && (
        <div className="space-y-6 animate-fade-in">

          {/* Sender Verification Guide */}
          <div className="bg-card border border-border rounded-[var(--radius-xl)] p-6 shadow-sm">
            <div className="flex items-start gap-3 mb-4">
              <ShieldCheck className="w-5 h-5 text-info shrink-0 mt-0.5" />
              <div>
                <p className="font-[var(--font-weight-semibold)] text-[length:var(--text-sm)] text-card-foreground">Sender Email Verification</p>
                <p className="text-[length:var(--text-xs)] text-muted-foreground mt-0.5">
                  All emails are sent securely through our verified platform domain. No further DNS configuration is required.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-info-bg border border-info-border rounded-[var(--radius-md)]">
              <Info className="w-4 h-4 text-info shrink-0" />
              <p className="text-[length:var(--text-xs)] text-info-foreground">
                Default sender <span className="font-[var(--font-weight-semibold)]">stayweb@wugweb.studio</span> is verified and ready to use for all properties on the platform.
              </p>
            </div>
          </div>

          {/* Sender Identity */}
          <div className="bg-card border border-border rounded-[var(--radius-xl)] p-6 shadow-sm">
            <p className="font-[var(--font-weight-semibold)] text-[length:var(--text-sm)] text-card-foreground mb-4">Sender Identity</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[length:var(--text-xs)] font-[var(--font-weight-semibold)] text-muted-foreground">Sender Name</label>
                <input
                  type="text"
                  value={config.senderName}
                  onChange={e => setConfig(c => ({ ...c, senderName: e.target.value }))}
                  placeholder="e.g. The Wanderer Hostel"
                  className="w-full px-3.5 py-2.5 bg-input-background border border-border rounded-[var(--radius-md)] text-[length:var(--text-sm)] text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[length:var(--text-xs)] font-[var(--font-weight-semibold)] text-muted-foreground">Sender Email</label>
                <input
                  type="email"
                  value={config.senderEmail}
                  readOnly
                  className="w-full px-3.5 py-2.5 bg-muted/50 border border-border rounded-[var(--radius-md)] text-[length:var(--text-sm)] text-muted-foreground focus:outline-none cursor-not-allowed"
                />
                <p className="text-[length:var(--text-xs)] text-muted-foreground">Platform default (Verified)</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-[length:var(--text-xs)] font-[var(--font-weight-semibold)] text-muted-foreground">Reply-To</label>
                <input
                  type="email"
                  value={config.replyTo}
                  onChange={e => setConfig(c => ({ ...c, replyTo: e.target.value }))}
                  placeholder="support@yourproperty.com"
                  className="w-full px-3.5 py-2.5 bg-input-background border border-border rounded-[var(--radius-md)] text-[length:var(--text-sm)] text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
          </div>

          {/* Automation Triggers */}
          <div className="bg-card border border-border rounded-[var(--radius-xl)] p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-4 h-4 text-foreground" />
              <p className="font-[var(--font-weight-semibold)] text-[length:var(--text-sm)] text-card-foreground">Auto-send Triggers</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Toggle
                checked={config.autoSendBookingConfirmation}
                onChange={v => setConfig(c => ({ ...c, autoSendBookingConfirmation: v }))}
                label="Booking Confirmation"
              />
              <Toggle
                checked={config.autoSendPaymentReceipt}
                onChange={v => setConfig(c => ({ ...c, autoSendPaymentReceipt: v }))}
                label="Payment Receipt"
              />
              <Toggle
                checked={config.autoSendOTAResponse}
                onChange={v => setConfig(c => ({ ...c, autoSendOTAResponse: v }))}
                label="OTA Booking Confirmation"
              />
              <Toggle
                checked={config.autoSendCheckInReminder}
                onChange={v => setConfig(c => ({ ...c, autoSendCheckInReminder: v }))}
                label="Check-in Reminder"
              />
            </div>

            {config.autoSendCheckInReminder && (
              <div className="mt-4 flex items-center gap-3 pl-4 border-l-2 border-accent/30">
                <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="text-[length:var(--text-sm)] text-muted-foreground">Send</span>
                <input
                  type="number"
                  min={1}
                  max={168}
                  value={config.reminderHoursBefore}
                  onChange={e => setConfig(c => ({ ...c, reminderHoursBefore: Number(e.target.value) }))}
                  className="w-20 px-3 py-1.5 bg-input-background border border-border rounded-[var(--radius-md)] text-[length:var(--text-sm)] text-center text-card-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <span className="text-[length:var(--text-sm)] text-muted-foreground">hours before check-in</span>
              </div>
            )}
          </div>

          {/* Save */}
          <div className="flex items-center justify-between">
            <a
              href="https://app.brevo.com/senders/domain/list"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-[length:var(--text-xs)] font-[var(--font-weight-semibold)] text-info-foreground hover:underline"
            >
              Brevo Sender Settings <ExternalLink className="w-3 h-3" />
            </a>
            <button
              onClick={saveConfig}
              disabled={configSaving}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-[var(--radius-md)] text-[length:var(--text-sm)] font-[var(--font-weight-semibold)] hover:opacity-90 disabled:opacity-60 transition-all shadow-sm"
            >
              {configSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {configSaving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      )}

      {/* ── TEMPLATES TAB ── */}
      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 animate-fade-in">

          {/* Template list */}
          <div className="lg:col-span-2 space-y-2">
            {DEFAULT_TEMPLATES.map(tpl => {
              const isSelected = selectedTemplate?.id === tpl.id;
              return (
                <button
                  key={tpl.id}
                  onClick={() => { setSelectedTemplate(tpl); setPreviewOpen(false); setTestResult(null); }}
                  className={`w-full text-left p-4 rounded-[var(--radius-lg)] border transition-all ${
                    isSelected
                      ? 'bg-card border-primary ring-1 ring-primary shadow-sm'
                      : 'bg-card border-border hover:border-primary/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="font-[var(--font-weight-semibold)] text-[length:var(--text-sm)] text-card-foreground">{tpl.name}</p>
                    <span className={`text-2xs px-2 py-0.5 rounded-[var(--radius-sm)] border font-[var(--font-weight-bold)] ${TYPE_STYLES[tpl.type]}`}>
                      {tpl.type}
                    </span>
                  </div>
                  <p className="text-[length:var(--text-xs)] text-muted-foreground truncate">{tpl.subject}</p>
                </button>
              );
            })}
          </div>

          {/* Template viewer */}
          <div className="lg:col-span-3">
            {selectedTemplate ? (
              <div className="bg-card border border-border rounded-[var(--radius-xl)] overflow-hidden shadow-sm animate-fade-in">

                {/* Toolbar */}
                <div className="px-5 py-3.5 border-b border-border flex items-center justify-between gap-3">
                  <p className="font-[var(--font-weight-semibold)] text-[length:var(--text-sm)] text-card-foreground">{selectedTemplate.name}</p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPreviewOpen(p => !p)}
                      className={`p-2 rounded-[var(--radius-md)] border transition-colors ${previewOpen ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-muted text-muted-foreground'}`}
                      title="Preview"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setTestResult(null)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 bg-primary text-primary-foreground rounded-[var(--radius-md)] text-[length:var(--text-xs)] font-[var(--font-weight-semibold)] hover:opacity-90 transition-all"
                    >
                      <Send className="w-3 h-3" />
                      Test Send
                    </button>
                  </div>
                </div>

                {/* Test send bar */}
                <div className="px-5 py-3 border-b border-border bg-muted/20">
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={testEmail}
                      onChange={e => setTestEmail(e.target.value)}
                      placeholder="recipient@example.com"
                      className="flex-1 px-3.5 py-2 bg-input-background border border-border rounded-[var(--radius-md)] text-[length:var(--text-sm)] text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    <button
                      onClick={fireTestSend}
                      disabled={testSending || !testEmail.trim()}
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-[var(--radius-md)] text-[length:var(--text-sm)] font-[var(--font-weight-semibold)] hover:opacity-90 disabled:opacity-60 transition-all"
                    >
                      {testSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      Send
                    </button>
                  </div>
                  {testResult && (
                    <div className={`mt-2 px-3 py-2 rounded-[var(--radius-md)] border text-[length:var(--text-xs)] font-[var(--font-weight-medium)] flex items-center gap-2 ${
                      testResult.ok
                        ? 'bg-success-bg border-success-border text-success-foreground'
                        : 'bg-error-bg border-error-border text-error-foreground'
                    }`}>
                      {testResult.ok
                        ? <><CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> Delivered (ID: {testResult.messageId})</>
                        : <><AlertCircle className="w-3.5 h-3.5 shrink-0" /> {testResult.error}</>
                      }
                    </div>
                  )}
                </div>

                {/* Preview */}
                {previewOpen ? (
                  <div className="p-4 bg-muted/30">
                    <div className="max-w-[640px] mx-auto bg-card border border-border rounded-[var(--radius-lg)] overflow-hidden shadow-sm">
                      <iframe
                        srcDoc={selectedTemplate.htmlContent}
                        className="w-full border-0"
                        style={{ height: 480 }}
                        title="Email Preview"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="p-5">
                    <div className="space-y-3">
                      <div>
                        <p className="text-[length:var(--text-xs)] font-[var(--font-weight-semibold)] tracking-wider text-muted-foreground mb-1">Subject</p>
                        <p className="text-[length:var(--text-sm)] text-card-foreground bg-muted/30 px-3 py-2 rounded-[var(--radius-md)] border border-border">{selectedTemplate.subject}</p>
                      </div>
                      <p className="text-[length:var(--text-xs)] text-muted-foreground">
                        Click the preview button above to see the full email template. Variables like {'{{guestName}}'} are replaced automatically at send time.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full min-h-[300px] flex flex-col items-center justify-center bg-card border border-dashed border-border rounded-[var(--radius-xl)] text-center p-10">
                <FileText className="w-10 h-10 text-muted-foreground mb-3 opacity-40" />
                <p className="font-[var(--font-weight-semibold)] text-muted-foreground">Select a template</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── LOG TAB ── */}
      {activeTab === 'log' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <p className="text-[length:var(--text-xs)] font-[var(--font-weight-bold)] uppercase tracking-widest text-muted-foreground">
              {deliveryLog.length} record{deliveryLog.length !== 1 ? 's' : ''}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={loadLog}
                disabled={logLoading}
                className="flex items-center gap-1.5 px-3.5 py-1.5 border border-border rounded-[var(--radius-md)] text-[length:var(--text-xs)] text-muted-foreground hover:bg-muted transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${logLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              {deliveryLog.length > 0 && (
                <button
                  onClick={clearLog}
                  disabled={logClearing}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 border border-error-border bg-error-bg rounded-[var(--radius-md)] text-[length:var(--text-xs)] text-error-foreground hover:opacity-80 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {logClearing ? 'Clearing…' : 'Clear'}
                </button>
              )}
            </div>
          </div>

          {logLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : deliveryLog.length === 0 ? (
            <div className="text-center py-12 bg-card border border-dashed border-border rounded-[var(--radius-xl)]">
              <Mail className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-40" />
              <p className="text-[length:var(--text-sm)] text-muted-foreground">No emails sent yet</p>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-[var(--radius-xl)] overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-[length:var(--text-sm)]">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left px-5 py-3 font-[var(--font-weight-semibold)] text-[length:var(--text-xs)] uppercase tracking-wider text-muted-foreground">Template</th>
                      <th className="text-left px-5 py-3 font-[var(--font-weight-semibold)] text-[length:var(--text-xs)] uppercase tracking-wider text-muted-foreground">Recipient</th>
                      <th className="text-left px-5 py-3 font-[var(--font-weight-semibold)] text-[length:var(--text-xs)] uppercase tracking-wider text-muted-foreground">Type</th>
                      <th className="text-left px-5 py-3 font-[var(--font-weight-semibold)] text-[length:var(--text-xs)] uppercase tracking-wider text-muted-foreground">Status</th>
                      <th className="text-left px-5 py-3 font-[var(--font-weight-semibold)] text-[length:var(--text-xs)] uppercase tracking-wider text-muted-foreground">Sent</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deliveryLog.map((entry) => (
                      <tr key={entry.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                        <td className="px-5 py-3">
                          <p className="font-[var(--font-weight-medium)] text-card-foreground">{entry.templateName}</p>
                        </td>
                        <td className="px-5 py-3">
                          <p className="text-card-foreground font-mono text-[length:var(--text-xs)]">{entry.toEmail}</p>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex px-2 py-0.5 rounded-[var(--radius-sm)] text-[length:var(--text-2xs)] font-[var(--font-weight-bold)] uppercase border ${
                            entry.type === 'test'
                              ? 'bg-warning-bg border-warning-border text-warning-foreground'
                              : 'bg-info-bg border-info-border text-info-foreground'
                          }`}>
                            {entry.type}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-[var(--radius-sm)] text-[length:var(--text-2xs)] font-[var(--font-weight-bold)] uppercase border ${
                            entry.status === 'delivered'
                              ? 'bg-success-bg border-success-border text-success-foreground'
                              : 'bg-error-bg border-error-border text-error-foreground'
                          }`}>
                            {entry.status === 'delivered' ? <CheckCircle2 className="w-2.5 h-2.5" /> : <AlertCircle className="w-2.5 h-2.5" />}
                            {entry.status}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <p className="text-[length:var(--text-xs)] text-muted-foreground">
                            {new Date(entry.sentAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}