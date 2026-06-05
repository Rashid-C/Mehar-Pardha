'use client'
import { useEffect, useState } from 'react'
import { getInvoices, getSummary, getTailors, Invoice, Tailor } from '@/lib/api'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

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

    const downloadPDF = () => {
        const doc = new jsPDF()
        const pageWidth = doc.internal.pageSize.getWidth()

        doc.setFillColor(212, 175, 55)
        doc.rect(0, 0, pageWidth, 28, 'F')
        doc.setTextColor(10, 10, 15)
        doc.setFontSize(16)
        doc.setFont('helvetica', 'bold')
        doc.text('MEHAR PARDHA', pageWidth / 2, 12, { align: 'center' })
        doc.setFontSize(8)
        doc.setFont('helvetica', 'normal')
        doc.text('TAILOR MANAGEMENT SYSTEM — DEIRA, DUBAI', pageWidth / 2, 21, { align: 'center' })

        doc.setTextColor(212, 175, 55)
        doc.setFontSize(13)
        doc.setFont('helvetica', 'bold')
        doc.text(`MONTHLY REPORT — ${MONTHS[selectedMonth - 1].toUpperCase()} 2026`, pageWidth / 2, 38, { align: 'center' })

        if (selectedTailor) {
            doc.setTextColor(150, 150, 150)
            doc.setFontSize(9)
            doc.setFont('helvetica', 'normal')
            doc.text(`Tailor: ${selectedTailor}`, pageWidth / 2, 46, { align: 'center' })
        }

        const boxY = 52, boxH = 16, boxW = 55, gap = 8
        const startX = (pageWidth - (boxW * 3 + gap * 2)) / 2
        doc.setDrawColor(212, 175, 55)
        doc.setLineWidth(0.3)

        const boxes = [
            { label: 'TOTAL INVOICES', value: String(invoices.length), color: [255, 255, 255] },
            { label: 'TOTAL PIECES', value: String(totalPieces), color: [96, 165, 250] },
            { label: 'TOTAL AMOUNT', value: `AED ${totalAmount}`, color: [212, 175, 55] },
        ]
        boxes.forEach((box, i) => {
            const x = startX + i * (boxW + gap)
            doc.setFillColor(20, 20, 30)
            doc.roundedRect(x, boxY, boxW, boxH, 2, 2, 'FD')
            doc.setTextColor(150, 150, 150)
            doc.setFontSize(7)
            doc.setFont('helvetica', 'normal')
            doc.text(box.label, x + boxW / 2, boxY + 5, { align: 'center' })
            doc.setTextColor(box.color[0], box.color[1], box.color[2])
            doc.setFontSize(10)
            doc.setFont('helvetica', 'bold')
            doc.text(box.value, x + boxW / 2, boxY + 13, { align: 'center' })
        })

        autoTable(doc, {
            startY: 76,
            head: [['INV NO', 'TAILOR', 'MD NO', 'DATE', 'PC', 'RATE', 'AMOUNT', 'REMARKS']],
            body: invoices.map(inv => [
                inv.inv_no, inv.tailor_code, inv.md_no, inv.rcv_date,
                inv.pc_count, inv.rate, `AED ${inv.amount}`, inv.remarks || '—',
            ]),
            foot: [['TOTAL', '', '', '', totalPieces, '', `AED ${totalAmount}`, '']],
            headStyles: { fillColor: [212, 175, 55], textColor: [10, 10, 15], fontStyle: 'bold', fontSize: 8 },
            bodyStyles: { fillColor: [15, 15, 22], textColor: [200, 200, 200], fontSize: 8 },
            alternateRowStyles: { fillColor: [20, 20, 32] },
            footStyles: { fillColor: [30, 25, 10], textColor: [212, 175, 55], fontStyle: 'bold', fontSize: 9 },
            styles: { lineColor: [40, 40, 60], lineWidth: 0.2 },
        })

        const finalY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10
        doc.setTextColor(80, 80, 80)
        doc.setFontSize(7)
        doc.text(`Generated ${new Date().toLocaleDateString('en-AE')} — Mehar Pardha Tailor Management`, pageWidth / 2, finalY, { align: 'center' })
        doc.save(`Mehar-Pardha-${MONTHS[selectedMonth - 1]}-2026.pdf`)
    }

    const downloadInvoicePDF = (inv: Invoice) => {
        const doc = new jsPDF()
        const pageWidth = doc.internal.pageSize.getWidth()

        // Gold header
        doc.setFillColor(212, 175, 55)
        doc.rect(0, 0, pageWidth, 28, 'F')
        doc.setTextColor(10, 10, 15)
        doc.setFontSize(16)
        doc.setFont('helvetica', 'bold')
        doc.text('MEHAR PARDHA', pageWidth / 2, 12, { align: 'center' })
        doc.setFontSize(8)
        doc.setFont('helvetica', 'normal')
        doc.text('TAILOR MANAGEMENT SYSTEM — DEIRA, DUBAI', pageWidth / 2, 21, { align: 'center' })

        // Invoice title
        doc.setTextColor(212, 175, 55)
        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        doc.text(`INVOICE #${inv.inv_no}`, pageWidth / 2, 40, { align: 'center' })

        // Divider
        doc.setDrawColor(212, 175, 55)
        doc.setLineWidth(0.3)
        doc.line(14, 45, pageWidth - 14, 45)

        // Invoice details
        const details = [
            ['Tailor Code', inv.tailor_code],
            ['Tailor Name', inv.tailor_name],
            ['MD Number', inv.md_no],
            ['Receive Date', inv.rcv_date],
            ['Pieces', String(inv.pc_count)],
            ['Rate (AED)', String(inv.rate)],
            ['Remarks', inv.remarks || '—'],
        ]

        let y = 58
        details.forEach(([label, value]) => {
            doc.setTextColor(100, 100, 100)
            doc.setFontSize(9)
            doc.setFont('helvetica', 'normal')
            doc.text(label, 20, y)

            doc.setTextColor(30, 30, 30)
            doc.setFontSize(9)
            doc.setFont('helvetica', 'bold')
            doc.text(value, 90, y)

            y += 10
        })


        // Amount box
        doc.setFillColor(245, 240, 220)
        doc.setDrawColor(212, 175, 55)
        doc.setLineWidth(0.5)
        doc.roundedRect(14, y + 5, pageWidth - 28, 24, 3, 3, 'FD')
        doc.setTextColor(150, 150, 150)
        doc.setFontSize(9)
        doc.setFont('helvetica', 'normal')
        doc.text('TOTAL AMOUNT', pageWidth / 2, y + 15, { align: 'center' })
        doc.setTextColor(212, 175, 55)
        doc.setFontSize(18)
        doc.setFont('helvetica', 'bold')
        doc.text(`AED ${inv.amount}`, pageWidth / 2, y + 25, { align: 'center' })

        // Footer
        doc.setTextColor(120, 120, 120)
        doc.setFontSize(7)
        doc.setFont('helvetica', 'normal')
        doc.text(
            `Generated ${new Date().toLocaleDateString('en-AE')} — Mehar Pardha Tailor Management`,
            pageWidth / 2, 270, { align: 'center' }
        )

        doc.save(`Invoice-${inv.inv_no}-${inv.tailor_code}.pdf`)
    }
    return (
        <main style={{ background: '#08080f', minHeight: '100vh', padding: '32px' }}>
            <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-1">
                        <div style={{ width: '3px', height: '22px', background: 'linear-gradient(180deg, #D4AF37, #8B6914)', borderRadius: '2px' }} />
                        <h2 style={{ color: '#ffffff', fontSize: '20px', fontWeight: 600 }}>Monthly Report</h2>
                    </div>
                    <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', marginLeft: '15px', letterSpacing: '1px' }}>
                        FILTER BY MONTH AND TAILOR — DOWNLOAD AS PDF
                    </p>
                </div>

                {/* Filters + Download */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px', flexWrap: 'wrap' }}>
                    <select
                        value={selectedMonth}
                        onChange={e => setSelectedMonth(parseInt(e.target.value))}
                        style={{ background: '#111118', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '8px', padding: '10px 16px', color: 'rgba(255,255,255,0.7)', fontSize: '13px', outline: 'none' }}
                    >
                        {MONTHS.map((m, i) => (
                            <option key={i} value={i + 1}>{m}</option>
                        ))}
                    </select>

                    <select
                        value={selectedTailor}
                        onChange={e => setSelectedTailor(e.target.value)}
                        style={{ background: '#111118', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '8px', padding: '10px 16px', color: 'rgba(255,255,255,0.7)', fontSize: '13px', outline: 'none' }}
                    >
                        <option value="">All Tailors</option>
                        {tailors.map(t => (
                            <option key={t.id} value={t.code}>{t.code} — {t.name}</option>
                        ))}
                    </select>

                    <button
                        onClick={downloadPDF}
                        disabled={invoices.length === 0}
                        style={{
                            background: invoices.length === 0 ? 'rgba(212,175,55,0.15)' : 'linear-gradient(135deg, #D4AF37, #B8962E)',
                            color: invoices.length === 0 ? 'rgba(255,255,255,0.3)' : '#0a0a0f',
                            padding: '10px 24px', borderRadius: '8px', fontSize: '13px',
                            fontWeight: 700, border: 'none', cursor: invoices.length === 0 ? 'not-allowed' : 'pointer',
                            letterSpacing: '0.5px'
                        }}
                    >
                        Download PDF
                    </button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-3 gap-5 mb-8">
                    <div style={{ background: '#111118', border: '1px solid rgba(212,175,55,0.15)', borderRadius: '12px', padding: '20px' }}>
                        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px', letterSpacing: '2px', marginBottom: '8px' }}>MONTH</p>
                        <p style={{ color: '#ffffff', fontSize: '22px', fontWeight: 700 }}>{MONTHS[selectedMonth - 1]}</p>
                    </div>
                    <div style={{ background: '#111118', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '12px', padding: '20px' }}>
                        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px', letterSpacing: '2px', marginBottom: '8px' }}>TOTAL PIECES</p>
                        <p style={{ color: '#60a5fa', fontSize: '22px', fontWeight: 700 }}>{totalPieces}</p>
                    </div>
                    <div style={{ background: '#111118', border: '1px solid rgba(212,175,55,0.25)', borderRadius: '12px', padding: '20px' }}>
                        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px', letterSpacing: '2px', marginBottom: '8px' }}>TOTAL AMOUNT</p>
                        <p style={{ color: '#D4AF37', fontSize: '22px', fontWeight: 700 }}>AED {totalAmount}</p>
                    </div>
                </div>

                {/* Table */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '60px', color: 'rgba(255,255,255,0.3)', fontSize: '13px', letterSpacing: '1px' }}>
                        LOADING...
                    </div>
                ) : (
                    <div style={{ border: '1px solid rgba(212,175,55,0.12)', borderRadius: '14px', overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                            <thead>
                                <tr style={{ background: 'linear-gradient(135deg, #0f0f1a, #111120)', borderBottom: '1px solid rgba(212,175,55,0.15)' }}>
                                    {['INV NO', 'TAILOR', 'MD NO', 'DATE', 'PC', 'RATE', 'AMOUNT', 'REMARKS', ''].map(h => (<th key={h} style={{ textAlign: 'left', padding: '14px 16px', color: 'rgba(212,175,55,0.6)', fontSize: '10px', letterSpacing: '1.5px', fontWeight: 600 }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {invoices.map((inv, idx) => (
                                    <tr key={inv.id}
                                        style={{ background: idx % 2 === 0 ? '#08080f' : '#0a0a12', borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(212,175,55,0.05)')}
                                        onMouseLeave={e => (e.currentTarget.style.background = idx % 2 === 0 ? '#08080f' : '#0a0a12')}
                                    ><td style={{ padding: '13px 16px', color: '#D4AF37', fontFamily: 'monospace', fontWeight: 600 }}>{inv.inv_no}</td>
                                        <td style={{ padding: '13px 16px' }}>
                                            <span style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.25)', color: '#D4AF37', padding: '3px 8px', borderRadius: '5px', fontSize: '11px', fontWeight: 700 }}>
                                                {inv.tailor_code}
                                            </span>
                                        </td>
                                        <td style={{ padding: '13px 16px', color: 'rgba(255,255,255,0.6)' }}>{inv.md_no}</td>
                                        <td style={{ padding: '13px 16px', color: 'rgba(255,255,255,0.6)' }}>{inv.rcv_date}</td>
                                        <td style={{ padding: '13px 16px', color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>{inv.pc_count}</td>
                                        <td style={{ padding: '13px 16px', color: 'rgba(255,255,255,0.6)' }}>{inv.rate}</td>
                                        <td style={{ padding: '13px 16px', color: '#4ade80', fontWeight: 700 }}>AED {inv.amount}</td>
                                        <td style={{ padding: '13px 16px', color: 'rgba(255,255,255,0.35)', fontSize: '12px' }}>{inv.remarks || '—'}</td>
                                        <td style={{ padding: '13px 16px' }}>
                                            <button
                                                onClick={e => { e.stopPropagation(); downloadInvoicePDF(inv) }}
                                                style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)', color: '#D4AF37', padding: '4px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', letterSpacing: '0.3px' }}
                                            >
                                                PDF
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            {invoices.length > 0 && (
                                <tfoot>
                                    <tr style={{ background: 'rgba(212,175,55,0.06)', borderTop: '1px solid rgba(212,175,55,0.2)' }}>
                                        <td colSpan={4} style={{ padding: '14px 16px', color: 'rgba(212,175,55,0.6)', fontSize: '10px', letterSpacing: '1.5px', fontWeight: 600 }}>TOTAL</td>
                                        <td style={{ padding: '14px 16px', color: '#60a5fa', fontWeight: 700 }}>{totalPieces}</td>
                                        <td style={{ padding: '14px 16px' }}></td>
                                        <td style={{ padding: '14px 16px', color: '#D4AF37', fontWeight: 700 }}>AED {totalAmount}</td>
                                        <td style={{ padding: '14px 16px' }}></td>
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                        {invoices.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '60px', color: 'rgba(255,255,255,0.2)', fontSize: '13px', letterSpacing: '1px' }}>
                                NO RECORDS FOR THIS MONTH
                            </div>
                        )}
                    </div>
                )}
            </div>
        </main>
    )
}