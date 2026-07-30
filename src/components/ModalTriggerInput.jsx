import React from 'react';

export default function ModalTriggerInput({ value, placeholder, onClick, categoryBadge }) {
  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: '#000',
        border: '1px solid #333',
        borderRadius: '6px',
        padding: '10px 12px',
        display: 'flex',
        justify: 'space-between',
        alignItems: 'center',
        cursor: 'pointer',
        minHeight: '42px'
      }}
    >
      <span style={{ color: value ? '#fff' : '#666', fontSize: '1rem', fontWeight: 'bold' }}>
        {value || placeholder}
      </span>

      {categoryBadge && (
        <span style={{
          backgroundColor: categoryBadge === '物理' ? '#b71c1c' : '#0d47a1',
          color: '#fff',
          fontSize: '0.75rem',
          padding: '2px 8px',
          borderRadius: '12px',
          fontWeight: 'bold'
        }}>
          {categoryBadge}
        </span>
      )}
    </div>
  );
}