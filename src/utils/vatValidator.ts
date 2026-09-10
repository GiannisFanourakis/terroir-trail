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
  isEuMember: boolean;
}

export const SUPPORTED_FISCAL_COUNTRIES: Record<string, FiscalLabelConfig> = {
  GR: {
    countryCode: 'GR',
    countryName: 'Greece',
    countryFlag: '🇬🇷',
    shortVatLabel: 'VAT / Tax ID (ΑΦΜ)',
    fullVatLabel: 'Tax Identification Number (VAT ID / ΑΦΜ)',
    companyNameLabel: 'Official Registered Business Name',
    taxOfficeLabel: 'Competent Tax Office (ΔΟΥ)',
    commercialRegistryLabel: 'Commercial Registry Number (ΓΕΜΗ)',
    authoritiesNote: 'AADE (myDATA) & EU VIES',
    placeholder: 'e.g. EL999999991 (Demo 9-digit Tax ID)',
    formatHint: 'Greek VAT requires 9 digits (Modulo 11 check)',
    exampleNumber: 'EL999999991',
    isEuMember: true,
  },
  IT: {
    countryCode: 'IT',
    countryName: 'Italy',
    countryFlag: '🇮🇹',
    shortVatLabel: 'Partita IVA (VAT)',
    fullVatLabel: 'Tax Identification Number (Partita IVA / VAT)',
    companyNameLabel: 'Official Registered Business Name',
    taxOfficeLabel: 'Competent Tax Office (Agenzia delle Entrate)',
    commercialRegistryLabel: 'Registro delle Imprese Number (REA)',
    authoritiesNote: 'Agenzia delle Entrate & EU VIES',
    placeholder: 'e.g. IT99999999990 (Demo 11-digit Tax ID)',
    formatHint: 'Italian VAT requires 11 digits (Luhn verified)',
    exampleNumber: 'IT99999999990',
    isEuMember: true,
  },
  FR: {
    countryCode: 'FR',
    countryName: 'France',
    countryFlag: '🇫🇷',
    shortVatLabel: 'TVA Intracommunautaire',
    fullVatLabel: 'EU VAT Identification Number (Numéro TVA)',
    companyNameLabel: 'Official Registered Business Name',
    taxOfficeLabel: 'Service des Impôts des Entreprises (SIE)',
    commercialRegistryLabel: 'RCS / SIREN Number (9 digits)',
    authoritiesNote: 'Direction Générale des Finances Publiques & EU VIES',
    placeholder: 'e.g. FR99999999999 (Demo 11-character VAT)',
    formatHint: 'French VAT requires 11 characters (FR + 2 keys + 9 digits)',
    exampleNumber: 'FR99999999999',
    isEuMember: true,
  },
  ES: {
    countryCode: 'ES',
    countryName: 'Spain',
    countryFlag: '🇪🇸',
    shortVatLabel: 'Tax ID (NIF / CIF)',
    fullVatLabel: 'Tax Identification Number (NIF / CIF)',
    companyNameLabel: 'Official Registered Business Name',
    taxOfficeLabel: 'Agencia Tributaria Delegation',
    commercialRegistryLabel: 'Registro Mercantil Number',
    authoritiesNote: 'Agencia Tributaria & EU VIES',
    placeholder: 'e.g. ESB99999999 (Demo 9-character Tax ID)',
    formatHint: 'Spanish Tax ID requires 9 characters',
    exampleNumber: 'ESB99999999',
    isEuMember: true,
  },
  DE: {
    countryCode: 'DE',
    countryName: 'Germany',
    countryFlag: '🇩🇪',
    shortVatLabel: 'USt-IdNr (VAT ID)',
    fullVatLabel: 'Umsatzsteuer-Identifikationsnummer (USt-IdNr)',
    companyNameLabel: 'Official Registered Business Name',
    taxOfficeLabel: 'Competent Finanzamt',
    commercialRegistryLabel: 'Handelsregister Number (HRB / HRA)',
    authoritiesNote: 'Bundeszentralamt für Steuern & EU VIES',
    placeholder: 'e.g. DE999999999 (Demo 9-digit VAT ID)',
    formatHint: 'German VAT ID requires 9 digits (DE + 9 digits)',
    exampleNumber: 'DE999999999',
    isEuMember: true,
  },
  US: {
    countryCode: 'US',
    countryName: 'United States',
    countryFlag: '🇺🇸',
    shortVatLabel: 'Federal Tax ID (EIN)',
    fullVatLabel: 'Federal Employer Identification Number (EIN / Tax ID)',
    companyNameLabel: 'Legal Registered Entity / Corporation Name',
    taxOfficeLabel: 'State of Incorporation / IRS Filing State',
    commercialRegistryLabel: 'Secretary of State Entity Filing Number',
    authoritiesNote: 'Internal Revenue Service (IRS) & State Regulators',
    placeholder: 'e.g. 12-3456789 (9-digit Federal EIN)',
    formatHint: 'US Federal EIN requires 9 digits (XX-XXXXXXX format)',
    exampleNumber: '12-3456789',
    isEuMember: false,
  },
  GB: {
    countryCode: 'GB',
    countryName: 'United Kingdom',
    countryFlag: '🇬🇧',
    shortVatLabel: 'UK VAT / Tax ID',
    fullVatLabel: 'UK VAT Registration Number (or CRN)',
    companyNameLabel: 'Official Registered Company Name',
    taxOfficeLabel: 'HM Revenue & Customs (HMRC)',
    commercialRegistryLabel: 'Companies House Company Number (CRN, 8 digits)',
    authoritiesNote: 'HM Revenue & Customs (HMRC) & Companies House',
    placeholder: 'e.g. GB123456789 (9-digit VAT) or 8-digit CRN',
    formatHint: 'UK VAT requires 9 digits (GB + 9 digits) or 8-digit CRN',
    exampleNumber: 'GB123456789',
    isEuMember: false,
  },
  CH: {
    countryCode: 'CH',
    countryName: 'Switzerland',
    countryFlag: '🇨🇭',
    shortVatLabel: 'UID / MWST Number',
    fullVatLabel: 'Business Identification Number (UID / MWST / TVA)',
    companyNameLabel: 'Official Registered Business Name',
    taxOfficeLabel: 'Federal Tax Administration (ESTV) / Cantonal Tax',
    commercialRegistryLabel: 'Cantonal Commercial Register (RC / HR Number)',
    authoritiesNote: 'Federal Tax Administration (ESTV)',
    placeholder: 'e.g. CHE-123.456.789 MWST',
    formatHint: 'Swiss UID format CHE-123.456.789',
    exampleNumber: 'CHE-123.456.789',
    isEuMember: false,
  },
  CA: {
    countryCode: 'CA',
    countryName: 'Canada',
    countryFlag: '🇨🇦',
    shortVatLabel: 'CRA Business Number (BN)',
    fullVatLabel: 'CRA Business Number (BN / GST/HST Account)',
    companyNameLabel: 'Legal Registered Corporation Name',
    taxOfficeLabel: 'Canada Revenue Agency (CRA) Tax Services',
    commercialRegistryLabel: 'Provincial / Federal Corporate Registry Number',
    authoritiesNote: 'Canada Revenue Agency (CRA)',
    placeholder: 'e.g. 123456789 RT0001 (9-digit BN)',
    formatHint: 'CRA Business Number has 9 digits',
    exampleNumber: '123456789',
    isEuMember: false,
  },
  AU: {
    countryCode: 'AU',
    countryName: 'Australia',
    countryFlag: '🇦🇺',
    shortVatLabel: 'ABN (Australian Business Number)',
    fullVatLabel: 'Australian Business Number (ABN / ACN)',
    companyNameLabel: 'Registered Entity / Trading Name',
    taxOfficeLabel: 'Australian Taxation Office (ATO)',
    commercialRegistryLabel: 'ASIC Corporate Registry Number',
    authoritiesNote: 'Australian Taxation Office (ATO) & ABR',
    placeholder: 'e.g. 12 345 678 901 (11-digit ABN)',
    formatHint: 'ABN requires 11 digits',
    exampleNumber: '12345678901',
    isEuMember: false,
  },
  OTHER: {
    countryCode: 'OTHER',
    countryName: 'Worldwide (Third Country)',
    countryFlag: '🌐',
    shortVatLabel: 'National Tax ID',
    fullVatLabel: 'National Tax Identification / Business Registration Number',
    companyNameLabel: 'Official Registered Business Name',
    taxOfficeLabel: 'Competent National Tax Authority',
    commercialRegistryLabel: 'National Commercial Company Registry',
    authoritiesNote: 'National Revenue Authority & Commercial Registry',
    placeholder: 'Enter official business tax ID or registration number',
    formatHint: 'National Tax Identification or Business Registration',
    exampleNumber: 'TAX123456789',
    isEuMember: false,
  },
};

export function getFiscalLabels(countryCode: string = 'GR'): FiscalLabelConfig {
  const code = (countryCode || 'GR').toUpperCase();
  if (code === 'EL') return SUPPORTED_FISCAL_COUNTRIES.GR;
  if (SUPPORTED_FISCAL_COUNTRIES[code]) return SUPPORTED_FISCAL_COUNTRIES[code];

  // Check if standard EU country
  const EU_CODES = ['AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'HU', 'IE', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'SE'];
  const isEu = EU_CODES.includes(code);

  return {
    countryCode: code,
    countryName: isEu ? 'European Union' : 'International Partner',
    countryFlag: isEu ? '🇪🇺' : '🌐',
    shortVatLabel: isEu ? 'EU VAT ID' : 'National Tax ID',
    fullVatLabel: isEu ? 'EU VAT Identification Number (VAT ID)' : 'National Tax Identification Number',
    companyNameLabel: 'Official Registered Business Name',
    taxOfficeLabel: 'Competent Tax Office',
    commercialRegistryLabel: 'National Commercial Business Registry',
    authoritiesNote: isEu ? 'National Tax Authority & EU VIES' : 'National Revenue Authority',
    placeholder: isEu ? `e.g. ${code}999999999 (EU VAT Number)` : 'e.g. TAX123456789',
    formatHint: isEu ? 'Standard EU VAT format (Country code + national number)' : 'National business registration format',
    exampleNumber: `${code}999999999`,
    isEuMember: isEu,
  };
}

/**
 * Universal Tax & Invoicing Breakdown Calculator for worldwide entities
 * Calculates exact pricing, VAT application, and legal basis for Greek, EU, and Non-EU businesses.
 */
export interface EntityTaxBreakdown {
  regionType: 'domestic_gr' | 'eu_b2b_reverse_charge' | 'eu_b2c_domestic' | 'extra_eu_export';
  regionName: string;
  countryCode: string;
  countryFlag: string;
  currency: string;
  currencySymbol: string;
  basePrice: number;
  vatRatePercent: number;
  vatAmount: number;
  totalPrice: number;
  taxNote: string;
  legalBasis: string;
  invoiceType: string;
  reportingAuthority: string;
  isTaxDeductible: boolean;
  deductionExplanation: string;
  accountantGuidance: string;
}

export function calculateEntityTaxBreakdown(countryCode: string = 'GR', hasValidTaxId: boolean = true): EntityTaxBreakdown {
  const code = (countryCode || 'GR').toUpperCase();

  // 1. GREECE (DOMESTIC EU)
  if (code === 'GR' || code === 'EL') {
    const basePrice = 199.00;
    const vatRatePercent = 24;
    const vatAmount = +(basePrice * 0.24).toFixed(2); // 47.76
    const totalPrice = +(basePrice + vatAmount).toFixed(2); // 246.76
    return {
      regionType: 'domestic_gr',
      regionName: 'Greece (Domestic Entity)',
      countryCode: 'GR',
      countryFlag: '🇬🇷',
      currency: 'EUR',
      currencySymbol: '€',
      basePrice,
      vatRatePercent,
      vatAmount,
      totalPrice,
      taxNote: 'Standard 24% Greek VAT applies (€47.76). Total payable is €246.76.',
      legalBasis: 'Greek VAT Code (Law 2859/2000) / AADE myDATA',
      invoiceType: 'Service Invoice (ΤΠΥ) with QR & MARK',
      reportingAuthority: 'AADE myDATA (Independent Authority for Public Revenue)',
      isTaxDeductible: true,
      deductionExplanation: '100% tax-deductible as an operating business advertising and digital promotion expense.',
      accountantGuidance: 'Your accountant records the gross invoice in expenses, deducts 100% from corporate taxable profit, and offsets the €47.76 VAT in your periodic VAT declaration (ΦΠΑ).',
    };
  }

  // 2. EUROPEAN UNION (INTRA-COMMUNITY B2B)
  const EU_COUNTRIES = ['IT', 'FR', 'ES', 'DE', 'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'HU', 'IE', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'SE'];
  const cfg = SUPPORTED_FISCAL_COUNTRIES[code] || getFiscalLabels(code);

  if (EU_COUNTRIES.includes(code)) {
    if (hasValidTaxId) {
      return {
        regionType: 'eu_b2b_reverse_charge',
        regionName: `${cfg.countryName} (EU B2B Reverse Charge)`,
        countryCode: code,
        countryFlag: cfg.countryFlag,
        currency: 'EUR',
        currencySymbol: '€',
        basePrice: 199.00,
        vatRatePercent: 0,
        vatAmount: 0.00,
        totalPrice: 199.00,
        taxNote: '0% VAT (Reverse Charge). You pay only the net price of €199.00.',
        legalBasis: 'Articles 44 & 196 of EU VAT Directive 2006/112/EC',
        invoiceType: 'Intra-Community B2B Service Invoice',
        reportingAuthority: 'European Commission VIES & National Tax Authority',
        isTaxDeductible: true,
        deductionExplanation: '100% deductible operating expense under European cross-border B2B rules.',
        accountantGuidance: 'Your accountant books this under Reverse Charge (Intra-Community acquisition of services). No cash VAT is paid; VAT is self-assessed and simultaneously deducted on your national VAT return.',
      };
    } else {
      const basePrice = 199.00;
      const vatRatePercent = 24;
      const vatAmount = 47.76;
      return {
        regionType: 'eu_b2c_domestic',
        regionName: `${cfg.countryName} (Unverified Tax ID)`,
        countryCode: code,
        countryFlag: cfg.countryFlag,
        currency: 'EUR',
        currencySymbol: '€',
        basePrice,
        vatRatePercent,
        vatAmount,
        totalPrice: 246.76,
        taxNote: 'Standard 24% VAT applies (€47.76) until a valid VIES VAT number is provided.',
        legalBasis: 'EU Directive 2006/112/EC - Non-taxable B2C rule',
        invoiceType: 'Standard Retail Service Invoice',
        reportingAuthority: 'AADE myDATA',
        isTaxDeductible: false,
        deductionExplanation: 'Provide a valid VIES VAT ID to automatically remove VAT and pay only the €199 net price.',
        accountantGuidance: 'Enter a valid corporate EU VAT ID to switch to 0% B2B reverse charge.',
      };
    }
  }

  // 3. EXTRA-EU / WORLDWIDE (US, UK, CH, CA, AU, REST OF WORLD)
  let currency = 'EUR';
  let currencySymbol = '€';
  let authority = 'National Revenue Authority';
  let extraHint = 'Certificate of Tax Residence & IRS W-8BEN-E provided upon request';

  if (code === 'US') {
    currency = 'USD';
    currencySymbol = '$';
    authority = 'Internal Revenue Service (IRS)';
    extraHint = 'TerroirTrail provides an IRS Form W-8BEN-E certifying foreign corporate status for zero US withholding';
  } else if (code === 'GB') {
    currency = 'GBP';
    currencySymbol = '£';
    authority = 'HM Revenue & Customs (HMRC)';
    extraHint = 'UK Reverse Charge applies for UK VAT registered businesses under Section 8 of VATA 1994';
  } else if (code === 'CH') {
    currency = 'CHF';
    currencySymbol = 'CHF ';
    authority = 'Federal Tax Administration (ESTV)';
    extraHint = 'Swiss Bezugsteuer (reverse charge) rules apply for Swiss taxable enterprises';
  } else if (code === 'CA') {
    currency = 'CAD';
    currencySymbol = 'C$';
    authority = 'Canada Revenue Agency (CRA)';
  } else if (code === 'AU') {
    currency = 'AUD';
    currencySymbol = 'A$';
    authority = 'Australian Taxation Office (ATO)';
  }

  return {
    regionType: 'extra_eu_export',
    regionName: `${cfg.countryName} (Extra-EU Export)`,
    countryCode: code,
    countryFlag: cfg.countryFlag,
    currency,
    currencySymbol,
    basePrice: 199.00,
    vatRatePercent: 0,
    vatAmount: 0.00,
    totalPrice: 199.00,
    taxNote: '0% VAT (Out of Scope / Export of Services). You pay only the net price.',
    legalBasis: 'Article 14 Greek VAT Code (Law 2859/2000) / Article 44 EU Directive 2006/112/EC',
    invoiceType: 'International B2B Commercial Export Invoice',
    reportingAuthority: authority,
    isTaxDeductible: true,
    deductionExplanation: '100% tax-deductible as an ordinary and necessary business advertising and software service expense.',
    accountantGuidance: `Book as a foreign digital marketing expense with 0% foreign VAT. ${extraHint}.`,
  };
}

/**
 * Universal VAT & Tax ID Validator for worldwide producers on TerroirTrail
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
  } else if (trimmed.startsWith('GB')) {
    targetCountry = 'GB';
  } else if (trimmed.startsWith('CHE')) {
    targetCountry = 'CH';
  }

  // 1. Italy
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

  // 2. Greece
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

  // 3. United States (EIN: 9 digits, format XX-XXXXXXX)
  if (targetCountry === 'US') {
    const clean = trimmed.replace(/\D/g, '');
    const isValid = clean.length === 9 && clean !== '000000000';
    const formatted = isValid ? `${clean.slice(0, 2)}-${clean.slice(2)}` : trimmed;
    return {
      isValid,
      country: 'OTHER',
      formatted,
      cleanDigits: clean,
      error: isValid ? undefined : 'US Federal EIN must be exactly 9 digits (format: XX-XXXXXXX)',
    };
  }

  // 4. United Kingdom (UK VAT: 9 digits, or CRN: 8 characters)
  if (targetCountry === 'GB') {
    const clean = trimmed.replace(/^GB/, '');
    const isVat = /^\d{9}$/.test(clean);
    const isCrn = /^[A-Z0-9]{8}$/.test(clean);
    const isValid = isVat || isCrn;
    return {
      isValid,
      country: 'OTHER',
      formatted: isVat ? 'GB' + clean : clean,
      cleanDigits: clean,
      error: isValid ? undefined : 'UK Tax ID must be a 9-digit UK VAT number (GB + 9 digits) or an 8-character Companies House CRN',
    };
  }

  // 5. Switzerland (UID: CHE-123.456.789)
  if (targetCountry === 'CH') {
    const clean = trimmed.replace(/[^0-9]/g, '');
    const isValid = clean.length === 9;
    const formatted = isValid 
      ? `CHE-${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6, 9)} MWST`
      : trimmed;
    return {
      isValid,
      country: 'OTHER',
      formatted,
      cleanDigits: clean,
      error: isValid ? undefined : 'Swiss UID must have 9 digits (format CHE-123.456.789)',
    };
  }

  // 6. Canada (CRA Business Number: 9 digits)
  if (targetCountry === 'CA') {
    const clean = trimmed.replace(/\D/g, '').slice(0, 9);
    const isValid = clean.length === 9;
    return {
      isValid,
      country: 'OTHER',
      formatted: clean,
      cleanDigits: clean,
      error: isValid ? undefined : 'CRA Business Number must have 9 digits',
    };
  }

  // 7. Australia (ABN: 11 digits)
  if (targetCountry === 'AU') {
    const clean = trimmed.replace(/\D/g, '');
    const isValid = clean.length === 11;
    return {
      isValid,
      country: 'OTHER',
      formatted: clean,
      cleanDigits: clean,
      error: isValid ? undefined : 'Australian Business Number (ABN) must have 11 digits',
    };
  }

  // 8. France
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

  // 9. Spain
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

  // 10. Germany
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

  // 11. Generic Worldwide / EU Fallback
  const isGenericValid = trimmed.length >= 5 && trimmed.length <= 20;
  return {
    isValid: isGenericValid,
    country: 'OTHER',
    formatted: trimmed,
    cleanDigits: trimmed.replace(/^[A-Z]{2}/, ''),
    error: isGenericValid ? undefined : 'Tax ID / Business Registration must be between 5 and 20 characters',
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

