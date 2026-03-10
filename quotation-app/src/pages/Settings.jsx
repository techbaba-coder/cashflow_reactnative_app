import { useState, useEffect } from 'react';
import { getSettings, saveSettings } from '../db/storage';

const TABS = ['Company Info', 'Quotation Defaults', 'Rate Analysis', 'Actual Cost'];

export default function Settings() {
  const [tab, setTab]       = useState(0);
  const [settings, setSettings] = useState(null);
  const [saved, setSaved]   = useState(false);

  useEffect(() => { setSettings(getSettings()); }, []);

  if (!settings) return null;

  function update(path, value) {
    setSettings(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      const keys = path.split('.');
      let obj = next;
      for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
      obj[keys[keys.length - 1]] = value;
      return next;
    });
    setSaved(false);
  }

  function updateRow(sheet, idx, field, value) {
    setSettings(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      next[sheet].rows[idx][field] = value;
      return next;
    });
    setSaved(false);
  }

  function handleSave() {
    saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const inp = (label, path, textarea, rows = 3) => (
    <div style={S.field}>
      <label style={S.label}>{label}</label>
      {textarea
        ? <textarea style={S.textarea} rows={rows} value={settings[path] ?? ''}
            onChange={e => update(path, e.target.value)} />
        : <input style={S.input} value={settings[path] ?? ''}
            onChange={e => update(path, e.target.value)} />}
    </div>
  );

  const nested = (label, sheet, key, textarea) => (
    <div style={S.field}>
      <label style={S.label}>{label}</label>
      {textarea
        ? <textarea style={S.textarea} rows={2} value={settings[sheet][key] ?? ''}
            onChange={e => update(`${sheet}.${key}`, e.target.value)} />
        : <input style={S.input} value={settings[sheet][key] ?? ''}
            onChange={e => update(`${sheet}.${key}`, e.target.value)} />}
    </div>
  );

  function RateTable({ sheetKey, showProjectSqft }) {
    const sheet = settings[sheetKey];
    return (
      <div>
        {nested('Sheet Title', sheetKey, 'title')}
        <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
          <table style={S.table}>
            <thead>
              <tr>
                {['Sr','Name','Qty / Unit','Rate','Fixed Amount'].map(h => (
                  <th key={h} style={S.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sheet.rows.map((row, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? '#faf8f4' : '#fff' }}>
                  <td style={S.td}>{row.sr}</td>
                  <td style={S.td}>
                    <input style={S.tinput} value={row.name}
                      onChange={e => updateRow(sheetKey, i, 'name', e.target.value)} />
                  </td>
                  <td style={S.td}>
                    <input style={S.tinput} type="number" value={row.qty}
                      disabled={row.fixedAmt !== '' && row.fixedAmt != null}
                      onChange={e => updateRow(sheetKey, i, 'qty', e.target.value)} />
                  </td>
                  <td style={S.td}>
                    <input style={S.tinput} type="number" value={row.rate}
                      disabled={row.fixedAmt !== '' && row.fixedAmt != null}
                      onChange={e => updateRow(sheetKey, i, 'rate', e.target.value)} />
                  </td>
                  <td style={S.td}>
                    <input style={S.tinput} type="number" value={row.fixedAmt}
                      placeholder="or fixed ₹"
                      onChange={e => updateRow(sheetKey, i, 'fixedAmt', e.target.value === '' ? '' : e.target.value)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem' }}>
          {nested('Overhead %', sheetKey, 'overheadPct')}
          {nested('Profit %',   sheetKey, 'profitPct')}
          {nested('Total Sq.ft (for per-sqft calc)', sheetKey, 'totalSqft')}
          {showProjectSqft && nested('Project Sq.ft', sheetKey, 'projectSqft')}
        </div>
      </div>
    );
  }

  return (
    <div style={S.page}>
      <div style={S.header}>
        <h1 style={S.title}>Settings</h1>
        <p style={S.subtitle}>Customize company info, defaults & Excel sheet data</p>
      </div>

      {/* Tabs */}
      <div style={S.tabs}>
        {TABS.map((t, i) => (
          <button key={t} style={{ ...S.tab, ...(tab === i ? S.tabActive : {}) }}
            onClick={() => setTab(i)}>{t}</button>
        ))}
      </div>

      <div style={S.card}>
        {/* ── Company Info ── */}
        {tab === 0 && (
          <div>
            <h2 style={S.sectionTitle}>Company Information</h2>
            <p style={S.hint}>These details appear in the header of every downloaded quotation.</p>
            {inp('Company / Document Title', 'companyTitle')}
            <div style={S.row2}>
              {inp('PAN',   'pan')}
              {inp('GST No','gstNo')}
            </div>
            {inp('MSME No', 'msme')}
            <div style={S.row2}>
              {inp('Email',   'email')}
              {inp('Contact','contact')}
            </div>
          </div>
        )}

        {/* ── Quotation Defaults ── */}
        {tab === 1 && (
          <div>
            <h2 style={S.sectionTitle}>Quotation Defaults</h2>
            <p style={S.hint}>These are printed at the bottom of every Excel quotation. Edit as needed.</p>
            {inp('Payment Terms', 'paymentTerms', true, 3)}
            {inp('Terms & Conditions', 'termsConditions', true, 8)}
            {inp('Bank Details', 'bankDetails', true, 6)}
          </div>
        )}

        {/* ── Rate Analysis ── */}
        {tab === 2 && (
          <div>
            <h2 style={S.sectionTitle}>Rate Analysis Sheet (Sheet 2)</h2>
            <p style={S.hint}>
              Rows with Qty + Rate → Amount = Qty × Rate.<br/>
              Rows with Fixed Amount → that value is used directly (leave Qty/Rate blank).
            </p>
            <RateTable sheetKey="rateAnalysis" showProjectSqft={false} />
          </div>
        )}

        {/* ── Actual Cost ── */}
        {tab === 3 && (
          <div>
            <h2 style={S.sectionTitle}>Actual Cost Sheet (Sheet 3)</h2>
            <p style={S.hint}>Same structure as Rate Analysis with an extra "Project Sq.ft" for projected total cost.</p>
            <RateTable sheetKey="actualCost" showProjectSqft={true} />
          </div>
        )}
      </div>

      <div style={S.actions}>
        <button
          style={{ ...S.saveBtn, ...(saved ? S.savedBtn : {}) }}
          onClick={handleSave}
        >
          {saved ? '✓ Settings Saved!' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}

const S = {
  page: { maxWidth: '900px', margin: '0 auto', padding: '2.5rem 1.5rem' },
  header: { marginBottom: '1.75rem' },
  title: { fontFamily: "'DM Serif Display', serif", fontSize: '2.2rem', color: '#1a1a1a', lineHeight: 1.1 },
  subtitle: { color: '#7a7060', fontSize: '0.9rem', marginTop: '5px' },
  sectionTitle: { fontSize: '1rem', fontWeight: 700, color: '#1a1a1a', marginBottom: '0.3rem' },
  hint: { color: '#7a7060', fontSize: '0.83rem', marginBottom: '1.25rem', lineHeight: 1.6 },
  tabs: { display: 'flex', gap: '6px', marginBottom: '1.25rem', flexWrap: 'wrap' },
  tab: {
    padding: '8px 18px', border: '1.5px solid #ddd8cf', borderRadius: '8px',
    background: '#fff', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
    fontWeight: 500, fontSize: '0.87rem', color: '#4a4238',
  },
  tabActive: { background: '#1a1a1a', color: '#f4f1eb', border: '1.5px solid #1a1a1a' },
  card: {
    background: '#fff', borderRadius: '14px', border: '1px solid #e8e2d8',
    padding: '1.75rem', marginBottom: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  },
  field: { marginBottom: '1rem' },
  label: { display: 'block', fontWeight: 600, fontSize: '0.8rem', color: '#4a4238', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' },
  input: { width: '100%', padding: '9px 12px', border: '1.5px solid #ddd8cf', borderRadius: '7px', fontFamily: "'DM Sans', sans-serif", fontSize: '0.9rem', color: '#1a1a1a', background: '#faf8f4', outline: 'none' },
  textarea: { width: '100%', padding: '9px 12px', border: '1.5px solid #ddd8cf', borderRadius: '7px', fontFamily: "'DM Sans', sans-serif", fontSize: '0.9rem', color: '#1a1a1a', background: '#faf8f4', outline: 'none', resize: 'vertical' },
  row2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' },
  th: { padding: '8px 10px', background: '#f4f1eb', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: '#7a7060', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e8e2d8', whiteSpace: 'nowrap' },
  td: { padding: '6px 8px', borderBottom: '1px solid #f0ece4' },
  tinput: { width: '100%', minWidth: '80px', padding: '6px 8px', border: '1px solid #ddd8cf', borderRadius: '5px', fontFamily: "'DM Sans', sans-serif", fontSize: '0.87rem', background: '#fff', outline: 'none' },
  actions: { display: 'flex', justifyContent: 'flex-end' },
  saveBtn: { padding: '11px 32px', background: '#1a1a1a', color: '#f4f1eb', border: 'none', borderRadius: '9px', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: '0.92rem', letterSpacing: '0.02em', transition: 'background 0.3s' },
  savedBtn: { background: '#2e7d32', cursor: 'default' },
};
