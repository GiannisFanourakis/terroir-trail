/**
 * VAT & Tax ID Validation Utilities for TerroirTrail Producers
 * Supports Greek ΑΦΜ (Modulo 11 algorithm) and Italian Partita IVA (Luhn algorithm)
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
 * Validates a Greek ΑΦΜ (Αριθμός Φορολογικού Μητρώου)
 * 9 digits with Modulo 11 check-digit verification
 */
export function validateGreekAfm(input: string): { isValid: boolean; formatted: string; cleanDigits: string; error?: string } {
  if (!input) {
    return { isValid: false, formatted: '', cleanDigits: '', error: 'ΑΦΜ cannot be empty' };
  }

  // Strip prefixes like EL or GR, whitespace and dashes
  const clean = input.trim().toUpperCase().replace(/^(EL|GR)/, '').replace(/[\s-]/g, '');

  if (!/^\d+$/.test(clean)) {
    return { isValid: false, formatted: input, cleanDigits: clean, error: 'ΑΦΜ must contain only digits' };
  }

  if (clean.length !== 9) {
    return { isValid: false, formatted: input, cleanDigits: clean, error: 'ΑΦΜ must be exactly 9 digits (got ' + clean.length + ')' };
  }

  if (clean === '000000000') {
    return { isValid: false, formatted: input, cleanDigits: clean, error: 'Invalid ΑΦΜ (all zeros)' };
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
    error: isValid ? undefined : 'Invalid ΑΦΜ check digit',
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

/**
 * Universal VAT Validator for Greek and Italian producers on TerroirTrail
 */
export function validateVatNumber(vatInput: string, countryHint: 'GR' | 'IT' | string = 'GR'): VatValidationResult {
  const trimmed = vatInput.trim().toUpperCase();

  // Autodetect country from prefix if present
  let targetCountry = countryHint;
  if (trimmed.startsWith('EL') || trimmed.startsWith('GR')) {
    targetCountry = 'GR';
  } else if (trimmed.startsWith('IT')) {
    targetCountry = 'IT';
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

  // Fallback for other EU VAT numbers
  const isGenericEuValid = /^[A-Z]{2}[A-Z0-9]{6,12}$/.test(trimmed);
  return {
    isValid: isGenericEuValid,
    country: 'OTHER',
    formatted: trimmed,
    cleanDigits: trimmed.replace(/^[A-Z]{2}/, ''),
    error: isGenericEuValid ? undefined : 'Invalid EU VAT format',
  };
}
