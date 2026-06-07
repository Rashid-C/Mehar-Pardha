'use client'
import { useEffect, useState } from 'react'
import { getStitchings, createStitching, deleteStitching, getTailors, getStitchingSummary, lookupRateSheet, ShopStitching, Tailor } from '@/lib/api'

const EMPTY = {
  md_no: '', tailor: '', date: '', pc_count: '', rate: '',
  cloth: '', mtr: '', inv_no: '', remarks: '',
}

export default function StitchingPage() {
  const [records, setRecords] = useState<ShopStitching[]>([])
  const [tailors, setTailors] = useState<Tailor[]>([])
  const [summary, setSummary] = useState({ total_pieces: 0, total_amount: 0, total_records: 0 })
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1)
  const [filterTailor, setFilterTailor] = useState('')

  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

  const fetchData = async () => {
    const params: Record<string, string | number> = { month: filterMonth }
    if (filterTailor) params.tailor = filterTailor
    const [recRes, sumRes, tailorRes] = await Promise.all([
      getStitchings(params),
      getStitchingSummary(params),
      getTailors(),
    ])
    setRecords(recRes.data)
    setSummary(sumRes.data)
    setTailors(tailorRes.data)
  }

  useEffect(() => { fetchData() }, [filterMonth, filterTailor])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleMdNoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setForm(prev => ({ ...prev, md_no: value, tailor: '', rate: '', inv_no: '' }))
    if (value.length >= 2) {
      try {
        const res = await lookupRateSheet(value)
        if (res.data) {
          setForm(prev => ({
            ...prev,
            md_no: value,
            tailor: String(res.data.tailor_id),
            rate: String(res.data.rate),
            inv_no: res.data.inv_no || '',
          }))
        }
      } catch { }
    }
  }
  const handleSubmit = async () => {
    setError('')
    setSuccess('')
    if (!form.md_no || !form.tailor || !form.date || !form.pc_count || !form.rate) {
      setError('MD No, Tailor, Date, Pieces and Rate are required')
      return
    }
    setLoading(true)
    try {
      await createStitching({
        md_no: form.md_no,
        tailor: parseInt(form.tailor),
        date: form.date,
        pc_count: parseInt(form.pc_count),
        rate: parseFloat(form.rate),
        cloth: form.cloth,
        mtr: form.mtr ? parseFloat(form.mtr) : null,
        inv_no: form.inv_no,
        remarks: form.remarks,
      })
      setSuccess(`Stitching record added for MD ${form.md_no}`)
      setForm(EMPTY)
      fetchData()
    } catch (err: unknown) {
      const e = err as { response?: { data?: unknown } }
      setError(e.response?.data ? JSON.stringify(e.response.data) : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this stitching record?')) return
    await deleteStitching(id)
    fetchData()
  }

  const autoTotal = form.pc_count && form.rate
    ? (parseFloat(form.pc_count) * parseFloat(form.rate)).toFixed(2)
    : null

  const inputStyle = {
    width: '100%', background: '#08080f',
    border: '1px solid rgba(212,175,55,0.2)', borderRadius: '8px',
    padding: '10px 14px', color: '#ffffff', fontSize: '13px',
    outline: 'none', boxSizing: 'border-box' as const,
  }

  const labelStyle = {
    color: 'rgba(255,255,255,0.4)', fontSize: '10px',
    letterSpacing: '1.5px', display: 'block', marginBottom: '6px', fontWeight: 600,
  }

  return (
    <main style={{ background: '#08080f', minHeight: '100vh', padding: '32px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        {/* Title */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
            <div style={{ width: '3px', height: '22px', background: 'linear-gradient(180deg, #D4AF37, #8B6914)', borderRadius: '2px' }} />
            <h2 style={{ color: '#ffffff', fontSize: '20px', fontWeight: 600 }}>Shop Stitching</h2>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', marginLeft: '15px', letterSpacing: '1px' }}>
            DAILY STITCHING WORK LOG — MD NUMBER AUTO-FILLS TAILOR AND RATE
          </p>
        </div>

        {/* Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '28px' }}>
          {[
            { label: 'TOTAL RECORDS', value: summary.total_records, color: '#ffffff' },
            { label: 'TOTAL PIECES', value: summary.total_pieces, color: '#60a5fa' },
            { label: 'TOTAL AMOUNT', value: `AED ${summary.total_amount}`, color: '#D4AF37' },
          ].map(c => (
            <div key={c.label} style={{ background: '#111118', border: '1px solid rgba(212,175,55,0.12)', borderRadius: '12px', padding: '20px' }}>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px', letterSpacing: '2px', marginBottom: '8px' }}>{c.label}</p>
              <p style={{ color: c.color, fontSize: '24px', fontWeight: 700 }}>{c.value}</p>
            </div>
          ))}
        </div>

        {/* Add Form */}
        <div style={{ background: 'linear-gradient(135deg, #111118, #0d0d16)', border: '1px solid rgba(212,175,55,0.15)', borderRadius: '16px', overflow: 'hidden', marginBottom: '28px' }}>
          <div style={{ background: 'rgba(212,175,55,0.04)', borderBottom: '1px solid rgba(212,175,55,0.1)', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '8px', height: '8px', background: '#D4AF37', borderRadius: '50%' }} />
            <span style={{ color: 'rgba(212,175,55,0.8)', fontSize: '11px', letterSpacing: '2px', fontWeight: 600 }}>ADD STITCHING RECORD</span>
          </div>

          <div style={{ padding: '24px' }}>
            {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px', color: '#f87171', fontSize: '13px' }}>{error}</div>}
            {success && <div style={{ background: 'rgba(39,174,96,0.1)', border: '1px solid rgba(39,174,96,0.3)', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px', color: '#4ade80', fontSize: '13px' }}>{success}</div>}

            {/* Row 1 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '14px', marginBottom: '14px' }}>
              <div>
                <label style={labelStyle}>MD NO *</label>
                <input name="md_no" value={form.md_no} onChange={handleMdNoChange}
                  placeholder="787" style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = 'rgba(212,175,55,0.6)')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(212,175,55,0.2)')} />
              </div>
              <div>
                <label style={labelStyle}>TAILOR *</label>
                <select name="tailor" value={form.tailor} onChange={handleChange}
                  style={{ ...inputStyle, cursor: 'pointer' }}
                  onFocus={e => (e.target.style.borderColor = 'rgba(212,175,55,0.6)')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(212,175,55,0.2)')}>
                  <option value="">Select</option>
                  {tailors.map(t => <option key={t.id} value={t.id}>{t.code} — {t.name}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>DATE *</label>
                <input name="date" value={form.date} onChange={handleChange}
                  type="date" style={{ ...inputStyle, colorScheme: 'dark' }}
                  onFocus={e => (e.target.style.borderColor = 'rgba(212,175,55,0.6)')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(212,175,55,0.2)')} />
              </div>
              <div>
                <label style={labelStyle}>INV NO</label>
                <input name="inv_no" value={form.inv_no} onChange={handleChange}
                  placeholder="1165" style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = 'rgba(212,175,55,0.6)')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(212,175,55,0.2)')} />
              </div>
            </div>

            {/* Row 2 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '14px', marginBottom: '14px' }}>
              <div>
                <label style={labelStyle}>PIECES *</label>
                <input name="pc_count" value={form.pc_count} onChange={handleChange}
                  type="number" placeholder="12" style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = 'rgba(212,175,55,0.6)')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(212,175,55,0.2)')} />
              </div>
              <div>
                <label style={labelStyle}>RATE (AED) *</label>
                <input name="rate" value={form.rate} onChange={handleChange}
                  type="number" placeholder="30" style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = 'rgba(212,175,55,0.6)')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(212,175,55,0.2)')} />
              </div>
              <div>
                <label style={labelStyle}>CLOTH</label>
                <input name="cloth" value={form.cloth} onChange={handleChange}
                  placeholder="Cotton, Silk..." style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = 'rgba(212,175,55,0.6)')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(212,175,55,0.2)')} />
              </div>
              <div>
                <label style={labelStyle}>MTR (CLOTH METERS)</label>
                <input name="mtr" value={form.mtr} onChange={handleChange}
                  type="number" placeholder="1.5" style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = 'rgba(212,175,55,0.6)')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(212,175,55,0.2)')} />
              </div>
            </div>

            {/* Auto Total */}
            {autoTotal && (
              <div style={{ background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '10px', padding: '14px 18px', marginBottom: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', letterSpacing: '1.5px', marginBottom: '4px' }}>CALCULATED TOTAL</p>
                  <p style={{ color: '#D4AF37', fontSize: '22px', fontWeight: 700 }}>AED {autoTotal}</p>
                </div>
                <span style={{ color: '#D4AF37', fontSize: '20px' }}>✓</span>
              </div>
            )}

            {/* Remarks */}
            <div style={{ marginBottom: '18px' }}>
              <label style={labelStyle}>REMARKS</label>
              <input name="remarks" value={form.remarks} onChange={handleChange}
                placeholder="Optional notes..." style={inputStyle}
                onFocus={e => (e.target.style.borderColor = 'rgba(212,175,55,0.6)')}
                onBlur={e => (e.target.style.borderColor = 'rgba(212,175,55,0.2)')} />
            </div>

            <button onClick={handleSubmit} disabled={loading}
              style={{ background: loading ? 'rgba(212,175,55,0.2)' : 'linear-gradient(135deg, #D4AF37, #B8962E)', color: loading ? 'rgba(255,255,255,0.4)' : '#0a0a0f', padding: '12px 28px', borderRadius: '8px', fontSize: '13px', fontWeight: 700, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', letterSpacing: '0.5px' }}>
              {loading ? 'SAVING...' : '+ ADD RECORD'}
            </button>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <select value={filterMonth} onChange={e => setFilterMonth(parseInt(e.target.value))}
            style={{ background: '#111118', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '8px', padding: '10px 16px', color: 'rgba(255,255,255,0.7)', fontSize: '13px', outline: 'none' }}>
            {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
          <select value={filterTailor} onChange={e => setFilterTailor(e.target.value)}
            style={{ background: '#111118', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '8px', padding: '10px 16px', color: 'rgba(255,255,255,0.7)', fontSize: '13px', outline: 'none' }}>
            <option value="">All Tailors</option>
            {tailors.map(t => <option key={t.id} value={t.code}>{t.code} — {t.name}</option>)}
          </select>
        </div>

        {/* Records Table */}
        <div style={{ border: '1px solid rgba(212,175,55,0.12)', borderRadius: '14px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: 'linear-gradient(135deg, #0f0f1a, #111120)', borderBottom: '1px solid rgba(212,175,55,0.15)' }}>
                {['DATE', 'MD NO', 'TAILOR', 'PC', 'RATE', 'TOTAL', 'CLOTH', 'MTR', 'INV NO', 'REMARKS', ''].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '13px 14px', color: 'rgba(212,175,55,0.6)', fontSize: '10px', letterSpacing: '1.5px', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.map((r, idx) => (
                <tr key={r.id}
                  style={{ background: idx % 2 === 0 ? '#08080f' : '#0a0a12', borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(212,175,55,0.04)')}
                  onMouseLeave={e => (e.currentTarget.style.background = idx % 2 === 0 ? '#08080f' : '#0a0a12')}>
                  <td style={{ padding: '11px 14px', color: 'rgba(255,255,255,0.6)' }}>{r.date}</td>
                  <td style={{ padding: '11px 14px', color: '#D4AF37', fontWeight: 700, fontFamily: 'monospace' }}>{r.md_no}</td>
                  <td style={{ padding: '11px 14px' }}>
                    <span style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.25)', color: '#D4AF37', padding: '3px 8px', borderRadius: '5px', fontSize: '11px', fontWeight: 700 }}>
                      {r.tailor_code}
                    </span>
                  </td>
                  <td style={{ padding: '11px 14px', color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>{r.pc_count}</td>
                  <td style={{ padding: '11px 14px', color: 'rgba(255,255,255,0.6)' }}>{r.rate}</td>
                  <td style={{ padding: '11px 14px', color: '#4ade80', fontWeight: 700 }}>AED {r.total}</td>
                  <td style={{ padding: '11px 14px', color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>{r.cloth || '—'}</td>
                  <td style={{ padding: '11px 14px', color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>{r.mtr || '—'}</td>
                  <td style={{ padding: '11px 14px', color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace', fontSize: '12px' }}>{r.inv_no || '—'}</td>
                  <td style={{ padding: '11px 14px', color: 'rgba(255,255,255,0.35)', fontSize: '12px' }}>{r.remarks || '—'}</td>
                  <td style={{ padding: '11px 14px' }}>
                    <button onClick={() => handleDelete(r.id)}
                      style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>
                      Del
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            {records.length > 0 && (
              <tfoot>
                <tr style={{ background: 'rgba(212,175,55,0.06)', borderTop: '1px solid rgba(212,175,55,0.2)' }}>
                  <td colSpan={3} style={{ padding: '13px 14px', color: 'rgba(212,175,55,0.6)', fontSize: '10px', letterSpacing: '1.5px', fontWeight: 600 }}>TOTAL</td>
                  <td style={{ padding: '13px 14px', color: '#60a5fa', fontWeight: 700 }}>{summary.total_pieces}</td>
                  <td style={{ padding: '13px 14px' }}></td>
                  <td style={{ padding: '13px 14px', color: '#D4AF37', fontWeight: 700 }}>AED {summary.total_amount}</td>
                  <td colSpan={5}></td>
                </tr>
              </tfoot>
            )}
          </table>
          {records.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px', color: 'rgba(255,255,255,0.2)', fontSize: '13px', letterSpacing: '1px' }}>
              NO STITCHING RECORDS FOR THIS PERIOD
            </div>
          )}
        </div>
      </div>
    </main>
  )
}