import { NavLink } from 'react-router-dom';

const NAV_LINKS = [
  { to: '/',            label: 'Dashboard'   },
  { to: '/particulars', label: 'Particulars' },
  { to: '/new',         label: '+ New Quote' },
  { to: '/settings',    label: '⚙ Settings'  },
];

export default function Navbar() {
  return (
    <nav style={styles.nav}>
      <div style={styles.brand}>
        <span style={styles.brandIcon}>◈</span>
        <span style={styles.brandName}>QuoteFlow</span>
      </div>
      <div style={styles.links}>
        {NAV_LINKS.map(({ to, label }) => (
          <NavLink key={to} to={to} end={to === '/'}
            style={({ isActive }) => ({ ...styles.link, ...(isActive ? styles.linkActive : {}) })}>
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

const styles = {
  nav: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2rem', height: '60px', background: '#1a1a1a', boxShadow: '0 2px 12px rgba(0,0,0,0.15)', position: 'sticky', top: 0, zIndex: 100 },
  brand: { display: 'flex', alignItems: 'center', gap: '10px' },
  brandIcon: { fontSize: '1.4rem', color: '#c9a84c' },
  brandName: { fontFamily: "'DM Serif Display', serif", fontSize: '1.3rem', color: '#f4f1eb', letterSpacing: '0.02em' },
  links: { display: 'flex', gap: '0.5rem', alignItems: 'center' },
  link: { padding: '6px 16px', borderRadius: '6px', color: '#b0a99a', textDecoration: 'none', fontSize: '0.88rem', fontWeight: 500, transition: 'all 0.2s', letterSpacing: '0.02em' },
  linkActive: { color: '#f4f1eb', background: '#2e2e2e' },
};
