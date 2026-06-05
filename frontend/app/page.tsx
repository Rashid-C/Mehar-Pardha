'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getInvoices, getTailors, getSummary, Invoice, Tailor, Summary } from '@/lib/api'

export default function Home() {
  const router = useRouter()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [tailors, setTailors] = useState<Tailor[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)
  const [filterTailor, setFilterTailor] = useState('')

  const fetchData = async () => {
    setLoading(true)
    try {
      const params = filterTailor ? { tailor: filterTailor } : {}
      const [invRes, tailorRes, sumRes] = await Promise.all([
        getInvoices(params),
        getTailors(),
        getSummary(params),
      ])
      setInvoices(invRes.data)
      setTailors(tailorRes.data)
      setSummary(sumRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [filterTailor])

  return (
    <main style={{ background: '#08080f', minHeight: '100vh', padding: '32px' }}>

      {/* Page Title */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div style={{ width: '3px', height: '22px', background: 'linear-gradient(180deg, #D4AF37, #8B6914)', borderRadius: '2px' }} />
          <h2 style={{ color: '#ffffff', fontSize: '20px', fontWeight: 600, letterSpacing: '0.3px' }}>Dashboard</h2>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', marginLeft: '15px', letterSpacing: '1px' }}>
          INVOICE OVERVIEW — ALL RECORDS
        </p>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-3 gap-5 mb-10">
          {/* Card 1 */}
          <div style={{ background: 'linear-gradient(135deg, #111118, #0d0d18)', border: '1px solid rgba(212,175,55,0.15)', borderRadius: '14px', padding: '24px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, right: 0, width: '80px', height: '80px', background: 'radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 70%)', borderRadius: '0 14px 0 80px' }} />
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px', letterSpacing: '2px', marginBottom: '12px' }}>TOTAL INVOICES</p>
            <p style={{ color: '#ffffff', fontSize: '36px', fontWeight: 700, lineHeight: 1 }}>{summary.total_invoices}</p>
            <div style={{ marginTop: '16px', height: '1px', background: 'linear-gradient(90deg, rgba(212,175,55,0.3), transparent)' }} />
          </div>
          {/* Card 2 */}
          <div style={{ background: 'linear-gradient(135deg, #111118, #0d0d18)', border: '1px solid rgba(212,175,55,0.15)', borderRadius: '14px', padding: '24px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, right: 0, width: '80px', height: '80px', background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)', borderRadius: '0 14px 0 80px' }} />
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px', letterSpacing: '2px', marginBottom: '12px' }}>TOTAL PIECES</p>
            <p style={{ color: '#60a5fa', fontSize: '36px', fontWeight: 700, lineHeight: 1 }}>{summary.total_pieces}</p>
            <div style={{ marginTop: '16px', height: '1px', background: 'linear-gradient(90deg, rgba(59,130,246,0.3), transparent)' }} />
          </div>
          {/* Card 3 */}
          <div style={{ background: 'linear-gradient(135deg, #111118, #0d0d18)', border: '1px solid rgba(212,175,55,0.25)', borderRadius: '14px', padding: '24px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, right: 0, width: '80px', height: '80px', background: 'radial-gradient(circle, rgba(212,175,55,0.12) 0%, transparent 70%)', borderRadius: '0 14px 0 80px' }} />
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px', letterSpacing: '2px', marginBottom: '12px' }}>TOTAL AMOUNT</p>
            <p style={{ color: '#D4AF37', fontSize: '36px', fontWeight: 700, lineHeight: 1 }}>AED {summary.total_amount}</p>
            <div style={{ marginTop: '16px', height: '1px', background: 'linear-gradient(90deg, rgba(212,175,55,0.4), transparent)' }} />
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <select
          value={filterTailor}
          onChange={e => setFilterTailor(e.target.value)}
          style={{ background: '#111118', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '8px', padding: '10px 16px', color: 'rgba(255,255,255,0.7)', fontSize: '13px', outline: 'none', cursor: 'pointer' }}
        >
          <option value="">All Tailors</option>
          {tailors.map(t => (
            <option key={t.id} value={t.code}>{t.code} — {t.name}</option>
          ))}
        </select>

        <a
          href="/add"
          style={{ background: 'linear-gradient(135deg, #D4AF37, #B8962E)', color: '#0a0a0f', padding: '10px 22px', borderRadius: '8px', fontSize: '13px', fontWeight: 700, letterSpacing: '0.3px', textDecoration: 'none', whiteSpace: 'nowrap' }}
        >
          + New Invoice
        </a>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'rgba(255,255,255,0.3)', fontSize: '13px', letterSpacing: '1px' }}>
          LOADING RECORDS...
        </div>
      ) : (
        <div style={{ border: '1px solid rgba(212,175,55,0.12)', borderRadius: '14px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: 'linear-gradient(135deg, #0f0f1a, #111120)', borderBottom: '1px solid rgba(212,175,55,0.15)' }}>
                {['INV NO', 'TAILOR', 'MD NO', 'DATE', 'PC', 'RATE', 'AMOUNT', 'REMARKS'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '14px 16px', color: 'rgba(212,175,55,0.6)', fontSize: '10px', letterSpacing: '1.5px', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv, idx) => (
                <tr
                  key={inv.id}
                  onClick={() => router.push(`/invoice/${inv.id}`)}
                  style={{ background: idx % 2 === 0 ? '#08080f' : '#0a0a12', borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer', transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(212,175,55,0.05)')}
                  onMouseLeave={e => (e.currentTarget.style.background = idx % 2 === 0 ? '#08080f' : '#0a0a12')}
                >
                  <td style={{ padding: '13px 16px', color: '#D4AF37', fontFamily: 'monospace', fontWeight: 600 }}>{inv.inv_no}</td>
                  <td style={{ padding: '13px 16px' }}>
                    <span style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.25)', color: '#D4AF37', padding: '3px 8px', borderRadius: '5px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px' }}>
                      {inv.tailor_code}
                    </span>
                  </td>
                  <td style={{ padding: '13px 16px', color: 'rgba(255,255,255,0.6)' }}>{inv.md_no}</td>
                  <td style={{ padding: '13px 16px', color: 'rgba(255,255,255,0.6)' }}>{inv.rcv_date}</td>
                  <td style={{ padding: '13px 16px', color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>{inv.pc_count}</td>
                  <td style={{ padding: '13px 16px', color: 'rgba(255,255,255,0.6)' }}>{inv.rate}</td>
                  <td style={{ padding: '13px 16px', color: '#4ade80', fontWeight: 700 }}>AED {inv.amount}</td>
                  <td style={{ padding: '13px 16px', color: 'rgba(255,255,255,0.35)', fontSize: '12px' }}>{inv.remarks || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {invoices.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px', color: 'rgba(255,255,255,0.2)', fontSize: '13px', letterSpacing: '1px' }}>
              NO RECORDS FOUND
            </div>
          )}
        </div>
      )}
    </main>
  )
}