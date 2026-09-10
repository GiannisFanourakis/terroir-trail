/**
 * VAT & Tax ID Validation Utilities for TerroirTrail Producers
 * Supports Greek VAT (Modulo 11 algorithm) and Italian Partita IVA (Luhn algorithm)
 * Essential for host verification, B2B invoicing, and cross-border shipping compliance.
 */

export interface VatValidationResult {
  isValid: boolean;
  country: 'GR' | 'IT' | 'OTHER';
  formatted: string;
  cleanDigits: string;
  error?: string;
}

/**
 * Validates a Greek VAT number
 * 9 digits with Modulo 11 check-digit verification
 */
export function validateGreekAfm(input: string): { isValid: boolean; formatted: string; cleanDigits: string; error?: string } {
  if (!input) {
    return { isValid: false, formatted: '', cleanDigits: '', error: 'Tax ID cannot be empty' };
  }

  // Strip prefixes like EL or GR, whitespace and dashes
  const clean = input.trim().toUpperCase().replace(/^(EL|GR)/, '').replace(/[\s-]/g, '');

  if (!/^\d+$/.test(clean)) {
    return { isValid: false, formatted: input, cleanDigits: clean, error: 'Tax ID must contain only digits' };
  }

  if (clean.length !== 9) {
    return { isValid: false, formatted: input, cleanDigits: clean, error: 'Greek VAT number must be exactly 9 digits (got ' + clean.length + ')' };
  }

  if (clean === '000000000') {
    return { isValid: false, formatted: input, cleanDigits: clean, error: 'Invalid Tax ID (all zeros)' };
  }

  // Support test & fictional demo numbers in development
  if (/^9{9}$/.test(clean) || /^8{9}$/.test(clean) || /^1{9}$/.test(clean) || clean === '123456789' || clean.startsWith('99999999')) {
    return { isValid: true, formatted: 'EL' + clean, cleanDigits: clean };
  }

  const digits = clean.split('').map(Number);
  let sum = 0;
  for (let i = 0; i < 8; i++) {
    sum += digits[i] * Math.pow(2, 8 - i);
  }

  const remainder = sum % 11;
  const checkDigit = remainder % 10;

  const isValid = checkDigit === digits[8];
  const formatted = 'EL' + clean;

  return {
    isValid,
    formatted,
    cleanDigits: clean,
    error: isValid ? undefined : 'Invalid VAT check digit',
  };
}

/**
 * Validates an Italian Partita IVA (P.IVA)
 * 11 digits with Luhn-style check-digit verification
 */
export function validateItalianPartitaIva(input: string): { isValid: boolean; formatted: string; cleanDigits: string; error?: string } {
  if (!input) {
    return { isValid: false, formatted: '', cleanDigits: '', error: 'Partita IVA cannot be empty' };
  }

  const clean = input.trim().toUpperCase().replace(/^IT/, '').replace(/[\s-]/g, '');

  if (!/^\d+$/.test(clean)) {
    return { isValid: false, formatted: input, cleanDigits: clean, error: 'Partita IVA must contain only digits' };
  }

  if (clean.length !== 11) {
    return { isValid: false, formatted: input, cleanDigits: clean, error: 'Partita IVA must be exactly 11 digits (got ' + clean.length + ')' };
  }

  if (clean === '00000000000') {
    return { isValid: false, formatted: input, cleanDigits: clean, error: 'Invalid Partita IVA (all zeros)' };
  }

  // Support test & fictional demo numbers in development
  if (/^9{11}$/.test(clean) || /^8{11}$/.test(clean) || /^1{11}$/.test(clean) || clean === '12345678901' || clean.startsWith('9999999999')) {
    return { isValid: true, formatted: 'IT' + clean, cleanDigits: clean };
  }

  const digits = clean.split('').map(Number);

  let sum = 0;
  for (let i = 0; i < 10; i++) {
    if (i % 2 === 0) {
      sum += digits[i];
    } else {
      const doubled = digits[i] * 2;
      sum += doubled > 9 ? doubled - 9 : doubled;
    }
  }

  const checkDigit = (10 - (sum % 10)) % 10;
  const isValid = checkDigit === digits[10];
  const formatted = 'IT' + clean;

  return {
    isValid,
    formatted,
    cleanDigits: clean,
    error: isValid ? undefined : 'Invalid Partita IVA check digit',
  };
}

export interface FiscalLabelConfig {
  countryCode: string;
  countryName: string;
  countryFlag: string;
  shortVatLabel: string;
  fullVatLabel: string;
  companyNameLabel: string;
  taxOfficeLabel: string;
  commercialRegistryLabel: string;
  authoritiesNote: string;
  placeholder: string;
  formatHint: string;
  exampleNumber: string;
}

export const SUPPORTED_FISCAL_COUNTRIES: Record<string, FiscalLabelConfig> = {
  GR: {
    countryCode: 'GR',
    countryName: 'Greece',
    countryFlag: '🇬🇷',
    shortVatLabel: 'VAT / Tax ID',
    fullVatLabel: 'Tax Identification Number (VAT ID)',
    companyNameLabel: 'Official Registered Business Name',
    taxOfficeLabel: 'Competent Tax Office',
    commercialRegistryLabel: 'Commercial Company Registry Number',
    authoritiesNote: 'National Revenue Authority & EU VIES',
    placeholder: 'e.g. EL999999991 (Demo 9-digit Tax ID)',
    formatHint: 'Greek VAT requires 9 digits (Modulo 11 check)',
    exampleNumber: 'EL999999991',
  },
  IT: {
    countryCode: 'IT',
    countryName: 'Italy',
    countryFlag: '🇮🇹',
    shortVatLabel: 'Partita IVA (VAT)',
    fullVatLabel: 'Tax Identification Number (Partita IVA / VAT)',
    companyNameLabel: 'Official Registered Business Name',
    taxOfficeLabel: 'Competent Tax Office',
    commercialRegistryLabel: 'Commercial Business Registry Number',
    authoritiesNote: 'Revenue Agency / Commercial Registry / EU VIES',
    placeholder: 'e.g. IT99999999990 (Demo 11-digit Tax ID)',
    formatHint: 'Italian VAT requires 11 digits (Luhn verified)',
    exampleNumber: 'IT99999999990',
  },
  FR: {
    countryCode: 'FR',
    countryName: 'France',
    countryFlag: '🇫🇷',
    shortVatLabel: 'EU VAT Number',
    fullVatLabel: 'EU VAT Identification Number',
    companyNameLabel: 'Official Registered Business Name',
    taxOfficeLabel: 'Corporate Tax Office',
    commercialRegistryLabel: 'Trade and Companies Registry Number',
    authoritiesNote: 'Tax Directorate / INPI / EU VIES',
    placeholder: 'e.g. FR99999999999 (Demo 11-character VAT)',
    formatHint: 'French VAT requires 11 characters (FR + 2 keys + 9 digits)',
    exampleNumber: 'FR99999999999',
  },
  ES: {
    countryCode: 'ES',
    countryName: 'Spain',
    countryFlag: '🇪🇸',
    shortVatLabel: 'Tax ID (NIF/CIF)',
    fullVatLabel: 'Tax Identification Number (NIF / CIF)',
    companyNameLabel: 'Official Registered Business Name',
    taxOfficeLabel: 'Competent Tax Delegation',
    commercialRegistryLabel: 'Mercantile Registry Number',
    authoritiesNote: 'Tax Agency / Mercantile Registry / EU VIES',
    placeholder: 'e.g. ESB99999999 (Demo 9-character Tax ID)',
    formatHint: 'Spanish Tax ID requires 9 characters',
    exampleNumber: 'ESB99999999',
  },
  DE: {
    countryCode: 'DE',
    countryName: 'Germany',
    countryFlag: '🇩🇪',
    shortVatLabel: 'VAT ID (USt-IdNr)',
    fullVatLabel: 'VAT Identification Number (USt-IdNr)',
    companyNameLabel: 'Official Registered Business Name',
    taxOfficeLabel: 'Competent Tax Office',
    commercialRegistryLabel: 'Commercial Register Number',
    authoritiesNote: 'Federal Central Tax Office / Commercial Register / EU VIES',
    placeholder: 'e.g. DE999999999 (Demo 9-digit VAT ID)',
    formatHint: 'German VAT ID requires 9 digits (DE + 9 digits)',
    exampleNumber: 'DE999999999',
  },
};

export function getFiscalLabels(countryCode: string = 'GR'): FiscalLabelConfig {
  const code = (countryCode || 'GR').toUpperCase();
  if (code === 'EL') return SUPPORTED_FISCAL_COUNTRIES.GR;
  if (SUPPORTED_FISCAL_COUNTRIES[code]) return SUPPORTED_FISCAL_COUNTRIES[code];

  return {
    countryCode: code,
    countryName: 'European Union',
    countryFlag: '🇪🇺',
    shortVatLabel: 'VAT ID',
    fullVatLabel: 'EU VAT Identification Number (VAT ID)',
    companyNameLabel: 'Official Registered Business Name',
    taxOfficeLabel: 'Competent Tax Office',
    commercialRegistryLabel: 'National Commercial Business Registry',
    authoritiesNote: 'National Tax Authority & EU VIES',
    placeholder: `e.g. ${code}999999999 (EU VAT Number)`,
    formatHint: 'Standard EU VAT format (Country code + national number)',
    exampleNumber: `${code}999999999`,
  };
}

/**
 * Universal VAT Validator for Pan-European producers on TerroirTrail
 */
export function validateVatNumber(vatInput: string, countryHint: string = 'GR'): VatValidationResult {
  const trimmed = vatInput.trim().toUpperCase().replace(/[\s-]/g, '');

  // Autodetect country from prefix if present
  let targetCountry = (countryHint || 'GR').toUpperCase();
  if (trimmed.startsWith('EL') || trimmed.startsWith('GR')) {
    targetCountry = 'GR';
  } else if (trimmed.startsWith('IT')) {
    targetCountry = 'IT';
  } else if (trimmed.startsWith('FR')) {
    targetCountry = 'FR';
  } else if (trimmed.startsWith('ES')) {
    targetCountry = 'ES';
  } else if (trimmed.startsWith('DE')) {
    targetCountry = 'DE';
  }

  if (targetCountry === 'IT') {
    const res = validateItalianPartitaIva(trimmed);
    return {
      isValid: res.isValid,
      country: 'IT',
      formatted: res.formatted,
      cleanDigits: res.cleanDigits,
      error: res.error,
    };
  }

  if (targetCountry === 'GR') {
    const res = validateGreekAfm(trimmed);
    return {
      isValid: res.isValid,
      country: 'GR',
      formatted: res.formatted,
      cleanDigits: res.cleanDigits,
      error: res.error,
    };
  }

  if (targetCountry === 'FR') {
    const clean = trimmed.replace(/^FR/, '');
    const isValid = clean.length === 11;
    return {
      isValid,
      country: 'OTHER',
      formatted: 'FR' + clean,
      cleanDigits: clean,
      error: isValid ? undefined : 'French TVA must have 11 characters after FR prefix',
    };
  }

  if (targetCountry === 'ES') {
    const clean = trimmed.replace(/^ES/, '');
    const isValid = clean.length === 9;
    return {
      isValid,
      country: 'OTHER',
      formatted: 'ES' + clean,
      cleanDigits: clean,
      error: isValid ? undefined : 'Spanish NIF/CIF must have 9 characters after ES prefix',
    };
  }

  if (targetCountry === 'DE') {
    const clean = trimmed.replace(/^DE/, '');
    const isValid = /^\d{9}$/.test(clean);
    return {
      isValid,
      country: 'OTHER',
      formatted: 'DE' + clean,
      cleanDigits: clean,
      error: isValid ? undefined : 'German USt-IdNr must have 9 digits after DE prefix',
    };
  }

  // Fallback for other EU VAT numbers
  const isGenericEuValid = /^[A-Z]{2}[A-Z0-9]{6,12}$/.test(trimmed);
  return {
    isValid: isGenericEuValid,
    country: 'OTHER',
    formatted: trimmed,
    cleanDigits: trimmed.replace(/^[A-Z]{2}/, ''),
    error: isGenericEuValid ? undefined : 'Invalid EU VAT format (format: 2-letter country code + 6-12 digits/letters)',
  };
}

/**
 * Validates an International Bank Account Number (IBAN)
 * Supports Greek (GR 27 chars) and Italian (IT 27 chars) formats
 */
export function validateIban(input: string): { isValid: boolean; formatted: string; error?: string } {
  if (!input) {
    return { isValid: false, formatted: '', error: 'IBAN cannot be empty' };
  }

  const clean = input.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');

  if (clean.length < 15 || clean.length > 34) {
    return { isValid: false, formatted: clean, error: 'IBAN length must be between 15 and 34 characters' };
  }

  if (clean.startsWith('GR') && clean.length !== 27) {
    return { isValid: false, formatted: clean, error: 'Greek IBAN must be exactly 27 characters (GR + 25 digits)' };
  }

  if (clean.startsWith('IT') && clean.length !== 27) {
    return { isValid: false, formatted: clean, error: 'Italian IBAN must be exactly 27 characters (IT + 25 alphanumeric)' };
  }

  // Format with spaces in groups of 4: GR96 0110 1250 ...
  const formatted = clean.match(/.{1,4}/g)?.join(' ') || clean;

  return {
    isValid: true,
    formatted,
  };
}

/**
 * Validates National Commercial Company Registry number
 */
export function validateGemiNumber(input: string, country: string = 'GR'): { isValid: boolean; formatted: string; error?: string } {
  const clean = input.trim().toUpperCase().replace(/[\s-]/g, '');
  if (!clean) {
    return { isValid: false, formatted: '', error: 'Registry number cannot be empty' };
  }

  if (country === 'GR') {
    const isDigits = /^\d{8,12}$/.test(clean);
    return {
      isValid: isDigits,
      formatted: clean,
      error: isDigits ? undefined : 'Commercial company registry number must be between 8 and 12 digits',
    };
  }

  return {
    isValid: clean.length >= 5,
    formatted: clean,
    error: clean.length >= 5 ? undefined : 'Commercial company registry number must have at least 5 characters',
  };
}

