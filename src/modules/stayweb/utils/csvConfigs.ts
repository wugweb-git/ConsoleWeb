/**
 * Centralized CSV column specifications for every entity type.
 * Used by the CSVImportModal to display 📋 format instructions and generate template.csv files.
 */

import type { CSVColumnSpec, CSVTemplateRow } from '../components/ui/CSVImportModal';

// ═══════════════════════════════════════════════════════════
// ROOMS
// ═══════════════════════════════════════════════════════════
export const roomCSVColumns: CSVColumnSpec[] = [
  { name: 'name', required: true, example: 'Deluxe Dorm', description: 'Room display name' },
  { name: 'type', required: true, example: 'dorm', description: '"dorm" or "private"' },
  { name: 'beds', required: true, example: '8', description: 'Number of beds in the room' },
  { name: 'maxOccupancy', required: false, example: '8', description: 'Max guests (defaults to beds)' },
  { name: 'basePrice', required: true, example: '500', description: 'Base price per night (₹)' },
  { name: 'size', required: false, example: '25', description: 'Room size in sqm' },
  { name: 'description', required: false, example: 'Spacious mixed dorm', description: 'Short description' },
  { name: 'amenities', required: false, example: 'WiFi;AC;Locker', description: 'Semicolon-separated list' },
];

export const roomCSVTemplateRows: CSVTemplateRow[] = [
  { name: 'Deluxe Dorm', type: 'dorm', beds: '8', maxOccupancy: '8', basePrice: '500', size: '25', description: 'Spacious mixed dorm with AC', amenities: 'WiFi;AC;Locker' },
  { name: 'Private Room A1', type: 'private', beds: '1', maxOccupancy: '2', basePrice: '1200', size: '15', description: 'Cozy private room', amenities: 'WiFi;AC;TV;Towels' },
];

// ═══════════════════════════════════════════════════════════
// GUESTS
// ═══════════════════════════════════════════════════════════
export const guestCSVColumns: CSVColumnSpec[] = [
  { name: 'name', required: true, example: 'John Doe', description: 'Full name of the guest' },
  { name: 'email', required: false, example: 'john@example.com', description: 'Email address' },
  { name: 'phone', required: false, example: '+91-9876543210', description: 'Phone number' },
  { name: 'nationality', required: false, example: 'India', description: 'Country of origin' },
  { name: 'idType', required: false, example: 'Passport', description: 'ID document type' },
  { name: 'idNumber', required: false, example: 'A12345678', description: 'ID document number' },
];

export const guestCSVTemplateRows: CSVTemplateRow[] = [
  { name: 'John Doe', email: 'john@example.com', phone: '+91-9876543210', nationality: 'India', idType: 'Passport', idNumber: 'A12345678' },
  { name: 'Jane Smith', email: 'jane.smith@mail.com', phone: '+44-7911123456', nationality: 'United Kingdom', idType: 'Driving License', idNumber: 'SMITH901234JA' },
];

// ═══════════════════════════════════════════════════════════
// POS ITEMS
// ═══════════════════════════════════════════════════════════
export const posItemCSVColumns: CSVColumnSpec[] = [
  { name: 'Name', required: true, example: 'Masala Chai', description: 'Menu item name' },
  { name: 'Category', required: true, example: 'Beverages', description: 'Light Meals, Mains, Quick Bites, Desserts, Beverages, Bar, Add-Ons' },
  { name: 'Subcategory', required: false, example: 'Hot Drinks', description: 'Optional sub-group' },
  { name: 'Price', required: true, example: '40', description: 'Price in ₹' },
  { name: 'Unit', required: false, example: 'cup', description: 'Unit (cup, plate, piece, etc.)' },
  { name: 'Description', required: false, example: 'Spiced Indian tea', description: 'Short description' },
  { name: 'Prep Time (min)', required: false, example: '5', description: 'Preparation time in minutes' },
  { name: 'Diet Flag', required: false, example: 'veg;vegan', description: 'Semicolon-separated dietary flags' },
  { name: 'Ingredients', required: false, example: 'Tea, Milk, Spices', description: 'Comma-separated ingredients' },
  { name: 'Allergens', required: false, example: 'Dairy', description: 'Semicolon-separated allergens' },
  { name: 'Available', required: false, example: 'Yes', description: '"Yes" or "No" (default: Yes)' },
  { name: 'Image URL', required: false, example: '', description: 'Optional image URL' },
];

export const posItemCSVTemplateRows: CSVTemplateRow[] = [
  { Name: 'Masala Chai', Category: 'Beverages', Subcategory: 'Hot Drinks', Price: '40', Unit: 'cup', Description: 'Spiced Indian tea', 'Prep Time (min)': '5', 'Diet Flag': 'veg', Ingredients: 'Tea, Milk, Spices, Sugar', Allergens: 'Dairy', Available: 'Yes', 'Image URL': '' },
  { Name: 'Paneer Tikka', Category: 'Mains', Subcategory: 'Indian Starters', Price: '220', Unit: 'plate', Description: 'Grilled cottage cheese', 'Prep Time (min)': '15', 'Diet Flag': 'veg;gluten-free', Ingredients: 'Paneer, Bell Pepper, Onion, Spices', Allergens: 'Dairy', Available: 'Yes', 'Image URL': '' },
];

// ═══════════════════════════════════════════════════════════
// MEAL PLANS
// ═══════════════════════════════════════════════════════════
export const mealPlanCSVColumns: CSVColumnSpec[] = [
  { name: 'Name', required: true, example: 'Full Board', description: 'Meal plan name' },
  { name: 'Type', required: true, example: 'breakfast', description: 'breakfast, lunch, dinner, or custom' },
  { name: 'Price', required: true, example: '350', description: 'Price per person (₹)' },
  { name: 'Description', required: false, example: 'All meals included', description: 'Short description' },
  { name: 'Included Items', required: false, example: 'Rice;Dal;Roti;Salad', description: 'Semicolon-separated list of items' },
];

export const mealPlanCSVTemplateRows: CSVTemplateRow[] = [
  { Name: 'Breakfast Buffet', Type: 'breakfast', Price: '200', Description: 'Continental + Indian breakfast', 'Included Items': 'Toast;Eggs;Cereal;Chai;Coffee;Paratha;Jam' },
  { Name: 'Dinner Set Menu', Type: 'dinner', Price: '350', Description: 'Fixed menu dinner', 'Included Items': 'Rice;Dal;Roti;Paneer;Salad;Dessert' },
];

// ═══════════════════════════════════════════════════════════
// CHARGES / FEES
// ═══════════════════════════════════════════════════════════
export const chargeCSVColumns: CSVColumnSpec[] = [
  { name: 'Name', required: true, example: 'Late Checkout Fee', description: 'Charge name' },
  { name: 'Category', required: false, example: 'room', description: 'Category (room, service, general)' },
  { name: 'Amount', required: true, example: '200', description: 'Amount in ₹' },
  { name: 'Description', required: false, example: 'Checkout after 11 AM', description: 'Short description' },
  { name: 'Tax Inclusive', required: false, example: 'Yes', description: '"Yes" or "No" (default: No)' },
];

export const chargeCSVTemplateRows: CSVTemplateRow[] = [
  { Name: 'Late Checkout Fee', Category: 'room', Amount: '200', Description: 'Checkout after 11 AM', 'Tax Inclusive': 'No' },
  { Name: 'Laundry Service', Category: 'service', Amount: '150', Description: 'Per load laundry', 'Tax Inclusive': 'Yes' },
];

// ═══════════════════════════════════════════════════════════
// BOOKINGS
// ══════════════════════════════════════════════════════════
export const bookingCSVColumns: CSVColumnSpec[] = [
  { name: 'Guest Name', required: true, example: 'John Doe', description: 'Full name' },
  { name: 'Room', required: true, example: 'D1-B3', description: 'Room/bed assignment' },
  { name: 'Check-In', required: true, example: '2026-03-01', description: 'YYYY-MM-DD format' },
  { name: 'Check-Out', required: true, example: '2026-03-05', description: 'YYYY-MM-DD format' },
  { name: 'Status', required: false, example: 'confirmed', description: 'confirmed, checked-in, pending' },
  { name: 'Total', required: false, example: '2000', description: 'Total amount in ₹' },
];

export const bookingCSVTemplateRows: CSVTemplateRow[] = [
  { 'Guest Name': 'John Doe', Room: 'D1-B3', 'Check-In': '2026-03-01', 'Check-Out': '2026-03-05', Status: 'confirmed', Total: '2000' },
  { 'Guest Name': 'Jane Smith', Room: 'P2', 'Check-In': '2026-03-02', 'Check-Out': '2026-03-04', Status: 'confirmed', Total: '2400' },
];

// ═══════════════════════════════════════════════════════════
// STAFF
// ═══════════════════════════════════════════════════════════
export const staffCSVColumns: CSVColumnSpec[] = [
  { name: 'Name', required: true, example: 'Priya Sharma', description: 'Full name of the staff member' },
  { name: 'Email', required: true, example: 'priya@stayweb.in', description: 'Login email address' },
  { name: 'Role', required: true, example: 'Receptionist', description: 'Receptionist, Manager, Housekeeping, etc.' },
];

export const staffCSVTemplateRows: CSVTemplateRow[] = [
  { Name: 'Priya Sharma', Email: 'priya@stayweb.in', Role: 'Receptionist' },
  { Name: 'Rahul Verma', Email: 'rahul@stayweb.in', Role: 'Manager' },
];

// ═══════════════════════════════════════════════════════════
// ADMIN — STAFF ROLES (Platform Config)
// ═══════════════════════════════════════════════════════════
export const adminStaffRoleCSVColumns: CSVColumnSpec[] = [
  { name: 'name', required: true, example: 'Receptionist', description: 'Role name' },
  { name: 'permissions', required: true, example: 'bookings,guests,checkin', description: 'Comma-separated permission keys' },
  { name: 'description', required: false, example: 'Front desk operations', description: 'Brief description of the role' },
];
export const adminStaffRoleCSVTemplateRows: CSVTemplateRow[] = [
  { name: 'Receptionist', permissions: 'bookings,guests,checkin', description: 'Front desk operations' },
  { name: 'Manager', permissions: 'all', description: 'Full access to all modules' },
];

// ═══════════════════════════════════════════════════════════
// ADMIN — POS CATEGORIES
// ═══════════════════════════════════════════════════════════
export const adminPOSCategoryCSVColumns: CSVColumnSpec[] = [
  { name: 'name', required: true, example: 'Beverages', description: 'Category name' },
  { name: 'description', required: false, example: 'Drinks and juices', description: 'Short description' },
  { name: 'color', required: false, example: '#3B82F6', description: 'Hex colour code' },
  { name: 'icon', required: false, example: 'Coffee', description: 'Lucide icon name (auto-assigned from name if blank)' },
  { name: 'isAlcohol', required: false, example: 'false', description: '"true" or "false"' },
];
export const adminPOSCategoryCSVTemplateRows: CSVTemplateRow[] = [
  { name: 'Beverages', description: 'Drinks and juices', color: '#3B82F6', icon: 'Coffee', isAlcohol: 'false' },
  { name: 'Bar', description: 'Alcoholic drinks', color: '#8B5CF6', icon: 'Wine', isAlcohol: 'true' },
];

// ═══════════════════════════════════════════════════════════
// ADMIN — POS DIETARY TAGS
// ═══════════════════════════════════════════════════════════
export const adminPOSDietaryCSVColumns: CSVColumnSpec[] = [
  { name: 'name', required: true, example: 'Vegetarian', description: 'Dietary type name' },
  { name: 'label', required: true, example: 'Veg', description: 'Short display label' },
  { name: 'code', required: true, example: 'VEG', description: 'Uppercase code' },
];
export const adminPOSDietaryCSVTemplateRows: CSVTemplateRow[] = [
  { name: 'Vegetarian', label: 'Veg', code: 'VEG' },
  { name: 'Non-Vegetarian', label: 'Non-Veg', code: 'NONVEG' },
];

// ═══════════════════════════════════════════════════════════
// ADMIN — POS UNITS
// ═══════════════════════════════════════════════════════════
export const adminPOSUnitCSVColumns: CSVColumnSpec[] = [
  { name: 'name', required: true, example: 'Plate', description: 'Unit name' },
  { name: 'abbreviation', required: true, example: 'pl', description: 'Short abbreviation' },
];
export const adminPOSUnitCSVTemplateRows: CSVTemplateRow[] = [
  { name: 'Plate', abbreviation: 'pl' },
  { name: 'Bottle', abbreviation: 'btl' },
];

// ═══════════════════════════════════════════════════════════
// ADMIN — ROOM TYPES
// ═══════════════════════════════════════════════════════════
export const adminRoomTypeCSVColumns: CSVColumnSpec[] = [
  { name: 'name', required: true, example: 'Mixed Dorm', description: 'Room type name' },
  { name: 'capacity', required: true, example: '8', description: 'Max capacity (beds)' },
  { name: 'description', required: false, example: 'Shared mixed-gender dorm', description: 'Brief description' },
];
export const adminRoomTypeCSVTemplateRows: CSVTemplateRow[] = [
  { name: 'Mixed Dorm', capacity: '8', description: 'Shared mixed-gender dorm' },
  { name: 'Private Double', capacity: '2', description: 'Private room with double bed' },
];

// ═══════════════════════════════════════════════════════════
// ADMIN — AMENITIES
// ═══════════════════════════════════════════════════════════
export const adminAmenityCSVColumns: CSVColumnSpec[] = [
  { name: 'name', required: true, example: 'Free WiFi', description: 'Amenity name' },
  { name: 'category', required: true, example: 'Connectivity', description: 'Category group' },
  { name: 'type', required: false, example: 'public', description: 'Amenity type: "room" or "public"' },
  { name: 'icon', required: false, example: 'Wifi', description: 'Lucide icon name (auto-assigned from name if blank)' },
  { name: 'description', required: false, example: 'High-speed internet access', description: 'Brief description' },
];
export const adminAmenityCSVTemplateRows: CSVTemplateRow[] = [
  { name: 'Free WiFi', category: 'Connectivity', type: 'room', icon: 'Wifi', description: 'High-speed internet access' },
  { name: 'Swimming Pool', category: 'Recreation', type: 'public', icon: 'Waves', description: 'Outdoor pool open 7am-9pm' },
];

// ═══════════════════════════════════════════════════════════
// ADMIN — MANUAL CHARGES
// ═══════════════════════════════════════════════════════════
export const adminManualChargeCSVColumns: CSVColumnSpec[] = [
  { name: 'name', required: true, example: 'Late Checkout Fee', description: 'Charge name' },
  { name: 'icon', required: false, example: 'Clock', description: 'Lucide icon name (auto-assigned from name if blank)' },
  { name: 'category', required: false, example: 'Accommodation', description: 'Charge category' },
];
export const adminManualChargeCSVTemplateRows: CSVTemplateRow[] = [
  { name: 'Late Checkout Fee', icon: 'Clock', category: 'Accommodation' },
  { name: 'Laundry Service', icon: 'Shirt', category: 'Services' },
];

// ═══════════════════════════════════════════════════════════
// ADMIN — ID DOCUMENT TYPES
// ═══════════════════════════════════════════════════════════
export const adminIdDocTypeCSVColumns: CSVColumnSpec[] = [
  { name: 'name', required: true, example: 'Passport', description: 'Document type name' },
  { name: 'code', required: true, example: 'PASSPORT', description: 'Uppercase code' },
  { name: 'description', required: false, example: 'International travel document', description: 'Brief description' },
];
export const adminIdDocTypeCSVTemplateRows: CSVTemplateRow[] = [
  { name: 'Passport', code: 'PASSPORT', description: 'International travel document' },
  { name: 'Aadhaar Card', code: 'AADHAAR', description: 'Indian national ID' },
];

// ═══════════════════════════════════════════════════════════
// ADMIN — GENDER OPTIONS
// ═══════════════════════════════════════════════════════════
export const adminGenderCSVColumns: CSVColumnSpec[] = [
  { name: 'name', required: true, example: 'Non-Binary', description: 'Display name' },
  { name: 'code', required: true, example: 'non-binary', description: 'Lowercase code' },
];
export const adminGenderCSVTemplateRows: CSVTemplateRow[] = [
  { name: 'Male', code: 'male' },
  { name: 'Female', code: 'female' },
  { name: 'Non-Binary', code: 'non-binary' },
];

// ═══════════════════════════════════════════════════════════
// ADMIN — HK TASK TYPES
// ═══════════════════════════════════════════════════════════
export const adminHKTaskTypeCSVColumns: CSVColumnSpec[] = [
  { name: 'name', required: true, example: 'Checkout Clean', description: 'Task type name' },
  { name: 'code', required: true, example: 'checkout-clean', description: 'Kebab-case code' },
  { name: 'estimatedMinutes', required: false, example: '45', description: 'Estimated minutes to complete' },
  { name: 'checklist', required: false, example: 'Strip beds,Wipe surfaces,Vacuum floor', description: 'Comma-separated checklist items' },
  { name: 'icon', required: false, example: 'Brush', description: 'Lucide icon name (auto-assigned from name if blank)' },
  { name: 'colorScheme', required: false, example: 'bg-info-bg text-info-foreground border-info-border', description: 'Tailwind colour classes' },
];
export const adminHKTaskTypeCSVTemplateRows: CSVTemplateRow[] = [
  { name: 'Checkout Clean', code: 'checkout-clean', estimatedMinutes: '45', checklist: 'Strip beds,Wipe surfaces,Vacuum floor', icon: 'Brush', colorScheme: 'bg-info-bg text-info-foreground border-info-border' },
];

// ═══════════════════════════════════════════════════════════
// ADMIN — HK PRIORITIES
// ═══════════════════════════════════════════════════════════
export const adminHKPriorityCSVColumns: CSVColumnSpec[] = [
  { name: 'name', required: true, example: 'Urgent', description: 'Priority name' },
  { name: 'code', required: true, example: 'urgent', description: 'Lowercase code' },
  { name: 'color', required: false, example: 'bg-error-bg text-error-foreground border-error-border', description: 'Tailwind colour classes' },
];
export const adminHKPriorityCSVTemplateRows: CSVTemplateRow[] = [
  { name: 'Urgent', code: 'urgent', color: 'bg-error-bg text-error-foreground border-error-border' },
  { name: 'Normal', code: 'normal', color: 'bg-info-bg text-info-foreground border-info-border' },
];

// ═══════════════════════════════════════════════════════════
// ADMIN — HK ROOM ITEMS
// ═══════════════════════════════════════════════════════════
export const adminHKRoomItemCSVColumns: CSVColumnSpec[] = [
  { name: 'name', required: true, example: 'Bath Towel', description: 'Item name' },
  { name: 'category', required: true, example: 'Towels', description: 'Linen / Towels / Toiletries / Supplies' },
  { name: 'parPerBed', required: false, example: '1', description: 'PAR per bed (0 = per-room)' },
  { name: 'unit', required: false, example: 'pcs', description: 'Unit of measure' },
];
export const adminHKRoomItemCSVTemplateRows: CSVTemplateRow[] = [
  { name: 'Bath Towel', category: 'Towels', parPerBed: '1', unit: 'pcs' },
  { name: 'Shampoo Sachet', category: 'Toiletries', parPerBed: '1', unit: 'pcs' },
];

// ═══════════════════════════════════════════════════════════
// ADMIN — STAFF DEPARTMENTS
// ═══════════════════════════════════════════════════════════
export const adminStaffDeptCSVColumns: CSVColumnSpec[] = [
  { name: 'name', required: true, example: 'Front Desk', description: 'Department name' },
  { name: 'description', required: false, example: 'Reception and check-in/out', description: 'Brief description' },
  { name: 'roles', required: false, example: 'Receptionist,Night Auditor', description: 'Comma-separated role names' },
];
export const adminStaffDeptCSVTemplateRows: CSVTemplateRow[] = [
  { name: 'Front Desk', description: 'Reception and check-in/out', roles: 'Receptionist,Night Auditor' },
  { name: 'Housekeeping', description: 'Room cleaning and maintenance', roles: 'Housekeeper,Supervisor' },
];

// ═══════════════════════════════════════════════════════════
// ADMIN — SHIFT TYPES
// ═══════════════════════════════════════════════════════════
export const adminShiftTypeCSVColumns: CSVColumnSpec[] = [
  { name: 'name', required: true, example: 'Morning', description: 'Shift name' },
  { name: 'code', required: true, example: 'morning', description: 'Lowercase code' },
  { name: 'startTime', required: true, example: '06:00', description: 'Start time (HH:MM)' },
  { name: 'endTime', required: true, example: '14:00', description: 'End time (HH:MM)' },
  { name: 'color', required: false, example: 'bg-warning-bg text-warning-foreground border-warning-border', description: 'Tailwind colour classes' },
];
export const adminShiftTypeCSVTemplateRows: CSVTemplateRow[] = [
  { name: 'Morning', code: 'morning', startTime: '06:00', endTime: '14:00', color: 'bg-warning-bg text-warning-foreground border-warning-border' },
  { name: 'Evening', code: 'evening', startTime: '14:00', endTime: '22:00', color: 'bg-info-bg text-info-foreground border-info-border' },
];

// ═══════════════════════════════════════════════════════════
// FLEXIBLE PRICING RULES
// ═══════════════════════════════════════════════════════════
export const pricingRuleCSVColumns: CSVColumnSpec[] = [
  { name: 'Name', required: true, example: 'Summer Weekend Premium', description: 'Rule name' },
  { name: 'Type', required: true, example: 'weekend', description: 'weekend, holiday, or custom' },
  { name: 'Adjustment Type', required: true, example: 'percentage', description: '"percentage" or "fixed"' },
  { name: 'Adjustment Value', required: true, example: '20', description: 'Amount (% or ₹)' },
  { name: 'Apply To', required: false, example: 'rooms;beds', description: 'Semicolon-separated: rooms, beds, meals, pos, charges' },
  { name: 'Start Date', required: false, example: '2026-03-01', description: 'YYYY-MM-DD (optional)' },
  { name: 'End Date', required: false, example: '2026-03-31', description: 'YYYY-MM-DD (optional)' },
  { name: 'Days of Week (0=Sun,6=Sat)', required: false, example: '5;6', description: 'Semicolon-separated day numbers' },
  { name: 'Enabled', required: false, example: 'Yes', description: '"Yes" or "No" (default: Yes)' },
];
export const pricingRuleCSVTemplateRows: CSVTemplateRow[] = [
  { Name: 'Summer Weekend Premium', Type: 'weekend', 'Adjustment Type': 'percentage', 'Adjustment Value': '20', 'Apply To': 'rooms;beds', 'Start Date': '', 'End Date': '', 'Days of Week (0=Sun,6=Sat)': '5;6', Enabled: 'Yes' },
  { Name: 'Diwali Special', Type: 'holiday', 'Adjustment Type': 'fixed', 'Adjustment Value': '500', 'Apply To': 'rooms', 'Start Date': '2026-10-20', 'End Date': '2026-10-24', 'Days of Week (0=Sun,6=Sat)': '', Enabled: 'Yes' },
];