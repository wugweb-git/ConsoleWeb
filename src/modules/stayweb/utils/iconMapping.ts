import { 
  Wifi, Tv, Wind, Car, Trees, Snowflake, Coffee, Utensils,
  Shield, Lock, Baby, Accessibility, Dumbbell, Leaf, HelpCircle,
  Salad, ChefHat, Sandwich, Cake, Beer, Wine, CirclePlus, LayoutGrid, UtensilsCrossed,
  Brush, Star, Repeat, AlertTriangle, CheckCircle2, Clock,
  Sparkles, Wrench, Eye, BedDouble, Package, WashingMachine,
  Hammer, ThermometerSun, Droplets,
  // Additional safe icons for comprehensive registry
  Home, Building2, MapPin, Phone, Mail, Globe, Camera, Upload,
  User, Users, Briefcase, CreditCard, Receipt, IndianRupee,
  Key, Zap, Waves, Gamepad2, Headphones, Bird,
  Printer, FileText, Calendar, Bell, Settings, Search,
  Heart, ThumbsUp, MessageCircle, Send, Share2,
  Moon, Sun, CloudRain, Umbrella, Mountain,
  Music, Volume2, Mic, Radio,
  ShoppingCart, ShoppingBag, Store, Tag, Gift, Percent,
  Truck, Plane, Train, Ship, Bike,
  BookOpen, GraduationCap, Pencil, Clipboard,
  Flame, Activity,
  Laptop, Monitor, Smartphone, Tablet, Cpu,
  Link, ExternalLink, Download, RefreshCw, RotateCcw,
  Check, X, Plus, Minus, ArrowRight, ArrowLeft,
  ChevronRight, ChevronDown, MoreHorizontal,
  Layers, Grid3x3, BarChart3, PieChart, TrendingUp,
  FolderOpen, Archive, Bookmark, Flag, Award,
  Scissors, Palette, Paintbrush, Aperture,
  Timer, Hourglass, Watch,
  Compass, Navigation, Map, Route,
  Shirt, Crown, Gem,
  Fish, Bug, Flower2,
  Plug, BatteryCharging, Signal, WifiOff,
  Wallet, Recycle, Bed, Box, Network, Loader2,
} from 'lucide-react';
import type { ElementType } from 'react';

// ─── UNIFIED ICON REGISTRY ───────────────────────────────────────────────────
// Single source of truth for all icon key → component resolution across the app.
// Every icon field in Platform Config (amenities, manual charges, HK task types,
// POS categories, etc.) stores a key from this registry.

export const ICON_REGISTRY: Record<string, ElementType> = {
  // ── Accommodation & Property ──
  Home, Building2, BedDouble, Bed, Key, Lock, Box,

  // ── Amenities & Facilities ──
  Wifi, WifiOff, Tv, Wind, Car, Trees, Snowflake,
  Zap, Waves, Gamepad2, Headphones, Bird,
  Dumbbell, Accessibility, Baby, Shield,
  Plug, BatteryCharging, Signal, Mountain,

  // ── Food & Beverage ──
  Coffee, Utensils, UtensilsCrossed, Salad, ChefHat, Sandwich, Cake,
  Beer, Wine, Flame, Fish,

  // ── Housekeeping & Maintenance ──
  Brush, Sparkles, WashingMachine,
  Wrench, Hammer,
  Droplets, ThermometerSun,
  Eye, Package, Recycle,

  // ── People & Staff ──
  User, Users, Briefcase, GraduationCap, Shirt, Crown, Gem,

  // ── Finance & Payments ──
  CreditCard, Receipt, IndianRupee, Wallet, Percent, Tag,

  // ── Commerce & POS ──
  ShoppingCart, ShoppingBag, Store, Gift,
  CirclePlus, LayoutGrid,

  // ── Communication ──
  Phone, Mail, Globe, MessageCircle, Send, Share2,
  Bell, Volume2, Mic, Radio, Music,

  // ── Time & Scheduling ──
  Clock, Timer, Hourglass, Watch, Calendar,

  // ── Documents & Content ──
  FileText, Clipboard, BookOpen, Pencil, Printer,
  FolderOpen, Archive, Bookmark, Flag, Award,

  // ── Travel & Transport ──
  Truck, Plane, Train, Ship, Bike, MapPin, Map, Route,

  // ── Nature & Environment ──
  Leaf, Flower2, Bug, Sun, Moon,
  CloudRain, Umbrella, Compass, Navigation,

  // ── Tech & Devices ──
  Laptop, Monitor, Smartphone, Tablet, Cpu, Camera, Network,

  // ── UI & Actions ──
  Star, Heart, ThumbsUp, Search, Settings,
  Check, X, Plus, Minus, RefreshCw, RotateCcw,
  Download, Upload, Link, ExternalLink,
  ArrowRight, ArrowLeft, ChevronRight, ChevronDown,

  // ── Charts & Data ──
  BarChart3, PieChart, TrendingUp, Activity, Layers, Grid3x3,

  // ── Creative ──
  Scissors, Palette, Paintbrush, Aperture,

  // ── Status & Alerts ──
  AlertTriangle, CheckCircle2, Repeat, HelpCircle, Loader2,
  MoreHorizontal,
};

/** All available icon keys, sorted alphabetically for the picker UI */
export const ICON_KEYS = Object.keys(ICON_REGISTRY).sort();

// ─── Case-insensitive lookup map (built once) ────────────────────────────────
// CSV imports and external data may store icon keys as lowercase ("waves"),
// kebab-case ("circle-dot"), or other variants. This normalised map resolves
// them all to PascalCase registry keys without a linear scan each time.
const _NORMALISED_REGISTRY: Record<string, ElementType> = {};
for (const [key, comp] of Object.entries(ICON_REGISTRY)) {
  _NORMALISED_REGISTRY[key.toLowerCase()] = comp;           // "BedDouble" → "beddouble"
  _NORMALISED_REGISTRY[key.toLowerCase().replace(/\d+/g, '')] = comp; // "Building2" → "building"
}

/** Resolve a Lucide icon key to a component. Supports PascalCase, lowercase, and kebab-case. Returns fallback if not found. */
export function getIconByKey(key: string, fallback?: ElementType): ElementType {
  if (!key) return fallback || HelpCircle;
  // 1. Exact match (fastest path)
  if (ICON_REGISTRY[key]) return ICON_REGISTRY[key];
  // 2. Case-insensitive / normalised lookup
  const norm = key.toLowerCase().replace(/-/g, '');
  if (_NORMALISED_REGISTRY[norm]) return _NORMALISED_REGISTRY[norm];
  return fallback || HelpCircle;
}

// ─── AUTO-SUGGEST ENGINE ─────────────────────────────────────────────────────
// Maps common words/phrases in item names to icon keys.
// Used by CSV imports and the "auto" option in the icon picker.

const KEYWORD_TO_ICON: [RegExp, string][] = [
  // Accommodation
  [/\\bwi-?fi\b/i,             'Wifi'],
  [/\\binternet\b/i,           'Wifi'],
  [/\\bhigh\s*speed/i,         'Wifi'],
  [/\\ba\.?c\.?\b/i,           'Wind'],
  [/\\bair\s*condition/i,      'Wind'],
  [/\\bfan\b/i,                'Wind'],
  [/\\btv\b|television|lcd/i,  'Tv'],
  [/\\bstream/i,               'Monitor'],
  [/\\bpark/i,                 'Car'],
  [/\\bgarden\b/i,             'Trees'],
  [/\\btree/i,                 'Trees'],
  [/\\bheat/i,                 'ThermometerSun'],
  [/\\bcoffee/i,               'Coffee'],
  [/\\btea\b/i,                'Coffee'],
  [/\\bkettle/i,               'Coffee'],
  [/\\bkitchen/i,              'Utensils'],
  [/\\bcook/i,                 'Utensils'],
  [/\\bsafe\b|vault/i,        'Shield'],
  [/\\block/i,                 'Lock'],
  [/\\bkey\b/i,                'Key'],
  [/\\bbaby|child|cot\b/i,     'Baby'],
  [/\\baccess/i,               'Accessibility'],
  [/\\bgym|fitness/i,          'Dumbbell'],
  [/\\beco|green|sustain/i,    'Leaf'],
  [/\\bpool|swim/i,            'Waves'],
  [/\\bgame|play/i,            'Gamepad2'],
  [/\\bpower|electric/i,       'Zap'],
  [/\\bcharg/i,                'BatteryCharging'],
  [/\\busb/i,                  'Smartphone'],
  [/\\b24.*hour|reception/i,   'Clock'],
  [/\\bconcierge/i,            'Bell'],
  [/\\bwild|nature|bird/i,     'Bird'],
  [/\\bpet|dog|cat|animal/i,   'Heart'],
  [/\\btent|camp/i,            'Mountain'],
  [/\\bmountain|trek|hike/i,   'Mountain'],
  [/\\bview\b/i,               'Eye'],
  [/\\blake/i,                 'Waves'],
  [/\\bsea\b|ocean/i,          'Waves'],
  [/\\bshower/i,               'Droplets'],
  [/\\bbath/i,                 'Droplets'],
  [/\\bbed\b/i,                'Bed'],
  [/\\blight/i,                'Sun'],
  [/\\bdoor/i,                 'Home'],
  [/\\bsofa|couch|seating/i,   'Home'],
  [/\\bwardrobe|closet/i,      'FolderOpen'],
  [/\\bdrawer/i,               'Archive'],
  [/\\bfridge|refriger/i,      'Box'],
  [/\\bnewspaper/i,            'FileText'],
  [/\\bsoundproof/i,           'Volume2'],
  [/\\bblackout/i,             'Moon'],
  [/\\bground\s*floor/i,       'Building2'],
  [/\\biron/i,                 'Shirt'],
  [/\\btoiletri/i,             'Sparkles'],
  [/\\bfree\s*toiletri/i,      'Sparkles'],
  [/\\bdesk\b/i,               'Laptop'],
  [/\\bmini\s*bar/i,           'Wine'],
  [/\\bmini\s*fridge/i,        'Box'],

  // ── Room Types ──
  [/\bdorm/i,                 'BedDouble'],
  [/\bprivate/i,              'Lock'],
  [/\bsuite/i,                'Crown'],
  [/\bdeluxe/i,               'Star'],
  [/\bfemale/i,               'User'],
  [/\bmale\b/i,               'User'],
  [/\bmixed/i,                'Users'],
  [/\bfamily/i,                'Users'],
  [/\bsingle\b/i,             'Bed'],
  [/\bdouble\b/i,             'BedDouble'],
  [/\btwin\b/i,               'BedDouble'],
  [/\bcabin/i,                'Home'],
  [/\bcottage/i,              'Home'],
  [/\bstudio/i,               'Home'],
  [/\bpenthouse/i,            'Crown'],
  [/\bbudget|economy/i,       'Wallet'],
  [/\bstandard/i,             'Home'],
  [/\bpremium/i,              'Star'],
  [/\bexecutive/i,            'Briefcase'],

  // ── ID Document Types ──
  [/\bpassport/i,             'Globe'],
  [/\baadhaar/i,              'FileText'],
  [/\bdriv/i,                 'Car'],
  [/\blicen[cs]e/i,           'FileText'],
  [/\bvoter/i,                'CheckCircle2'],
  [/\bpan\s*card|pan\b/i,     'CreditCard'],
  [/\bnational\s*id/i,        'FileText'],
  [/\bvisa\b/i,               'Plane'],
  [/\bbirth\s*cert/i,         'FileText'],
  [/\bration\s*card/i,        'FileText'],

  // ── Gender Options ──
  [/\bnon.?binary/i,          'Users'],
  [/\btransgender|trans\b/i,  'Users'],
  [/\bother|prefer\s*not/i,   'HelpCircle'],

  // ── HK Priorities ──
  [/\burgent|emergency|critical/i, 'AlertTriangle'],
  [/\bhigh\b/i,               'Flag'],
  [/\bnormal|medium|moderate/i, 'Star'],
  [/\blow\b/i,                'ArrowLeft'],

  // ── HK Room Items (Linen, Towels, Toiletries, Supplies) ──
  [/\btowel/i,                'Droplets'],
  [/\blinen|sheet|pillow\s*cover/i, 'BedDouble'],
  [/\bpillow\b/i,             'Bed'],
  [/\bblanket|duvet|comforter/i, 'BedDouble'],
  [/\bsoap/i,                 'Droplets'],
  [/\bshampoo|conditioner/i,  'Droplets'],
  [/\btoilet\s*paper|tissue/i, 'Package'],
  [/\bbin\s*liner|garbage|trash/i, 'Recycle'],
  [/\bsanitiz|disinfect/i,    'Shield'],
  [/\bbrush/i,                'Brush'],
  [/\bmop|bucket/i,           'Droplets'],
  [/\bsachet|packet/i,        'Package'],
  [/\bmat\b/i,                'Layers'],
  [/\bcurtain|drape/i,        'Home'],
  [/\bhanger/i,               'Shirt'],
  [/\bslipper|shoe/i,         'Shirt'],
  [/\brobe|gown/i,            'Shirt'],
  [/\bglove/i,                'Shield'],
  [/\bdetergent|cleaner/i,    'Sparkles'],

  // ── Staff Departments & Roles ──
  [/\bfront\s*desk|recep/i,   'Bell'],
  [/\bhousekeep/i,            'Brush'],
  [/\bmanag/i,                'Briefcase'],
  [/\bsecur/i,                'Shield'],
  [/\bmainten/i,              'Wrench'],
  [/\baccounts|financ/i,      'IndianRupee'],
  [/\bhr\b|human\s*resource/i, 'Users'],
  [/\boperation/i,            'Settings'],
  [/\bstaff/i,                'Users'],
  [/\bsupervisor/i,           'Eye'],
  [/\bauditor|audit/i,        'Clipboard'],
  [/\bchef|cook/i,            'ChefHat'],
  [/\bwaiter|steward/i,       'Utensils'],
  [/\bdriver/i,               'Car'],
  [/\bguard/i,                'Shield'],
  [/\bportor|bellboy|bell\s*boy/i, 'Bell'],

  // ── Staff Shifts ──
  [/\bmorning|day\b/i,        'Sun'],
  [/\bevening|afternoon/i,    'Sun'],
  [/\bnight|graveyard/i,      'Moon'],
  [/\brotating|split/i,       'Repeat'],
  [/\bgeneral|full\s*day/i,   'Clock'],

  // Food & Beverage
  [/\bbar\b|cocktail|spirit/i,    'Wine'],
  [/\bbeer|draft|lager|ale\b/i,   'Beer'],
  [/\bwine\b/i,                   'Wine'],
  [/\bjuice|water|soda|soft\s*drink/i, 'Coffee'],
  [/\bsalad|light\s*meal/i,       'Salad'],
  [/\bbreakfast/i,                 'Salad'],
  [/\bchef|main.*course|entr/i,   'ChefHat'],
  [/\bsnack|quick\s*bite/i,       'Sandwich'],
  [/\bsandwich|burger|wrap/i,     'Sandwich'],
  [/\bdessert|sweet|pastry/i,     'Cake'],
  [/\bice\s*cream/i,              'Cake'],
  [/\bpizza/i,                     'Utensils'],
  [/\bsoup|stew/i,                'Utensils'],
  [/\bmeat|chicken|mutton/i,      'Utensils'],
  [/\bfish|seafood|prawn/i,       'Fish'],
  [/\bfruit/i,                     'Leaf'],
  [/\bbeverage|drink/i,           'Coffee'],
  [/\bfood|meal|dine|restaurant/i, 'Utensils'],
  [/\badd.?on|extra|supplement/i,  'CirclePlus'],
  [/\bveg/i,                       'Leaf'],
  [/\balcohol|liquor/i,            'Wine'],
  [/\bnon.?veg/i,                  'Utensils'],
  [/\bhalal|kosher/i,              'Utensils'],
  [/\bgluten/i,                    'Leaf'],
  [/\bdairy/i,                     'Coffee'],
  [/\bnut/i,                       'Shield'],
  [/\borganic/i,                   'Leaf'],

  // ── POS Units ──
  [/\bplate\b/i,                   'Utensils'],
  [/\bcup\b/i,                     'Coffee'],
  [/\bbottle\b/i,                  'Wine'],
  [/\bglass\b/i,                   'Wine'],
  [/\bpiece|pcs\b/i,               'Box'],
  [/\bserving\b/i,                 'Utensils'],
  [/\bportion|bowl\b/i,            'Utensils'],
  [/\bkg\b|kilogram/i,             'Package'],
  [/\blit[re]+\b/i,                'Droplets'],
  [/\bml\b|millilit/i,             'Droplets'],
  [/\bdozen\b/i,                   'Grid3x3'],
  [/\bpack\b|packet/i,             'Package'],
  [/\bjug\b|pitcher/i,             'Coffee'],
  [/\bcan\b/i,                     'Box'],
  [/\bscoop\b/i,                   'Cake'],
  [/\bslice\b/i,                   'Scissors'],
  [/\bshot\b|peg\b/i,              'Wine'],

  // Housekeeping
  [/\bclean/i,                'Sparkles'],
  [/\blaundry|wash/i,         'WashingMachine'],
  [/\brepair|fix|maintain/i,  'Wrench'],
  [/\binspect|check/i,        'Eye'],
  [/\bdeep\s*clean/i,         'Sparkles'],
  [/\bsuppl/i,                'Package'],
  [/\blinen|towel|sheet/i,    'Package'],
  [/\btoilet/i,               'Droplets'],
  [/\bturndown|turn.?down/i,  'Moon'],
  [/\bstay.?over/i,           'Repeat'],
  [/\brefresh/i,              'RefreshCw'],

  // Finance & Charges
  [/\blate/i,                 'Clock'],
  [/\bcheckout|check.?out/i,  'Home'],
  [/\bcheckin|check.?in/i,    'Home'],
  [/\bfee|charge|surcharge/i, 'IndianRupee'],
  [/\btax|gst/i,              'Percent'],
  [/\bpayment|pay/i,          'CreditCard'],
  [/\brefund|return/i,        'RotateCcw'],
  [/\bdamage|breakage/i,      'AlertTriangle'],
  [/\bdeposit|security/i,     'Shield'],
  [/\btransport|cab|taxi|shuttle/i, 'Car'],
  [/\bairport|flight/i,       'Plane'],
  [/\btour|excursion|sight/i,  'Compass'],
  [/\bspa|massage|wellness/i,  'Heart'],
  [/\bpick.?up|drop/i,         'Truck'],
  [/\bprint|photocopy/i,       'Printer'],
  [/\bphone|call/i,            'Phone'],
  [/\bmail|email/i,            'Mail'],
  [/\broom\s*service/i,        'Bell'],
  [/\bminibar/i,               'Box'],
  [/\bstore|shop/i,            'Store'],
  [/\bgift/i,                  'Gift'],
  [/\bsmok/i,                  'Wind'],
  [/\bparcel|courier/i,        'Package'],
  [/\bmedical|first\s*aid/i,   'Activity'],
  [/\bcowork|workspace/i,      'Laptop'],
  [/\bevent|party|celebration/i, 'Calendar'],
  [/\bexcursion|adventure/i,   'Compass'],
  [/\bbonfire|fire\b/i,        'Flame'],
  [/\blibrary|book/i,          'BookOpen'],
  [/\blounge|common/i,         'Home'],
  [/\brooftop/i,               'Mountain'],
  [/\bterrace|balcony|patio/i, 'Mountain'],
  [/\bbeach/i,                 'Waves'],
  [/\bcycle|bicycle/i,         'Bike'],
  [/\bwater\s*sport/i,         'Waves'],
  [/\bkayak|canoe|raft/i,      'Waves'],
  [/\bscuba|snorkel|div/i,     'Waves'],
  [/\bsurf/i,                  'Waves'],
];

/**
 * Suggest the best icon key for a given item name.
 * Returns the first matching keyword rule, or the provided fallback.
 */
export function suggestIconForName(name: string, fallback = 'HelpCircle'): string {
  for (const [pattern, iconKey] of KEYWORD_TO_ICON) {
    if (pattern.test(name)) return iconKey;
  }
  return fallback;
}

// ─── GROUPED ICON CATEGORIES (for picker UI) ─────────────────────────────────

export const ICON_GROUPS: { label: string; keys: string[] }[] = [
  {
    label: 'Accommodation',
    keys: ['Home', 'Building2', 'BedDouble', 'Bed', 'Key', 'Lock', 'Box'],
  },
  {
    label: 'Amenities & Facilities',
    keys: ['Wifi', 'WifiOff', 'Tv', 'Wind', 'Car', 'Zap', 'Waves', 'Snowflake', 'Gamepad2', 'Headphones', 'Dumbbell', 'Accessibility', 'Baby', 'Shield', 'Plug', 'BatteryCharging', 'Signal'],
  },
  {
    label: 'Nature & Outdoors',
    keys: ['Trees', 'Mountain', 'Bird', 'Leaf', 'Flower2', 'Sun', 'Moon', 'CloudRain', 'Umbrella', 'Compass', 'Navigation', 'Fish', 'Bug'],
  },
  {
    label: 'Food & Beverage',
    keys: ['Coffee', 'Utensils', 'UtensilsCrossed', 'Salad', 'ChefHat', 'Sandwich', 'Cake', 'Beer', 'Wine', 'Flame', 'Fish', 'Bell'],
  },
  {
    label: 'Housekeeping',
    keys: ['Brush', 'Sparkles', 'WashingMachine', 'Wrench', 'Hammer', 'Droplets', 'ThermometerSun', 'Eye', 'Package', 'Recycle'],
  },
  {
    label: 'Finance & Commerce',
    keys: ['CreditCard', 'Receipt', 'IndianRupee', 'Wallet', 'Percent', 'Tag', 'ShoppingCart', 'ShoppingBag', 'Store', 'Gift', 'CirclePlus', 'LayoutGrid'],
  },
  {
    label: 'People & Staff',
    keys: ['User', 'Users', 'Briefcase', 'GraduationCap', 'Shirt', 'Crown', 'Gem'],
  },
  {
    label: 'Time & Scheduling',
    keys: ['Clock', 'Timer', 'Hourglass', 'Watch', 'Calendar'],
  },
  {
    label: 'Communication',
    keys: ['Phone', 'Mail', 'Globe', 'MessageCircle', 'Send', 'Share2', 'Bell', 'Volume2', 'Mic', 'Radio', 'Music'],
  },
  {
    label: 'Travel & Transport',
    keys: ['Truck', 'Plane', 'Train', 'Ship', 'Bike', 'MapPin', 'Map', 'Route'],
  },
  {
    label: 'Documents',
    keys: ['FileText', 'Clipboard', 'BookOpen', 'Pencil', 'Printer', 'FolderOpen', 'Archive', 'Bookmark', 'Flag', 'Award'],
  },
  {
    label: 'Status & Alerts',
    keys: ['Star', 'Heart', 'ThumbsUp', 'AlertTriangle', 'CheckCircle2', 'Repeat', 'HelpCircle', 'Activity'],
  },
];

// ─── EXISTING HELPER FUNCTIONS (preserved for backward compat) ────────────────

/** Resolve a Lucide icon key (stored in Platform Config) to a component. Falls back to Brush. */
export const getIconForHKTaskType = (iconKey: string): ElementType => {
  return ICON_REGISTRY[iconKey] || Brush;
};

export const amenityIcons: { [key: string]: any } = {
  // Connectivity
  'WiFi': Wifi, 'Wi-Fi': Wifi, 'Free WiFi': Wifi, 'Free Wi-Fi': Wifi, 'Internet': Wifi,
  'High Speed Internet': Wifi,
  // Climate
  'AC': Wind, 'Air Conditioning': Wind, 'Air-Conditioning': Wind, 'Fan': Wind,
  'Heating': Snowflake, 'Central Heating': Snowflake,
  // Entertainment
  'TV': Tv, 'Television': Tv, 'Smart TV': Tv, 'Cable TV': Tv, 'TV (LCD)': Tv,
  'Streaming Services': Monitor,
  'Music': Music, 'Speaker': Volume2, 'Games': Gamepad2, 'Indoor Games': Gamepad2,
  // Transport & Parking
  'Parking': Car, 'Free Parking': Car, 'Bike Rental': Bike, 'Bike Rentals': Bike,
  'Airport Pickup': Plane, 'Airport Shuttle': Plane, 'Shuttle Service': Truck,
  // Food & Drink
  'Coffee Maker': Coffee, 'Tea/Coffee': Coffee, 'Tea/Coffee Maker': Coffee, 'Tea Coffee Maker': Coffee,
  'Coffee Machine': Coffee, 'Electric Kettle': Coffee,
  'Minibar': Wine, 'Mini Bar': Wine,
  'Kitchen': Utensils, 'Kitchenette': Utensils, 'Shared Kitchen': Utensils,
  'Restaurant': UtensilsCrossed, 'Breakfast': Coffee, 'Free Breakfast': Coffee,
  'Bar': Beer, 'Bar / Cafe': Beer, 'Café': Coffee, 'Vending Machine': ShoppingCart,
  // Security & Safety
  'Safe': Shield, 'Safety Locker': Shield, 'Locker': Lock, 'Private Lockers': Lock,
  'Security': Shield, 'Security Lockers': Lock, 'Laptop Safe': Shield,
  'CCTV': Eye, '24/7 Security': Shield, 'Fire Extinguisher': Flame,
  'Key Card': Key, 'Key Card Access': Key,
  // Wellness & Fitness
  'Gym': Dumbbell, 'Fitness Center': Dumbbell, 'Fitness Centre': Dumbbell,
  'Swimming Pool': Waves, 'Pool': Waves, 'Infinity Pool': Waves,
  'Spa': Sparkles, 'Massage': Heart, 'Yoga': Activity, 'Meditation': Moon,
  'Sauna': ThermometerSun,
  // Accessibility
  'Accessible': Accessibility, 'Wheelchair Access': Accessibility,
  'Elevator': Building2, 'Lift': Building2,
  // Baby & Family
  'Baby Cot': Baby, 'Crib': Baby, 'Family Friendly': Users, 'Kids Area': Gamepad2,
  // Laundry & Cleaning
  'Laundry': WashingMachine, 'Laundry Service': WashingMachine, 'Iron': Shirt, 'Ironing': Shirt,
  'Iron / Ironing Board': Shirt, 'Ironing Board': Shirt,
  'Housekeeping': Brush, 'Daily Housekeeping': Brush,
  // Outdoor & Nature
  'Garden': Trees, 'Garden View': Trees, 'Outdoor Spaces': Trees,
  'Terrace': Mountain, 'Balcony': Mountain,
  'Rooftop': Mountain, 'Rooftop Bar': Beer, 'BBQ': Flame, 'Campfire': Flame,
  'Wildlife / Nature': Bird, 'Nature Trail': Compass, 'Beach Access': Waves,
  'Lake View': Waves, 'Sea View': Waves, 'Mountain View': Mountain,
  'Seating Area Outside Door': Trees, 'Seating Area Outside Dorm': Trees,
  // Work & Business
  'Co-working Space': Laptop, 'Co-Working': Laptop, 'Business Center': Monitor,
  'Meeting Room': Users, 'Desk': Laptop, 'Work Desk': Laptop, 'Printer': Printer,
  // Services
  '24-hr Reception': Clock, '24/7 Reception': Clock, 'Concierge': Headphones,
  'Room Service': Bell, 'Tour Desk': Map, 'Travel Assistance': Compass,
  'Luggage Storage': Archive, 'Currency Exchange': CreditCard,
  'Wake-Up Call': Bell, 'Express Check-in': Zap, 'Express Check-out': Zap,
  // Eco
  'Eco-Friendly': Leaf, 'Eco-Certified': Leaf, 'Solar Power': Sun,
  // Room features
  'Bed Linen': BedDouble, 'Linen Included': BedDouble, 'Towels': Droplets, 'Hot Water': Droplets,
  'Shower': Droplets, 'Bathtub': Droplets, 'Hair Dryer': Wind, 'Bathrobes': Shirt,
  'Toiletries': Sparkles, 'Free Toiletries': Sparkles,
  'Wardrobe': FolderOpen, 'Mirror': Aperture, 'Dedicated Drawers': Archive,
  'Reading Light': Sun, 'Blackout Curtains': Moon, 'Soundproof Rooms': Volume2,
  'King Size Bed': BedDouble, 'Twin Beds': BedDouble, 'Extra Bed Available': Bed,
  'Sofa': Home, 'Slippers': Shirt, 'Daily Newspaper': FileText,
  'Mini Fridge': Box, 'Ground Floor Unit': Building2,
  // Power & Charging
  'Power Backup': Zap, 'Charging Station': Zap, 'USB Charging': Smartphone,
  'Charging Points': BatteryCharging, 'USB Charging Ports': Smartphone,
  // Social
  'Common Area': Home, 'Lounge': Home, 'Library': BookOpen, 'Reading Room': BookOpen,
  'Events': Calendar, 'Live Music': Music, 'Movie Night': Monitor,
  // Pets
  'Pet Friendly': Heart, 'Pets Allowed': Heart,
  // Special
  'Female-Only Dorms': Users, 'Mixed Dorms': Users,
  'Smoking Area': Wind, 'Non-Smoking': Shield,
};

export const dietaryIcons: { [key: string]: any } = {
  'Vegetarian': Leaf,
  'Vegan': Leaf,
  'Gluten-Free': Utensils,
  'Dairy-Free': Utensils,
  'Halal': Utensils,
  'Kosher': Utensils,
  'Nut-Free': Shield,
  'Organic': Leaf,
  'Non-Vegetarian': Utensils,
};

export const getIconForAmenity = (amenity: string) => {
  // 1. Direct match from amenityIcons
  if (amenityIcons[amenity]) return amenityIcons[amenity];
  // 2. Case-insensitive direct match
  const lower = amenity.toLowerCase();
  for (const [key, icon] of Object.entries(amenityIcons)) {
    if (key.toLowerCase() === lower) return icon;
  }
  // 3. Fall back to suggestIconForName (keyword-based auto-detection)
  const suggested = suggestIconForName(amenity);
  if (suggested !== 'HelpCircle') return ICON_REGISTRY[suggested] || HelpCircle;
  return HelpCircle;
};

export const getIconForDietary = (dietary: string) => {
  return dietaryIcons[dietary] || HelpCircle;
};

/**
 * POS category → icon mapping.
 * Keys are lowercase category names; values are Lucide icon components.
 */
export const posCategoryIcons: Record<string, any> = {
  'light meals': Salad,
  'mains': ChefHat,
  'quick bites': Sandwich,
  'desserts': Cake,
  'dessert': Cake,
  'beverages': Coffee,
  'bar': Wine,
  'add-ons': CirclePlus,
  'food': Utensils,
  'drinks': Coffee,
  'snacks': Sandwich,
  'breakfast': Salad,
  'breakfast & light meals': Salad,
  'meals': UtensilsCrossed,
};

/** Return the Lucide icon component for a POS category (case-insensitive). */
export const getIconForPOSCategory = (category: string) => {
  return posCategoryIcons[category.toLowerCase()] || UtensilsCrossed;
};