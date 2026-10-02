import { ArrowLeft, MousePointer, Keyboard, Search, Menu, ArrowRight, Home, Calendar, Users, Bed } from 'lucide-react';
import { StayWebLogo } from './ui/StayWebLogo';

interface NavigationGuidePageProps {
  onBack: () => void;
}

export function NavigationGuidePage({ onBack }: NavigationGuidePageProps) {
  const navigationPatterns = [
    {
      title: 'Sidebar Navigation',
      icon: Menu,
      description: 'Main navigation hub for accessing all primary sections',
      interactions: [
        { action: 'Click menu item', result: 'Navigate to section (Dashboard, Bookings, Guests, etc.)' },
        { action: 'Active state', result: 'Current page highlighted in primary color' },
        { action: 'Mobile: Tap hamburger', result: 'Opens sidebar overlay' },
        { action: 'Expand "Support & Demos"', result: 'Reveals collapsible submenu with 5 pages' }
      ]
    },
    {
      title: 'Quick Actions Panel',
      icon: MousePointer,
      description: 'Dashboard shortcut buttons for common tasks',
      interactions: [
        { action: 'New Booking', result: 'Opens booking creation form' },
        { action: 'Quick Check-in', result: 'Opens check-in modal with guest search' },
        { action: 'Add Manual Charge', result: 'Opens charge entry form' },
        { action: 'Collect Payment', result: 'Opens payment collection modal' }
      ]
    },
    {
      title: 'Search & Filters',
      icon: Search,
      description: 'Find bookings, guests, and rooms quickly',
      interactions: [
        { action: 'Type in search box', result: 'Real-time filtering by name, ID, or room' },
        { action: 'Click filter chips', result: 'Filter by status (confirmed, checked-in, etc.)' },
        { action: 'Date range picker', result: 'Filter bookings by date range' },
        { action: 'Clear filters', result: 'Reset to show all items' }
      ]
    },
    {
      title: 'Context Actions',
      icon: MousePointer,
      description: 'Actions available on cards and list items',
      interactions: [
        { action: 'Click booking card', result: 'Opens booking detail view' },
        { action: 'Click guest name', result: 'Opens guest profile' },
        { action: 'View Folio button', result: 'Opens complete guest bill' },
        { action: 'Three-dot menu', result: 'Shows edit/delete options' }
      ]
    }
  ];

  const keyboardShortcuts = [
    { keys: ['Cmd/Ctrl', 'K'], action: 'Open global search' },
    { keys: ['Cmd/Ctrl', 'B'], action: 'Toggle sidebar' },
    { keys: ['Cmd/Ctrl', 'N'], action: 'New booking' },
    { keys: ['Cmd/Ctrl', 'P'], action: 'New payment' },
    { keys: ['Esc'], action: 'Close modal/drawer' },
    { keys: ['/', '?'], action: 'Show keyboard shortcuts' },
    { keys: ['←', '→'], action: 'Navigate calendar' },
    { keys: ['Tab'], action: 'Move between form fields' }
  ];

  const breadcrumbExamples = [
    {
      path: 'Dashboard → Bookings → Booking Detail',
      description: 'View specific booking from bookings list'
    },
    {
      path: 'Dashboard → Guests → Guest Profile → Folio',
      description: 'Access guest bill from guest profile'
    },
    {
      path: 'Dashboard → POS → Restaurant → Order Detail',
      description: 'View specific POS order'
    },
    {
      path: 'Dashboard → Reports → Occupancy Report → Export',
      description: 'Generate and download occupancy report'
    }
  ];

  const mobileNavigation = [
    {
      title: 'Mobile Menu',
      items: [
        'Hamburger icon (top-left) opens sidebar',
        'Sidebar overlays full screen with backdrop',
        'Tap outside sidebar or X button to close',
        'All desktop features available'
      ]
    },
    {
      title: 'Mobile Gestures',
      items: [
        'Swipe right on any page to go back',
        'Pull down to refresh data',
        'Tap and hold on cards for quick actions',
        'Double-tap to zoom (on images/documents)'
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Navigation Patterns */}
      <div>
        <h2 className="text-foreground mb-4">Navigation Patterns</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {navigationPatterns.map((pattern, index) => {
            const Icon = pattern.icon;
            return (
              <div key={index} className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-card-foreground mb-1">{pattern.title}</h3>
                    <p className="text-muted-foreground">{pattern.description}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {pattern.interactions.map((interaction, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                      <ArrowRight className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-card-foreground mb-1">{interaction.action}</p>
                        <p className="text-muted-foreground">{interaction.result}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Keyboard Shortcuts */}
      <div>
        <h2 className="text-foreground mb-4">Keyboard Shortcuts</h2>
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-start gap-3 mb-6">
            <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
              <Keyboard className="w-5 h-5 text-foreground" />
            </div>
            <div>
              <h3 className="text-card-foreground mb-1">Power User Shortcuts</h3>
              <p className="text-muted-foreground">Speed up your workflow with keyboard commands</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {keyboardShortcuts.map((shortcut, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <span className="text-card-foreground">{shortcut.action}</span>
                <div className="flex items-center gap-1">
                  {shortcut.keys.map((key, keyIndex) => (
                    <span key={keyIndex}>
                      <kbd className="px-2 py-1 bg-card border border-border rounded text-primary">
                        {key}
                      </kbd>
                      {keyIndex < shortcut.keys.length - 1 && (
                        <span className="mx-1 text-muted-foreground">+</span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Breadcrumb Navigation */}
      <div>
        <h2 className="text-foreground mb-4">Breadcrumb Navigation</h2>
        <div className="bg-card border border-border rounded-xl p-6">
          <p className="text-muted-foreground mb-6">
            Every page shows a breadcrumb trail to help you understand your current location and navigate back easily.
          </p>
          <div className="space-y-4">
            {breadcrumbExamples.map((example, index) => (
              <div key={index} className="p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <code className="px-3 py-1.5 bg-card border border-border rounded text-primary">
                    {example.path}
                  </code>
                </div>
                <p className="text-muted-foreground">{example.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div>
        <h2 className="text-foreground mb-4">Mobile Navigation</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mobileNavigation.map((section, index) => (
            <div key={index} className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-card-foreground mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Key Features */}
      <div className="bg-muted border border-border rounded-xl p-6">
        <h2 className="text-foreground mb-4">Key Features & Flows</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: '📅', title: 'Bookings & Check-in', path: '/bookings' },
            { icon: '🛏️', title: 'Room & Bed Management', path: '/rooms' },
            { icon: '👤', title: 'Guest Folios', path: '/guests' },
            { icon: '🛒', title: 'POS Billing', path: '/pos' },
            { icon: '📄', title: 'Invoices', path: '/invoices' },
            { icon: '📊', title: 'Reports', path: '/reports' }
          ].map((feature, index) => (
            <div key={index} className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="text-2xl mb-2">{feature.icon}</div>
              <h3 className="text-card-foreground mb-1">{feature.title}</h3>
              <code className="text-muted-foreground text-xs">{feature.path}</code>
            </div>
          ))}
        </div>
      </div>

      {/* Primary Navigation Sections */}
      <div>
        <h2 className="text-foreground mb-4">Primary Navigation Sections</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Home, name: 'Dashboard', desc: 'Overview & quick actions' },
            { icon: Calendar, name: 'Bookings', desc: 'Reservations management' },
            { icon: Users, name: 'Guests', desc: 'Guest profiles & folios' },
            { icon: Bed, name: 'Rooms', desc: 'Inventory & availability' }
          ].map((section, index) => {
            const Icon = section.icon;
            return (
              <div key={index} className="bg-card border border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-card-foreground mb-1">{section.name}</h3>
                <p className="text-muted-foreground">{section.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Best Practices */}
      <div className="bg-gradient-to-r from-primary/5 to-accent/5 border border-border rounded-xl p-6">
        <h3 className="text-foreground mb-4">Navigation Best Practices</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-card-foreground mb-3">Do's ✅</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Use sidebar for main section navigation</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Use Quick Actions for common tasks</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Use breadcrumbs to go back one level</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Use search for finding specific items</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Use keyboard shortcuts for speed</span>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-card-foreground mb-3">Tips 💡</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Back button (top-left) returns to previous page</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Active page highlighted in sidebar</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Click logo/title to return to Dashboard</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Most actions have confirmation dialogs</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Press ESC to close any modal/drawer</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}