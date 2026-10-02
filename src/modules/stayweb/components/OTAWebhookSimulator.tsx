/**
 * @module OTAWebhookSimulator
 * @description Developer/SuperAdmin tool for simulating incoming Channel Manager (OTA) webhooks and evaluating booking ingestion pipelines.
 * @label [Feature: ChannelManager, SuperAdmin, Testing]
 */
import { useState, useEffect } from 'react';
import {
  Radio,
  Send,
  CheckCircle,
  AlertCircle,
  Loader2,
  Globe,
  User,
  Mail,
  Phone,
  BedDouble,
  Calendar,
  Users,
  IndianRupee,
  FileText,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { AdminPageHeader } from './ui/AdminPageHeader';
import { AlertBanner } from './ui/AlertBanner';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { supabase } from '../utils/supabase/client';

interface TenantInfo {
  tenantId: string;
  userEmails: string[];
  profile: { name?: string } | null;
}

interface SimulationResult {
  id: string;
  platform: string;
  guestName: string;
  status: string;
  timestamp: string;
  eventType?: string;
  bookingId?: string;
}

const OTA_PLATFORMS = [
  { id: 'booking.com', label: 'Booking.com', color: 'bg-info-bg text-info-foreground border-info-border' },
  { id: 'goibibo', label: 'Goibibo', color: 'bg-warning-bg text-warning-foreground border-warning-border' },
  { id: 'makemytrip', label: 'MakeMyTrip', color: 'bg-error-bg text-error-foreground border-error-border' },
  { id: 'hostelworld', label: 'Hostelworld', color: 'bg-success-bg text-success-foreground border-success-border' },
  { id: 'agoda', label: 'Agoda', color: 'bg-purple-bg text-purple-foreground border-purple-border' },
  { id: 'airbnb', label: 'Airbnb', color: 'bg-pink-bg text-pink-foreground border-pink-border' },
];

const ROOM_TYPES = [
  'Standard Dorm (Mixed)',
  'Female Dorm',
  'Private Room',
  'Deluxe Private',
  'Family Room',
  'Pod Bed',
];

const SAMPLE_GUESTS = [
  { name: 'Arjun Mehta', email: 'arjun.mehta@gmail.com', phone: '+919876543210' },
  { name: 'Priya Sharma', email: 'priya.s@outlook.com', phone: '+919123456789' },
  { name: 'Rahul Patel', email: 'rahulp@yahoo.com', phone: '+918765432109' },
  { name: 'Ananya Gupta', email: 'ananya.g@gmail.com', phone: '+917654321098' },
  { name: 'Vikram Singh', email: 'vikram.singh@proton.me', phone: '+916543210987' },
];

export function OTAWebhookSimulator() {
  const [tenants, setTenants] = useState<TenantInfo[]>([]);
  const [loadingTenants, setLoadingTenants] = useState(true);
  const [selectedTenant, setSelectedTenant] = useState('');
  const [platform, setPlatform] = useState('booking.com');
  const [requestType, setRequestType] = useState<'new' | 'modified' | 'cancelled'>('new');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [roomType, setRoomType] = useState('Standard Dorm (Mixed)');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [paymentModel, setPaymentModel] = useState<'hotel_collect' | 'ota_collect'>('hotel_collect');
  const [currency, setCurrency] = useState('INR');
  const [commissionRate, setCommissionRate] = useState(15);
  const [specialRequests, setSpecialRequests] = useState('');
  const [sending, setSending] = useState(false);
  const [results, setResults] = useState<SimulationResult[]>([]);
  const [lastError, setLastError] = useState<string | null>(null);

  // Set default dates
  useEffect(() => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date(today);
    dayAfter.setDate(dayAfter.getDate() + 3);
    setCheckIn(tomorrow.toISOString().split('T')[0]);
    setCheckOut(dayAfter.toISOString().split('T')[0]);
  }, []);

  // Load tenants
  useEffect(() => {
    const loadTenants = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) return;

        const res = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-ead79e26/super-admin/tenants`,
          { headers: { Authorization: `Bearer ${session.access_token}` } }
        );
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data)) {
            setTenants(json.data);
            if (json.data.length > 0) setSelectedTenant(json.data[0].tenantId);
          }
        }
      } catch (e) {
        console.error('[OTA Simulator] Failed to load tenants:', e);
      } finally {
        setLoadingTenants(false);
      }
    };
    loadTenants();
  }, []);

  const fillRandomGuest = () => {
    const guest = SAMPLE_GUESTS[Math.floor(Math.random() * SAMPLE_GUESTS.length)];
    setGuestName(guest.name);
    setGuestEmail(guest.email);
    setGuestPhone(guest.phone);
    setPlatform(OTA_PLATFORMS[Math.floor(Math.random() * OTA_PLATFORMS.length)].id);
    setRoomType(ROOM_TYPES[Math.floor(Math.random() * ROOM_TYPES.length)]);
    setTotalAmount(Math.floor(Math.random() * 4000) + 500);
    setAdults(Math.floor(Math.random() * 3) + 1);
    setChildren(Math.random() > 0.7 ? 1 : 0);
    setPaymentModel(Math.random() > 0.5 ? 'hotel_collect' : 'ota_collect');
    setCurrency(['INR', 'INR', 'INR', 'USD', 'EUR'][Math.floor(Math.random() * 5)]);
    setCommissionRate(Math.floor(Math.random() * 10) + 10);
    const requests = ['Early check-in', 'Lower bunk preferred', 'Vegetarian meals', 'Late checkout', 'Airport pickup needed', ''];
    setSpecialRequests(requests[Math.floor(Math.random() * requests.length)]);
  };

  const handleSimulate = async () => {
    if (!selectedTenant || !guestName || !checkIn || !checkOut) {
      setLastError('Please fill in all required fields (tenant, guest name, check-in/out dates).');
      return;
    }

    setSending(true);
    setLastError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setLastError('No active session. Please log in again.');
        return;
      }

      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-ead79e26/super-admin/ota-simulate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            tenantId: selectedTenant,
            platform,
            guestName,
            guestEmail,
            guestPhone,
            roomType,
            checkIn,
            checkOut,
            adults,
            children,
            totalAmount,
            paymentModel,
            currency,
            commissionRate,
            specialRequests,
            status: requestType,
          }),
        }
      );

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || `Server returned ${res.status}`);
      }

      setResults(prev => [{
        id: json.data?.id || json.data?.webhookResponse?.bookingId || `sim-${Date.now()}`,
        platform,
        guestName,
        status: 'success',
        timestamp: new Date().toLocaleTimeString(),
        eventType: requestType,
        bookingId: json.data?.webhookResponse?.bookingId || json.data?.webhookBookingId,
      }, ...prev].slice(0, 20));

    } catch (e: any) {
      console.error('[OTA Simulator] Error:', e);
      setLastError(e.message || 'Failed to simulate webhook');
      setResults(prev => [{
        id: `err-${Date.now()}`,
        platform,
        guestName,
        status: 'error',
        timestamp: new Date().toLocaleTimeString(),
      }, ...prev].slice(0, 20));
    } finally {
      setSending(false);
    }
  };

  const selectedTenantInfo = tenants.find(t => t.tenantId === selectedTenant);

  return (
    <div className="h-full flex flex-col bg-background">
      <AdminPageHeader
        title="OTA Webhook Simulator"
        description="Simulate incoming OTA booking webhooks to test the reservation pipeline end-to-end"
        icon={Radio}
        badge="Super Admin"
      />

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-5xl mx-auto space-y-8">

          {/* Target Tenant */}
          <div className="bg-card border border-border rounded-[var(--radius-xl)] p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[var(--radius-lg)] bg-primary/10 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="text-foreground">Target Property</h4>
                  <p className="text-[length:var(--text-xs)] text-muted-foreground">Select the tenant to receive the simulated OTA request</p>
                </div>
              </div>
              <button
                onClick={fillRandomGuest}
                className="flex items-center gap-2 px-4 py-2 bg-muted text-card-foreground rounded-[var(--radius-md)] hover:bg-muted/80 transition-colors text-[length:var(--text-sm)] font-[var(--font-weight-semibold)] border border-border"
              >
                <Zap className="w-4 h-4" />
                Auto-fill Random
              </button>
            </div>

            {loadingTenants ? (
              <div className="flex items-center gap-3 py-4">
                <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
                <span className="text-muted-foreground text-[length:var(--text-sm)]">Loading properties...</span>
              </div>
            ) : tenants.length === 0 ? (
              <AlertBanner variant="warning" title="No Properties Found" description="No tenant properties are registered yet." />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[length:var(--text-sm)] font-[var(--font-weight-semibold)] text-foreground mb-2">Property</label>
                  <select
                    value={selectedTenant}
                    onChange={(e) => setSelectedTenant(e.target.value)}
                    className="w-full px-4 py-3 bg-input-background border border-border rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    {tenants.map(t => (
                      <option key={t.tenantId} value={t.tenantId}>
                        {t.profile?.name || t.tenantId} ({t.userEmails?.[0] || 'no email'})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[length:var(--text-sm)] font-[var(--font-weight-semibold)] text-foreground mb-2">Tenant ID</label>
                  <input
                    type="text"
                    value={selectedTenant}
                    readOnly
                    className="w-full px-4 py-3 bg-muted border border-border rounded-[var(--radius-md)] font-mono text-muted-foreground text-[length:var(--text-sm)]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* OTA Platform & Request Type */}
          <div className="bg-card border border-border rounded-[var(--radius-xl)] p-6 shadow-sm space-y-6">
            <h4 className="text-foreground flex items-center gap-2">
              <Radio className="w-5 h-5 text-primary" />
              Webhook Configuration
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-[length:var(--text-sm)] font-[var(--font-weight-semibold)] text-foreground mb-3">OTA Platform</label>
                <div className="grid grid-cols-2 gap-2">
                  {OTA_PLATFORMS.map(p => (
                    <button
                      key={p.id}
                      onClick={() => setPlatform(p.id)}
                      className={`px-3 py-2.5 rounded-[var(--radius-md)] border text-[length:var(--text-sm)] font-[var(--font-weight-semibold)] transition-all ${
                        platform === p.id ? p.color + ' shadow-sm' : 'bg-card border-border text-muted-foreground hover:border-primary/50'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[length:var(--text-sm)] font-[var(--font-weight-semibold)] text-foreground mb-3">Request Type</label>
                <div className="flex gap-2">
                  {(['new', 'modified', 'cancelled'] as const).map(type => (
                    <button
                      key={type}
                      onClick={() => setRequestType(type)}
                      className={`flex-1 px-3 py-2.5 rounded-[var(--radius-md)] border text-[length:var(--text-sm)] font-[var(--font-weight-semibold)] capitalize transition-all ${
                        requestType === type
                          ? type === 'new' ? 'bg-success-bg border-success-border text-success-foreground'
                            : type === 'modified' ? 'bg-warning-bg border-warning-border text-warning-foreground'
                            : 'bg-error-bg border-error-border text-error-foreground'
                          : 'bg-card border-border text-muted-foreground hover:border-primary/50'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Guest & Booking Details */}
          <div className="bg-card border border-border rounded-[var(--radius-xl)] p-6 shadow-sm space-y-6">
            <h4 className="text-foreground flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Guest & Booking Details
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="flex items-center gap-1.5 text-[length:var(--text-sm)] font-[var(--font-weight-semibold)] text-foreground mb-2">
                  <User className="w-3.5 h-3.5" /> Guest Name <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full px-4 py-3 bg-input-background border border-border rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="e.g. Arjun Mehta"
                />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-[length:var(--text-sm)] font-[var(--font-weight-semibold)] text-foreground mb-2">
                  <Mail className="w-3.5 h-3.5" /> Email
                </label>
                <input
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-input-background border border-border rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="guest@example.com"
                />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-[length:var(--text-sm)] font-[var(--font-weight-semibold)] text-foreground mb-2">
                  <Phone className="w-3.5 h-3.5" /> Phone
                </label>
                <input
                  type="text"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  className="w-full px-4 py-3 bg-input-background border border-border rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="+919876543210"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              <div>
                <label className="flex items-center gap-1.5 text-[length:var(--text-sm)] font-[var(--font-weight-semibold)] text-foreground mb-2">
                  <BedDouble className="w-3.5 h-3.5" /> Room Type
                </label>
                <select
                  value={roomType}
                  onChange={(e) => setRoomType(e.target.value)}
                  className="w-full px-4 py-3 bg-input-background border border-border rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  {ROOM_TYPES.map(rt => <option key={rt} value={rt}>{rt}</option>)}
                </select>
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-[length:var(--text-sm)] font-[var(--font-weight-semibold)] text-foreground mb-2">
                  <Calendar className="w-3.5 h-3.5" /> Check-in <span className="text-destructive">*</span>
                </label>
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full px-4 py-3 bg-input-background border border-border rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-[length:var(--text-sm)] font-[var(--font-weight-semibold)] text-foreground mb-2">
                  <Calendar className="w-3.5 h-3.5" /> Check-out <span className="text-destructive">*</span>
                </label>
                <input
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full px-4 py-3 bg-input-background border border-border rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-[length:var(--text-sm)] font-[var(--font-weight-semibold)] text-foreground mb-2">
                  <IndianRupee className="w-3.5 h-3.5" /> Total Amount
                </label>
                <input
                  type="number"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-input-background border border-border rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="0"
                  min={0}
                />
              </div>
            </div>

            {/* Financial & Payment Fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="flex items-center gap-1.5 text-[length:var(--text-sm)] font-[var(--font-weight-semibold)] text-foreground mb-2">
                  <IndianRupee className="w-3.5 h-3.5" /> Payment Model
                </label>
                <select
                  value={paymentModel}
                  onChange={(e) => setPaymentModel(e.target.value as any)}
                  className="w-full px-4 py-3 bg-input-background border border-border rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="hotel_collect">Hotel Collect</option>
                  <option value="ota_collect">OTA Collect</option>
                </select>
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-[length:var(--text-sm)] font-[var(--font-weight-semibold)] text-foreground mb-2">
                  <Globe className="w-3.5 h-3.5" /> Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-4 py-3 bg-input-background border border-border rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-[length:var(--text-sm)] font-[var(--font-weight-semibold)] text-foreground mb-2">
                  <IndianRupee className="w-3.5 h-3.5" /> Commission %
                </label>
                <input
                  type="number"
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-input-background border border-border rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-accent"
                  min={0}
                  max={50}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="flex items-center gap-1.5 text-[length:var(--text-sm)] font-[var(--font-weight-semibold)] text-foreground mb-2">
                  <Users className="w-3.5 h-3.5" /> Adults
                </label>
                <input
                  type="number"
                  value={adults}
                  onChange={(e) => setAdults(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-input-background border border-border rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-accent"
                  min={1}
                  max={10}
                />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-[length:var(--text-sm)] font-[var(--font-weight-semibold)] text-foreground mb-2">
                  <Users className="w-3.5 h-3.5" /> Children
                </label>
                <input
                  type="number"
                  value={children}
                  onChange={(e) => setChildren(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-input-background border border-border rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-accent"
                  min={0}
                  max={5}
                />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-[length:var(--text-sm)] font-[var(--font-weight-semibold)] text-foreground mb-2">
                  <FileText className="w-3.5 h-3.5" /> Special Requests
                </label>
                <input
                  type="text"
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  className="w-full px-4 py-3 bg-input-background border border-border rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="Early check-in, lower bunk..."
                />
              </div>
            </div>
          </div>

          {/* Error */}
          {lastError && (
            <AlertBanner variant="warning" title="Simulation Failed" description={lastError} />
          )}

          {/* Send Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSimulate}
              disabled={sending || !selectedTenant || !guestName || !checkIn || !checkOut}
              className="flex items-center gap-3 px-10 py-4 bg-primary text-primary-foreground rounded-[var(--radius-lg)] font-[var(--font-weight-bold)] hover:opacity-90 transition-all disabled:opacity-50 shadow-md text-[length:var(--text-base)]"
            >
              {sending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Simulating...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Simulate Webhook
                </>
              )}
            </button>
          </div>

          {/* Results Log */}
          {results.length > 0 && (
            <div className="bg-card border border-border rounded-[var(--radius-xl)] p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-foreground flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-primary" />
                  Simulation Log
                </h4>
                <button
                  onClick={() => setResults([])}
                  className="text-[length:var(--text-xs)] text-muted-foreground hover:text-foreground transition-colors"
                >
                  Clear
                </button>
              </div>

              <div className="space-y-2">
                {results.map((r, i) => (
                  <div
                    key={`${r.id}-${i}`}
                    className={`flex items-center gap-3 px-4 py-3 rounded-[var(--radius-md)] border text-[length:var(--text-sm)] ${
                      r.status === 'success'
                        ? 'bg-success-bg border-success-border'
                        : 'bg-error-bg border-error-border'
                    }`}
                  >
                    {r.status === 'success' ? (
                      <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-error flex-shrink-0" />
                    )}
                    <span className="font-[var(--font-weight-semibold)] text-foreground">{r.platform}</span>
                    {r.eventType && (
                      <span className={`px-1.5 py-0.5 rounded-[var(--radius-sm)] text-[length:var(--text-2xs)] font-[var(--font-weight-medium)] ${
                        r.eventType === 'new' ? 'bg-success-bg text-success-foreground'
                          : r.eventType === 'modified' ? 'bg-warning-bg text-warning-foreground'
                          : 'bg-error-bg text-error-foreground'
                      }`}>
                        {r.eventType}
                      </span>
                    )}
                    <span className="text-muted-foreground">{r.guestName}</span>
                    <span className="ml-auto text-[length:var(--text-xs)] text-muted-foreground font-mono">{r.timestamp}</span>
                    {r.status === 'success' && r.bookingId && (
                      <span className="text-[length:var(--text-xs)] font-mono text-muted-foreground">{r.bookingId}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}