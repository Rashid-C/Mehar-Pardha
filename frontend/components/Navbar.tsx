'use client'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const pathname = usePathname()

  const links = [
    { href: '/', label: 'Dashboard' },
    { href: '/add', label: 'New Invoice' },
    { href: '/tailors', label: 'Tailors' },
    { href: '/report', label: 'Reports' },
  ]

  return (
    <nav style={{ background: 'linear-gradient(135deg, #0a0a0f 0%, #111118 50%, #0d0d14 100%)', borderBottom: '1px solid rgba(212,175,55,0.2)' }} className="sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-8 py-0 flex items-center justify-between h-16">
        {/* Logo */}
        <a href="/" style={{ textDecoration: 'none' }} className="flex items-center gap-4">
          <div style={{ border: '1px solid rgba(212,175,55,0.4)', borderRadius: '50%', padding: '2px', background: 'rgba(212,175,55,0.05)' }}>
            <Image
              src="/logo.png"
              alt="Mehar Collective"
              width={42}
              height={42}
              className="rounded-full object-contain"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 style={{ color: '#D4AF37', fontWeight: 700, fontSize: '17px', letterSpacing: '0.5px' }}>
                MEHAR PARDHA
              </h1>
              <span style={{ background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)', color: '#D4AF37', fontSize: '9px', padding: '1px 6px', borderRadius: '4px', letterSpacing: '1px' }}>
                DUBAI
              </span>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px', letterSpacing: '1.5px' }}>
              TAILOR MANAGEMENT SYSTEM
            </p>
          </div>
        </a>

        {/* Links */}
        <div className="flex items-center gap-1">
          {links.map(link => (
            <a
              key={link.href}
              href={link.href}
              style={pathname === link.href ? {
                background: 'linear-gradient(135deg, #D4AF37, #B8962E)',
                color: '#0a0a0f',
                fontWeight: 700,
                fontSize: '12px',
                padding: '7px 18px',
                borderRadius: '6px',
                letterSpacing: '0.5px',
              } : {
                color: 'rgba(255,255,255,0.5)',
                fontSize: '12px',
                padding: '7px 18px',
                borderRadius: '6px',
                letterSpacing: '0.5px',
                fontWeight: 500,
              }}
              onMouseEnter={e => {
                if (pathname !== link.href) {
                  (e.target as HTMLElement).style.color = '#D4AF37'
                  ;(e.target as HTMLElement).style.background = 'rgba(212,175,55,0.08)'
                }
              }}
              onMouseLeave={e => {
                if (pathname !== link.href) {
                  (e.target as HTMLElement).style.color = 'rgba(255,255,255,0.5)'
                  ;(e.target as HTMLElement).style.background = 'transparent'
                }
              }}
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  )
}