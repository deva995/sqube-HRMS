import React, { useState, useMemo, useEffect } from 'react';
import {
  Receipt,
  IndianRupee,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  Search,
  Filter,
  FileText,
  UploadCloud,
  DollarSign,
  TrendingUp,
  Tag,
  Building,
} from 'lucide-react';
import { useHrms } from '../../context/HrmsContext';
import { KpiCard } from '../common/KpiCard';
import { Modal } from '../common/Modal';
import { StatusBadge } from '../common/StatusBadge';
import { ExpenseClaim } from '../../types';
import { expenseApi } from '../../services/expenseApi';

export const ExpenseModuleView: React.FC = () => {
  const { currentUserRole, currentUserPersona, showToast } = useHrms();

  const [expenses, setExpenses] = useState<ExpenseClaim[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Approved' | 'Rejected' | 'Reimbursed'>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  // Submit Expense Form State
  const [category, setCategory] = useState('Travel');
  const [amount, setAmount] = useState<number>(1500);
  const [merchant, setMerchant] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [receiptFileName, setReceiptFileName] = useState('');

  const isManagerOrAdmin = ['Super Admin', 'Admin', 'Finance Manager', 'Manager'].includes(currentUserRole);

  const fetchExpenses = async () => {
    try {
      setIsLoading(true);
      const data = await expenseApi.getExpenses();
      setExpenses(data);
    } catch (err: any) {
      showToast({ message: 'Failed to load expense records: ' + err.message, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((exp) => {
      const matchStatus = statusFilter === 'All' || exp.status === statusFilter;
      const matchCat = categoryFilter === 'All' || exp.category === categoryFilter;
      const matchSearch =
        !searchQuery ||
        exp.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exp.merchant.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exp.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchStatus && matchCat && matchSearch;
    });
  }, [expenses, statusFilter, categoryFilter, searchQuery]);

  const stats = useMemo(() => {
    const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
    const pendingAmount = expenses.filter((e) => e.status === 'Pending').reduce((sum, e) => sum + e.amount, 0);
    const approvedAmount = expenses.filter((e) => e.status === 'Approved' || e.status === 'Reimbursed').reduce((sum, e) => sum + e.amount, 0);
    const pendingCount = expenses.filter((e) => e.status === 'Pending').length;
    return { totalAmount, pendingAmount, approvedAmount, pendingCount };
  }, [expenses]);

  const handleSubmitExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!merchant.trim() || amount <= 0) {
      showToast({ message: 'Please enter a valid merchant and amount.', type: 'error' });
      return;
    }

    try {
      const created = await expenseApi.createExpense({
        employeeId: currentUserPersona.id || 'emp-acro-104',
        employeeName: currentUserPersona.name || 'Sneha Patel',
        category,
        amount,
        currency: 'INR',
        date,
        merchant,
        description: description || `${category} expense at ${merchant}`,
        receiptUrl: receiptFileName ? `https://storage.sqbehrms.internal/receipts/${receiptFileName}` : undefined,
      });

      setExpenses([created, ...expenses]);
      setIsSubmitModalOpen(false);
      setMerchant('');
      setDescription('');
      setReceiptFileName('');
      setAmount(1500);
      showToast({ message: 'Expense claim submitted successfully for manager approval.', type: 'success' });
    } catch (err: any) {
      showToast({ message: 'Failed to submit expense: ' + err.message, type: 'error' });
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: 'Approved' | 'Rejected' | 'Reimbursed') => {
    try {
      const updated = await expenseApi.updateStatus(id, newStatus);
      setExpenses(expenses.map((e) => (e.id === id ? updated : e)));
      showToast({ message: `Expense claim marked as ${newStatus}.`, type: 'success' });
    } catch (err: any) {
      showToast({ message: 'Failed to update expense status: ' + err.message, type: 'error' });
    }
  };

  const categories = ['Travel', 'Meals & Entertainment', 'Software & Tools', 'Office Supplies', 'Medical', 'Training & Certs', 'Other'];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/70 backdrop-blur-xl border border-slate-200/80 rounded-2xl p-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Receipt className="w-7 h-7 text-indigo-600" />
            Corporate Expense & Reimbursement
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Automated expense claims, digital receipt auditing, policy limit validations, and direct payroll reimbursement.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSubmitModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-500/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Claim New Expense
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Claims"
          value={`₹${stats.totalAmount.toLocaleString()}`}
          subtitle={`${expenses.length} claims submitted`}
          icon={<IndianRupee className="w-5 h-5 text-indigo-600" />}
          gradient="from-indigo-500/10 to-blue-500/10"
        />
        <KpiCard
          title="Pending Approval"
          value={`₹${stats.pendingAmount.toLocaleString()}`}
          subtitle={`${stats.pendingCount} claims awaiting review`}
          icon={<Clock className="w-5 h-5 text-amber-600" />}
          gradient="from-amber-500/10 to-orange-500/10"
        />
        <KpiCard
          title="Approved & Reimbursed"
          value={`₹${stats.approvedAmount.toLocaleString()}`}
          subtitle="Processed via direct transfer"
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
          gradient="from-emerald-500/10 to-teal-500/10"
        />
        <KpiCard
          title="Category Distribution"
          value="7 Active"
          subtitle="Compliant with statutory tax rules"
          icon={<Tag className="w-5 h-5 text-purple-600" />}
          gradient="from-purple-500/10 to-indigo-500/10"
        />
      </div>

      {/* Expense Claims Table */}
      <div className="bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        {/* Controls Bar */}
        <div className="p-4 border-b border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status:</span>
            {(['All', 'Pending', 'Approved', 'Rejected', 'Reimbursed'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  statusFilter === st
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st}
              </button>
            ))}

            <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block" />

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none"
            >
              <option value="All">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search employee, merchant, details..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Employee</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Merchant / Vendor</th>
                <th className="py-3.5 px-4">Expense Date</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Receipt</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading expenses...
                  </td>
                </tr>
              ) : filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Receipt className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    No expense claims found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{exp.employeeName}</div>
                      <div className="text-[11px] text-slate-400">ID: {exp.id}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-900">{exp.merchant}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-xs">{exp.description}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{exp.date}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 text-sm">₹{exp.amount.toLocaleString()}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      {exp.receiptUrl ? (
                        <a
                          href={exp.receiptUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          View
                        </a>
                      ) : (
                        <span className="text-slate-400">No Receipt</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={exp.status} />
                      {exp.approvedBy && (
                        <div className="text-[10px] text-slate-400 mt-0.5">by {exp.approvedBy}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {exp.status === 'Pending' && isManagerOrAdmin ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleUpdateStatus(exp.id, 'Approved')}
                            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-medium text-xs rounded-lg border border-emerald-200 transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(exp.id, 'Rejected')}
                            className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-medium text-xs rounded-lg border border-rose-200 transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      ) : exp.status === 'Approved' && isManagerOrAdmin ? (
                        <button
                          onClick={() => handleUpdateStatus(exp.id, 'Reimbursed')}
                          className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium text-xs rounded-lg border border-indigo-200 transition-colors"
                        >
                          Mark Reimbursed
                        </button>
                      ) : (
                        <span className="text-slate-400 text-xs">{exp.status}</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Claim Expense Modal */}
      <Modal isOpen={isSubmitModalOpen} onClose={() => setIsSubmitModalOpen(false)} title="Submit Expense Claim">
        <form onSubmit={handleSubmitExpense} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Expense Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Amount (INR ₹)</label>
              <input
                type="number"
                min={1}
                step={50}
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Merchant / Vendor</label>
              <input
                type="text"
                placeholder="e.g. Uber India, AWS, Hotel Marriott"
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Expense Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description / Business Purpose</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="State the business rationale or project code..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Receipt Attachment</label>
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:bg-slate-50 transition-colors">
              <UploadCloud className="w-6 h-6 text-slate-400 mx-auto mb-1" />
              <div className="text-xs text-slate-600 font-medium">
                {receiptFileName ? receiptFileName : 'Attach digital receipt (PDF, PNG, JPG)'}
              </div>
              <input
                type="file"
                className="hidden"
                id="receipt-file-input"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setReceiptFileName(e.target.files[0].name);
                  }
                }}
              />
              <label
                htmlFor="receipt-file-input"
                className="inline-block mt-2 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg cursor-pointer transition-colors"
              >
                Browse File
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsSubmitModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-md transition-all active:scale-95"
            >
              Submit Claim
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
