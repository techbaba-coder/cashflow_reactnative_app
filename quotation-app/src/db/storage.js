const PARTICULARS_KEY = 'quotation_app_particulars';
const QUOTATIONS_KEY  = 'quotation_app_quotations';
const SETTINGS_KEY    = 'quotation_app_settings';

// ─── Particulars ──────────────────────────────────────────────────────────────

export function getParticulars() {
  try { return JSON.parse(localStorage.getItem(PARTICULARS_KEY)) || []; }
  catch { return []; }
}

export function saveParticulars(particulars) {
  localStorage.setItem(PARTICULARS_KEY, JSON.stringify(particulars));
}

// ─── Quotations ───────────────────────────────────────────────────────────────

export function getQuotations() {
  try { return JSON.parse(localStorage.getItem(QUOTATIONS_KEY)) || []; }
  catch { return []; }
}

export function saveQuotations(quotations) {
  localStorage.setItem(QUOTATIONS_KEY, JSON.stringify(quotations));
}

export function addQuotation(quotation) {
  const all = getQuotations();
  all.unshift(quotation);
  saveQuotations(all);
}

export function deleteQuotation(id) {
  saveQuotations(getQuotations().filter(q => q.id !== id));
}

// ─── Settings ─────────────────────────────────────────────────────────────────

export const DEFAULT_SETTINGS = {
  companyTitle: 'Quotation - Glass Work',
  pan:  'ABTPY4729J',
  gstNo: '27ABTPY4729J1ZN',
  msme: 'UDYAM-MH-19-0121657',
  email: 'Alutradeenterprises@gmail.com',
  contact: '+91 95650 365747',
  paymentTerms: '',
  termsConditions:
    '1) Electricity, Water will be supplied by you\n' +
    '2) Safe storage space will be provided by you.\n' +
    '3) Any masonry work will be done by you.\n' +
    '4) Alteration after fixing, will be charged extra.\n' +
    '5) Final billing will be done upon Actual site Measurement\n' +
    '6) Timely payment system would Enable us to do good quality work.',
  bankDetails:
    'BANK - BANK OF BARODA\n' +
    'ACCOUNT TYPE - CURRENT ACCOUNT\n' +
    'Account No - 99480200001430\n' +
    'Ifsc Code - BARB0DBMONT\n' +
    'Branch - Mount Poinsur, Mumbai subarban -400103',
  rateAnalysis: {
    title: 'Rate Bifurcation \u2013 27x65 Domal Series',
    rows: [
      { sr: 1, name: 'Aluminium Section',    qty: 315, rate: 345, fixedAmt: '' },
      { sr: 2, name: '6 mm Toughened Glass', qty: 448, rate: 90,  fixedAmt: '' },
      { sr: 3, name: 'Labour @ \u20b970',       qty: 417, rate: 70,  fixedAmt: '' },
      { sr: 4, name: 'Hardware appx',         qty: '',  rate: '',  fixedAmt: 22000 },
      { sr: 5, name: 'Powder Coating',        qty: '',  rate: '',  fixedAmt: 14000 },
    ],
    overheadPct: 8,
    profitPct:   15,
    totalSqft:   417,
  },
  actualCost: {
    title: 'Rate Bifurcation \u2013 27x65 Domal Series actual cost',
    rows: [
      { sr: 1, name: 'Aluminium Section',    qty: 287, rate: 342, fixedAmt: '' },
      { sr: 2, name: '6 mm Toughened Glass', qty: 448, rate: 80,  fixedAmt: '' },
      { sr: 3, name: 'Labour @ \u20b970',       qty: 417, rate: 60,  fixedAmt: '' },
      { sr: 4, name: 'Hardware appx',         qty: '',  rate: '',  fixedAmt: 22000 },
      { sr: 5, name: 'Powder Coating',        qty: '',  rate: '',  fixedAmt: 13000 },
    ],
    overheadPct:  8,
    profitPct:    15,
    totalSqft:    417,
    projectSqft:  8000,
  },
};

export function getSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY));
    if (!saved) return JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
    // Deep merge so new default keys appear even for old saved settings
    return {
      ...DEFAULT_SETTINGS,
      ...saved,
      rateAnalysis: { ...DEFAULT_SETTINGS.rateAnalysis, ...saved.rateAnalysis },
      actualCost:   { ...DEFAULT_SETTINGS.actualCost,   ...saved.actualCost   },
    };
  } catch {
    return JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
  }
}

export function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
