import { ArrowLeft, Play, CheckCircle, Calendar, Users, Bed, ShoppingCart, IndianRupee, FileText, QrCode, Layers } from 'lucide-react';
import { StayWebLogo } from './ui/StayWebLogo';

interface PrototypeDemoPageProps {
  onBack: () => void;
}

export function PrototypeDemoPage({ onBack }: PrototypeDemoPageProps) {
  const userJourneys = [
    {
      title: 'Walk-in Guest Booking',
      icon: Users,
      steps: [
        'Guest arrives at reception',
        'Staff searches available beds/rooms',
        'Select bed in Dorm A (gender: mixed, price: ₹500/night)',
        'Capture guest details (name, phone, ID proof)',
        'Set check-in/out dates',
        'Select meal plan (CP - Continental Plan)',
        'Calculate total: 3 nights × ₹500 = ₹1,500',
        'Create booking & generate folio',
        'Collect advance payment (₹500)',
        'Check-in complete - guest receives room key'
      ],
      status: 'Live'
    },
    {
      title: 'QR Self Check-in',
      icon: QrCode,
      steps: [
        'Guest books online (booking confirmed)',
        'System sends email with QR code link',
        'Guest arrives and scans QR at kiosk/mobile',
        'System verifies booking ID & dates',
        'Guest uploads ID document photo',
        'System auto-checks in guest',
        'Digital room key sent to guest phone',
        'Folio auto-created with stay charges'
      ],
      status: 'Live'
    },
    {
      title: 'Guest Orders at Restaurant',
      icon: ShoppingCart,
      steps: [
        'Guest sits at Table 5 in restaurant',
        'Scans QR code on table',
        'Views digital menu (Food & Beverages)',
        'Adds items: 2× Pasta (₹250 each), 1× Lemonade (₹80)',
        'Guest submits order',
        'Kitchen receives KOT (Kitchen Order Ticket)',
        'Staff prepares order',
        'Staff posts bill to guest folio (₹580)',
        'No cash payment needed - added to room bill'
      ],
      status: 'Live'
    },
    {
      title: 'Manual Charge Addition',
      icon: IndianRupee,
      steps: [
        'Guest requests bike rental',
        'Staff navigates to guest folio',
        'Click "Add Manual Charge"',
        'Select charge type: "Bike Rental"',
        'Enter amount: ₹300',
        'Add description: "Mountain bike - 4 hours"',
        'Post to folio',
        'Charge appears in guest bill instantly'
      ],
      status: 'Live'
    },
    {
      title: 'Guest Check-out & Payment',
      icon: FileText,
      steps: [
        'Guest comes to reception for checkout',
        'Staff opens guest folio',
        'Review all charges: Stay (₹1,500), POS (₹580), Bike Rental (₹300)',
        'Total: ₹2,380, Already paid: ₹500',
        'Balance due: ₹1,880',
        'Apply discount: ₹100 (loyalty discount)',
        'Final amount: ₹1,780',
        'Collect payment (UPI/Cash/Card)',
        'Generate final invoice',
        'Update booking status to "checked-out"',
        'Email invoice to guest'
      ],
      status: 'Live'
    },
    {
      title: 'Walk-in Bar Order (Non-Guest)',
      icon: ShoppingCart,
      steps: [
        'Local customer walks into bar',
        'Staff creates new POS order',
        'Select outlet: "Bar"',
        'Enter customer name (optional)',
        'Add items: 2× Beer (₹200 each), 1× Snacks (₹150)',
        'Total: ₹550',
        'Customer pays immediately (Cash)',
        'Print receipt',
        'Order complete (not posted to folio)'
      ],
      status: 'Live'
    }
  ];

  const features = [
    { name: 'Multi-Bed Dorm Management', status: 'Live' },
    { name: 'Gender Restriction (Male/Female/Mixed)', status: 'Live' },
    { name: 'Private Room Booking', status: 'Live' },
    { name: 'Guest Folio System', status: 'Live' },
    { name: 'POS - Restaurant & Bar', status: 'Live' },
    { name: 'Manual Charges', status: 'Live' },
    { name: 'QR Self Check-in', status: 'Live' },
    { name: 'Payment Collection (Cash/UPI/Card)', status: 'Live' },
    { name: 'Invoice Generation', status: 'Live' },
    { name: 'Meal Plan Selection (EP/CP/MAP/AP)', status: 'Live' },
    { name: 'Occupancy Reports', status: 'Live' },
    { name: 'Revenue Reports', status: 'Live' }
  ];

  return (
    <div className="space-y-6">
      {/* System Overview */}
      <div className="bg-primary rounded-xl p-8">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
            <Layers className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h3 className="text-primary-foreground mb-3">StayWeb PMS - Complete System Overview</h3>
            <p className="text-primary-foreground/80 mb-4">
              A modern, minimal SaaS Property Management System designed for hostels and hybrid properties.
              Built with React, TypeScript, and Tailwind CSS using a custom design system with dark gray primary,
              yellow/orange accents, and Inter Tight typography.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-primary-foreground/20 rounded-full text-primary-foreground">
                12 Core Features
              </span>
              <span className="px-3 py-1 bg-primary-foreground/20 rounded-full text-primary-foreground">
                6 User Journeys
              </span>
              <span className="px-3 py-1 bg-primary-foreground/20 rounded-full text-primary-foreground">
                100% Design System Compliant
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* User Journeys */}
      <div>
        <h2 className="text-foreground mb-4">Complete User Journeys</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {userJourneys.map((journey, index) => {
            const Icon = journey.icon;
            return (
              <div key={index} className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-card-foreground mb-1">{journey.title}</h3>
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-success-bg text-success-foreground rounded-full">
                      <CheckCircle className="w-3 h-3" />
                      <span>{journey.status}</span>
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  {journey.steps.map((step, stepIndex) => (
                    <div key={stepIndex} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-muted-foreground">{stepIndex + 1}</span>
                      </div>
                      <p className="text-muted-foreground flex-1">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Features Status */}
      <div>
        <h2 className="text-foreground mb-4">Feature Implementation Status</h2>
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <span className="text-card-foreground">{feature.name}</span>
                <span className="px-3 py-1 bg-success-bg text-success-foreground rounded-full">
                  {feature.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Capabilities */}
      <div>
        <h2 className="text-foreground mb-4">System Capabilities</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Bed className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-card-foreground mb-2">Flexible Inventory</h3>
            <p className="text-muted-foreground mb-4">
              Manage private rooms and multi-bed dorms (4/6/8/12 beds) with gender restrictions. 
              Real-time bed availability tracking.
            </p>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success" />
                <span>Variable bed counts per dorm</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success" />
                <span>Male/Female/Mixed gender options</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success" />
                <span>Private room support</span>
              </li>
            </ul>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-card-foreground mb-2">Unified Folio System</h3>
            <p className="text-muted-foreground mb-4">
              All charges (stay, POS, manual) flow into one guest folio. 
              Support for partial payments and multiple payment methods.
            </p>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success" />
                <span>Auto stay charge calculation</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success" />
                <span>POS order posting</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success" />
                <span>Manual charge types</span>
              </li>
            </ul>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <ShoppingCart className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-card-foreground mb-2">Dual POS System</h3>
            <p className="text-muted-foreground mb-4">
              Separate restaurant and bar outlets. Post to guest folios or handle walk-in customers. 
              KOT generation for kitchen.
            </p>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success" />
                <span>Restaurant & bar outlets</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success" />
                <span>Guest & walk-in support</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success" />
                <span>Veg/Non-veg/Alcohol tagging</span>
              </li>
            </ul>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <QrCode className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-card-foreground mb-2">QR Automation</h3>
            <p className="text-muted-foreground mb-4">
              Self check-in via QR codes. Guest folio scanning for POS. 
              Digital menu QR codes for restaurant/bar.
            </p>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success" />
                <span>Self check-in QR codes</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success" />
                <span>Folio scanning at POS</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success" />
                <span>Digital menu access</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}