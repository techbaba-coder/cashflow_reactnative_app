import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getQuotations } from '../db/storage';
import { formatCurrency, formatDate } from '../utils/calculations';

export default function QuotationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quotation, setQuotation] = useState(null);

  useEffect(() => {
    const all = getQuotations();
    const found = all.find(q => q.id === id);
    setQuotation(found || null);
  }, [id]);

  if (!quotation) {
    return (
      <div style={styles.page}>
        <p style={{ color: '#7a7060' }}>Quotation not found.</p>
        <button style={styles.backBtn} onClick={() => navigate('/')}>← Back</button>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <button style={styles.backBtn} onClick={() => navigate('/')}>← Back</button>
          <h1 style={styles.title}>Quotation</h1>
          <p style={styles.subtitle}>
            {formatDate(quotation.createdAt)} &nbsp;·&nbsp; {quotation.clientName}
          </p>
        </div>
      </div>

      <div style={styles.card}>
        <div style={styles.metaRow}>
          <div style={styles.metaBlock}>
            <span style={styles.metaLabel}>Client</span>
            <span style={styles.metaValue}>{quotation.clientName}</span>
          </div>
          <div style={styles.metaBlock}>
            <span style={styles.metaLabel}>Date</span>
            <span style={styles.metaValue}>{formatDate(quotation.createdAt)}</span>
          </div>
          <div style={styles.metaBlock}>
            <span style={styles.metaLabel}>Items</span>
            <span style={styles.metaValue}>{quotation.items.length}</span>
          </div>
        </div>
      </div>

      <div style={styles.card}>
        <h2 style={styles.sectionTitle}>Line Items</h2>
        <div style={styles.tableWrapper}>
          {/* Head */}
          <div style={styles.thead}>
            {['#', 'Particular', 'Description', 'Unit', 'Area', 'Rate', 'Amount'].map(h => (
              <div key={h} style={{ ...styles.th, flex: h === 'Description' ? 3 : h === 'Particular' ? 2 : 1, textAlign: h === 'Amount' ? 'right' : 'left' }}>
                {h}
              </div>
            ))}
          </div>
          {/* Rows */}
          {quotation.items.map((item, i) => (
            <div key={item.id || i} style={{ ...styles.trow, background: i % 2 === 0 ? '#faf8f4' : '#fff' }}>
              <div style={{ ...styles.td, flex: 1 }}>{i + 1}</div>
              <div style={{ ...styles.td, flex: 2, fontWeight: 600 }}>{item.particularName}</div>
              <div style={{ ...styles.td, flex: 3, color: '#4a4238' }}>{item.description || '—'}</div>
              <div style={{ ...styles.td, flex: 1 }}>{item.unit || '—'}</div>
              <div style={{ ...styles.td, flex: 1 }}>{item.area}</div>
              <div style={{ ...styles.td, flex: 1 }}>{item.rate}</div>
              <div style={{ ...styles.td, flex: 1, textAlign: 'right', fontWeight: 700 }}>
                {formatCurrency(item.amount)}
              </div>
            </div>
          ))}
        </div>

        <div style={styles.totalBox}>
          <span style={styles.totalLabel}>Grand Total</span>
          <span style={styles.totalValue}>{formatCurrency(quotation.total)}</span>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '2.5rem 1.5rem',
  },
  header: {
    marginBottom: '1.75rem',
  },
  backBtn: {
    background: 'transparent',
    border: 'none',
    color: '#7a7060',
    cursor: 'pointer',
    fontSize: '0.88rem',
    padding: '0',
    marginBottom: '0.5rem',
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 500,
  },
  title: {
    fontFamily: "'DM Serif Display', serif",
    fontSize: '2.2rem',
    color: '#1a1a1a',
    lineHeight: 1.1,
  },
  subtitle: {
    color: '#7a7060',
    fontSize: '0.9rem',
    marginTop: '5px',
  },
  card: {
    background: '#fff',
    borderRadius: '14px',
    border: '1px solid #e8e2d8',
    padding: '1.75rem',
    marginBottom: '1.25rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  },
  metaRow: {
    display: 'flex',
    gap: '3rem',
    flexWrap: 'wrap',
  },
  metaBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  metaLabel: {
    fontSize: '0.75rem',
    fontWeight: 700,
    color: '#7a7060',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  metaValue: {
    fontSize: '1rem',
    fontWeight: 600,
    color: '#1a1a1a',
  },
  sectionTitle: {
    fontSize: '1rem',
    fontWeight: 600,
    color: '#1a1a1a',
    marginBottom: '1rem',
  },
  tableWrapper: {
    display: 'flex',
    flexDirection: 'column',
    borderRadius: '10px',
    overflow: 'hidden',
    border: '1px solid #f0ece4',
    overflowX: 'auto',
  },
  thead: {
    display: 'flex',
    background: '#f4f1eb',
    padding: '10px 14px',
    gap: '8px',
  },
  th: {
    fontSize: '0.74rem',
    fontWeight: 700,
    color: '#7a7060',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    flex: 1,
  },
  trow: {
    display: 'flex',
    padding: '11px 14px',
    gap: '8px',
    borderTop: '1px solid #f0ece4',
  },
  td: {
    fontSize: '0.9rem',
    color: '#1a1a1a',
    flex: 1,
  },
  totalBox: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '1.25rem',
    background: '#1a1a1a',
    borderRadius: '10px',
    padding: '14px 20px',
  },
  totalLabel: {
    color: '#b0a99a',
    fontSize: '0.88rem',
    fontWeight: 500,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
  },
  totalValue: {
    fontFamily: "'DM Serif Display', serif",
    fontSize: '1.4rem',
    color: '#c9a84c',
  },
};
