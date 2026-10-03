import { FileText, Hotel, Users, Brain, UserCheck, ScrollText, Shield, Building2, Lock } from 'lucide-react';

// Copy for the ConsoleWeb sign-in screen (layout follows Stayweb's sign-in screen).

export const authHero = {
  titleLines: ['One console,', 'every Wugweb product.'],
  description: 'Run DocWeb, Stayweb, HRweb and ThinkWeb from one place: companies, people, approvals and platform settings.',
};

export const authModules = [
  { icon: FileText, name: 'DocWeb', desc: 'Credentials, documents & verification' },
  { icon: Hotel, name: 'Stayweb', desc: 'Properties & hospitality operations' },
  { icon: Users, name: 'HRweb', desc: 'Employees & onboarding' },
  { icon: Brain, name: 'ThinkWeb', desc: 'Admin portal & test centre' },
  { icon: UserCheck, name: 'Sign-ups', desc: 'Review & approve new companies' },
  { icon: ScrollText, name: 'Audit log', desc: 'Every platform decision recorded' },
];

export const authHighlights = [
  { icon: Shield, label: 'Platform owners only' },
  { icon: Building2, label: 'One shared database' },
  { icon: Lock, label: 'Every company kept separate' },
];

export const authContacts = {
  sales: { title: 'Sales & Partnerships', email: 'praneet@wugweb.com', phone: '+91 77009 90098', tel: '+917700990098' },
  support: { title: 'Support', email: 'hello@wugweb.com', phone: '+91 8802139220', tel: '+918802139220' },
};

export const authFooterLinks = [
  { label: 'Terms of Service', href: 'https://wugweb.com/termsofuse.html' },
  { label: 'Privacy Policy', href: 'https://wugweb.com/privacypolicy.html' },
  { label: 'Contact Us', href: 'mailto:hello@wugweb.com' },
];
