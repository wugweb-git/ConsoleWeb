/**
 * Client-side encryption utilities for sensitive data
 * Uses Web Crypto API for secure encryption/decryption
 */

// Generate a random encryption key (in production, this should be stored securely)
const ENCRYPTION_KEY_STORAGE = 'stayweb_encryption_key';

/**
 * Generate or retrieve encryption key
 */
async function getEncryptionKey(): Promise<CryptoKey> {
  // Check if key exists in sessionStorage
  const storedKey = sessionStorage.getItem(ENCRYPTION_KEY_STORAGE);
  
  if (storedKey) {
    // Import existing key
    const keyData = JSON.parse(storedKey);
    return await crypto.subtle.importKey(
      'jwk',
      keyData,
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
  }
  
  // Generate new key
  const key = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
  
  // Export and store key
  const exportedKey = await crypto.subtle.exportKey('jwk', key);
  sessionStorage.setItem(ENCRYPTION_KEY_STORAGE, JSON.stringify(exportedKey));
  
  return key;
}

/**
 * Encrypt sensitive data (PII like email, phone, ID numbers)
 */
export async function encryptPII(data: string): Promise<string> {
  try {
    if (!data) return '';
    
    const key = await getEncryptionKey();
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    
    // Generate random IV
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    // Encrypt data
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      dataBuffer
    );
    
    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);
    
    // Convert to base64 for storage
    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt sensitive data
 */
export async function decryptPII(encryptedData: string): Promise<string> {
  try {
    if (!encryptedData) return '';
    
    const key = await getEncryptionKey();
    
    // Decode from base64
    const combined = new Uint8Array(
      atob(encryptedData).split('').map(c => c.charCodeAt(0))
    );
    
    // Extract IV and encrypted data
    const iv = combined.slice(0, 12);
    const encrypted = combined.slice(12);
    
    // Decrypt data
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encrypted
    );
    
    // Convert back to string
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Encrypt API keys and credentials
 */
export async function encryptAPIKey(apiKey: string): Promise<string> {
  // Use same encryption as PII but with different context
  return encryptPII(apiKey);
}

/**
 * Decrypt API keys and credentials
 */
export async function decryptAPIKey(encryptedKey: string): Promise<string> {
  return decryptPII(encryptedKey);
}

/**
 * Mask sensitive data for display (show partial info)
 */
export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return email;
  
  const [localPart, domain] = email.split('@');
  const maskedLocal = localPart.length > 3
    ? localPart.substring(0, 2) + '***' + localPart.slice(-1)
    : '***';
  
  return `${maskedLocal}@${domain}`;
}

/**
 * Mask phone number for display
 */
export function maskPhone(phone: string): string {
  if (!phone || phone.length < 4) return '***';
  
  return '***' + phone.slice(-4);
}

/**
 * Mask ID number for display
 */
export function maskIDNumber(idNumber: string): string {
  if (!idNumber || idNumber.length < 4) return '***';
  
  return '***' + idNumber.slice(-4);
}

/**
 * Validate if data is encrypted (basic check)
 */
export function isEncrypted(data: string): boolean {
  try {
    // Encrypted data should be base64 encoded
    // Basic validation: check if it's valid base64 and has reasonable length
    if (!data) return false;
    
    const decoded = atob(data);
    return decoded.length > 12; // IV (12 bytes) + some encrypted data
  } catch {
    return false;
  }
}

/**
 * Hash password for storage (one-way)
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Secure key storage helper
 */
export const SecureStorage = {
  /**
   * Store encrypted data
   */
  async setSecure(key: string, value: string): Promise<void> {
    const encrypted = await encryptPII(value);
    sessionStorage.setItem(`secure_${key}`, encrypted);
  },
  
  /**
   * Retrieve and decrypt data
   */
  async getSecure(key: string): Promise<string | null> {
    const encrypted = sessionStorage.getItem(`secure_${key}`);
    if (!encrypted) return null;
    
    try {
      return await decryptPII(encrypted);
    } catch {
      return null;
    }
  },
  
  /**
   * Remove secure data
   */
  removeSecure(key: string): void {
    sessionStorage.removeItem(`secure_${key}`);
  },
  
  /**
   * Clear all secure data
   */
  clearAll(): void {
    const keys = Object.keys(sessionStorage).filter(k => k.startsWith('secure_'));
    keys.forEach(key => sessionStorage.removeItem(key));
    sessionStorage.removeItem(ENCRYPTION_KEY_STORAGE);
  }
};

/**
 * Example usage and types
 */
export interface EncryptedGuestData {
  id: string;
  name: string; // Not encrypted (needed for search)
  emailEncrypted: string;
  phoneEncrypted?: string;
  idNumberEncrypted?: string;
  // Display versions
  emailMasked?: string;
  phoneMasked?: string;
  idNumberMasked?: string;
}

export interface EncryptedAPICredentials {
  gatewayName: string;
  apiKeyEncrypted: string;
  secretKeyEncrypted?: string;
  merchantIdEncrypted?: string;
}

/**
 * Helper to encrypt guest PII data
 */
export async function encryptGuestData(guest: {
  id: string;
  name: string;
  email: string;
  phone?: string;
  idNumber?: string;
}): Promise<EncryptedGuestData> {
  return {
    id: guest.id,
    name: guest.name,
    emailEncrypted: await encryptPII(guest.email),
    phoneEncrypted: guest.phone ? await encryptPII(guest.phone) : undefined,
    idNumberEncrypted: guest.idNumber ? await encryptPII(guest.idNumber) : undefined,
    emailMasked: maskEmail(guest.email),
    phoneMasked: guest.phone ? maskPhone(guest.phone) : undefined,
    idNumberMasked: guest.idNumber ? maskIDNumber(guest.idNumber) : undefined,
  };
}

/**
 * Helper to decrypt guest PII data
 */
export async function decryptGuestData(encryptedGuest: EncryptedGuestData): Promise<{
  id: string;
  name: string;
  email: string;
  phone?: string;
  idNumber?: string;
}> {
  return {
    id: encryptedGuest.id,
    name: encryptedGuest.name,
    email: await decryptPII(encryptedGuest.emailEncrypted),
    phone: encryptedGuest.phoneEncrypted ? await decryptPII(encryptedGuest.phoneEncrypted) : undefined,
    idNumber: encryptedGuest.idNumberEncrypted ? await decryptPII(encryptedGuest.idNumberEncrypted) : undefined,
  };
}
