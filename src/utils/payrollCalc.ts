/**
 * Payroll Calculation Utility (Illustrative Math Demo)
 * 
 * DISCLAIMER / STATUTORY NOTICE:
 * Indian payroll statutory rules (EPFO wage ceiling, ESIC applicability criteria, state-specific
 * Professional Tax slabs, New vs Old Regime TDS brackets, Gratuity, LWF) require dedicated compliance engines.
 * 
 * The calculations below provide standard formula implementations for salary computations.
 */

export interface SalaryBreakdown {
  basic: number;
  hra: number;
  specialAllowance: number;
  grossSalary: number;
  pf: number;
  esi: number;
  professionalTax: number;
  tds: number;
  totalDeductions: number;
  netSalary: number;
}

/**
 * Calculates simplified illustrative breakdown from Monthly Gross CTC
 */
export function calculateIllustrativeSalaryBreakdown(monthlyGross: number): SalaryBreakdown {
  // Simplified Illustrative Component Split:
  // Basic: 50% of Gross
  const basic = Math.round(monthlyGross * 0.5);
  
  // HRA: 20% of Gross
  const hra = Math.round(monthlyGross * 0.2);
  
  // Special Allowance: Remaining balancing figure (30%)
  const specialAllowance = Math.max(0, monthlyGross - basic - hra);
  
  // Illustrative PF: 12% of Basic, capped for demo at basic ₹15,000 (= ₹1,800 max) or 12% of actual basic for higher earners
  const pfEligibleBasic = Math.min(basic, 15000);
  const pf = Math.round(pfEligibleBasic * 0.12);
  
  // Illustrative ESI: 0.75% of Gross if monthlyGross <= 21,000, else 0
  const esi = monthlyGross <= 21000 ? Math.round(monthlyGross * 0.0075) : 0;
  
  // Illustrative PT (Professional Tax): standard ₹200/month
  const professionalTax = monthlyGross > 15000 ? 200 : 0;
  
  // Illustrative TDS (simplified slab: 5% above 50,000/mo, 10% above 100,000/mo, 20% above 200,000/mo)
  let tds = 0;
  if (monthlyGross > 200000) {
    tds = Math.round((monthlyGross - 200000) * 0.20 + 12500);
  } else if (monthlyGross > 100000) {
    tds = Math.round((monthlyGross - 100000) * 0.10 + 2500);
  } else if (monthlyGross > 50000) {
    tds = Math.round((monthlyGross - 50000) * 0.05);
  }
  
  const totalDeductions = pf + esi + professionalTax + tds;
  const netSalary = Math.max(0, monthlyGross - totalDeductions);

  return {
    basic,
    hra,
    specialAllowance,
    grossSalary: monthlyGross,
    pf,
    esi,
    professionalTax,
    tds,
    totalDeductions,
    netSalary,
  };
}

/**
 * Format numbers as Indian Rupee strings (e.g. ₹1,45,000)
 */
export function formatInr(amount: number): string {
  if (isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format large numbers in Lakhs/Crores for KPI widgets (e.g., ₹14.5 L, ₹1.2 Cr)
 */
export function formatInrCompact(amount: number): string {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)} L`;
  }
  if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(1)} K`;
  }
  return formatInr(amount);
}
