import { useState, useEffect } from 'react';
import { getParticulars, saveParticulars } from '../db/storage';

export default function Particulars() {
  const [particulars, setParticulars] = useState([]);
  const [input, setInput] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setParticulars(getParticulars());
  }, []);

  function handleAdd() {
    const name = input.trim();
    if (!name) { setError('Please enter a particular name.'); return; }
    if (particulars.some(p => p.name.toLowerCase() === name.toLowerCase())) {
      setError('A particular with this name already exists.');
      return;
    }
    const updated = [
      ...particulars,
      { id: Date.now().toString(), name },
    ];
    setParticulars(updated);
    saveParticulars(updated);
    setInput('');
    setError('');
  }

  function handleDelete(id) {
    if (!confirm('Delete this particular?')) return;
    const updated = particulars.filter(p => p.id !== id);
    setParticulars(updated);
    saveParticulars(updated);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleAdd();
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>Particulars</h1>
        <p style={styles.subtitle}>Manage work/service categories used in quotations</p>
      </div>

      <div style={styles.card}>
        <h2 style={styles.sectionTitle}>Add New Particular</h2>
        <div style={styles.inputRow}>
          <input
            style={{ ...styles.input, ...(error ? styles.inputError : {}) }}
            placeholder="e.g. Civil Work, Electrical, Plumbing…"
            value={input}
            onChange={e => { setInput(e.target.value); setError(''); }}
            onKeyDown={handleKeyDown}
          />
          <button style={styles.addBtn} onClick={handleAdd}>
            Add
          </button>
        </div>
        {error && <p style={styles.errorText}>{error}</p>}
      </div>

      <div style={styles.listCard}>
        <div style={styles.listHeader}>
          <h2 style={styles.sectionTitle}>Saved Particulars</h2>
          <span style={styles.badge}>{particulars.length}</span>
        </div>

        {particulars.length === 0 ? (
          <div style={styles.empty}>
            <p>No particulars added yet.</p>
          </div>
        ) : (
          <ul style={styles.list}>
            {particulars.map((p, i) => (
              <li key={p.id} style={styles.listItem}>
                <div style={styles.itemLeft}>
                  <span style={styles.itemNumber}>{i + 1}</span>
                  <span style={styles.itemName}>{p.name}</span>
                </div>
                <button
                  style={styles.deleteBtn}
                  onClick={() => handleDelete(p.id)}
                  title="Delete"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    maxWidth: '660px',
    margin: '0 auto',
    padding: '2.5rem 1.5rem',
  },
  header: {
    marginBottom: '2rem',
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
    marginBottom: '1.5rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  },
  sectionTitle: {
    fontSize: '1rem',
    fontWeight: 600,
    color: '#1a1a1a',
    marginBottom: '1.1rem',
    letterSpacing: '0.01em',
  },
  inputRow: {
    display: 'flex',
    gap: '10px',
  },
  input: {
    flex: 1,
    padding: '10px 14px',
    border: '1.5px solid #ddd8cf',
    borderRadius: '8px',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '0.95rem',
    color: '#1a1a1a',
    background: '#faf8f4',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  inputError: {
    borderColor: '#e74c3c',
  },
  addBtn: {
    padding: '10px 24px',
    background: '#c9a84c',
    color: '#1a1a1a',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 700,
    fontSize: '0.92rem',
    letterSpacing: '0.02em',
    whiteSpace: 'nowrap',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: '0.83rem',
    marginTop: '8px',
  },
  listCard: {
    background: '#fff',
    borderRadius: '14px',
    border: '1px solid #e8e2d8',
    padding: '1.75rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  },
  listHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '1rem',
  },
  badge: {
    background: '#f4f1eb',
    color: '#7a7060',
    borderRadius: '20px',
    padding: '2px 10px',
    fontSize: '0.82rem',
    fontWeight: 600,
  },
  empty: {
    textAlign: 'center',
    padding: '2.5rem',
    color: '#a09580',
    fontSize: '0.92rem',
  },
  list: {
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  listItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 14px',
    background: '#faf8f4',
    borderRadius: '9px',
    border: '1px solid #f0ece4',
  },
  itemLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  itemNumber: {
    width: '24px',
    height: '24px',
    background: '#e8e2d8',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: '#7a7060',
    flexShrink: 0,
  },
  itemName: {
    fontWeight: 500,
    color: '#1a1a1a',
    fontSize: '0.95rem',
  },
  deleteBtn: {
    background: 'transparent',
    border: 'none',
    color: '#bbb',
    cursor: 'pointer',
    fontSize: '0.85rem',
    padding: '4px 8px',
    borderRadius: '6px',
    transition: 'color 0.2s, background 0.2s',
  },
};
