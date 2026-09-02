import { jsPDF } from 'jspdf';
import { Payslip } from '../types';
import { formatInr } from './payrollCalc';

/**
 * Generates a client-side downloadable PDF Payslip with explicit Demo watermark.
 */
export function downloadPayslipPdf(payslip: Payslip, orgName: string): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.getImageProperties ? 210 : 210;
  
  // Header / Branding Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 38, 'F');

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text('SQUBE HRMS', 15, 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(203, 213, 225); // slate-300
  doc.text(`Organization: ${orgName}`, 15, 24);
  doc.text(`Salary Slip for Period: ${payslip.monthYear}`, 15, 30);

  // Status Badge on Header
  doc.setFillColor(34, 197, 94); // emerald-500
  doc.roundedRect(150, 12, 45, 12, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text('DISBURSED', 162, 19.5);

  // Watermark across center
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.setTextColor(226, 232, 240); // very faint slate
  doc.saveGraphicsState();
  // Rotate watermark
  doc.text('OFFICIAL COPY • ENTERPRISE HRMS', 20, 160, { angle: 45 });
  doc.restoreGraphicsState();

  // Employee Information Box
  let y = 48;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(15, y, 180, 36, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);

  doc.text('Employee Name:', 20, y + 8);
  doc.text('Employee Code:', 20, y + 16);
  doc.text('Department:', 20, y + 24);
  doc.text('Designation:', 20, y + 32);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(payslip.employeeName, 60, y + 8);
  doc.text(payslip.employeeCode, 60, y + 16);
  doc.text(payslip.department, 60, y + 24);
  doc.text(payslip.designation, 60, y + 32);

  // Column 2 of Employee info
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 65, 85);
  doc.text('Bank Name:', 115, y + 8);
  doc.text('Account No:', 115, y + 16);
  doc.text('Days Present:', 115, y + 24);
  doc.text('Paid Leaves:', 115, y + 32);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(payslip.bankName, 150, y + 8);
  doc.text(payslip.maskedAccount, 150, y + 16);
  doc.text(`${payslip.daysPresent} / ${payslip.workingDays}`, 150, y + 24);
  doc.text(`${payslip.paidLeaves} days`, 150, y + 32);

  // Breakdown Tables (Earnings on Left, Deductions on Right)
  y = 92;
  const tableWidth = 86;

  // Earnings Header
  doc.setFillColor(79, 70, 229); // Indigo 600
  doc.rect(15, y, tableWidth, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text('EARNINGS', 20, y + 5.5);
  doc.text('AMOUNT', 80, y + 5.5);

  // Deductions Header
  doc.setFillColor(225, 29, 72); // Rose 600
  doc.rect(109, y, tableWidth, 8, 'F');
  doc.text('DEDUCTIONS', 114, y + 5.5);
  doc.text('AMOUNT', 174, y + 5.5);

  // Rows
  const earnings = [
    { label: 'Basic Salary', amount: payslip.basicSalary },
    { label: 'House Rent Allowance (HRA)', amount: payslip.hra },
    { label: 'Special Allowance', amount: payslip.specialAllowance },
    { label: 'Bonus / Incentive', amount: payslip.bonusOrIncentive },
  ];

  const deductions = [
    { label: 'Provident Fund (PF)', amount: payslip.providentFund },
    { label: 'Employee State Ins. (ESI)', amount: payslip.esi },
    { label: 'Professional Tax (PT)', amount: payslip.professionalTax },
    { label: 'Income Tax (TDS)', amount: payslip.tdsIncomeTax },
  ];

  y += 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);

  for (let i = 0; i < 4; i++) {
    const rowY = y + i * 8;
    // alternating background
    if (i % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(15, rowY, tableWidth, 8, 'F');
      doc.rect(109, rowY, tableWidth, 8, 'F');
    }
    
    // Earnings items
    doc.text(earnings[i].label, 20, rowY + 5.5);
    doc.text(formatInr(earnings[i].amount), 75, rowY + 5.5);

    // Deductions items
    doc.text(deductions[i].label, 114, rowY + 5.5);
    doc.text(formatInr(deductions[i].amount), 169, rowY + 5.5);
  }

  // Totals Row
  y += 32;
  doc.setFillColor(241, 245, 249);
  doc.rect(15, y, tableWidth, 9, 'F');
  doc.rect(109, y, tableWidth, 9, 'F');

  doc.setFont('helvetica', 'bold');
  doc.text('Total Gross Earnings', 20, y + 6);
  doc.text(formatInr(payslip.grossEarnings), 75, y + 6);

  doc.text('Total Deductions', 114, y + 6);
  doc.text(formatInr(payslip.totalDeductions), 169, y + 6);

  // Net Pay Callout Banner
  y += 16;
  doc.setFillColor(15, 23, 42);
  doc.roundedRect(15, y, 180, 24, 3, 3, 'F');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(203, 213, 225);
  doc.text('NET SALARY PAYABLE', 25, y + 9);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text(formatInr(payslip.netSalary), 25, y + 18);

  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  doc.text('Transferred electronically to registered account', 95, y + 14);

  // Footer Disclaimer
  y += 40;
  doc.setDrawColor(203, 213, 225);
  doc.line(15, y, 195, y);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(
    'SYSTEM GENERATED STATEMENT: This payslip was generated securely by Sqbe HRMS Enterprise Cloud.',
    15,
    y + 6
  );
  doc.text(
    'Formulas and values are illustrative only and not certified for statutory tax filings under IT Act / EPFO.',
    15,
    y + 11
  );
  doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN')}`, 15, y + 16);

  // Trigger browser download
  doc.save(`Payslip_${payslip.employeeCode}_${payslip.monthYear.replace(/\s+/g, '_')}.pdf`);
}

/**
 * Generates an executive Monthly HR & Analytics Report PDF
 */
export function downloadExecutiveReportPdf(
  orgName: string,
  month: string,
  stats: {
    totalHeadcount: number;
    activeCount: number;
    monthlyPayrollInr: number;
    attendanceRatePercent: number;
    openJobsCount: number;
    topPerformers: string[];
    departmentHeadcounts: { name: string; count: number }[];
  }
): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = 210;

  // Header Banner
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 42, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text('SQBE HRMS • EXECUTIVE HR REPORT', 15, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(203, 213, 225);
  doc.text(`Organization: ${orgName}`, 15, 26);
  doc.text(`Report Period: ${month} • Generated from Client State Simulator`, 15, 33);

  // Key KPI grid in PDF
  let y = 52;
  const kpis = [
    { label: 'Total Headcount', val: `${stats.totalHeadcount} Employees` },
    { label: 'Monthly Payroll', val: formatInr(stats.monthlyPayrollInr) },
    { label: 'Avg Attendance Rate', val: `${stats.attendanceRatePercent}%` },
    { label: 'Open Requisitions', val: `${stats.openJobsCount} Positions` },
  ];

  kpis.forEach((kpi, index) => {
    const colX = 15 + (index % 2) * 92;
    const rowY = y + Math.floor(index / 2) * 22;

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(colX, rowY, 88, 18, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(kpi.label.toUpperCase(), colX + 5, rowY + 6);

    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text(kpi.val, colX + 5, rowY + 14);
  });

  // Department Breakdown Table
  y = 104;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('Department Headcount & Allocation', 15, y);

  y += 6;
  doc.setFillColor(79, 70, 229);
  doc.rect(15, y, 180, 8, 'F');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text('DEPARTMENT NAME', 20, y + 5.5);
  doc.text('ACTIVE STAFF', 120, y + 5.5);
  doc.text('SHARE %', 160, y + 5.5);

  y += 8;
  stats.departmentHeadcounts.forEach((dept, i) => {
    const rowY = y + i * 8;
    if (i % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(15, rowY, 180, 8, 'F');
    }
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(dept.name, 20, rowY + 5.5);
    doc.text(`${dept.count} members`, 120, rowY + 5.5);
    const pct = ((dept.count / (stats.totalHeadcount || 1)) * 100).toFixed(1);
    doc.text(`${pct}%`, 160, rowY + 5.5);
  });

  // High Performers Spotlight
  y += stats.departmentHeadcounts.length * 8 + 14;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('High Performers & Key Contributors', 15, y);

  y += 6;
  doc.setFillColor(240, 253, 244);
  doc.setDrawColor(187, 247, 208);
  doc.roundedRect(15, y, 180, 20, 2, 2, 'FD');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(22, 101, 52);
  doc.text(`Recognized this cycle: ${stats.topPerformers.join(', ')}`, 20, y + 11);

  // Footer
  y = 265;
  doc.setDrawColor(203, 213, 225);
  doc.line(15, y, 195, y);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Sqbe HRMS • Executive Analytics Report • Enterprise Cloud Environment', 15, y + 6);
  doc.text('Confidential - For internal evaluation purposes only', 15, y + 11);

  doc.save(`Sqbe_Executive_Report_${orgName.replace(/\s+/g, '_')}_${month}.pdf`);
}
