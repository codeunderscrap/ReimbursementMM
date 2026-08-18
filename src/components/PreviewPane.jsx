import React from 'react';

export default function PreviewPane({ 
  employeeDetails, 
  items, 
  advance, 
  totalReimbursement, 
  totalInWords, 
  previewRef 
}) {
  
  // Pad the items array to at least 12 rows to maintain the Excel sheet layout shape
  const paddedItems = [...items];
  const targetRowCount = 12;
  const paddingNeeded = targetRowCount - items.length;
  
  for (let i = 0; i < paddingNeeded; i++) {
    paddedItems.push({
      id: `pad-${i}`,
      isPadding: true
    });
  }

  // Calculate Sub Total
  const subTotal = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  // Formats date string safely
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      // Return DD-MM-YYYY format
      const d = String(date.getDate()).padStart(2, '0');
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const y = date.getFullYear();
      return `${d}-${m}-${y}`;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="preview-panel">
      {/* Target element for html2pdf / printing */}
      <div className="a4-preview-sheet" ref={previewRef} id="reimbursement-print-area">
        
        {/* Company Header Block */}
        <div className="preview-sheet-header" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', borderBottom: '3px double #0f5132', paddingBottom: '1rem', marginBottom: '1.5rem', textAlign: 'left' }}>
          <img src="/mini%20mines.png" alt="MiniMines Logo" style={{ height: '56px', objectFit: 'contain' }} />
          <div>
            <h2 style={{ margin: 0, fontSize: '1.15rem', color: '#0f5132', fontFamily: "'Outfit', sans-serif", fontWeight: 800, letterSpacing: '0.03em' }}>MINIMINES CLEANTECH SOLUTIONS PRIVATE LIMITED</h2>
            <h3 style={{ margin: '0.1rem 0 0.25rem 0', fontSize: '0.85rem', color: '#555', fontWeight: 500 }}>BENGALURU</h3>
            <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#000', fontWeight: 700, letterSpacing: '0.02em' }}>EXPENSES FOR CONVEYANCE & REIMBURSEMENT</h4>
          </div>
        </div>

        {/* Metadata Grid */}
        <div className="document-meta-grid">
          <div className="meta-item">
            <span className="meta-item-label">SI. NO / FY:</span>
            <span className="meta-item-value">{employeeDetails.title || 'Reimbursement 26-27'}</span>
          </div>
          <div className="meta-item">
            <span className="meta-item-label" style={{ textAlign: 'right', paddingRight: '1rem' }}>DATE:</span>
            <span className="meta-item-value">{formatDate(employeeDetails.date)}</span>
          </div>
          
          <div className="meta-item">
            <span className="meta-item-label">NAME:</span>
            <span className="meta-item-value">{employeeDetails.name || ''}</span>
          </div>
          <div className="meta-item">
            <span className="meta-item-label" style={{ textAlign: 'right', paddingRight: '1rem' }}>CODE:</span>
            <span className="meta-item-value">{employeeDetails.code || ''}</span>
          </div>

          <div className="meta-item">
            <span className="meta-item-label">Reimbursement No:</span>
            <span className="meta-item-value">{employeeDetails.reimbursementNo || ''}</span>
          </div>
          <div className="meta-item">
            <span className="meta-item-label" style={{ textAlign: 'right', paddingRight: '1rem' }}>DEPARTMENT:</span>
            <span className="meta-item-value">{employeeDetails.department || ''}</span>
          </div>
        </div>

        {/* Main Expense Table */}
        <table className="preview-table">
          <thead>
            <tr>
              <th style={{ width: '4%' }}>Sl No</th>
              <th style={{ width: '9%' }}>Date</th>
              <th style={{ width: '13%' }}>Vendor Name</th>
              <th style={{ width: '7%' }}>Mode</th>
              <th style={{ width: '12%' }}>Nature Of Expense</th>
              <th style={{ width: '8%' }}>From</th>
              <th style={{ width: '8%' }}>To</th>
              <th style={{ width: '13%' }}>Purpose</th>
              <th style={{ width: '9%' }}>Cost Center</th>
              <th style={{ width: '9%' }}>Work Assigned by</th>
              <th style={{ width: '4%' }}>kms</th>
              <th style={{ width: '8%' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {paddedItems.map((item, idx) => {
              if (item.isPadding) {
                return (
                  <tr key={item.id}>
                    <td className="text-center">{idx + 1}</td>
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                  </tr>
                );
              }

              return (
                <tr key={item.id}>
                  <td className="text-center">{idx + 1}</td>
                  <td className="text-center" style={{ whiteSpace: 'nowrap' }}>
                    {formatDate(item.date)}
                  </td>
                  <td>{item.vendorName}</td>
                  <td className="text-center">{item.mode}</td>
                  <td>{item.natureOfExpense}</td>
                  <td>{item.from}</td>
                  <td>{item.to}</td>
                  <td>{item.purpose}</td>
                  <td>{item.costCenter}</td>
                  <td>{item.workAssignedBy}</td>
                  <td className="text-center">{item.kms}</td>
                  <td className="text-right">
                    {item.amount !== undefined && item.amount !== '' ? `${item.amount}/-` : '0/-'}
                  </td>
                </tr>
              );
            })}

            {/* Sub Total */}
            <tr className="preview-totals-row">
              <td colSpan="11" className="text-right">Sub Total</td>
              <td className="text-right">{subTotal.toFixed(2)}/-</td>
            </tr>

            {/* Less: Advance */}
            <tr className="preview-totals-row">
              <td colSpan="11" className="text-right">Less : Advance</td>
              <td className="text-right">{(Number(advance) || 0).toFixed(2)}/-</td>
            </tr>

            {/* Total Reimbursement */}
            <tr className="preview-totals-row" style={{ backgroundColor: '#eef7f0' }}>
              <td colSpan="11" className="text-right" style={{ color: '#0f5132', fontSize: '0.85rem' }}>Total Reimbursemenet</td>
              <td className="text-right" style={{ color: '#0f5132', fontSize: '0.85rem' }}>{totalReimbursement.toFixed(2)}/-</td>
            </tr>
          </tbody>
        </table>

        {/* Total Amount in Words */}
        <div className="words-row">
          <span>TOTAL Rs in Words-</span>
          <em>{totalInWords}</em>
        </div>

        {/* Signatures Area */}
        <div className="preview-signatures-grid">
          <div className="signature-box">
            <div className="signature-line">Signature of Employee</div>
          </div>
          <div className="signature-box align-right">
            <div className="signature-line">Approval HR</div>
          </div>
          <div className="signature-box">
            <div className="signature-line">Approval HOD Signature</div>
          </div>
          <div className="signature-box align-right">
            <div className="signature-line">Approval CEO</div>
          </div>
        </div>

        {/* Payment Details Section */}
        <div className="preview-payment-section">
          <div className="payment-title">Payment Details (For Office Use Only)</div>
          <table className="payment-table">
            <tbody>
              <tr>
                <td className="header-cell">Cheque/Cash/NEFT</td>
                <td className="value-cell">&nbsp;</td>
                <td className="signature-cell" rowSpan="3">
                  SIGNATURE OF EMPLOYEE
                  <span>(After Payment)</span>
                </td>
              </tr>
              <tr>
                <td className="header-cell">Bank Name</td>
                <td className="value-cell">&nbsp;</td>
              </tr>
              <tr>
                <td className="header-cell">Amount</td>
                <td className="value-cell" style={{ fontWeight: 'bold' }}>{totalReimbursement.toFixed(2)}/-</td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
