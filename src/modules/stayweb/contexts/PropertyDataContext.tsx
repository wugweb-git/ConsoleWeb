// TODO: replace with Stayweb admin API
/**
 * @module PropertyDataContext
 * @description Centralized React Context for property state (inventory, pricing, policies, bookings). Interacts with Supabase edge-functions.
 * @label [Context, Data Layer, Core]
 */
import { createContext, useContext, useState, ReactNode, useEffect, useMemo, useRef, useCallback, startTransition } from 'react';
import { supabase, getInitialSession, resetSessionCache } from '../utils/supabase/client';
import { 
  PricingRule, 
  OTAChannel, 
  PaymentGateway 
} from '../types/schema';
import { defaultWebhookUrl } from '../utils/constants';

// New API Layer Imports
import { apiClient } from '../src/api/client';
import { bookingsApi, CreateBookingPayload } from '../src/api/bookings';
import { inventoryApi, LockPayload, LockResponse } from '../src/api/inventory';
import { ledgerApi } from '../src/api/ledger';
import { authApi } from '../src/api/auth';
import { usePlatformConfig, type PlatformHKTaskType } from '../utils/platformConfig';
import { triggerBookingConfirmationEmail, triggerBookingConfirmationSMS } from '../utils/notificationTriggers';

// Legacy Types (Keep for compatibility until full refactor)
export const api = apiClient; 

/**
 * PropertyPolicies — stored as a nested object on PropertyProfile.
 * All fields are optional at the TypeScript level via Partial<> at call-sites
 * so partial saves work cleanly without migration pain.
 */
export interface PropertyPolicies {
  /** Individual house rules, each as a single sentence */
  houseRules: string[];
  /** Structured cancellation policy type */
  cancellationPolicy: 'flexible' | 'moderate' | 'strict' | 'non-refundable' | 'custom';
  /** Free-text elaboration / conditions */
  cancellationNote: string;
  petPolicy: 'not-allowed' | 'allowed' | 'on-request';
  petNote: string;
  smokingPolicy: 'not-allowed' | 'designated-areas' | 'allowed';
  smokingNote: string;
  quietHoursEnabled: boolean;
  quietHoursFrom: string;   // "HH:MM"
  quietHoursTo: string;     // "HH:MM"
  minimumAge: number;
  internetPolicy: string;
  checkInInstructions: string;
  checkOutInstructions: string;
  extraInfo: string;
}

export interface PropertyProfile {
  id?: string;
  name: string;
  displayName?: string;
  description?: string;
  tagline?: string;

  address: string;
  city: string;
  state?: string;
  country: string;
  postalCode?: string;
  googleMapsUrl?: string;

  phone: string;
  email: string;
  website: string;

  // Social Media URLs (mapped to email templates)
  socialFacebook?: string;
  socialInstagram?: string;
  socialX?: string;

  // Review & Business Listing URLs
  tripAdvisorUrl?: string;
  googleBusinessUrl?: string;

  // Reply-to email for guest communications (if different from property contact email)
  replyToEmail?: string;

  // Point of Contact
  contactPersonName?: string;
  contactPersonRole?: string;
  contactPersonPhone?: string;
  contactPersonEmail?: string;
  contactPersonWhatsapp?: string;

  checkInTime: string;
  checkOutTime: string;
  currency: string;
  timezone: string;
  languages?: string[];

  logo?: string;

  // Property type & positioning
  propertyType?: string;
  starRating?: number;
  guestPersona?: string[];
  experienceStyle?: string[];
  uniqueSellingPoints?: string[];

  // Facilities
  wifiAvailable?: boolean;
  parkingAvailable?: boolean;
  restaurantAvailable?: boolean;
  barAvailable?: boolean;
  poolAvailable?: boolean;
  powerBackup?: boolean;
  has24hrReception?: boolean;
  currencyExchange?: boolean;
  conciergeService?: boolean;
  indoorGames?: boolean;
  outdoorSpaces?: boolean;
  wildlifeExperience?: boolean;

  // Dynamic public amenities (IDs from platform config amenities with type='public')
  publicAmenities?: string[];

  // Guest policy quick-flags (detail lives in PropertyPolicies)
  petsAllowed?: boolean;
  smokingAllowed?: boolean;
  partiesAllowed?: boolean;
  wheelchairAccessible?: boolean;
  paymentMethods?: string[];

  // Activities & Social
  activities?: string[];
  socialEvents?: string[];
  nearbyAttractions?: string[];

  taxConfig?: TaxConfig;
  invoiceConfig?: InvoiceConfig;
  policies?: PropertyPolicies;

  /** OTA inventory lock TTL in minutes (default: 5) */
  otaLockTtlMinutes?: number;
  /** How often (in seconds) the Room Availability dashboard polls for lock status (default: 60) */
  lockRefreshIntervalSeconds?: number;
}

export interface InvoiceConfig {
  stayPrefix: string;      // e.g. "INV-STAY"
  posPrefix: string;       // e.g. "INV-POS"
  nextStayNumber: number;  // auto-incrementing
  nextPosNumber: number;
  footerText: string;      // e.g. "Thank you for staying with us!"
  termsAndConditions: string;
  showLogo: boolean;
  showPropertyAddress: boolean;
  showTaxBreakdown: boolean;
}

export interface TaxConfig {
  taxSystem: 'gst' | 'vat' | 'none';
  stayTaxRate: number;
  foodTaxRate: number;
  alcoholTaxRate: number;
  serviceTaxRate: number;
  taxRegistrationNumber: string;
  taxLabel: string; // e.g. "GST", "VAT", "Tax"
  showTaxBreakdown: boolean;
  // GST-specific
  cgstRate?: number;
  sgstRate?: number;
  igstRate?: number;
  // Separate tax registration for bar/alcohol (some resorts have different GSTIN for bar)
  barTaxRegistrationNumber?: string;
  barTaxLabel?: string; // e.g. "Bar GST" — shown on bar invoices
  // Separate tax registration for food (if different from stay)
  foodTaxRegistrationNumber?: string;
  foodTaxLabel?: string;
}

export interface RoomDetail {
  id: string;
  name: string;
  type: string;
  beds: number;
  maxOccupancy: number;
  basePrice: number;
  size: number;
  description: string;
  images: string[];
  videoUrl?: string;
  amenities: string[];
  otaVisible: boolean;
}

export interface MealPlanDetail {
  id: string;
  name: string;
  type?: 'EP' | 'CP' | 'MAP' | 'AP' | 'custom';
  price: number;
  description: string;
  image: string;
  includedItems: string[];
  dietaryOptions: string[];
  servingTimes: { [key: string]: string };
  otaVisible: boolean;
  enabled?: boolean;
}

export interface POSItemDetail {
  id: string;                    // product_id
  name: string;
  russianName?: string;
  categoryId?: string;           // category_id — links to a category record
  category: string;              // category_name
  subcategoryId?: string;        // subcategory_id — links to a subcategory record
  subcategory?: string;          // subcategory_name
  price: number;
  unit?: string;                 // e.g. "piece", "plate", "glass", "bottle", "portion"
  description: string;
  image: string;                 // image_url
  available: boolean;
  dietaryInfo: string[];         // diet_flag — e.g. ["veg","vegan","jain"]
  preparationTime: number;       // prep_time in minutes
  ingredients: string;
  allergens: string[];           // e.g. ["gluten","dairy","nuts"]
  printerStation?: string;       // printer_station — kitchen, bar, dessert, etc.
}

export interface ChargeCategoryDetail {
  id: string;
  name: string;
  defaultAmount: number;
  description: string;
  icon: string;
  taxable: boolean;
  category: string;
  autoApply: boolean;
}

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  department?: string;
  status?: 'active' | 'inactive' | 'on-leave';
  joinedAt?: string;
  blocked?: boolean;
}

export interface Guest {
  id: string;
  propertyId?: string;
  name: string;
  email: string;
  phone: string;
  nationality: string;
  idType: string;
  idNumber: string;
  currentBooking?: {
    id: string;
    room: string;
    checkIn: string;
    checkOut: string;
    status: 'checked-in' | 'confirmed' | 'checked-out';
  };
  totalStays: number;
  totalSpent: number;
  lastVisit: string;
  status: 'active' | 'past' | 'upcoming';
  tags?: string[];
}

export interface Booking {
  id: string;
  propertyId?: string; // Tenant Isolation
  bookingDate: string;
  checkIn: string;
  checkOut: string;
  guestName: string;
  guestEmail?: string;
  guestAvatar: string;
  roomBed: string;
  nights: number;
  status: 'confirmed' | 'checked-in' | 'checked-out' | 'pending' | 'cancelled';
  folio: number;
  roomType: 'dorm' | 'private';
  date: Date;
  channel?: string;
  totalAmount: number;
  paidAmount?: number;
  roomId?: string; 
  bedId?: string;
  mealPlanId?: string;  
}

export interface RoomInventory {
  id: string;
  propertyId?: string; // Tenant Isolation
  roomId: string; // Alias for id
  number: string;
  roomNumber: string; // Alias for number
  name: string;
  type: 'private' | 'dorm';
  roomType: 'private' | 'dorm'; // Alias for type
  roomTypeId: string; // Links to RoomDetail
  floor: string;
  status: 'available' | 'occupied' | 'maintenance' | 'cleaning';
  beds: Array<{
    bedNumber: number;
    status: 'available' | 'occupied' | 'cleaning' | 'confirmed';
    guestName?: string;
    guestId?: string;
    bookingId?: string;
    checkOut?: string;
    price?: number; // Price per bed
  }>;
}

export interface CurrentUser {
  name: string;
  email: string;
  role: string;
  avatar: string;
  phone?: string;
  bio?: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  amount: number;
  quantity: number;
  category: 'stay' | 'service' | 'pos' | 'other';
  date: string;
}

export interface Invoice {
  id: string;
  propertyId?: string;
  bookingId: string;
  guestId?: string;
  items: InvoiceItem[];
  totalAmount: number;
  paidAmount: number;
  status: 'paid' | 'pending' | 'partial' | 'cancelled';
  type?: 'stay' | 'pos' | 'service';
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

// Initial Data
const initialPropertyProfile: PropertyProfile = {
  id: '',
  name: '',
  address: '',
  city: '',
  country: '',
  phone: '',
  email: '',
  website: '',
  checkInTime: '14:00',
  checkOutTime: '11:00',
  currency: 'INR',
  timezone: 'UTC',
  logo: '',
};

const initialCurrentUser: CurrentUser = {
  name: '',
  email: '',
  role: '',
  avatar: '',
};

export interface ManualCharge {
  id: string;
  name: string;
  categoryId: string;
  amount: number;
  description?: string;
  date: string;
  status?: 'pending' | 'applied' | 'cancelled';
}

export interface POSCategoryDetail {
  id: string;
  name: string;
  description?: string;
}

export interface POSDietaryDetail {
  id: string;
  name: string;
  label: string;
  color: string;
}

export interface POSUnitDetail {
  id: string;
  name: string;
  label: string;
}

export interface StaffRoleDetail {
  id: string;
  name: string;
  permissions: string[];
}

export interface RoomTypeDetail {
  id: string;
  name: string;
  capacity: number;
  basePrice: number;
  description?: string;
}

export interface AmenityDetail {
  id: string;
  name: string;
  icon?: string;
  category: 'Public' | 'Room';
  applicability: 'All' | 'All Rooms' | 'Private Rooms' | 'Dorms' | 'Selected Rooms';
}

// Context Type
interface PropertyDataContextType {
  propertyProfile: PropertyProfile;
  rooms: RoomDetail[];
  mealPlans: MealPlanDetail[];
  posItems: POSItemDetail[];
  chargeCategories: ChargeCategoryDetail[];
  manualCharges: ManualCharge[];
  posCategories: POSCategoryDetail[];
  posDietaryInfo: POSDietaryDetail[];
  posUnits: POSUnitDetail[];
  staffRoles: StaffRoleDetail[];
  roomTypes: RoomTypeDetail[];
  amenities: AmenityDetail[];
  staffMembers: StaffMember[];
  guests: Guest[];
  bookings: Booking[];
  roomInventory: RoomInventory[];
  invoices: Invoice[];
  pricingRules: PricingRule[];
  otaChannels: OTAChannel[];
  paymentGateways: PaymentGateway[];
  webhookUrl: string;
  currentUser: CurrentUser;
  
  updateProfile: (profile: Partial<PropertyProfile>) => void;
  updateCurrentUser: (updates: Partial<CurrentUser>) => Promise<void>;
  
  // CRUD Operations
  addRoom: (room: RoomDetail) => Promise<RoomDetail | void>;
  updateRoom: (id: string, room: Partial<RoomDetail>) => Promise<void>;
  deleteRoom: (id: string) => Promise<void>;
  
  addMealPlan: (plan: MealPlanDetail) => Promise<void>;
  updateMealPlan: (id: string, plan: Partial<MealPlanDetail>) => Promise<void>;
  deleteMealPlan: (id: string) => Promise<void>;
  
  addPOSItem: (item: POSItemDetail) => Promise<void>;
  updatePOSItem: (id: string, item: Partial<POSItemDetail>) => Promise<void>;
  deletePOSItem: (id: string) => Promise<void>;
  
  addChargeCategory: (charge: ChargeCategoryDetail) => Promise<void>;
  updateChargeCategory: (id: string, charge: Partial<ChargeCategoryDetail>) => Promise<void>;
  deleteChargeCategory: (id: string) => Promise<void>;

  addManualCharge: (charge: ManualCharge) => Promise<void>;
  updateManualCharge: (id: string, charge: Partial<ManualCharge>) => Promise<void>;
  deleteManualCharge: (id: string) => Promise<void>;

  addPOSCategory: (category: POSCategoryDetail) => Promise<void>;
  updatePOSCategory: (id: string, category: Partial<POSCategoryDetail>) => Promise<void>;
  deletePOSCategory: (id: string) => Promise<void>;

  addPOSDietary: (dietary: POSDietaryDetail) => Promise<void>;
  updatePOSDietary: (id: string, dietary: Partial<POSDietaryDetail>) => Promise<void>;
  deletePOSDietary: (id: string) => Promise<void>;

  addPOSUnit: (unit: POSUnitDetail) => Promise<void>;
  updatePOSUnit: (id: string, unit: Partial<POSUnitDetail>) => Promise<void>;
  deletePOSUnit: (id: string) => Promise<void>;

  addStaffRole: (role: StaffRoleDetail) => Promise<void>;
  updateStaffRole: (id: string, role: Partial<StaffRoleDetail>) => Promise<void>;
  deleteStaffRole: (id: string) => Promise<void>;

  addRoomType: (type: RoomTypeDetail) => Promise<void>;
  updateRoomType: (id: string, type: Partial<RoomTypeDetail>) => Promise<void>;
  deleteRoomType: (id: string) => Promise<void>;

  addAmenity: (amenity: AmenityDetail) => Promise<void>;
  updateAmenity: (id: string, amenity: Partial<AmenityDetail>) => Promise<void>;
  deleteAmenity: (id: string) => Promise<void>;
  
  addStaffMember: (staff: StaffMember) => Promise<void>;
  updateStaffMember: (id: string, staff: Partial<StaffMember>) => Promise<void>;
  deleteStaffMember: (id: string) => Promise<void>;
  
  addGuest: (guest: Guest) => Promise<void>;
  updateGuest: (id: string, guest: Partial<Guest>) => Promise<void>;
  deleteGuest: (id: string) => Promise<void>;
  
  // Bookings & Locks
  acquireLock: (payload: LockPayload) => Promise<LockResponse>;
  addBooking: (booking: Booking, lockId?: string) => Promise<void>;
  updateBooking: (id: string, booking: Partial<Booking>) => Promise<void>;
  deleteBooking: (id: string) => Promise<void>;
  
  addRoomInventory: (room: RoomInventory) => Promise<RoomInventory | void>;
  updateRoomInventory: (id: string, room: Partial<RoomInventory>) => Promise<void>;
  deleteRoomInventory: (id: string) => Promise<void>;
  
  addInvoice: (invoice: Invoice) => Promise<void>;
  updateInvoice: (id: string, invoice: Partial<Invoice>) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
  
  addPricingRule: (rule: PricingRule) => Promise<void>;
  updatePricingRule: (id: string, rule: Partial<PricingRule>) => Promise<void>;
  deletePricingRule: (id: string) => Promise<void>;
  
  addOTAChannel: (channel: OTAChannel) => Promise<void>;
  updateOTAChannel: (id: string, channel: Partial<OTAChannel>) => Promise<void>;
  deleteOTAChannel: (id: string) => Promise<void>;
  
  updatePaymentGateway: (id: string, gateway: Partial<PaymentGateway>) => Promise<void>;
  
  kots: any[];
  posStock: any[];
  updateKOT: (id: string, updates: any) => Promise<void>;
  updatePOSStock: (itemId: string, updates: any) => Promise<void>;
  
  isLoading: boolean;
  syncStage: 'auth' | 'fetching' | 'processing' | 'done';
  isCachedLoad: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  ensureLoaded: () => Promise<void>;
}

const PropertyDataContext = createContext<PropertyDataContextType | undefined>(undefined);

// ─── Batch-sync localStorage cache (avoids full-screen spinner on return visits) ───
const BATCH_CACHE_KEY = 'stayweb_batch_cache';
const BATCH_CACHE_TTL = 30 * 60 * 1000; // 30 minutes

function getCachedBatchData(): any | null {
  try {
    const raw = localStorage.getItem(BATCH_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - (parsed._cachedAt || 0) > BATCH_CACHE_TTL) {
      localStorage.removeItem(BATCH_CACHE_KEY);
      return null;
    }
    return parsed;
  } catch { return null; }
}

function setCachedBatchData(data: any) {
  try {
    localStorage.setItem(BATCH_CACHE_KEY, JSON.stringify({ ...data, _cachedAt: Date.now() }));
  } catch { /* storage full — non-fatal */ }
}

/**
 * Invalidate the batch cache so the next page load fetches fresh data.
 * Must be called after every successful CRUD mutation to prevent stale-cache bugs
 * where changes vanish on refresh because the cache was saved before the mutation.
 */
function invalidateBatchCache() {
  try { localStorage.removeItem(BATCH_CACHE_KEY); } catch { /* noop */ }
}

export function PropertyDataProvider({ children, isAdmin }: { children: ReactNode; isAdmin?: boolean }) {
  const { hkTaskTypes: platformHKTaskTypes, hkPriorities: platformHKPriorities } = usePlatformConfig();
  const [isLoading, setIsLoading] = useState(true);
  const [syncStage, setSyncStage] = useState<'auth' | 'fetching' | 'processing' | 'done'>('auth');
  const [isCachedLoad, setIsCachedLoad] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ─── Tenant Binding: propertyId ref is set ONCE on load, before any writes ───
  // Restore cached propertyId immediately to prevent race conditions on refresh
  const cachedPropertyId = (() => {
    try { return localStorage.getItem('stayweb_property_id') || null; } catch { return null; }
  })();
  const propertyIdRef = useRef<string | null>(cachedPropertyId);
  const dataLoadedRef = useRef(false);

  /**
   * Returns the resolved propertyId or throws.
   * Every write operation MUST call this instead of inlining `propertyProfile.id || 'default-prop'`.
   */
  const getPropertyId = (): string => {
    const id = propertyIdRef.current || propertyProfile.id;
    if (!id) {
      throw new Error('Property ID not loaded yet. Please wait for data to finish loading before making changes.');
    }
    return id;
  };

  const [propertyProfile, setPropertyProfile] = useState<PropertyProfile>(initialPropertyProfile);
  const [rooms, setRooms] = useState<RoomDetail[]>([]);
  const [mealPlans, setMealPlans] = useState<MealPlanDetail[]>([]);
  const [posItems, setPosItems] = useState<POSItemDetail[]>([]);
  const [chargeCategories, setChargeCategories] = useState<ChargeCategoryDetail[]>([]);
  const [manualCharges, setManualCharges] = useState<ManualCharge[]>([]);
  const [posCategories, setPosCategories] = useState<POSCategoryDetail[]>([]);
  const [posDietaryInfo, setPosDietaryInfo] = useState<POSDietaryDetail[]>([]);
  const [posUnits, setPosUnits] = useState<POSUnitDetail[]>([]);
  const [staffRoles, setStaffRoles] = useState<StaffRoleDetail[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomTypeDetail[]>([]);
  const [amenities, setAmenities] = useState<AmenityDetail[]>([]);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rawRoomInventory, setRawRoomInventory] = useState<RoomInventory[]>([]);

  // Derived Room Inventory based on bookings + housekeeping status
  const roomInventory = useMemo(() => {
    return rawRoomInventory.map(room => {
      // Find active bookings for this room
      const activeBookings = bookings.filter(b => 
        b.roomId === room.id && 
        (b.status === 'checked-in' || b.status === 'confirmed')
      );

      // Start with the stored room status (includes HK statuses from KV)
      let roomStatus: 'available' | 'occupied' | 'maintenance' | 'cleaning' = room.status;

      // Update bed statuses based on bookings
      const updatedBeds = room.beds.map(bed => {
        const booking = activeBookings.find(b => 
          b.bedId === bed.bedNumber.toString() || 
          (!b.bedId && bed.bedNumber === 1)
        );

        let bedStatus: 'available' | 'occupied' | 'cleaning' | 'confirmed' = 'available';
        if (booking) {
          if (booking.status === 'confirmed') bedStatus = 'confirmed';
          else bedStatus = 'occupied';
        }

        return {
          ...bed,
          status: bedStatus,
          guestName: booking?.guestName,
          guestId: booking?.guestName,
          bookingId: booking?.id
        };
      });

      // Only derive occupancy status if the room is NOT in a housekeeping state
      // Housekeeping statuses (cleaning, maintenance) take priority over booking-derived status
      if (roomStatus !== 'cleaning' && roomStatus !== 'maintenance') {
        if (updatedBeds.every(b => b.status === 'occupied')) {
          roomStatus = 'occupied';
        } else if (updatedBeds.some(b => b.status === 'occupied' || b.status === 'confirmed')) {
          if (room.type === 'private') {
            roomStatus = 'occupied';
          }
        }
      }

      return {
        ...room,
        status: roomStatus,
        beds: updatedBeds
      };
    });
  }, [rawRoomInventory, bookings]);

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([]);
  const [otaChannels, setOtaChannels] = useState<OTAChannel[]>([]);
  const [paymentGateways, setPaymentGateways] = useState<PaymentGateway[]>([]);
  const [kots, setKots] = useState<any[]>([]);
  const [posStock, setPosStock] = useState<any[]>([]);
  const [webhookUrl] = useState(defaultWebhookUrl);
  const [currentUser, setCurrentUser] = useState<CurrentUser>(initialCurrentUser);

  // ─── AbortController: cancel in-flight batch-sync when a new request starts ───
  // Prevents "Http: connection closed before message completed" Deno errors
  // caused by orphaned server responses writing to dead sockets.
  const batchAbortRef = useRef<AbortController | null>(null);

  // ─── Debounced profile save: prevents spamming the server on every keystroke ───
  const profileSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingProfileRef = useRef<PropertyProfile | null>(null);
  const lastUserIdRef = useRef<string | null>(null);

  const flushProfileSave = useCallback(async () => {
    if (pendingProfileRef.current) {
      // Guard: don't attempt save if there's no active session
      let hasSession = false;
      try {
        const { data: { session } } = await supabase.auth.getSession();
        hasSession = !!session?.access_token;
      } catch {
        // supabase.auth may throw — treat as no session
      }
      if (!hasSession) {
        console.warn('[Profile] Skipping debounced save — no active session');
        return;
      }
      const toSave = pendingProfileRef.current;
      pendingProfileRef.current = null;
      try {
        await apiClient.fetch('/property-profile', {
          method: 'PUT',
          body: JSON.stringify(toSave)
        });
        invalidateBatchCache();
      } catch (err: any) {
        // Don't log noise for auth errors — the user is likely logging out
        if (err.status !== 401) {
          console.error('[Profile] Debounced save failed:', err);
        }
      }
    }
  }, []);

  const fetchWithAuthCheck = useCallback(async (endpoint: string, fallback: any) => {
    try {
      return await apiClient.fetch(endpoint);
    } catch (e: any) {
      if (e.message === 'Unauthorized' || e.status === 401) {
         throw e; // Stop the entire refresh process
      }
      // NO_TENANT (403) — stop loading, let AuthContext handle the block
      if (e.status === 403) {
        console.warn(`[StayWeb] 403 on ${endpoint} — likely no tenant. AuthContext will handle.`);
        throw e;
      }
      console.error(`${endpoint} fetch failed`, e);
      return fallback;
    }
  }, []);

  // Fetch all data from API — uses single /batch-sync endpoint for performance
  // If preloadedBatch is provided, skip the network call (used for instant cache load)
  const refreshData = async (background = false, preloadedBatch?: any) => {
    try {
      if (!background) {
        setIsLoading(true);
        setSyncStage('auth');
      }
      setError(null);
      
      // ─── Use deduplicated getInitialSession() — with 10s timeout protection ───
      // getSession() waits for Supabase auth state machine to initialize
      // (network call on first load). If it hangs (lock contention, unreachable
      // auth service), the timeout rejects so we don't stay in isLoading=true forever.
      let session: any = null;
      try {
        const result = await getInitialSession();
        session = result?.data?.session;
      } catch (authErr: any) {
        console.error('[StayWeb] supabase.auth.getSession() threw:', authErr?.message || authErr);
        // Reset the cached promise so the next retry makes a fresh getSession() call
        // (important when the cached promise itself timed out / is permanently rejected)
        resetSessionCache();
        // If we have preloaded cache data, continue without session (will apply cached state)
        if (!preloadedBatch) {
          startTransition(() => { setIsLoading(false); });
          setError('Authentication service unavailable. Please refresh the page or log in again.');
          return;
        }
      }
      
      // ─── CRITICAL: If no session and no cache, bail early.
      if (!session?.user && !preloadedBatch) {
        console.log('[StayWeb] No active session — skipping data load (waiting for auth)');
        startTransition(() => { setIsLoading(false); });
        return;
      }

      // ─── Verify the token is still alive before firing the batch request (skip for cache loads) ───
      const expiresAt = session?.expires_at;
      const now = Math.floor(Date.now() / 1000);
      if (!preloadedBatch && expiresAt && now >= expiresAt - 60) {
        console.log('[StayWeb] Session token expired/expiring, attempting refresh before data load...');
        try {
          const { data: refreshed, error: refreshErr } = await supabase.auth.refreshSession();
          if (refreshErr || !refreshed.session) {
            console.warn('[StayWeb] Token refresh failed — signing out to clear dead session');
            try { await supabase.auth.signOut({ scope: 'local' }); } catch { /* noop */ }
            startTransition(() => { setIsLoading(false); });
            setError('Session expired. Please log in again.');
            return;
          }
          session = refreshed.session;
          console.log('[StayWeb] Token refreshed successfully, proceeding with data load');
        } catch (refreshErr: any) {
          console.error('[StayWeb] supabase.auth.refreshSession() threw:', refreshErr?.message || refreshErr);
          try { await supabase.auth.signOut({ scope: 'local' }); } catch { /* noop */ }
          startTransition(() => { setIsLoading(false); });
          setError('Session refresh failed. Please log in again.');
          return;
        }
      }
      
      // ─── PERF: Single /batch-sync request replaces 25+ parallel API calls ───
      if (!background) setSyncStage('fetching');
      const batchStartTime = performance.now();
      let batchData: any;
      if (preloadedBatch) {
        batchData = preloadedBatch;
        console.log('[StayWeb] Using preloaded batch data (cache hit)');
      } else {
        // Cancel any in-flight batch-sync request before starting a new one
        // This prevents orphaned responses that cause server-side "connection closed" errors
        if (batchAbortRef.current) {
          batchAbortRef.current.abort();
        }
        const abortController = new AbortController();
        batchAbortRef.current = abortController;
        try {
          batchData = await apiClient.fetch('/batch-sync', { signal: abortController.signal });
        } catch (e: any) {
          // If this request was aborted because a newer one replaced it, silently bail
          if (e.name === 'AbortError' || e.message?.includes('aborted') || abortController.signal.aborted) {
            console.log('[StayWeb] batch-sync request superseded by a newer call — ignoring');
            return;
          }
          // Re-throw auth/tenant errors for the outer catch to handle
          throw e;
        } finally {
          // Clear ref if this is still the active controller
          if (batchAbortRef.current === abortController) {
            batchAbortRef.current = null;
          }
        }
        // Cache the batch response for instant load on next visit
        setCachedBatchData(batchData);
      }
      const batchDuration = Math.round(performance.now() - batchStartTime);
      if (!background) setSyncStage('processing');

      // Destructure the batch response
      const {
        me: meData,
        properties: propertiesData,
        propertyProfile: profileData,
        mealPlans: mealPlansData,
        posItems: posItemsData,
        chargeCategories: chargeCategoriesData,
        manualCharges: manualChargesData,
        posCategories: posCategoriesData,
        posDietary: posDietaryData,
        posUnits: posUnitsData,
        staffRoles: staffRolesData,
        roomTypes: roomTypesListData,
        amenities: amenitiesData,
        staff: staffData,
        guests: guestsData,
        bookings: bookingsData,
        invoices: invoicesData,
        pricingRules: pricingRulesData,
        otaChannels: otaChannelsData,
        paymentGateways: paymentGatewaysData,
        kots: kotsData,
        posStock: posStockData,
        roomInventory: roomInventoryKvData,
        roomDetails: roomTypesData,
        userProfile: userProfileData,
        platformConfig: platformConfigData,
      } = batchData;

      // Set current user from /core/me + session metadata
      if (session?.user) {
        lastUserIdRef.current = session.user.id;
        console.log(`[StayWeb] Session active for: ${session.user.email} (uid: ${session.user.id})`);
        setCurrentUser({
          name: session.user.user_metadata?.name || session.user.email || 'User',
          email: session.user.email || '',
          role: meData?.roles?.[0]?.name || 'owner',
          avatar: session.user.user_metadata?.avatar_url || ''
        });
      }

      // Resolve property ID from batch response
      let currentPropertyId: string | null = null;
      const roomsData = roomInventoryKvData || [];

      if (propertiesData && propertiesData.length > 0) {
        currentPropertyId = propertiesData[0].id;
        console.log(`[StayWeb] Bound to property: ${currentPropertyId} (name: ${propertiesData[0].name})`);
        propertyIdRef.current = currentPropertyId;
        try { localStorage.setItem('stayweb_property_id', currentPropertyId); } catch { /* noop */ }
      }

      console.log(`[StayWeb] BatchSync completed in ${batchDuration}ms — rooms: ${(roomTypesData || []).length}, inventory: ${roomsData.length}, pos: ${(posItemsData || []).length}, guests: ${(guestsData || []).length}, bookings: ${(bookingsData || []).length}, staff: ${(staffData || []).length}`);

      // ─── Hydrate Platform Config from backend → localStorage ───
      // This ensures platform config (SuperAdmin catalogue) is available to all
      // components via usePlatformConfig() even if set on a different device/browser.
      if (platformConfigData && typeof platformConfigData === 'object') {
        const pcKeys = Object.keys(platformConfigData);
        let hydrated = 0;
        for (const key of pcKeys) {
          if (key.startsWith('admin_cfg_') && Array.isArray(platformConfigData[key])) {
            try {
              localStorage.setItem(key, JSON.stringify(platformConfigData[key]));
              hydrated++;
            } catch { /* localStorage full — non-fatal */ }
          }
        }
        if (hydrated > 0) {
          console.log(`[StayWeb] Hydrated ${hydrated} platform config sections from backend`);
          // Fire 'platform-config-hydrated' (NOT 'platform-config-changed')
          // so useLocalList hooks re-read from localStorage WITHOUT triggering
          // a re-sync back to the server (which could overwrite with stale data)
          window.dispatchEvent(new CustomEvent('platform-config-hydrated'));
        }
      }

      // Map Staff Roles
      setStaffRoles(Array.isArray(staffRolesData) ? staffRolesData : []);
      setManualCharges(Array.isArray(manualChargesData) ? manualChargesData : []);
      setPosCategories(Array.isArray(posCategoriesData) ? posCategoriesData : []);
      setPosDietaryInfo(Array.isArray(posDietaryData) ? posDietaryData : []);
      setPosUnits(Array.isArray(posUnitsData) ? posUnitsData : []);
      setRoomTypes(Array.isArray(roomTypesListData) ? roomTypesListData : []);
      setAmenities(Array.isArray(amenitiesData) ? amenitiesData : []);

      // Map Guests to include Current Booking
      const activeBookings = (bookingsData || []).filter((b: any) => 
        b.status === 'checked-in' || b.status === 'confirmed'
      );
      
      const mappedGuests = (Array.isArray(guestsData) ? guestsData : []).map((guest: any) => {
        // Handle both snake_case (DB) and camelCase keys
        const currentBooking = activeBookings.find((b: any) => {
           const bookingGuestId = b.guestId || b.guest_id;
           return bookingGuestId === guest.id;
        });
        
        // Ensure defaults for numeric fields to prevent UI crashes
        const safeGuest = {
            ...guest,
            totalStays: guest.totalStays || 0,
            totalSpent: guest.totalSpent || 0
        };
        
        if (currentBooking) {
            // Find room number
            const bookingRoomId = currentBooking.roomId || currentBooking.room_id;
            const roomInv = (roomsData || []).find((r: any) => r.id === bookingRoomId);
            const roomNumber = roomInv ? (roomInv.room_number || roomInv.roomNumber || roomInv.number || 'Unknown') : 'Unknown';
            
            return {
                ...safeGuest,
                status: 'active', // Force active if they have a booking
                currentBooking: {
                    id: currentBooking.id,
                    room: roomNumber,
                    checkIn: currentBooking.checkIn || currentBooking.checkin_date,
                    checkOut: currentBooking.checkOut || currentBooking.checkout_date,
                    status: currentBooking.status
                }
            };
        }
        return safeGuest;
      });

      // Update State — merge BOTH data sources: profileData (full KV profile) + propertiesData (core API overlay)
      // profileData is the authoritative source for ALL profile fields
      // propertiesData supplements with property ID binding for tenant isolation
      if (profileData && typeof profileData === 'object' && Object.keys(profileData).length > 0) {
        const merged: any = { ...profileData };
        // If core properties returned data, bind the property ID
        if (propertiesData && propertiesData.length > 0) {
          const p = propertiesData[0];
          merged.id = merged.id || p.id || 'default-property';
        }
        setPropertyProfile(merged);
      } else if (propertiesData && propertiesData.length > 0) {
        // Fallback: no KV profile yet, bootstrap from core properties
        const p = propertiesData[0];
        setPropertyProfile(prev => ({
          ...prev,
          id: p.id,
          name: p.name,
          address: p.address,
          city: p.city,
          country: p.country,
          checkInTime: p.checkin_time,
          checkOutTime: p.checkout_time
        }));
      }

      if (roomTypesData && roomTypesData.length > 0) {
        const mappedRooms = roomTypesData.map((rt: any) => ({
          id: rt.id,
          name: rt.name,
          type: rt.type || (rt.name.toLowerCase().includes('dorm') ? 'dorm' : 'private'),
          beds: rt.capacity || rt.beds,
          maxOccupancy: rt.capacity || rt.maxOccupancy,
          basePrice: rt.basePrice || rt.base_price || 0,
          size: rt.size || 0,
          description: rt.description || '',
          images: rt.images || [],
          amenities: rt.amenities || [],
          otaVisible: rt.otaVisible !== false
        }));
        setRooms(mappedRooms);
      } else {
        setRooms([]);
      }

      // ── Build room inventory from room-details (source of truth) ──
      // Room-details define every physical room. KV room-inventory entries are
      // used ONLY for status overrides (housekeeping, bed assignments, etc.).
      // This prevents stale/orphan KV entries from inflating the room count.
      const kvRoomInventory = Array.isArray(roomInventoryKvData) ? roomInventoryKvData : [];
      const roomDetailsList = Array.isArray(roomTypesData) ? roomTypesData : [];

      if (roomDetailsList.length > 0) {
        // Build lookup maps for KV inventory entries — index by multiple keys
        // so we can find the matching KV entry regardless of which ID was used
        const kvByKey = new Map<string, any>();
        const kvByRoomNumber = new Map<string, any>();
        for (const kvRoom of kvRoomInventory) {
          if (!kvRoom) continue;
          if (kvRoom.roomId) kvByKey.set(kvRoom.roomId, kvRoom);
          if (kvRoom.roomTypeId) kvByKey.set(kvRoom.roomTypeId, kvRoom);
          if (kvRoom.id) kvByKey.set(kvRoom.id, kvRoom);
          // Also index by deterministic auto-ID pattern
          if (kvRoom.roomId) kvByKey.set(`inv-auto-${kvRoom.roomId}`, kvRoom);
          if (kvRoom.roomTypeId) kvByKey.set(`inv-auto-${kvRoom.roomTypeId}`, kvRoom);
          // Index by roomNumber for fallback matching
          const rNum = (kvRoom.roomNumber || kvRoom.number || kvRoom.room_number || '').toString().toLowerCase().trim();
          if (rNum) kvByRoomNumber.set(rNum, kvRoom);
        }

        const usedKvEntries = new Set<string>();
        const mappedInventory = roomDetailsList.map((rt: any) => {
          // Find matching KV entry for this room-detail — skip already-claimed entries
          const findKv = () => {
            const candidates = [
              kvByKey.get(rt.id),
              kvByKey.get(`inv-auto-${rt.id}`),
              (() => {
                const numFromName = (rt.name || '').replace(/[^0-9]/g, '').toLowerCase().trim();
                return numFromName ? kvByRoomNumber.get(numFromName) : null;
              })(),
            ];
            for (const c of candidates) {
              if (c && !usedKvEntries.has(c.id)) return c;
            }
            return null;
          };
          const kvEntry = findKv();
          if (kvEntry) usedKvEntries.add(kvEntry.id);

          const capacity = rt.capacity || rt.beds || 1;
          const basePrice = rt.base_price || rt.basePrice || 0;
          const roomNum = kvEntry?.roomNumber || kvEntry?.number || rt.name?.replace(/[^0-9]/g, '') || '';
          const derivedType = rt.type || (rt.name?.toLowerCase().includes('dorm') ? 'dorm' : 'private');

          // Find active bookings for this room
          const activeBookingsForRoom = (bookingsData || []).filter((b: any) => 
            (b.room_id === rt.id || b.roomId === rt.id || (kvEntry && b.room_id === kvEntry.id)) && 
            (b.status === 'checked-in' || b.status === 'confirmed')
          );

          // Build beds array — prefer KV-stored bed statuses, fall back to booking-derived
          const kvBeds = kvEntry?.beds;
          const beds = Array.from({ length: capacity }, (_, i) => {
            const bedNumber = i + 1;
            // If KV has bed data, use it (preserves housekeeping statuses)
            if (Array.isArray(kvBeds) && kvBeds[i]) {
              return {
                bedNumber,
                status: kvBeds[i].status || 'available',
                guestName: kvBeds[i].guestName,
                guestId: kvBeds[i].guestId,
                bookingId: kvBeds[i].bookingId,
                checkOut: kvBeds[i].checkOut,
                price: kvBeds[i].price || basePrice,
              };
            }
            // Otherwise derive from bookings
            const booking = activeBookingsForRoom.find((b: any) => 
              b.bed_id === bedNumber.toString() || (!b.bed_id && i === 0)
            );
            return {
              bedNumber,
              status: booking ? (booking.status === 'confirmed' ? 'confirmed' : 'occupied') : 'available',
              guestName: booking?.guest_name,
              guestId: booking?.guest_id,
              bookingId: booking?.id,
              price: basePrice,
            };
          });

          // Housekeeping status from KV override
          const hkStatus = kvEntry?.status || 'available';
          const invId = kvEntry?.id || `inv-auto-${rt.id}`;

          return {
            id: invId,
            roomId: rt.id,
            number: roomNum,
            roomNumber: roomNum,
            name: rt.name || `Room ${roomNum}`,
            type: derivedType,
            roomType: derivedType,
            roomTypeId: rt.id,
            floor: kvEntry?.floor || '1',
            status: hkStatus,
            beds: beds as any[],
            price: kvEntry?.price || basePrice || 0,
            gender: kvEntry?.gender || 'mixed',
            amenities: kvEntry?.amenities || rt.amenities || [],
            mealPlans: kvEntry?.mealPlans || [],
          };
        });

        // Deduplicate by id — if two room-details resolved to the same KV entry,
        // only keep the first and assign a unique fallback ID to the rest
        const seenIds = new Set<string>();
        const deduplicatedInventory = mappedInventory.map((inv: any) => {
          if (!seenIds.has(inv.id)) {
            seenIds.add(inv.id);
            return inv;
          }
          // Collision: give it a unique deterministic ID based on its roomTypeId
          const uniqueId = `inv-auto-${inv.roomTypeId || inv.roomId}`;
          if (!seenIds.has(uniqueId)) {
            seenIds.add(uniqueId);
            return { ...inv, id: uniqueId };
          }
          // Final fallback: append random suffix
          const fallbackId = `inv-auto-${inv.roomTypeId || inv.roomId}-${Math.random().toString(36).slice(2, 7)}`;
          seenIds.add(fallbackId);
          return { ...inv, id: fallbackId };
        });

        console.log(`[StayWeb] Built ${deduplicatedInventory.length} inventory items from ${roomDetailsList.length} room-details (${kvRoomInventory.length} KV entries used for overrides)`);
        setRawRoomInventory(deduplicatedInventory as any[]);

        // Background cleanup: if KV has significantly more entries than room-details,
        // trigger server-side purge of orphan room-inventory entries
        if (kvRoomInventory.length > roomDetailsList.length + 2) {
          console.log(`[Dedup] KV has ${kvRoomInventory.length} room-inventory entries but only ${roomDetailsList.length} room-details — triggering server cleanup...`);
          apiClient.fetch('/room-inventory/deduplicate', { method: 'POST' })
            .then((res: any) => {
              console.log(`[Dedup] Server cleanup complete: removed=${res?.removed}, remaining=${res?.remaining}`);
            })
            .catch((err: any) => {
              console.error(`[Dedup] Server room-inventory cleanup failed:`, err?.message || err);
            });
        }
      } else if (kvRoomInventory.length > 0) {
        // No room-details but KV entries exist — show KV data as fallback
        const fallbackInventory = kvRoomInventory
          .filter((r: any) => r && r.id)
          .map((r: any) => ({
            id: r.id,
            roomId: r.roomId || r.id,
            number: r.roomNumber || r.number || r.room_number || '',
            roomNumber: r.roomNumber || r.number || r.room_number || '',
            name: r.name || `Room ${r.roomNumber || r.number || ''}`,
            type: r.type || r.roomType || 'private',
            roomType: r.type || r.roomType || 'private',
            roomTypeId: r.roomTypeId || r.roomId || r.id,
            floor: r.floor || '1',
            status: r.status || 'available',
            beds: Array.isArray(r.beds) ? r.beds : [],
            price: r.price || 0,
            gender: r.gender || 'mixed',
            amenities: r.amenities || [],
            mealPlans: r.mealPlans || [],
          }));
        // Deduplicate fallback by roomNumber
        const seen = new Set<string>();
        const deduped = fallbackInventory.filter((item: any) => {
          const key = (item.roomNumber || '').toLowerCase().trim();
          if (!key) return true;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
        console.log(`[StayWeb] No room-details found, using ${deduped.length} KV entries as fallback (${kvRoomInventory.length} total)`);
        setRawRoomInventory(deduped as any[]);
      } else {
        setRawRoomInventory([]);
      }

      setMealPlans(Array.isArray(mealPlansData) ? mealPlansData : []);
      
      // Deduplicate POS items by name (case-insensitive), keeping the first (deterministic-ID preferred)
      const rawPosItems = Array.isArray(posItemsData) ? posItemsData : [];
      const seenNames = new Set<string>();
      const dedupedPosItems = rawPosItems.filter((item: any) => {
        const key = (item.name || '').toLowerCase().trim();
        if (!key || seenNames.has(key)) return false;
        seenNames.add(key);
        return true;
      });
      setPosItems(dedupedPosItems);

      // If server has duplicates, trigger a one-time server-side cleanup (fire-and-forget)
      if (rawPosItems.length > dedupedPosItems.length) {
        console.log(`[Dedup] Frontend filtered ${rawPosItems.length - dedupedPosItems.length} duplicate POS items. Triggering server cleanup...`);
        apiClient.fetch('/pos-items/deduplicate', { method: 'POST' }).catch(() => {});
      }

      setChargeCategories(Array.isArray(chargeCategoriesData) ? chargeCategoriesData : []);
      setStaffMembers(Array.isArray(staffData) ? staffData : []);
      setGuests(mappedGuests); // Use mapped guests with booking info

      // ─── Resolve currentUser name: prefer KV user-profile > matching staff member > auth metadata > email ───
      if (session?.user) {
        const userEmail = session.user.email || '';
        const staffList = Array.isArray(staffData) ? staffData : [];
        const matchingStaff = staffList.find((s: any) => s.email?.toLowerCase() === userEmail.toLowerCase());
        
        // User profile already included in batch-sync response (no extra API call needed)
        const kvProfile: any = userProfileData || null;
        
        const userEmailLower = userEmail.toLowerCase().trim();
        const resolvedName = kvProfile?.name || matchingStaff?.name || session.user.user_metadata?.name || userEmail.split('@')[0] || 'User';
        let resolvedRole = matchingStaff?.role || kvProfile?.role || 'owner';
        
        // System admin bypass
        if (userEmailLower === 'admin@wugweb.com') {
          resolvedRole = 'super-admin';
        }

        setCurrentUser({
          name: resolvedName,
          email: userEmail,
          role: resolvedRole,
          avatar: kvProfile?.avatar || session.user.user_metadata?.avatar_url || '',
          phone: kvProfile?.phone || session.user.user_metadata?.phone || '',
          bio: kvProfile?.bio || ''
        });
      }

      // Track whether batch-sync succeeded for retry logic.
      // Mark as loaded on ANY successful response (even empty properties)
      // to prevent unnecessary cold-start retries that re-show the loading screen.
      dataLoadedRef.current = true;
      
      if (bookingsData && Array.isArray(bookingsData)) {
        setBookings(bookingsData.map((b: any) => ({
          id: b.id,
          bookingDate: b.created_at || b.bookingDate || new Date().toISOString(),
          checkIn: b.checkIn || b.checkin_date,
          checkOut: b.checkOut || b.checkout_date,
          guestName: b.guestName || b.guest_name,
          guestEmail: b.guestEmail || b.guest_email || (b.guestName || b.guest_name),
          guestAvatar: '',
          roomId: b.roomId || b.room_id,
          bedId: b.bedId || b.bed_id,
          roomBed: b.roomBed || b.room_bed || ((b.roomId || b.room_id) ? 'Room' : 'Bed'), 
          nights: b.nights || 1, 
          status: b.status,
          folio: b.folio || b.totalAmount || b.total_amount || 0,
          roomType: b.roomType || b.room_type || 'private',
          date: new Date(b.created_at || b.bookingDate || Date.now()),
          channel: b.source || b.channel,
          totalAmount: b.totalAmount || b.total_amount || 0,
          paidAmount: b.paidAmount || b.paid_amount || 0
        })));
      } else {
        setBookings([]);
      }
      
      setInvoices(Array.isArray(invoicesData) ? invoicesData : []);
      setPricingRules(Array.isArray(pricingRulesData) ? pricingRulesData : []);
      setOtaChannels(Array.isArray(otaChannelsData) ? otaChannelsData : []);
      setPaymentGateways(Array.isArray(paymentGatewaysData) ? paymentGatewaysData : []);
      setKots(Array.isArray(kotsData) ? kotsData : []);
      setPosStock(Array.isArray(posStockData) ? posStockData : []);

    } catch (err: any) {
      console.error('Error fetching data:', JSON.stringify({ message: err.message, status: err.status }));

      // Background refreshes should NOT overwrite UI with error banners
      // (cached data is already displayed). Auth errors are the exception — session is dead.
      if (err.message === 'Unauthorized' || err.status === 401) {
        console.warn('[StayWeb] 401 during data load — clearing dead session and redirecting to login.');
        setError('Session expired. Please log in again.');
        try { await supabase.auth.signOut({ scope: 'local' }); } catch { /* noop */ }
      } else if (err.status === 403) {
        console.warn('[StayWeb] 403 during data load — user has no tenant mapping.');
        if (!background) setError('No property mapped to your account. Contact your administrator.');
      } else if (err.status === 0 || err.message?.includes('Network error') || err.message?.includes('Failed to fetch')) {
        // Network errors (cold-start, server down) — show a friendlier message
        if (!background) setError('Unable to reach the server. It may be starting up — please retry in a few seconds.');
        else console.warn('[StayWeb] Background refresh network error (non-fatal):', err.message);
      } else {
        if (!background) setError(err.message || 'Failed to load data.');
        else console.warn('[StayWeb] Background refresh failed (non-fatal):', err.message);
      }
    } finally {
      if (!background) {
        startTransition(() => {
          setIsLoading(false);
          setSyncStage('done');
        });
      }
    }
  };

  useEffect(() => {
    let retryTimeout: ReturnType<typeof setTimeout> | null = null;

    const loadWithRetry = async () => {
      // ─── PERF: Try loading from cache first for instant UI ───
      const cached = getCachedBatchData();
      if (cached && cached.me?.hasTenant !== false) {
        console.log('[StayWeb] Loading from batch cache (instant load)');
        setIsCachedLoad(true);
        try {
          // Apply cached data immediately — no network call, just state processing
          await refreshData(false, cached);
        } catch { /* handled inside refreshData */ }
        setIsCachedLoad(false);
        // Background refresh to get fresh data (silent, no loading spinner)
        // If background refresh fails (cold-start), retry once after 3s
        refreshData(true).catch(() => {
          console.log('[StayWeb] Background refresh failed after cache load — retrying in 3s...');
          setTimeout(() => {
            refreshData(true).catch(() => {
              console.warn('[StayWeb] Background refresh retry also failed — user may see stale data until next mutation or manual refresh');
            });
          }, 3000);
        });
        return;
      }

      // ─── Cold-start recovery: retry up to 2 times with increasing delay ───
      // Retries run as background refreshes (no loading spinner) to avoid
      // flashing the full-screen loader multiple times.
      await refreshData();
      if (!dataLoadedRef.current) {
        retryTimeout = setTimeout(async () => {
          console.log('[StayWeb] Retry 1 — batch-sync (cold-start recovery, background)...');
          await refreshData(true); // background=true — no loading spinner
          if (!dataLoadedRef.current) {
            retryTimeout = setTimeout(async () => {
              console.log('[StayWeb] Retry 2 — batch-sync (final attempt)...');
              await refreshData(); // final attempt shows loading if needed
            }, 4000);
          }
        }, 2000);
      }
    };

    loadWithRetry();

    // ─── Wrap onAuthStateChange in try-catch — supabase.auth may throw "Wh is not a constructor" ───
    let subscription: { unsubscribe: () => void } | null = null;
    try {
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        // Only re-fetch data on explicit SIGNED_IN events (not TOKEN_REFRESHED or navigation)
        // This prevents data re-sync every time the user navigates between pages or switches tabs
        if (_event === 'SIGNED_IN' && session) { 
          // Prevent refetch if the user is already loaded and the same (e.g. from tab focus)
          if (dataLoadedRef.current && lastUserIdRef.current === session.user.id) {
            console.log('[StayWeb] Ignoring SIGNED_IN event from tab focus (data already loaded)');
            return;
          }
          lastUserIdRef.current = session.user.id;
          resetSessionCache(); 
          refreshData(); 
        }
        else if (_event === 'SIGNED_OUT' || !session) {
          lastUserIdRef.current = null;
          // Clear cached tenant data on logout
          resetSessionCache();
          try { localStorage.removeItem('stayweb_property_id'); localStorage.removeItem(BATCH_CACHE_KEY); } catch { /* noop */ }
          propertyIdRef.current = null;
          dataLoadedRef.current = false;
          setPropertyProfile(initialPropertyProfile);
          setRooms([]);
          setMealPlans([]);
          setPosItems([]);
          setChargeCategories([]);
          setStaffMembers([]);
          setGuests([]);
          setBookings([]);
          setRawRoomInventory([]);
          setInvoices([]);
          setPricingRules([]);
          setOtaChannels([]);
          setPaymentGateways([]);
          setKots([]);
          setPosStock([]);
          startTransition(() => { setIsLoading(false); });
        }
      });
      subscription = data.subscription;
    } catch (e) {
      console.error('[StayWeb] Failed to set up PropertyData auth listener:', e);
    }

    return () => {
      subscription?.unsubscribe();
      if (retryTimeout) clearTimeout(retryTimeout);
      // Abort any in-flight batch-sync request on unmount to prevent
      // server-side "connection closed before message completed" errors
      if (batchAbortRef.current) {
        batchAbortRef.current.abort();
        batchAbortRef.current = null;
      }
    };
  }, []);

  const updateProfile = async (profile: Partial<PropertyProfile>) => {
    // Update local state immediately (optimistic)
    const updated = { ...propertyProfile, ...profile };
    setPropertyProfile(updated);
    // Debounce the server save (500ms) to avoid spamming on every keystroke
    pendingProfileRef.current = updated;
    if (profileSaveTimerRef.current) clearTimeout(profileSaveTimerRef.current);
    profileSaveTimerRef.current = setTimeout(flushProfileSave, 500);
  };

  const updateCurrentUser = async (updates: Partial<CurrentUser>) => {
    // Optimistic update
    const updated = { ...currentUser, ...updates };
    setCurrentUser(updated);
    try {
      await apiClient.fetch('/user-profile', {
        method: 'PUT',
        body: JSON.stringify(updated)
      });
      invalidateBatchCache();
    } catch (err: any) {
      // Revert on failure, but only if it's not an auth error (user logging out)
      if (err.status !== 401) {
        setCurrentUser(currentUser);
        console.error('Failed to update user profile:', err);
      }
      throw err;
    }
  };

  const addRoom = async (room: RoomDetail) => {
    try {
      const payload = { ...room, propertyId: getPropertyId() };
      const response = await apiClient.fetch('/room-details', { method: 'POST', body: JSON.stringify(payload) });
      const newRoom = response || payload;
      setRooms(prev => [...prev, newRoom]);
      invalidateBatchCache();
      return newRoom;
    } catch (err) { console.error(err); throw err; }
  };
  const updateRoom = async (id: string, updates: Partial<RoomDetail>) => {
    try {
      await apiClient.fetch(`/room-details/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
      setRooms(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
      invalidateBatchCache();
    } catch (err) { console.error(err); throw err; }
  };
  const deleteRoom = async (id: string) => {
    try {
      await apiClient.fetch(`/room-details/${id}`, { method: 'DELETE' });
      setRooms(prev => prev.filter(r => r.id !== id));
      // Cascade-delete all corresponding room-inventory entries
      const linkedInvItems = rawRoomInventory.filter(inv => 
        inv.roomId === id || inv.roomTypeId === id || inv.id === `inv-auto-${id}`
      );
      for (const inv of linkedInvItems) {
        apiClient.fetch(`/room-inventory/${inv.id}`, { method: 'DELETE' })
          .catch(err => console.warn(`[deleteRoom] Failed to cascade-delete inventory ${inv.id}:`, err?.message || err));
      }
      // Also try the deterministic ID pattern directly (in case it wasn't in local state)
      if (!linkedInvItems.some(inv => inv.id === `inv-auto-${id}`)) {
        apiClient.fetch(`/room-inventory/inv-auto-${id}`, { method: 'DELETE' }).catch(() => {});
      }
      setRawRoomInventory(prev => prev.filter(r => r.roomId !== id && r.roomTypeId !== id && r.id !== `inv-auto-${id}`));
      invalidateBatchCache();
    } catch (err) { console.error(err); throw err; }
  };
  
  const addRoomInventory = async (room: RoomInventory) => {
      try {
        const propId = getPropertyId();
        const payload = { ...room, propertyId: propId };
        // Use PUT (upsert) with the deterministic ID so re-adding the same room
        // overwrites the existing KV entry instead of creating a new one
        const id = payload.id || `inv-auto-${payload.roomId || payload.roomTypeId}`;
        const response = await apiClient.fetch(`/room-inventory/${id}`, { 
            method: 'PUT', 
            body: JSON.stringify({ ...payload, id }) 
        });
        const newInv = response || { ...payload, id };
        setRawRoomInventory(prev => {
            // Replace existing entry with same ID, or add if new
            const existsIdx = prev.findIndex(p => p.id === newInv.id);
            if (existsIdx >= 0) {
              const updated = [...prev];
              updated[existsIdx] = { ...prev[existsIdx], ...newInv };
              return updated;
            }
            // Also check by roomId to avoid visual duplicates
            const byRoomIdx = prev.findIndex(p => p.roomId === newInv.roomId || p.roomTypeId === newInv.roomId);
            if (byRoomIdx >= 0) {
              const updated = [...prev];
              updated[byRoomIdx] = { ...prev[byRoomIdx], ...newInv };
              return updated;
            }
            return [...prev, newInv];
        });
        invalidateBatchCache();
        return newInv;
      } catch (err) { console.error('Failed to add inventory', err); throw err; }
  };
  const updateRoomInventory = async (id: string, updates: Partial<RoomInventory>) => {
    try {
      // Ensure roomId/roomTypeId/number are always persisted in the KV entry
      // so it can be matched to room-details on reload (prevents HK data mismatch)
      const existingRoom = rawRoomInventory.find(r => r.id === id);
      const enrichedUpdates: Record<string, any> = { ...updates };
      if (existingRoom?.roomId && !updates.roomId) enrichedUpdates.roomId = existingRoom.roomId;
      if (existingRoom?.roomTypeId && !(updates as any).roomTypeId) enrichedUpdates.roomTypeId = existingRoom.roomTypeId;
      if (existingRoom?.number && !(updates as any).number) {
        enrichedUpdates.number = existingRoom.number;
        enrichedUpdates.roomNumber = existingRoom.number;
      }
      await apiClient.fetch(`/room-inventory/${id}`, { method: 'PUT', body: JSON.stringify(enrichedUpdates) });
      setRawRoomInventory(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
      invalidateBatchCache();
    } catch (err) { console.error(err); throw err; }
  };
  const deleteRoomInventory = async (id: string) => {
    try {
      await apiClient.fetch(`/room-inventory/${id}`, { method: 'DELETE' });
      setRawRoomInventory(prev => prev.filter(r => r.id !== id));
      invalidateBatchCache();
    } catch (err) { console.error(err); throw err; }
  };

  const addMealPlan = async (plan: MealPlanDetail) => {
    try {
      const payload = { ...plan, propertyId: getPropertyId() };
      const response = await apiClient.fetch('/meal-plans', { method: 'POST', body: JSON.stringify(payload) });
      setMealPlans(prev => [...prev, response || payload]);
      invalidateBatchCache();
    } catch (err) { console.error(err); throw err; }
  };
  const updateMealPlan = async (id: string, updates: Partial<MealPlanDetail>) => {
    try {
      await apiClient.fetch(`/meal-plans/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
      setMealPlans(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
      invalidateBatchCache();
    } catch (err) { console.error(err); throw err; }
  };
  const deleteMealPlan = async (id: string) => {
    try {
      await apiClient.fetch(`/meal-plans/${id}`, { method: 'DELETE' });
      setMealPlans(prev => prev.filter(p => p.id !== id));
      invalidateBatchCache();
    } catch (err) { console.error(err); throw err; }
  };

  const addPOSItem = async (item: POSItemDetail) => {
    try {
      // Normalize category: trim whitespace and title-case for consistency
      const normalized = {
        ...item,
        category: item.category?.trim().replace(/\b\w/g, c => c.toUpperCase()) || item.category,
        name: item.name?.trim() || item.name,
        propertyId: getPropertyId(),
      };
      const response = await apiClient.fetch('/pos-items', { method: 'POST', body: JSON.stringify(normalized) });
      setPosItems(prev => [...prev, response || normalized]);
      invalidateBatchCache();
    } catch (err) { console.error(err); throw err; }
  };
  const updatePOSItem = async (id: string, updates: Partial<POSItemDetail>) => {
    try {
      // Normalize category if provided
      const normalized = { ...updates };
      if (normalized.category) {
        normalized.category = normalized.category.trim().replace(/\b\w/g, c => c.toUpperCase());
      }
      if (normalized.name) {
        normalized.name = normalized.name.trim();
      }
      await apiClient.fetch(`/pos-items/${id}`, { method: 'PUT', body: JSON.stringify(normalized) });
      setPosItems(prev => prev.map(i => i.id === id ? { ...i, ...normalized } : i));
      invalidateBatchCache();
    } catch (err) { console.error(err); throw err; }
  };
  const deletePOSItem = async (id: string) => {
    try {
      await apiClient.fetch(`/pos-items/${id}`, { method: 'DELETE' });
      setPosItems(prev => prev.filter(i => i.id !== id));
      invalidateBatchCache();
    } catch (err) { console.error(err); throw err; }
  };

  const addChargeCategory = async (charge: ChargeCategoryDetail) => {
    try {
      const payload = { ...charge, propertyId: getPropertyId() };
      const response = await apiClient.fetch('/charge-categories', { method: 'POST', body: JSON.stringify(payload) });
      setChargeCategories(prev => [...prev, response || payload]);
      invalidateBatchCache();
    } catch (err) { console.error(err); throw err; }
  };
  const updateChargeCategory = async (id: string, updates: Partial<ChargeCategoryDetail>) => {
    try {
      await apiClient.fetch(`/charge-categories/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
      setChargeCategories(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
      invalidateBatchCache();
    } catch (err) { console.error(err); throw err; }
  };
  const deleteChargeCategory = async (id: string) => {
    try {
      await apiClient.fetch(`/charge-categories/${id}`, { method: 'DELETE' });
      setChargeCategories(prev => prev.filter(c => c.id !== id));
      invalidateBatchCache();
    } catch (err) { console.error(err); throw err; }
  };

  const addManualCharge = async (charge: ManualCharge) => {
    try {
      const payload = { ...charge, propertyId: getPropertyId() };
      const response = await apiClient.fetch('/manual-charges', { method: 'POST', body: JSON.stringify(payload) });
      setManualCharges(prev => [...prev, response || payload]);
      invalidateBatchCache();
    } catch (err) { console.error(err); throw err; }
  };
  const updateManualCharge = async (id: string, updates: Partial<ManualCharge>) => {
    try {
      await apiClient.fetch(`/manual-charges/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
      setManualCharges(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
      invalidateBatchCache();
    } catch (err) { console.error(err); throw err; }
  };
  const deleteManualCharge = async (id: string) => {
    try {
      await apiClient.fetch(`/manual-charges/${id}`, { method: 'DELETE' });
      setManualCharges(prev => prev.filter(c => c.id !== id));
      invalidateBatchCache();
    } catch (err) { console.error(err); throw err; }
  };

  const addPOSCategory = async (category: POSCategoryDetail) => {
    try {
      const payload = { ...category, propertyId: getPropertyId() };
      const response = await apiClient.fetch('/pos-categories', { method: 'POST', body: JSON.stringify(payload) });
      setPosCategories(prev => [...prev, response || payload]);
      invalidateBatchCache();
    } catch (err) { console.error(err); throw err; }
  };
  const updatePOSCategory = async (id: string, updates: Partial<POSCategoryDetail>) => {
    try {
      await apiClient.fetch(`/pos-categories/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
      setPosCategories(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
      invalidateBatchCache();
    } catch (err) { console.error(err); throw err; }
  };
  const deletePOSCategory = async (id: string) => {
    try {
      await apiClient.fetch(`/pos-categories/${id}`, { method: 'DELETE' });
      setPosCategories(prev => prev.filter(c => c.id !== id));
      invalidateBatchCache();
    } catch (err) { console.error(err); throw err; }
  };

  const addPOSDietary = async (dietary: POSDietaryDetail) => {
    try {
      const payload = { ...dietary, propertyId: getPropertyId() };
      const response = await apiClient.fetch('/pos-dietary', { method: 'POST', body: JSON.stringify(payload) });
      setPosDietaryInfo(prev => [...prev, response || payload]);
      invalidateBatchCache();
    } catch (err) { console.error(err); throw err; }
  };
  const updatePOSDietary = async (id: string, updates: Partial<POSDietaryDetail>) => {
    try {
      await apiClient.fetch(`/pos-dietary/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
      setPosDietaryInfo(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
      invalidateBatchCache();
    } catch (err) { console.error(err); throw err; }
  };
  const deletePOSDietary = async (id: string) => {
    try {
      await apiClient.fetch(`/pos-dietary/${id}`, { method: 'DELETE' });
      setPosDietaryInfo(prev => prev.filter(d => d.id !== id));
      invalidateBatchCache();
    } catch (err) { console.error(err); throw err; }
  };

  const addPOSUnit = async (unit: POSUnitDetail) => {
    try {
      const payload = { ...unit, propertyId: getPropertyId() };
      const response = await apiClient.fetch('/pos-units', { method: 'POST', body: JSON.stringify(payload) });
      setPosUnits(prev => [...prev, response || payload]);
      invalidateBatchCache();
    } catch (err) { console.error(err); throw err; }
  };
  const updatePOSUnit = async (id: string, updates: Partial<POSUnitDetail>) => {
    try {
      await apiClient.fetch(`/pos-units/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
      setPosUnits(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
      invalidateBatchCache();
    } catch (err) { console.error(err); throw err; }
  };
  const deletePOSUnit = async (id: string) => {
    try {
      await apiClient.fetch(`/pos-units/${id}`, { method: 'DELETE' });
      setPosUnits(prev => prev.filter(u => u.id !== id));
      invalidateBatchCache();
    } catch (err) { console.error(err); throw err; }
  };

  const addStaffRole = async (role: StaffRoleDetail) => {
    try {
      const payload = { ...role, propertyId: getPropertyId() };
      const response = await apiClient.fetch('/staff-roles', { method: 'POST', body: JSON.stringify(payload) });
      setStaffRoles(prev => [...prev, response || payload]);
      invalidateBatchCache();
    } catch (err) { console.error(err); throw err; }
  };
  const updateStaffRole = async (id: string, updates: Partial<StaffRoleDetail>) => {
    try {
      await apiClient.fetch(`/staff-roles/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
      setStaffRoles(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
      invalidateBatchCache();
    } catch (err) { console.error(err); throw err; }
  };
  const deleteStaffRole = async (id: string) => {
    try {
      await apiClient.fetch(`/staff-roles/${id}`, { method: 'DELETE' });
      setStaffRoles(prev => prev.filter(r => r.id !== id));
      invalidateBatchCache();
    } catch (err) { console.error(err); throw err; }
  };

  const addRoomType = async (type: RoomTypeDetail) => {
    try {
      const payload = { ...type, propertyId: getPropertyId() };
      const response = await apiClient.fetch('/room-types', { method: 'POST', body: JSON.stringify(payload) });
      setRoomTypes(prev => [...prev, response || payload]);
      invalidateBatchCache();
    } catch (err) { console.error(err); throw err; }
  };
  const updateRoomType = async (id: string, updates: Partial<RoomTypeDetail>) => {
    try {
      await apiClient.fetch(`/room-types/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
      setRoomTypes(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
      invalidateBatchCache();
    } catch (err) { console.error(err); throw err; }
  };
  const deleteRoomType = async (id: string) => {
    try {
      await apiClient.fetch(`/room-types/${id}`, { method: 'DELETE' });
      setRoomTypes(prev => prev.filter(t => t.id !== id));
      invalidateBatchCache();
    } catch (err) { console.error(err); throw err; }
  };

  const addAmenity = async (amenity: AmenityDetail) => {
    try {
      const payload = { ...amenity, propertyId: getPropertyId() };
      const response = await apiClient.fetch('/amenities', { method: 'POST', body: JSON.stringify(payload) });
      setAmenities(prev => [...prev, response || payload]);
      invalidateBatchCache();
    } catch (err) { console.error(err); throw err; }
  };
  const updateAmenity = async (id: string, updates: Partial<AmenityDetail>) => {
    try {
      await apiClient.fetch(`/amenities/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
      setAmenities(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
      invalidateBatchCache();
    } catch (err) { console.error(err); throw err; }
  };
  const deleteAmenity = async (id: string) => {
    try {
      await apiClient.fetch(`/amenities/${id}`, { method: 'DELETE' });
      setAmenities(prev => prev.filter(a => a.id !== id));
      invalidateBatchCache();
    } catch (err) { console.error(err); throw err; }
  };

  const addStaffMember = async (staff: StaffMember) => {
    try {
      // Persist ALL staff fields — phone, department, status, joinedAt, userId etc.
      const normalized: StaffMember & Record<string, any> = {
        ...staff,
        id: staff.id,
        name: staff.name || '',
        email: staff.email || '',
        phone: (staff as any).phone || '',
        role: staff.role || '',
        department: (staff as any).department || '',
        status: (staff as any).status || 'active',
        joinedAt: (staff as any).joinedAt || new Date().toISOString(),
        blocked: staff.blocked ?? false,
      };
      const payload = { ...normalized, propertyId: getPropertyId() };
      const response = await apiClient.fetch('/staff', { method: 'POST', body: JSON.stringify(payload) });
      setStaffMembers(prev => [...prev, response || payload]);
      invalidateBatchCache();
    } catch (err) { console.error(err); throw err; }
  };
  const updateStaffMember = async (id: string, updates: Partial<StaffMember>) => {
    try {
      await apiClient.fetch(`/staff/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
      setStaffMembers(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
      invalidateBatchCache();
    } catch (err) { console.error(err); throw err; }
  };
  const deleteStaffMember = async (id: string) => {
    try {
      await apiClient.fetch(`/staff/${id}`, { method: 'DELETE' });
      setStaffMembers(prev => prev.filter(s => s.id !== id));
      invalidateBatchCache();
    } catch (err) { console.error(err); throw err; }
  };

  const addGuest = async (guest: Guest) => {
    try {
      const payload = { ...guest, propertyId: getPropertyId() };
      const response = await apiClient.fetch('/guests', { method: 'POST', body: JSON.stringify(payload) });
      setGuests(prev => [...prev, response || payload]);
      invalidateBatchCache();
    } catch (err) { console.error(err); throw err; }
  };
  const updateGuest = async (id: string, updates: Partial<Guest>) => {
    try {
      await apiClient.fetch(`/guests/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
      setGuests(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g));
      invalidateBatchCache();
    } catch (err) { console.error(err); throw err; }
  };
  const deleteGuest = async (id: string) => {
    try {
      await apiClient.fetch(`/guests/${id}`, { method: 'DELETE' });
      setGuests(prev => prev.filter(g => g.id !== id));
      invalidateBatchCache();
    } catch (err) { console.error(err); throw err; }
  };

  // --- BOOKING LOGIC WITH LOCK SUPPORT ---

  const calculateBookingPrice = (booking: Partial<Booking>): number => {
    // 1. Base Price
    let basePrice = 0;
    const room = rooms.find(r => r.id === booking.roomId); // Assuming roomId is RoomDetail ID for now, or use roomType mapping
    // If we only have roomType name, we need to find it
    const roomDetail = rooms.find(r => r.name === booking.roomType || r.type === booking.roomType);
    if (roomDetail) {
      basePrice = roomDetail.basePrice || 0;
    }

    let total = basePrice * (booking.nights || 1);

    // 2. Apply Pricing Rules
    const checkInDate = new Date(booking.checkIn || new Date());
    
    pricingRules.forEach(rule => {
      if (!rule.enabled) return;

      // Date Range Check
      if (rule.startDate && new Date(rule.startDate) > checkInDate) return;
      if (rule.endDate && new Date(rule.endDate) < checkInDate) return;

      // Day of Week Check
      if (rule.daysOfWeek && !rule.daysOfWeek.includes(checkInDate.getDay())) return;

      // Apply Adjustment
      if (rule.adjustmentType === 'percentage') {
        const adjustment = total * (rule.adjustmentValue / 100);
        total += adjustment;
      } else {
        total += rule.adjustmentValue;
      }
    });

    // 3. Add Meal Plan
    if (booking.mealPlanId) {
      const plan = mealPlans.find(mp => mp.id === booking.mealPlanId);
      if (plan) {
        // Assume price is per person per night
        const guests = (booking as any).numberOfGuests || 1; // Need to ensure this field exists or default to 1
        total += (plan.price * (booking.nights || 1) * guests);
      }
    }

    return Math.max(0, Math.round(total));
  };

  const acquireLock = async (payload: LockPayload): Promise<LockResponse> => {
     return inventoryApi.acquireLock(payload);
  };

  const addBooking = async (booking: Booking, lockId?: string) => {
    try {
      // Calculate Price if not provided (flexible pricing)
      const calculatedAmount = booking.totalAmount > 0 ? booking.totalAmount : calculateBookingPrice(booking);
      const finalBooking = { ...booking, totalAmount: calculatedAmount, folio: calculatedAmount };

      const corePayload: CreateBookingPayload = {
        property_id: getPropertyId(),
        guest_name: finalBooking.guestName,
        guest_email: finalBooking.guestEmail,
        checkin_date: finalBooking.checkIn,
        checkout_date: finalBooking.checkOut,
        status: finalBooking.status || 'confirmed',
        total_amount: finalBooking.totalAmount || finalBooking.folio || 0,
        currency: 'INR',
        source: 'manual',
        room_id: finalBooking.roomId,
        bed_id: finalBooking.bedId,
        lock_id: lockId
      };

      const response = await bookingsApi.createBooking(corePayload);
      
      // Map the response to match the same structure as fetched bookings
      const newBooking: Booking = {
        id: response.id,
        bookingDate: response.created_at || new Date().toISOString(),
        checkIn: response.checkin_date || finalBooking.checkIn,
        checkOut: response.checkout_date || finalBooking.checkOut,
        guestName: response.guest_name || finalBooking.guestName,
        guestEmail: response.guest_email || finalBooking.guestEmail || finalBooking.guestName,
        guestAvatar: finalBooking.guestAvatar || '',
        roomId: response.room_id || finalBooking.roomId,
        bedId: response.bed_id || finalBooking.bedId,
        roomBed: (response.room_id || finalBooking.roomId) ? 'Room' : 'Bed',
        nights: finalBooking.nights || 1,
        status: response.status || finalBooking.status || 'confirmed',
        folio: finalBooking.folio || 0,
        roomType: finalBooking.roomType || 'private',
        date: new Date(response.created_at || new Date().toISOString()),
        channel: response.source || 'manual',
        totalAmount: response.total_amount || finalBooking.totalAmount || 0,
        paidAmount: response.paid_amount || finalBooking.paidAmount || 0,
        propertyId: getPropertyId()
      };

      setBookings(prev => [...prev, newBooking]);
      invalidateBatchCache();

      // ── Fire-and-forget: booking confirmation email + SMS ──
      if (newBooking.status === 'confirmed' && newBooking.guestEmail) {
        triggerBookingConfirmationEmail({
          guestName: newBooking.guestName,
          guestEmail: newBooking.guestEmail,
          bookingId: newBooking.id,
          checkIn: new Date(newBooking.checkIn).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
          checkOut: new Date(newBooking.checkOut).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
          roomType: newBooking.roomType,
          totalAmount: newBooking.totalAmount,
          propertyName: propertyProfile?.name,
          propertyAddress: [propertyProfile?.address, propertyProfile?.city].filter(Boolean).join(', '),
          propertyPhone: propertyProfile?.phone,
          propertyEmail: propertyProfile?.email,
        });
        triggerBookingConfirmationSMS({
          guestName: newBooking.guestName,
          guestPhone: (newBooking as any).guestPhone,
          guestEmail: newBooking.guestEmail,
          checkIn: new Date(newBooking.checkIn).toLocaleDateString('en-IN'),
          checkOut: new Date(newBooking.checkOut).toLocaleDateString('en-IN'),
          roomInfo: newBooking.roomType,
          propertyName: propertyProfile?.name,
        });
      }
    } catch (err) { console.error(err); throw err; }
  };

  const updateBooking = async (id: string, updates: Partial<Booking>) => {
    try {
      await apiClient.fetch(`/bookings/${id}`, { method: 'PUT', body: JSON.stringify(updates) });

      // ── Auto-update room/bed status when booking transitions to checked-in ──
      if (updates.status === 'checked-in') {
        const booking = bookings.find(b => b.id === id);
        if (booking) {
          const room = roomInventory.find(r =>
            r.id === booking.roomId ||
            r.roomId === booking.roomId ||
            r.number === booking.roomBed?.split('-')[0] ||
            r.roomNumber === booking.roomBed?.split('-')[0]
          );
          if (room) {
            // Update room status to occupied
            updateRoomInventory(room.id, { status: 'occupied' })
              .catch(err => console.error('Failed to set room occupied on check-in:', err));

            // If dorm room with beds, update the specific bed status
            if (room.beds && Array.isArray(room.beds) && booking.roomBed) {
              const bedId = booking.roomBed.split('-')[1] || booking.roomBed;
              const updatedBeds = room.beds.map((bed: any) => {
                if (bed.id === bedId || bed.number === bedId || bed.label === booking.roomBed) {
                  return { ...bed, status: 'occupied', guestName: booking.guestName || updates.guestName };
                }
                return bed;
              });
              updateRoomInventory(room.id, { beds: updatedBeds })
                .catch(err => console.error('Failed to update bed status on check-in:', err));
            }
          }
        }
      }

      // ── Auto-generate checkout-clean HK task when booking transitions to checked-out ──
      if (updates.status === 'checked-out') {
        const booking = bookings.find(b => b.id === id);
        if (booking) {
          const room = roomInventory.find(r =>
            r.id === booking.roomId ||
            r.roomId === booking.roomId ||
            r.number === booking.roomBed?.split('-')[0] ||
            r.roomNumber === booking.roomBed?.split('-')[0]
          );
          if (room) {
            // Look up checkout-clean task type from Platform Config
            const checkoutTaskType = platformHKTaskTypes.find(t => t.code === 'checkout-clean');
            if (!checkoutTaskType) {
              console.warn('No "checkout-clean" task type configured in Platform Config — skipping auto-task creation.');
            } else {
            const taskId = Math.random().toString(36).substring(2, 15);
            // Derive checklist from platform config (comma-separated)
            const checklistItems = checkoutTaskType.checklist
              .split(',')
              .map(s => s.trim())
              .filter(Boolean)
              .map(label => ({ id: Math.random().toString(36).substring(2, 10), label, done: false }));
            // Derive priority — use first configured priority or 'high' code
            const defaultPriority = platformHKPriorities.length > 0
              ? platformHKPriorities[0].code
              : 'high';
            const checkoutTask = {
              id: taskId,
              roomId: room.id,
              roomNumber: room.number || room.roomNumber,
              type: checkoutTaskType.code,
              priority: defaultPriority,
              status: 'pending',
              assignedTo: 'Unassigned',
              checklist: checklistItems,
              notes: `Auto-generated: ${checkoutTaskType.name} for ${booking.guestName}`,
              createdAt: new Date().toISOString(),
              startedAt: null,
              completedAt: null,
              inspectedBy: null,
              estimatedMinutes: Number(checkoutTaskType.estimatedMinutes) || 30,
            };
            // Persist to KV
            apiClient.fetch(`/hk-tasks/${taskId}`, { method: 'PUT', body: JSON.stringify(checkoutTask) })
              .catch(err => console.error('Failed to auto-create checkout HK task:', err));
            // Set room to cleaning
            updateRoomInventory(room.id, { status: 'cleaning' })
              .catch(err => console.error('Failed to set room cleaning on checkout:', err));
            // If dorm room with beds, update the specific bed status to available
            if (room.beds && Array.isArray(room.beds) && booking.roomBed) {
              const bedId = booking.roomBed.split('-')[1] || booking.roomBed;
              const updatedBeds = room.beds.map((bed: any) => {
                if (bed.id === bedId || bed.number === bedId || bed.label === booking.roomBed) {
                  return { ...bed, status: 'available', guestName: '' };
                }
                return bed;
              });
              updateRoomInventory(room.id, { beds: updatedBeds })
                .catch(err => console.error('Failed to update bed status on checkout:', err));
            }
            // Dispatch event so HousekeepingPage can pick it up in real-time
            window.dispatchEvent(new CustomEvent('hk-checkout-task-created', { detail: checkoutTask }));
            }
          }
        }
      }

      setBookings(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
      invalidateBatchCache();
    } catch (err) { console.error(err); throw err; }
  };
  const deleteBooking = async (id: string) => {
    try {
      await apiClient.fetch(`/bookings/${id}`, { method: 'DELETE' });
      setBookings(prev => prev.filter(b => b.id !== id));
      invalidateBatchCache();
    } catch (err) { console.error(err); throw err; }
  };

  const addInvoice = async (invoice: Invoice) => {
    try {
      const payload = { ...invoice, propertyId: getPropertyId() };
      const response = await apiClient.fetch('/invoices', { method: 'POST', body: JSON.stringify(payload) });
      setInvoices(prev => [...prev, response || payload]);
      invalidateBatchCache();
    } catch (err) { console.error(err); throw err; }
  };
  const updateInvoice = async (id: string, updates: Partial<Invoice>) => {
    try {
      await apiClient.fetch(`/invoices/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
      setInvoices(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
      invalidateBatchCache();
    } catch (err) { console.error(err); throw err; }
  };
  const deleteInvoice = async (id: string) => {
    try {
      await apiClient.fetch(`/invoices/${id}`, { method: 'DELETE' });
      setInvoices(prev => prev.filter(i => i.id !== id));
      invalidateBatchCache();
    } catch (err) { console.error(err); throw err; }
  };

  const addPricingRule = async (rule: PricingRule) => {
    try {
      const payload = { ...rule, propertyId: getPropertyId() };
      const response = await apiClient.fetch('/pricing-rules', { method: 'POST', body: JSON.stringify(payload) });
      setPricingRules(prev => [...prev, response || payload]);
      invalidateBatchCache();
    } catch (err) { console.error(err); throw err; }
  };
  const updatePricingRule = async (id: string, updates: Partial<PricingRule>) => {
    try {
      await apiClient.fetch(`/pricing-rules/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
      setPricingRules(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
      invalidateBatchCache();
    } catch (err) { console.error(err); throw err; }
  };
  const deletePricingRule = async (id: string) => {
    try {
      await apiClient.fetch(`/pricing-rules/${id}`, { method: 'DELETE' });
      setPricingRules(prev => prev.filter(r => r.id !== id));
      invalidateBatchCache();
    } catch (err) { console.error(err); throw err; }
  };

  const addOTAChannel = async (channel: OTAChannel) => {
    try {
      const payload = { ...channel, propertyId: getPropertyId() };
      const response = await apiClient.fetch('/ota-channels', { method: 'POST', body: JSON.stringify(payload) });
      setOtaChannels(prev => [...prev, response || payload]);
      invalidateBatchCache();
    } catch (err) { console.error(err); throw err; }
  };
  const updateOTAChannel = async (id: string, updates: Partial<OTAChannel>) => {
    try {
      await apiClient.fetch(`/ota-channels/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
      setOtaChannels(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
      invalidateBatchCache();
    } catch (err) { console.error(err); throw err; }
  };
  const deleteOTAChannel = async (id: string) => {
    try {
      await apiClient.fetch(`/ota-channels/${id}`, { method: 'DELETE' });
      setOtaChannels(prev => prev.filter(c => c.id !== id));
      invalidateBatchCache();
    } catch (err) { console.error(err); throw err; }
  };

  const updatePaymentGateway = async (id: string, gateway: Partial<PaymentGateway>) => {
    try {
      await apiClient.fetch(`/payment-gateways/${id}`, { method: 'PUT', body: JSON.stringify(gateway) });
      setPaymentGateways(prev => prev.map(g => g.id === id ? { ...g, ...gateway } : g));
      invalidateBatchCache();
    } catch (err) { console.error(err); throw err; }
  };

  // ── KOT functions ──
  const updateKOT = async (id: string, updates: any) => {
    try {
      await apiClient.fetch(`/kots/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
      setKots(prev => prev.map(k => k.id === id ? { ...k, ...updates } : k));
      invalidateBatchCache();
    } catch (err) { console.error(err); throw err; }
  };

  // ── POS Stock functions ──
  const updatePOSStock = async (itemId: string, updates: any) => {
    try {
      await apiClient.fetch(`/pos-stock/${itemId}`, { method: 'PUT', body: JSON.stringify(updates) });
      setPosStock(prev => {
        const existing = prev.find(s => s.itemId === itemId);
        if (existing) return prev.map(s => s.itemId === itemId ? { ...s, ...updates } : s);
        return [...prev, { itemId, ...updates }];
      });
      invalidateBatchCache();
    } catch (err) { console.error(err); throw err; }
  };

  const ensureLoaded = async () => {
    if (isLoading) {
      await refreshData();
    }
  };

  return (
    <PropertyDataContext.Provider value={{
      propertyProfile,
      rooms,
      mealPlans,
      posItems,
      chargeCategories,
      manualCharges,
      posCategories,
      posDietaryInfo,
      posUnits,
      staffRoles,
      roomTypes,
      amenities,
      staffMembers,
      guests,
      bookings,
      roomInventory,
      invoices,
      pricingRules,
      otaChannels,
      paymentGateways,
      webhookUrl,
      currentUser,
      updateProfile,
      updateCurrentUser,
      addRoom, updateRoom, deleteRoom,
      addMealPlan, updateMealPlan, deleteMealPlan,
      addPOSItem, updatePOSItem, deletePOSItem,
      addChargeCategory, updateChargeCategory, deleteChargeCategory,
      addManualCharge, updateManualCharge, deleteManualCharge,
      addPOSCategory, updatePOSCategory, deletePOSCategory,
      addPOSDietary, updatePOSDietary, deletePOSDietary,
      addPOSUnit, updatePOSUnit, deletePOSUnit,
      addStaffRole, updateStaffRole, deleteStaffRole,
      addRoomType, updateRoomType, deleteRoomType,
      addAmenity, updateAmenity, deleteAmenity,
      addStaffMember, updateStaffMember, deleteStaffMember,
      addGuest, updateGuest, deleteGuest,
      acquireLock,
      addBooking, updateBooking, deleteBooking,
      addRoomInventory, updateRoomInventory, deleteRoomInventory,
      addInvoice, updateInvoice, deleteInvoice,
      addPricingRule, updatePricingRule, deletePricingRule,
      addOTAChannel, updateOTAChannel, deleteOTAChannel,
      updatePaymentGateway,
      kots, posStock, updateKOT, updatePOSStock,
      isLoading,
      syncStage,
      isCachedLoad,
      error,
      refreshData,
      ensureLoaded
    }}>
      {children}
    </PropertyDataContext.Provider>
  );
}

export function usePropertyData() {
  const context = useContext(PropertyDataContext);
  if (context === undefined) {
    // During HMR or if rendered outside PropertyDataProvider, return a safe
    // loading state instead of throwing — prevents blank-screen crashes.
    console.warn('[StayWeb] usePropertyData called outside PropertyDataProvider — returning safe defaults.');
    const noop = async () => {};
    return {
      propertyProfile: {} as any,
      rooms: [], mealPlans: [], posItems: [], chargeCategories: [], manualCharges: [],
      posCategories: [], posDietaryInfo: [], posUnits: [], staffRoles: [], roomTypes: [],
      amenities: [], staffMembers: [], guests: [], bookings: [], roomInventory: [],
      invoices: [], pricingRules: [], otaChannels: [], paymentGateways: [],
      kots: [], posStock: [],
      webhookUrl: '',
      currentUser: { name: '', email: '', role: 'owner' as const, avatar: '' },
      updateProfile: () => {}, updateCurrentUser: noop,
      addRoom: noop, updateRoom: noop, deleteRoom: noop,
      addMealPlan: noop, updateMealPlan: noop, deleteMealPlan: noop,
      addPOSItem: noop, updatePOSItem: noop, deletePOSItem: noop,
      addChargeCategory: noop, updateChargeCategory: noop, deleteChargeCategory: noop,
      addManualCharge: noop, updateManualCharge: noop, deleteManualCharge: noop,
      addPOSCategory: noop, updatePOSCategory: noop, deletePOSCategory: noop,
      addPOSDietary: noop, updatePOSDietary: noop, deletePOSDietary: noop,
      addPOSUnit: noop, updatePOSUnit: noop, deletePOSUnit: noop,
      addStaffRole: noop, updateStaffRole: noop, deleteStaffRole: noop,
      addRoomType: noop, updateRoomType: noop, deleteRoomType: noop,
      addAmenity: noop, updateAmenity: noop, deleteAmenity: noop,
      addStaffMember: noop, updateStaffMember: noop, deleteStaffMember: noop,
      addGuest: noop, updateGuest: noop, deleteGuest: noop,
      acquireLock: async () => ({ success: false, lockId: '' }),
      addBooking: noop, updateBooking: noop, deleteBooking: noop,
      addRoomInventory: noop, updateRoomInventory: noop, deleteRoomInventory: noop,
      addInvoice: noop, updateInvoice: noop, deleteInvoice: noop,
      addPricingRule: noop, updatePricingRule: noop, deletePricingRule: noop,
      addOTAChannel: noop, updateOTAChannel: noop, deleteOTAChannel: noop,
      updatePaymentGateway: noop, updateKOT: noop, updatePOSStock: noop,
      isLoading: false,
      syncStage: 'done' as const,
      isCachedLoad: false,
      error: 'PropertyDataProvider not mounted. Please reload the page.',
      refreshData: async () => { window.location.reload(); },
      ensureLoaded: noop,
    } as PropertyDataContextType;
  }
  return context;
}