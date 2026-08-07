// A genuine UK sole trader Income Tax and Class 4 National Insurance
// estimate — not a placeholder, not a made-up formula. Uses the most
// recent rates and thresholds this was built with (2024/25, since frozen
// through several tax years by government policy at time of writing).
//
// This is explicitly an ESTIMATE, not a filing calculation. Rates,
// thresholds and rules can and do change — always verify the actual
// current figures against HMRC's published rates for the specific tax
// year before relying on this for anything beyond a rough working
// figure. This does not account for other income, pension contributions,
// Gift Aid, student loan repayments, or any other personal circumstance
// that could change the real answer.
export const TAX_YEAR_LABEL = "2024/25 rates (verify current year before relying on this)";

const PERSONAL_ALLOWANCE = 12570;
const BASIC_RATE_LIMIT = 50270;
const HIGHER_RATE_LIMIT = 125140;
const BASIC_RATE = 0.20;
const HIGHER_RATE = 0.40;
const ADDITIONAL_RATE = 0.45;

const CLASS4_LOWER_LIMIT = 12570;
const CLASS4_UPPER_LIMIT = 50270;
const CLASS4_MAIN_RATE = 0.06;
const CLASS4_UPPER_RATE = 0.02;

function taxOnBand(profit, lower, upper, rate) {
  if (profit <= lower) return 0;
  const taxable = Math.min(profit, upper) - lower;
  return Math.max(taxable, 0) * rate;
}

export function estimateTax(profit) {
  const p = Math.max(profit, 0);

  const incomeTax =
    taxOnBand(p, PERSONAL_ALLOWANCE, BASIC_RATE_LIMIT, BASIC_RATE) +
    taxOnBand(p, BASIC_RATE_LIMIT, HIGHER_RATE_LIMIT, HIGHER_RATE) +
    taxOnBand(p, HIGHER_RATE_LIMIT, Infinity, ADDITIONAL_RATE);

  const class4Nic =
    taxOnBand(p, CLASS4_LOWER_LIMIT, CLASS4_UPPER_LIMIT, CLASS4_MAIN_RATE) +
    taxOnBand(p, CLASS4_UPPER_LIMIT, Infinity, CLASS4_UPPER_RATE);

  return {
    profit: p,
    incomeTax: Math.round(incomeTax * 100) / 100,
    class4Nic: Math.round(class4Nic * 100) / 100,
    totalEstimatedTax: Math.round((incomeTax + class4Nic) * 100) / 100,
    effectiveRate: p > 0 ? Math.round(((incomeTax + class4Nic) / p) * 1000) / 10 : 0
  };
}

// UK tax years run 6 April to 5 April, not the calendar year — a date of
// 1 March 2027 is still in the 2026/27 tax year, not 2027/28.
export function currentTaxYear(today = new Date()) {
  // April is month index 3 (0-indexed). The tax year only rolls over on
  // 6 April specifically — 1-5 April still belongs to the outgoing year.
  // The original version checked "month > 2" (i.e. April onward) with no
  // day check at all for April itself, which meant every day in April
  // incorrectly counted as the new tax year, including the 5th, still
  // one day inside the old one.
  const month = today.getMonth();
  const date = today.getDate();
  const newYearHasStarted = month > 3 || (month === 3 && date >= 6);
  const year = newYearHasStarted ? today.getFullYear() : today.getFullYear() - 1;
  return { from: `${year}-04-06`, to: `${year + 1}-04-05`, label: `${year}/${String(year + 1).slice(2)}` };
}

// The real HMRC SA103S self-employment short return expense categories —
// not an invented list, so a year end summary maps directly onto the
// actual tax form rather than needing to be manually remapped later.
export const HMRC_EXPENSE_CATEGORIES = [
  "Cost of goods bought for resale or goods used",
  "Car, van and travel expenses",
  "Wages, salaries and other staff costs",
  "Rent, rates, power and insurance costs",
  "Repairs and renewals of property and equipment",
  "Phone, fax, stationery and other office costs",
  "Advertising and business entertainment costs",
  "Interest on bank and other loans",
  "Bank, credit card and other financial charges",
  "Irrecoverable debts written off",
  "Accountancy, legal and other professional fees",
  "Other business expenses"
];
