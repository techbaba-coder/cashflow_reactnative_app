import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getQuotations, deleteQuotation, getSettings } from '../db/storage';
import { formatCurrency, formatDate } from '../utils/calculations';
import { downloadQuotationExcel } from '../utils/excelExport';

export default function Dashboard() {
  const [quotations, setQuotations] = useState([]);
  const [downloading, setDownloading] = useState(null);
  const navigate = useNavigate();

  useEffect(() => { setQuotations(getQuotations()); }, []);

  function handleDelete(id) {
    if (!confirm('Delete this quotation? This cannot be undone.')) return;
    deleteQuotation(id);
    setQuotations(getQuotations());
  }

  function handleDownload(quotation) {
    setDownloading(quotation.id);
    try {
      const settings = getSettings();
      downloadQuotationExcel(quotation, settings);
    } catch (err) {
      alert('Failed to generate Excel: ' + err.message);
    }
    setTimeout(() => setDownloading(null), 1500);
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Dashboard</h1>
          <p style={styles.subtitle}>
            {quotations.length} quotation{quotations.length !== 1 ? 's' : ''} saved
          </p>
        </div>
        <div style={styles.headerActions}>
          <button style={styles.settingsBtn} onClick={() => navigate('/settings')}>
            ⚙ Settings
          </button>
          <button style={styles.newBtn} onClick={() => navigate('/new')}>
            + New Quotation
          </button>
        </div>
      </div>

      {quotations.length === 0 ? (
        <div style={styles.empty}>
          <div style={styles.emptyIcon}>◈</div>
          <h2 style={styles.emptyTitle}>No quotations yet</h2>
          <p style={styles.emptyText}>Create your first quotation to see it here.</p>
          <button style={styles.newBtn} onClick={() => navigate('/new')}>
            Create Quotation
          </button>
        </div>
      ) : (
        <div style={styles.grid}>
          {quotations.map((q) => (
            <div key={q.id} style={styles.card}>
              <div style={styles.cardTop}>
                <div style={styles.clientInitial}>
                  {q.clientName?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div style={styles.cardMeta}>
                  <div style={styles.clientName}>{q.clientName}</div>
                  <div style={styles.cardDate}>{formatDate(q.createdAt)}</div>
                </div>
              </div>

              <div style={styles.divider} />
              <div style={styles.itemCount}>
                {q.items.length} line item{q.items.length !== 1 ? 's' : ''}
              </div>

              <div style={styles.totalRow}>
                <span style={styles.totalLabel}>Total (excl. GST)</span>
                <span style={styles.totalValue}>{formatCurrency(q.total)}</span>
              </div>

              <div style={styles.cardActions}>
                <button style={styles.viewBtn} onClick={() => navigate(`/quotation/${q.id}`)}>
                  View
                </button>
                <button
                  style={{ ...styles.xlsBtn, ...(downloading === q.id ? styles.xlsBtnActive : {}) }}
                  onClick={() => handleDownload(q)}
                  disabled={downloading === q.id}
                >
                  {downloading === q.id ? '⏳ Generating…' : '⬇ Excel'}
                </button>
                <button style={styles.deleteBtn} onClick={() => handleDelete(q.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { maxWidth: '1100px', margin: '0 auto', padding: '2.5rem 1.5rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' },
  title: { fontFamily: "'DM Serif Display', serif", fontSize: '2.2rem', color: '#1a1a1a', lineHeight: 1.1 },
  subtitle: { color: '#7a7060', fontSize: '0.9rem', marginTop: '4px' },
  headerActions: { display: 'flex', gap: '10px', alignItems: 'center' },
  newBtn: { background: '#1a1a1a', color: '#f4f1eb', border: 'none', padding: '10px 22px', borderRadius: '8px', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: '0.9rem', letterSpacing: '0.02em' },
  settingsBtn: { background: 'transparent', color: '#4a4238', border: '1.5px solid #ddd8cf', padding: '9px 18px', borderRadius: '8px', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: '0.9rem' },
  empty: { textAlign: 'center', padding: '5rem 2rem', background: '#fff', borderRadius: '16px', border: '1px solid #e8e2d8' },
  emptyIcon: { fontSize: '3rem', color: '#c9a84c', marginBottom: '1rem' },
  emptyTitle: { fontFamily: "'DM Serif Display', serif", fontSize: '1.5rem', color: '#1a1a1a', marginBottom: '0.5rem' },
  emptyText: { color: '#7a7060', marginBottom: '2rem', fontSize: '0.95rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' },
  card: { background: '#fff', borderRadius: '14px', border: '1px solid #e8e2d8', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' },
  cardTop: { display: 'flex', alignItems: 'center', gap: '12px' },
  clientInitial: { width: '44px', height: '44px', borderRadius: '50%', background: '#f4f1eb', border: '2px solid #c9a84c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Serif Display', serif", fontSize: '1.2rem', color: '#1a1a1a', flexShrink: 0 },
  cardMeta: { flex: 1, minWidth: 0 },
  clientName: { fontWeight: 600, fontSize: '1rem', color: '#1a1a1a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  cardDate: { fontSize: '0.82rem', color: '#7a7060', marginTop: '2px' },
  divider: { height: '1px', background: '#f0ece4' },
  itemCount: { fontSize: '0.83rem', color: '#7a7060' },
  totalRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f9f7f2', borderRadius: '8px', padding: '10px 14px' },
  totalLabel: { fontSize: '0.85rem', color: '#7a7060', fontWeight: 500 },
  totalValue: { fontWeight: 700, fontSize: '1.05rem', color: '#1a1a1a', fontFamily: "'DM Serif Display', serif" },
  cardActions: { display: 'flex', gap: '6px', marginTop: '4px' },
  viewBtn: { flex: 1, padding: '8px', background: '#1a1a1a', color: '#f4f1eb', border: 'none', borderRadius: '7px', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: '0.82rem' },
  xlsBtn: { flex: 1.2, padding: '8px', background: '#1b5e20', color: '#fff', border: 'none', borderRadius: '7px', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: '0.82rem', transition: 'opacity 0.2s' },
  xlsBtnActive: { opacity: 0.7, cursor: 'wait' },
  deleteBtn: { flex: 1, padding: '8px', background: 'transparent', color: '#c0392b', border: '1px solid #e8c5c1', borderRadius: '7px', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: '0.82rem' },
};
