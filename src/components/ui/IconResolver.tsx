import React from 'react';
import {
  FileText, FilePen, Clock, CheckCircle, XCircle, Pause, Send, Eye,
  ShieldCheck, AlertTriangle, Ban, Award, Receipt, Shield, Key, QrCode, Mail,
  GraduationCap, Briefcase, DollarSign, Heart, Scale, Factory, Truck, Landmark,
  Building, Building2, Monitor, Gem, Car, Sparkles, UtensilsCrossed, MapPin,
  Hexagon, User, Search, PenTool, Package, Files, Download, FolderTree, Users,
  Braces, Code, Table, Hash, Lock, Globe, Network, Zap, BarChart3, FileCode,
  Crown, Rocket, CreditCard, UserCheck, UserX,
  UserPlus, FolderPlus, Trash2, Settings, Plus, Minus, Edit2, ChevronDown,
  // New icons for extended config
  Tag, Flag, Archive, Copy, Bell, MessageSquare, Plug, Upload, Printer,
  Layers, Server, CircleDot, FileCheck,
  CheckCheck,
} from 'lucide-react';

// LucideIcon type inferred from a known icon to avoid `type` import issues on Vercel
type LucideIconComponent = typeof FileText;

const iconMap: Record<string, LucideIconComponent> = {
  FileText, FilePen, Clock, CheckCircle, CheckCheck, XCircle, Pause, Send, Eye,
  ShieldCheck, AlertTriangle, Ban, Award, Receipt, Shield, Key, QrCode, Mail,
  GraduationCap, Briefcase, DollarSign, Heart, Scale, Factory, Truck, Landmark,
  Building, Building2, Monitor, Gem, Car, Sparkles, UtensilsCrossed, MapPin,
  Hexagon, User, Search, PenTool, Package, Files, Download, FolderTree, Users,
  Braces, Code, Table, Hash, Lock, Globe, Network, Zap, BarChart3, FileCode,
  Crown, Rocket, CreditCard, UserCheck, UserX,
  UserPlus, FolderPlus, Trash2, Settings, Plus, Minus, Edit2, ChevronDown,
  // Extended
  Tag, Flag, Archive, Copy, Bell, MessageSquare, Plug, Upload, Printer,
  Layers, Server, CircleDot, FileCheck,
  // Fallback mappings for icons that may not exist in all lucide versions
  SearchX: Search,
  Handshake: Users,
  Pill: Shield,
  ChefHat: UtensilsCrossed,
};

interface IconResolverProps {
  name?: string;
  className?: string;
  style?: React.CSSProperties;
  fallback?: LucideIconComponent;
}

export function IconResolver({ name, className, style, fallback }: IconResolverProps) {
  if (!name) return null;
  const Icon = iconMap[name] || fallback || FileText;
  return <Icon className={className} style={style} />;
}

export function getIconComponent(name?: string): LucideIconComponent | null {
  if (!name) return null;
  return iconMap[name] || null;
}
