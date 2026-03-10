import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getParticulars, addQuotation } from '../db/storage';
import { calcAmount, calcTotal, formatCurrency } from '../utils/calculations';

const EMPTY_ITEM = () => ({
  id: Date.now().toString() + Math.random(),
  particularId: '',
  particularName: '',
  description: '',
  unit: '',
  area: '',
  rate: '',
  amount: 0,
});

export default function QuotationForm() {
  const navigate = useNavigate();
  const [particulars, setParticulars] = useState([]);
  const [clientName, setClientName] = useState('');
  const [items, setItems] = useState([EMPTY_ITEM()]);
  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setParticulars(getParticulars());
  }, []);

  function updateItem(index, field, value) {
    setItems(prev => {
      const updated = [...prev];
      const item = { ...updated[index], [field]: value };

      // if particular dropdown changes, snapshot the name
      if (field === 'particularId') {
        const found = particulars.find(p => p.id === value);
        item.particularName = found ? found.name : '';
      }

      item.amount = calcAmount(
        field === 'area' ? value : item.area,
        field === 'rate' ? value : item.rate
      );
      updated[index] = item;
      return updated;
    });
  }

  function addItem() {
    setItems(prev => [...prev, EMPTY_ITEM()]);
  }

  function removeItem(index) {
    if (items.length === 1) return; // keep at least one row
    setItems(prev => prev.filter((_, i) => i !== index));
  }

  function validate() {
    const e = {};
    if (!clientName.trim()) e.clientName = 'Client name is required.';
    items.forEach((item, i) => {
      if (!item.particularName) e[`particular_${i}`] = 'Select a particular.';
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSave() {
    if (!validate()) return;

    const quotation = {
      id: Date.now().toString(),
      clientName: clientName.trim(),
      createdAt: new Date().toISOString(),
      items: items.map(({ id, particularName, description, unit, area, rate, amount }) => ({
        id,
        particularName,   // snapshot – frozen at save time
        description,
        unit,
        area: parseFloat(area) || 0,
        rate: parseFloat(rate) || 0,
        amount,
      })),
      total: calcTotal(items),
    };

    addQuotation(quotation);
    setSaved(true);
    setTimeout(() => navigate('/'), 1200);
  }

  const grandTotal = calcTotal(items);

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>New Quotation</h1>
        <p style={styles.subtitle}>Fill in the details below and save</p>
      </div>

      {/* Client Name */}
      <div style={styles.card}>
        <label style={styles.label}>Client Name *</label>
        <input
          style={{ ...styles.input, ...(errors.clientName ? styles.inputError : {}) }}
          placeholder="Enter client name"
          value={clientName}
          onChange={e => { setClientName(e.target.value); setErrors(prev => ({ ...prev, clientName: '' })); }}
        />
        {errors.clientName && <p style={styles.errorText}>{errors.clientName}</p>}
      </div>

      {/* Line Items */}
      <div style={styles.card}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Line Items</h2>
          <button style={styles.addRowBtn} onClick={addItem}>+ Add Row</button>
        </div>

        {/* Table Header */}
        <div style={styles.tableWrapper}>
          <div style={styles.tableHead}>
            <div style={{ ...styles.col, flex: 2 }}>Particular</div>
            <div style={{ ...styles.col, flex: 3 }}>Description</div>
            <div style={{ ...styles.col, flex: 1 }}>Unit</div>
            <div style={{ ...styles.col, flex: 1 }}>Area</div>
            <div style={{ ...styles.col, flex: 1 }}>Rate</div>
            <div style={{ ...styles.col, flex: 1.5, textAlign: 'right' }}>Amount</div>
            <div style={{ width: '36px' }} />
          </div>

          {items.map((item, index) => (
            <div key={item.id} style={styles.tableRow}>
              {/* Particular */}
              <div style={{ ...styles.cellWrap, flex: 2 }}>
                <select
                  style={{
                    ...styles.select,
                    ...(errors[`particular_${index}`] ? styles.inputError : {}),
                  }}
                  value={item.particularId}
                  onChange={e => {
                    updateItem(index, 'particularId', e.target.value);
                    setErrors(prev => ({ ...prev, [`particular_${index}`]: '' }));
                  }}
                >
                  <option value="">Select…</option>
                  {particulars.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                {errors[`particular_${index}`] && (
                  <p style={styles.errorText}>{errors[`particular_${index}`]}</p>
                )}
              </div>

              {/* Description */}
              <div style={{ ...styles.cellWrap, flex: 3 }}>
                <input
                  style={styles.input}
                  placeholder="Description"
                  value={item.description}
                  onChange={e => updateItem(index, 'description', e.target.value)}
                />
              </div>

              {/* Unit */}
              <div style={{ ...styles.cellWrap, flex: 1 }}>
                <input
                  style={styles.input}
                  placeholder="sqft"
                  value={item.unit}
                  onChange={e => updateItem(index, 'unit', e.target.value)}
                />
              </div>

              {/* Area */}
              <div style={{ ...styles.cellWrap, flex: 1 }}>
                <input
                  style={styles.input}
                  type="number"
                  min="0"
                  placeholder="0"
                  value={item.area}
                  onChange={e => updateItem(index, 'area', e.target.value)}
                />
              </div>

              {/* Rate */}
              <div style={{ ...styles.cellWrap, flex: 1 }}>
                <input
                  style={styles.input}
                  type="number"
                  min="0"
                  placeholder="0"
                  value={item.rate}
                  onChange={e => updateItem(index, 'rate', e.target.value)}
                />
              </div>

              {/* Amount (auto) */}
              <div style={{ ...styles.cellWrap, flex: 1.5, alignItems: 'flex-end' }}>
                <div style={styles.amountDisplay}>
                  {formatCurrency(item.amount)}
                </div>
              </div>

              {/* Remove */}
              <div style={{ width: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <button
                  style={styles.removeBtn}
                  onClick={() => removeItem(index)}
                  disabled={items.length === 1}
                  title="Remove row"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Total */}
        <div style={styles.totalBox}>
          <span style={styles.totalLabel}>Grand Total</span>
          <span style={styles.totalValue}>{formatCurrency(grandTotal)}</span>
        </div>
      </div>

      {/* Actions */}
      <div style={styles.actions}>
        <button style={styles.cancelBtn} onClick={() => navigate('/')}>Cancel</button>
        <button
          style={{ ...styles.saveBtn, ...(saved ? styles.savedBtn : {}) }}
          onClick={handleSave}
          disabled={saved}
        >
          {saved ? '✓ Saved!' : 'Save Quotation'}
        </button>
      </div>
    </div>
  );
}

const styles = {
  page: {
    maxWidth: '1100px',
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
    marginBottom: '1.25rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  },
  label: {
    display: 'block',
    fontWeight: 600,
    fontSize: '0.88rem',
    color: '#4a4238',
    marginBottom: '8px',
    letterSpacing: '0.02em',
    textTransform: 'uppercase',
  },
  input: {
    width: '100%',
    padding: '9px 12px',
    border: '1.5px solid #ddd8cf',
    borderRadius: '7px',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '0.9rem',
    color: '#1a1a1a',
    background: '#faf8f4',
    outline: 'none',
  },
  inputError: {
    borderColor: '#e74c3c',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: '0.78rem',
    marginTop: '4px',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.25rem',
  },
  sectionTitle: {
    fontSize: '1rem',
    fontWeight: 600,
    color: '#1a1a1a',
  },
  addRowBtn: {
    background: '#f4f1eb',
    border: '1px solid #ddd8cf',
    borderRadius: '7px',
    padding: '7px 16px',
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '0.87rem',
    fontWeight: 600,
    color: '#4a4238',
  },
  tableWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    overflowX: 'auto',
  },
  tableHead: {
    display: 'flex',
    gap: '8px',
    padding: '0 8px',
    marginBottom: '4px',
  },
  col: {
    fontSize: '0.75rem',
    fontWeight: 700,
    color: '#7a7060',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    padding: '0 2px',
  },
  tableRow: {
    display: 'flex',
    gap: '8px',
    alignItems: 'flex-start',
    background: '#faf8f4',
    borderRadius: '9px',
    padding: '10px 8px',
    border: '1px solid #f0ece4',
  },
  cellWrap: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: '80px',
  },
  select: {
    width: '100%',
    padding: '9px 12px',
    border: '1.5px solid #ddd8cf',
    borderRadius: '7px',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '0.9rem',
    color: '#1a1a1a',
    background: '#fff',
    outline: 'none',
    cursor: 'pointer',
  },
  amountDisplay: {
    padding: '9px 4px',
    fontWeight: 700,
    fontSize: '0.9rem',
    color: '#1a1a1a',
    textAlign: 'right',
    whiteSpace: 'nowrap',
  },
  removeBtn: {
    background: 'transparent',
    border: 'none',
    color: '#ccc',
    cursor: 'pointer',
    fontSize: '0.8rem',
    padding: '4px',
    borderRadius: '4px',
    lineHeight: 1,
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
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '0.5rem',
  },
  cancelBtn: {
    padding: '11px 28px',
    background: 'transparent',
    border: '1.5px solid #ddd8cf',
    borderRadius: '9px',
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 600,
    fontSize: '0.92rem',
    color: '#4a4238',
  },
  saveBtn: {
    padding: '11px 32px',
    background: '#1a1a1a',
    color: '#f4f1eb',
    border: 'none',
    borderRadius: '9px',
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 700,
    fontSize: '0.92rem',
    letterSpacing: '0.02em',
    transition: 'background 0.3s',
  },
  savedBtn: {
    background: '#2e7d32',
    cursor: 'default',
  },
};
