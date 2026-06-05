'use client'

import { getInvoices, getSummary, getTailors, Invoice, Tailor } from '@/lib/api'
import { useEffect, useState } from 'react'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export default function Report() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [tailors, setTailors] = useState<Tailor[]>([])
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedTailor, setSelectedTailor] = useState('')
  const [loading, setLoading] = useState(true)
  const [totalPieces, setTotalPieces] = useState(0)
  const [totalAmount, setTotalAmount] = useState(0)

  const fetchReport = async () => {
    setLoading(true)
    try {
      const params: Record<string, string | number> = { month: selectedMonth }
      if (selectedTailor) params.tailor = selectedTailor
      const [invRes, sumRes, tailorRes] = await Promise.all([
        getInvoices(params),
        getSummary(params),
        getTailors(),
      ])
      setInvoices(invRes.data)
      setTotalPieces(sumRes.data.total_pieces)
      setTotalAmount(sumRes.data.total_amount)
      setTailors(tailorRes.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReport()
  }, [selectedMonth, selectedTailor])

  return (
    <main className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center gap-4">
          <a href="/" className="text-gray-400 hover:text-white text-sm">← Back</a>
          <h1 className="text-2xl font-bold">Monthly Report</h1>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-8">
          <select
            className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white text-sm"
            value={selectedMonth}
            onChange={e => setSelectedMonth(parseInt(e.target.value))}
          >
            {MONTHS.map((m, i) => (
              <option key={i} value={i + 1}>{m}</option>
            ))}
          </select>
          <select
            className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white text-sm"
            value={selectedTailor}
            onChange={e => setSelectedTailor(e.target.value)}
          >
            <option value="">All Tailors</option>
            {tailors.map(t => (
              <option key={t.id} value={t.code}>{t.code} - {t.name}</option>
            ))}
          </select>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <p className="text-gray-400 text-xs uppercase tracking-wider">Month</p>
            <p className="text-xl font-bold text-white mt-1">{MONTHS[selectedMonth - 1]}</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <p className="text-gray-400 text-xs uppercase tracking-wider">Total Pieces</p>
            <p className="text-xl font-bold text-blue-400 mt-1">{totalPieces}</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <p className="text-gray-400 text-xs uppercase tracking-wider">Total Amount</p>
            <p className="text-xl font-bold text-green-400 mt-1">AED {totalAmount}</p>
          </div>
        </div>

        {/* Invoice Table */}
        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : (
          <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 border-b border-gray-800 bg-gray-900">
                  <th className="text-left py-3 px-4">INV NO</th>
                  <th className="text-left py-3 px-4">TAILOR</th>
                  <th className="text-left py-3 px-4">MD NO</th>
                  <th className="text-left py-3 px-4">DATE</th>
                  <th className="text-left py-3 px-4">PC</th>
                  <th className="text-left py-3 px-4">RATE</th>
                  <th className="text-left py-3 px-4">AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map(inv => (
                  <tr key={inv.id} className="border-b border-gray-800 hover:bg-gray-800">
                    <td className="py-3 px-4 font-mono text-blue-400">{inv.inv_no}</td>
                    <td className="py-3 px-4">
                      <span className="bg-gray-700 px-2 py-1 rounded text-xs font-bold">{inv.tailor_code}</span>
                    </td>
                    <td className="py-3 px-4 text-gray-300">{inv.md_no}</td>
                    <td className="py-3 px-4 text-gray-300">{inv.rcv_date}</td>
                    <td className="py-3 px-4 text-gray-300">{inv.pc_count}</td>
                    <td className="py-3 px-4 text-gray-300">{inv.rate}</td>
                    <td className="py-3 px-4 font-bold text-green-400">AED {inv.amount}</td>
                  </tr>
                ))}
              </tbody>
              {/* Total Row */}
              {invoices.length > 0 && (
                <tfoot>
                  <tr className="bg-gray-800 font-bold">
                    <td colSpan={4} className="py-3 px-4 text-gray-400">TOTAL</td>
                    <td className="py-3 px-4 text-blue-400">{totalPieces}</td>
                    <td className="py-3 px-4"></td>
                    <td className="py-3 px-4 text-green-400">AED {totalAmount}</td>
                  </tr>
                </tfoot>
              )}
            </table>
            {invoices.length === 0 && (
              <p className="text-gray-500 text-center py-10">No invoices for this month</p>
            )}
          </div>
        )}
      </div>
    </main>
  )
}