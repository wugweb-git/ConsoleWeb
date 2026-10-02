import { ArrowLeft, Home, Calendar, Users, Bed, ShoppingCart, IndianRupee, BarChart3, Settings, FileText, QrCode, CreditCard } from 'lucide-react';
import { StayWebLogo } from './ui/StayWebLogo';

interface SystemSitemapPageProps {
  onBack: () => void;
}

export function SystemSitemapPage({ onBack }: SystemSitemapPageProps) {
  const sections = [
    {
      title: 'Dashboard',
      icon: Home,
      color: 'primary',
      pages: [
        { name: 'Main Dashboard', route: '/dashboard', description: 'Hero stats, live room status, dorm beds, upcoming reservations, quick actions' }
      ]
    },
    {
      title: 'Bookings',
      icon: Calendar,
      color: 'primary',
      pages: [
        { name: 'Bookings List', route: '/bookings', description: 'Search, filter bookings by status (confirmed, checked-in, checked-out, cancelled)' },
        { name: 'New Booking', route: '/bookings/new', description: 'Create walk-in or advance booking, select room/bed, meal plan, rates' },
        { name: 'Booking Detail', route: '/bookings/:id', description: 'View booking info, check-in/out dates, guest details, folio link' },
        { name: 'Calendar View', route: '/bookings/calendar', description: 'Visual calendar with booking timeline, occupancy view' }
      ]
    },
    {
      title: 'Guests',
      icon: Users,
      color: 'primary',
      pages: [
        { name: 'Guests List', route: '/guests', description: 'All guests, search by name/phone/email, filter by status' },
        { name: 'Guest Profile', route: '/guests/:id', description: 'Complete guest info, booking history, folio, ID documents, notes' },
        { name: 'Check-in', route: '/guests/checkin', description: 'Manual check-in form, capture ID proof, assign room/bed' },
        { name: 'Self Check-in (QR)', route: '/checkin/:token', description: 'Guest-facing QR check-in page, ID upload, verification' }
      ]
    },
    {
      title: 'Rooms & Inventory',
      icon: Bed,
      color: 'primary',
      pages: [
        { name: 'Rooms Overview', route: '/rooms', description: 'All rooms/dorms, bed status, occupancy, availability' },
        { name: 'Room Detail', route: '/rooms/:id', description: 'Bed-level view, current occupants, bed statuses, meal plans' },
        { name: 'Add Room/Dorm', route: '/rooms/new', description: 'Create new room/dorm, set beds, gender restriction, rates' },
        { name: 'Dorm Bed Layout', route: '/rooms/:id/beds', description: 'Visual bed layout, drag-drop bed management' }
      ]
    },
    {
      title: 'POS - Point of Sale',
      icon: ShoppingCart,
      color: 'accent',
      pages: [
        { name: 'POS - Restaurant', route: '/pos/restaurant', description: 'Menu items, create order, post to folio or walk-in billing' },
        { name: 'POS - Bar', route: '/pos/bar', description: 'Bar menu, drinks/alcohol items, order creation' },
        { name: 'Menu Management', route: '/pos/menu', description: 'Add/edit items, categories, pricing, veg/non-veg/alcohol tags' },
        { name: 'Orders History', route: '/pos/orders', description: 'Past POS orders, filter by outlet, date, guest' }
      ]
    },
    {
      title: 'Billing & Payments',
      icon: CreditCard,
      color: 'accent',
      pages: [
        { name: 'Guest Folio', route: '/folios/:id', description: 'Complete bill: stay + POS + manual charges, payment history' },
        { name: 'Manual Charges', route: '/charges', description: 'Add manual charge (rental, laundry, etc.) to guest folio' },
        { name: 'Collect Payment', route: '/folios/:id/payment', description: 'Record payment (cash, UPI, card), partial/full' },
        { name: 'Invoice', route: '/invoices/:id', description: 'Final invoice with tax, discount, itemized charges' },
        { name: 'Settle Bill', route: '/folios/:id/settle', description: 'Finalize folio, print invoice, checkout guest' }
      ]
    },
    {
      title: 'Reports & Analytics',
      icon: BarChart3,
      color: 'primary',
      pages: [
        { name: 'Reports Dashboard', route: '/reports', description: 'Revenue, occupancy, POS sales, payment methods' },
        { name: 'Occupancy Report', route: '/reports/occupancy', description: 'Daily/weekly/monthly occupancy rates, bed utilization' },
        { name: 'Revenue Report', route: '/reports/revenue', description: 'Revenue breakdown: stay, POS, manual charges' },
        { name: 'POS Sales Report', route: '/reports/pos', description: 'Restaurant vs bar sales, top items, trends' },
        { name: 'Payment Report', route: '/reports/payments', description: 'Cash/UPI/card collection, pending payments' }
      ]
    },
    {
      title: 'QR Management',
      icon: QrCode,
      color: 'accent',
      pages: [
        { name: 'QR Codes Overview', route: '/qr', description: 'Generate/manage QR codes for check-in, folio, menu' },
        { name: 'Check-in QR', route: '/qr/checkin', description: 'Generate booking-specific check-in QR codes' },
        { name: 'Folio QR', route: '/qr/folio', description: 'Generate guest folio QR for POS scanning' },
        { name: 'Menu QR', route: '/qr/menu', description: 'Static menu QR codes for restaurant/bar tables' }
      ]
    },
    {
      title: 'Settings',
      icon: Settings,
      color: 'primary',
      pages: [
        { name: 'Property Settings', route: '/settings/property', description: 'Property name, address, contact, timezone, currency' },
        { name: 'User Management', route: '/settings/users', description: 'Staff accounts, roles (owner, admin, staff), permissions' },
        { name: 'Meal Plans', route: '/settings/meal-plans', description: 'Configure EP, CP, MAP, AP meal plans' },
        { name: 'Charge Types', route: '/settings/charge-types', description: 'Manual charge categories (rental, laundry, tours, etc.)' },
        { name: 'Tax & Pricing', route: '/settings/pricing', description: 'Default rates, tax settings, discount rules' }
      ]
    }
  ];

  const getIconColor = (color: string) => {
    return color === 'accent' ? 'text-primary bg-primary/10' : 'text-primary bg-primary/10';
  };

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-6">
          <p className="text-muted-foreground mb-2">Total Sections</p>
          <h2 className="text-foreground">{sections.length}</h2>
        </div>
        <div className="bg-card border border-border rounded-xl p-6">
          <p className="text-muted-foreground mb-2">Total Pages</p>
          <h2 className="text-foreground">{sections.reduce((sum, s) => sum + s.pages.length, 0)}</h2>
        </div>
        <div className="bg-card border border-border rounded-xl p-6">
          <p className="text-muted-foreground mb-2">Main Flows</p>
          <h2 className="text-foreground">6</h2>
        </div>
        <div className="bg-card border border-border rounded-xl p-6">
          <p className="text-muted-foreground mb-2">User Roles</p>
          <h2 className="text-foreground">3</h2>
        </div>
      </div>

      {/* Sitemap Sections */}
      <div className="space-y-6">
        {sections.map((section, sectionIndex) => {
          const Icon = section.icon;
          return (
            <div key={sectionIndex} className="bg-card border border-border rounded-xl overflow-hidden">
              {/* Section Header */}
              <div className="bg-muted p-6 border-b border-border">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 ${getIconColor(section.color)} rounded-xl flex items-center justify-center`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-foreground">{section.title}</h2>
                    <p className="text-muted-foreground">{section.pages.length} pages in this section</p>
                  </div>
                </div>
              </div>

              {/* Section Pages */}
              <div className="p-6">
                <div className="space-y-4">
                  {section.pages.map((page, pageIndex) => (
                    <div key={pageIndex} className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="w-8 h-8 bg-card border border-border rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-muted-foreground">{pageIndex + 1}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <h3 className="text-card-foreground">{page.name}</h3>
                          <code className="px-3 py-1 bg-card border border-border rounded text-primary">
                            {page.route}
                          </code>
                        </div>
                        <p className="text-muted-foreground">{page.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* User Flows */}
      <div>
        <h2 className="text-foreground mb-4">Core User Flows</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-card-foreground mb-4">Walk-in Booking Flow</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary">1</div>
                <span className="text-muted-foreground">Dashboard → Bookings → New Booking</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary">2</div>
                <span className="text-muted-foreground">Select available room/bed → Check dates</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary">3</div>
                <span className="text-muted-foreground">Capture guest details → Create booking</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary">4</div>
                <span className="text-muted-foreground">Auto-generate folio → Collect payment</span>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-card-foreground mb-4">POS Order Flow</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary">1</div>
                <span className="text-muted-foreground">POS → Restaurant/Bar → Create Order</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary">2</div>
                <span className="text-muted-foreground">Add items → Set table → Submit KOT</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary">3</div>
                <span className="text-muted-foreground">Scan guest folio QR or enter name</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary">4</div>
                <span className="text-muted-foreground">Post to folio or collect payment</span>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-card-foreground mb-4">Guest Checkout Flow</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary">1</div>
                <span className="text-muted-foreground">Guests → Select Guest → View Folio</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary">2</div>
                <span className="text-muted-foreground">Review all charges (stay + POS + manual)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary">3</div>
                <span className="text-muted-foreground">Apply discount/tax → Calculate balance</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary">4</div>
                <span className="text-muted-foreground">Collect payment → Generate invoice → Checkout</span>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-card-foreground mb-4">QR Self Check-in Flow</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary">1</div>
                <span className="text-muted-foreground">Guest receives QR code via email</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary">2</div>
                <span className="text-muted-foreground">Scan QR → Verify booking details</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary">3</div>
                <span className="text-muted-foreground">Upload ID document photo</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary">4</div>
                <span className="text-muted-foreground">Auto check-in → Receive digital room key</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}