/**
 * STAYWEB PMS - COMPREHENSIVE DATABASE SCHEMA
 * Complete type definitions for all entities
 * Version: 1.0.0
 * Last Updated: December 6, 2024
 */

// ============================================================================
// CORE ENTITIES
// ============================================================================

/**
 * PROPERTY - The main hotel/hostel entity
 */
export interface Property {
  id: string;
  name: string;
  type: 'hostel' | 'hotel' | 'guesthouse' | 'apartment' | 'hybrid';
  logo?: string;
  
  // Location
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  googleMapsLink: string;
  
  // Contact
  phone: string;
  email: string;
  website?: string;
  
  // Capacity
  totalRooms: number;
  totalBeds: number;
  
  // Policies
  checkInTime: string; // HH:MM format
  checkOutTime: string; // HH:MM format
  cancellationPolicy?: string;
  
  // Financial
  currency: string;
  taxRate: number; // percentage
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

/**
 * USER - Staff members and admins
 */
export interface User {
  id: string;
  propertyId: string;
  
  // Personal Info
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  initials: string;
  
  // Authentication
  passwordHash?: string; // Not stored in frontend
  lastLogin?: string;
  
  // Authorization
  role: 'owner' | 'admin' | 'manager' | 'receptionist' | 'staff';
  permissions: UserPermission[];
  
  // Status
  isActive: boolean;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export type UserPermission = 
  | 'view_bookings'
  | 'create_bookings'
  | 'edit_bookings'
  | 'cancel_bookings'
  | 'view_guests'
  | 'edit_guests'
  | 'view_rooms'
  | 'edit_rooms'
  | 'view_reports'
  | 'manage_pos'
  | 'manage_payments'
  | 'manage_ota'
  | 'manage_settings'
  | 'manage_users';

// ============================================================================
// GUEST MANAGEMENT
// ============================================================================

/**
 * GUEST - Customer profile
 */
export interface Guest {
  id: string;
  propertyId: string;
  
  // Personal Info
  firstName: string;
  lastName: string;
  fullName: string; // Computed field
  email: string;
  phone: string;
  dateOfBirth?: string;
  nationality?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  
  // Identification
  idType?: 'passport' | 'drivers-license' | 'national-id' | 'aadhaar' | 'pan';
  idNumber?: string;
  idExpiry?: string;
  idImageUrl?: string;
  
  // Address
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  
  // Emergency Contact
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  
  // Guest Preferences
  preferences?: GuestPreference;
  
  // Guest History
  totalBookings: number;
  totalSpent: number;
  averageRating?: number;
  tags?: string[]; // VIP, Frequent, Corporate, etc.
  notes?: string;
  
  // Marketing
  marketingConsent: boolean;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  lastStayDate?: string;
}

export interface GuestPreference {
  roomType?: string;
  bedType?: 'single' | 'double' | 'queen' | 'king';
  floorPreference?: 'low' | 'high' | 'middle';
  smokingAllowed?: boolean;
  dietaryRestrictions?: string[];
  specialRequests?: string;
}

// ============================================================================
// ROOM & INVENTORY MANAGEMENT
// ============================================================================

/**
 * ROOM TYPE - Room categories
 */
export interface RoomType {
  id: string;
  propertyId: string;
  
  // Basic Info
  name: string;
  code: string; // e.g., DLX, STE, DRM
  category: 'private' | 'shared' | 'dorm' | 'suite';
  
  // Capacity
  maxOccupancy: number;
  bedConfiguration: BedConfiguration[];
  
  // Pricing
  basePrice: number;
  weekendPrice?: number;
  extraPersonCharge?: number;
  
  // Details
  size?: number; // in sq ft or sq m
  sizeUnit?: 'sqft' | 'sqm';
  amenities: string[];
  description?: string;
  images?: string[];
  
  // Availability
  totalRooms: number;
  isActive: boolean;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface BedConfiguration {
  type: 'single' | 'double' | 'queen' | 'king' | 'bunk';
  count: number;
}

/**
 * ROOM - Individual room/bed inventory
 */
export interface Room {
  id: string;
  propertyId: string;
  roomTypeId: string;
  
  // Identification
  roomNumber: string;
  floor?: number;
  building?: string;
  
  // For Dorm Beds
  isDormBed: boolean;
  bedNumber?: string; // For dorm beds
  
  // Status
  status: RoomStatus;
  housekeepingStatus: 'clean' | 'dirty' | 'inspected' | 'out-of-order';
  
  // Maintenance
  isOutOfOrder: boolean;
  outOfOrderReason?: string;
  outOfOrderUntil?: string;
  maintenanceNotes?: string;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  lastCleaned?: string;
}

export type RoomStatus = 
  | 'available'
  | 'occupied'
  | 'reserved'
  | 'blocked'
  | 'maintenance';

// ============================================================================
// BOOKING & RESERVATION MANAGEMENT
// ============================================================================

/**
 * BOOKING - Reservation record
 */
export interface Booking {
  id: string;
  propertyId: string;
  
  // Guest Info
  guestId: string;
  guestName: string; // Denormalized for quick access
  guestEmail: string;
  guestPhone: string;
  guestAvatar?: string;
  numberOfGuests: number;
  
  // Room Info
  roomId?: string;
  roomTypeId: string;
  roomNumber?: string;
  roomBed?: string; // Display name (e.g., "Room 101" or "Dorm A - Bed 5")
  roomType: string; // Display name
  
  // Meal Plan
  mealPlanId?: string;

  // Dates
  checkIn: string; // ISO date
  checkOut: string; // ISO date
  nights: number;
  actualCheckIn?: string; // Timestamp
  actualCheckOut?: string; // Timestamp
  
  // Booking Status
  status: BookingStatus;
  
  // Channel Information
  channel: BookingChannel;
  otaBookingId?: string; // OTA's booking reference
  otaCommission?: number;
  
  // Financial
  roomCharges: number;
  extraCharges: number;
  taxes: number;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number; // Computed: totalAmount - paidAmount
  folio: number; // Current folio balance
  
  // Special Requests
  specialRequests?: string;
  internalNotes?: string;
  
  // Group Booking
  isGroupBooking: boolean;
  groupId?: string;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  bookedAt: string;
  cancelledAt?: string;
  cancellationReason?: string;
}

export type BookingStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'checked-in' 
  | 'checked-out' 
  | 'cancelled'
  | 'no-show';

export type BookingChannel = 
  | 'manual' 
  | 'makemytrip'
  | 'goibibo'
  | 'yatra'
  | 'booking-com'
  | 'agoda'
  | 'expedia'
  | 'airbnb'
  | 'hostelworld'
  | 'easemytrip'
  | 'cleartrip'
  | 'hotels-com'
  | 'hotel-tonight'
  | 'hostel-bookers'
  | 'hostelz';

/**
 * GROUP BOOKING - For managing group reservations
 */
export interface GroupBooking {
  id: string;
  propertyId: string;
  
  // Group Info
  groupName: string;
  organizerName: string;
  organizerEmail: string;
  organizerPhone: string;
  
  // Bookings
  bookingIds: string[];
  totalGuests: number;
  
  // Financial
  totalAmount: number;
  paidAmount: number;
  
  // Special
  notes?: string;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// FOLIO & FINANCIAL MANAGEMENT
// ============================================================================

/**
 * FOLIO - Guest ledger/bill
 */
export interface Folio {
  id: string;
  propertyId: string;
  bookingId: string;
  guestId: string;
  
  // Summary
  totalCharges: number;
  totalPayments: number;
  balance: number; // Computed
  
  // Line Items
  charges: FolioCharge[];
  payments: FolioPayment[];
  
  // Status
  status: 'open' | 'closed' | 'void';
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
}

/**
 * FOLIO CHARGE - Individual charge on guest bill
 */
export interface FolioCharge {
  id: string;
  folioId: string;
  
  // Charge Details
  type: ChargeType;
  category: 'room' | 'pos' | 'service' | 'misc' | 'tax';
  description: string;
  
  // Reference
  referenceId?: string; // POSTransaction ID, etc.
  
  // Amount
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  
  // Tax
  taxRate?: number;
  taxAmount?: number;
  
  // User
  chargedBy: string; // User ID
  
  // Timestamps
  chargedAt: string;
  createdAt: string;
}

export type ChargeType = 
  | 'accommodation'
  | 'food'
  | 'beverage'
  | 'laundry'
  | 'minibar'
  | 'telephone'
  | 'internet'
  | 'spa'
  | 'parking'
  | 'extra-bed'
  | 'late-checkout'
  | 'early-checkin'
  | 'damage'
  | 'tax'
  | 'other';

/**
 * FOLIO PAYMENT - Payments on guest bill
 */
export interface FolioPayment {
  id: string;
  folioId: string;
  
  // Payment Details
  amount: number;
  method: PaymentMethod;
  
  // Reference
  transactionId?: string;
  receiptNumber?: string;
  
  // Card Details (if applicable)
  last4Digits?: string;
  cardBrand?: string;
  
  // Status
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  
  // Gateway
  gatewayProvider?: string; // razorpay, stripe, etc.
  gatewayTransactionId?: string;
  
  // User
  receivedBy: string; // User ID
  
  // Timestamps
  paymentDate: string;
  createdAt: string;
}

export type PaymentMethod = 
  | 'cash'
  | 'card'
  | 'upi'
  | 'net-banking'
  | 'wallet'
  | 'cheque'
  | 'bank-transfer'
  | 'ota-collect';

// ============================================================================
// POS (POINT OF SALE) MANAGEMENT
// ============================================================================

/**
 * POS TRANSACTION - Restaurant/Bar sales
 */
export interface POSTransaction {
  id: string;
  propertyId: string;
  
  // Customer
  bookingId?: string; // If guest is staying
  guestId?: string;
  guestName?: string;
  roomNumber?: string;
  isWalkIn: boolean; // Non-guest customer
  
  // Order Items
  items: POSOrderItem[];
  
  // Financial
  subtotal: number;
  taxes: number;
  discount: number;
  totalAmount: number;
  
  // Payment
  paymentMethod?: PaymentMethod;
  paymentStatus: 'pending' | 'paid' | 'post-to-room';
  
  // Status
  orderStatus: 'pending' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled';
  
  // Service Details
  tableNumber?: string;
  servedBy?: string; // User ID
  
  // Timestamps
  orderTime: string;
  servedTime?: string;
  completedTime?: string;
  createdAt: string;
  updatedAt: string;
}

export interface POSOrderItem {
  id: string;
  menuItemId: string;
  name: string;
  category: MenuCategory;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
}

/**
 * POS MENU ITEM - Food & Beverage offerings
 */
export interface POSMenuItem {
  id: string;
  propertyId?: string;
  
  // Basic Info
  name: string;
  category: MenuCategory;
  subcategory?: string;
  
  // Pricing
  price: number;
  costPrice?: number;
  
  // Details
  description?: string;
  image?: string;
  
  // Recipe
  ingredients?: string[];
  preparationTime?: string;
  
  // Dietary
  dietary?: DietaryTag[];
  allergens?: string[];
  
  // Inventory
  available: boolean;
  inStock?: boolean;
  
  // Timestamps
  createdAt?: string;
  updatedAt?: string;
}

export type MenuCategory = 
  | 'food'
  | 'drinks'
  | 'bar'
  | 'snacks'
  | 'meals'
  | 'breakfast'
  | 'lunch'
  | 'dinner'
  | 'desserts';

export type DietaryTag = 
  | 'vegan'
  | 'vegetarian'
  | 'gluten-free'
  | 'dairy-free'
  | 'nut-free'
  | 'halal'
  | 'kosher'
  | 'organic';

/**
 * MEAL PLAN - Bundled meal offerings
 */
export interface MealPlan {
  id: string;
  propertyId: string;
  
  // Basic Info
  name: string;
  code: string; // EP, CP, MAP, AP
  description: string;
  
  // Inclusions
  includesBreakfast: boolean;
  includesLunch: boolean;
  includesDinner: boolean;
  includesSnacks: boolean;
  
  // Pricing
  pricePerDay: number;
  pricePerPerson?: number;
  
  // Availability
  isActive: boolean;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

// Common meal plan codes:
// EP - European Plan (No meals)
// CP - Continental Plan (Breakfast only)
// MAP - Modified American Plan (Breakfast + Dinner)
// AP - American Plan (All meals)

// ============================================================================
// OTA (ONLINE TRAVEL AGENCY) MANAGEMENT
// ============================================================================

/**
 * OTA CHANNEL - Connected booking platforms
 */
export interface OTAChannel {
  id: string;
  name: string;
  category: 'OTA' | 'Wholesaler' | 'Booking Engine' | 'Meta Channel' | 'GDS';
  logo?: string;
  logoUrl?: string;
  connected: boolean;
  commission?: number;
  color?: string;
  isCustom?: boolean;
  /** Platform-specific credentials */
  credentials?: {
    propertyId?: string;
    apiKey?: string;
    apiSecret?: string;
    hotelCode?: string;
    username?: string;
    password?: string;
  };
  /** Sync state */
  syncStatus?: 'idle' | 'syncing' | 'synced' | 'error';
  lastSyncAt?: string;
  syncError?: string;
  /** Rate plan mapping — local room type → OTA room type */
  rateMappings?: OTARoomMapping[];
  /** Whether to auto-push rate & inventory changes */
  autoSync?: boolean;
}

export interface OTARoomMapping {
  localRoomTypeId: string;
  otaRoomTypeId: string;
  otaRoomTypeName: string;
}

/**
 * OTA BOOKING REQUEST - Pending OTA reservations
 */
export interface OTABookingRequest {
  id: string;
  propertyId: string;
  
  // OTA Info
  channelName: BookingChannel;
  otaBookingId: string;
  
  // Guest Info
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  numberOfGuests: number;
  
  // Booking Info
  roomType: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  
  // Financial
  totalAmount: number;
  commissionAmount: number;
  netAmount: number;
  
  // Status
  status: 'pending' | 'confirmed' | 'rejected';
  
  // Special Requests
  specialRequests?: string;
  
  // Response
  responseNote?: string;
  
  // Timestamps
  requestedAt: string;
  respondedAt?: string;
  createdAt: string;
}

// ============================================================================
// PAYMENT GATEWAY MANAGEMENT
// ============================================================================

/**
 * PAYMENT GATEWAY - Connected payment providers
 */
export interface PaymentGateway {
  id: string;
  propertyId: string;
  
  // Provider Info
  provider: PaymentGatewayProvider;
  name: string; // Used in UI
  displayName?: string; // Legacy
  logo?: string;
  description?: string;
  category?: 'indian' | 'international';
  popular?: boolean;
  
  // Connection
  enabled: boolean; // Used in UI
  isActive?: boolean; // Legacy
  isDefault: boolean;
  
  // Credentials (encrypted in production)
  merchantId?: string;
  apiKey?: string;
  apiSecret?: string;
  webhookSecret?: string;
  
  // Settings
  supported: string[]; // Used in UI
  supportedMethods?: PaymentMethod[]; // Legacy
  fees?: string;
  processingTime?: string;
  transactionFee?: number; // percentage (Legacy number)
  
  // Test Mode
  isTestMode: boolean;
  
  // Statistics
  totalTransactions?: number;
  totalAmount?: number;
  
  // Timestamps
  connectedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type PaymentGatewayProvider = 
  | 'razorpay'
  | 'stripe'
  | 'paytm'
  | 'phonepe'
  | 'googlepay'
  | 'paypal'
  | 'ccavenue'
  | 'instamojo'
  | 'cashfree'
  | 'payu'
  | 'airwallex';

// ============================================================================
// REPORTS & ANALYTICS
// ============================================================================

/**
 * DAILY REPORT - End of day summary
 */
export interface DailyReport {
  id: string;
  propertyId: string;
  reportDate: string; // ISO date
  
  // Occupancy
  totalRooms: number;
  occupiedRooms: number;
  availableRooms: number;
  occupancyRate: number; // percentage
  
  // Bookings
  newBookings: number;
  checkIns: number;
  checkOuts: number;
  cancellations: number;
  noShows: number;
  
  // Revenue
  roomRevenue: number;
  posRevenue: number;
  otherRevenue: number;
  totalRevenue: number;
  
  // Payments
  cashPayments: number;
  cardPayments: number;
  upiPayments: number;
  otherPayments: number;
  totalPayments: number;
  
  // Outstanding
  totalOutstanding: number;
  
  // Channel Performance
  channelBreakdown: ChannelPerformance[];
  
  // Generated
  generatedBy?: string; // User ID
  generatedAt: string;
  createdAt: string;
}

export interface ChannelPerformance {
  channel: BookingChannel;
  bookings: number;
  revenue: number;
}

// ============================================================================
// SETTINGS & CONFIGURATION
// ============================================================================

/**
 * PROPERTY SETTINGS - Configurable options
 */
export interface PropertySettings {
  id: string;
  propertyId: string;
  
  // General
  timezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  currency: string;
  language: string;
  
  // Financial
  taxRate: number;
  serviceTaxRate: number;
  roundingMethod: 'none' | 'up' | 'down' | 'nearest';
  
  // Booking
  advanceBookingDays: number;
  minimumStayNights: number;
  maximumStayNights: number;
  allowSameDayBooking: boolean;
  
  // Check-in/out
  checkInTime: string;
  checkOutTime: string;
  earlyCheckInCharge?: number;
  lateCheckOutCharge?: number;
  
  // Notifications
  emailNotifications: boolean;
  smsNotifications: boolean;
  
  // Security
  requireGuestId: boolean;
  requireAdvancePayment: boolean;
  minimumAdvancePayment: number; // percentage
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// AUDIT & LOGGING
// ============================================================================

/**
 * AUDIT LOG - System activity tracking
 */
export interface AuditLog {
  id: string;
  propertyId: string;
  
  // Action
  action: string; // e.g., 'booking_created', 'payment_received'
  entity: string; // e.g., 'booking', 'guest', 'payment'
  entityId: string;
  
  // Changes
  changesBefore?: any;
  changesAfter?: any;
  
  // User
  userId?: string;
  userName?: string;
  
  // Metadata
  ipAddress?: string;
  userAgent?: string;
  
  // Timestamp
  timestamp: string;
  createdAt: string;
}

// ============================================================================
// HELPER TYPES
// ============================================================================

/**
 * API Response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

/**
 * Pagination
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Filter options
 */
export interface FilterOptions {
  startDate?: string;
  endDate?: string;
  status?: string;
  channel?: BookingChannel;
  roomType?: string;
  searchQuery?: string;
}

/**
 * Sort options
 */
export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

export interface PricingRule {
  id: string;
  name: string;
  type: 'weekend' | 'holiday' | 'custom';
  adjustmentType: 'percentage' | 'fixed';
  adjustmentValue: number;
  applyTo: {
    rooms: boolean;
    beds: boolean;
    meals: boolean;
    pos: boolean;
    charges: boolean;
  };
  startDate?: string;
  endDate?: string;
  daysOfWeek?: number[]; // 0 = Sunday, 6 = Saturday
  enabled: boolean;
}