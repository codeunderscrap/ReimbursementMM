import React from 'react';
import { Plus, Trash2, Copy, FileSpreadsheet, User, Building, Calendar, DollarSign, MapPin, Briefcase } from 'lucide-react';

export default function FormEditor({
  employeeDetails,
  setEmployeeDetails,
  items,
  setItems,
  advance,
  setAdvance
}) {

  // Pre-seeded lists for datalists
  const departments = ['IT', 'Corporate', 'R&D', 'Operations', 'Finance', 'HR', 'Sales', 'Marketing'];
  const modes = ['Flight', 'Train', 'Cab', 'Auto', 'Metro', 'Bus', 'Personal Car', 'Personal Bike'];
  const natureOfExpenses = ['Relocation', 'Local Conveyance', 'Outstation Travel', 'Accommodation', 'Meals', 'Office Supplies', 'Client Entertainment', 'Courier/Postage'];
  const costCenters = ['Corporate', 'R&D', 'Sales', 'Marketing', 'Operations', 'IT Support'];
  const vendors = ['ClearTrip', 'MakeMyTrip', 'Uber', 'Ola', 'Namma Yatri', 'IRCTC', 'Indigo', 'Taj Hotels', 'Amazon', 'Fastrack'];
  const assignees = ['Anurag', 'Siddharth', 'Nitin', 'Divya', 'Pooja', 'Rahul'];

  // Handle metadata updates
  const handleMetaChange = (field, val) => {
    setEmployeeDetails(prev => ({
      ...prev,
      [field]: val
    }));
  };

  // Add a new empty expense item
  const handleAddItem = () => {
    const newItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      slNo: String(items.length + 1),
      date: new Date().toISOString().split('T')[0],
      vendorName: '',
      mode: '',
      natureOfExpense: '',
      from: '',
      to: '',
      purpose: '',
      costCenter: '',
      workAssignedBy: '',
      kms: '',
      amount: 0
    };
    setItems(prev => [...prev, newItem]);
  };

  // Update a specific field in an item
  const handleItemChange = (itemId, field, value) => {
    setItems(prev => prev.map(item => {
      if (item.id === itemId) {
        let updatedVal = value;
        if (field === 'amount') {
          updatedVal = parseFloat(value) || 0;
        } else if (field === 'kms') {
          updatedVal = value === '' ? '' : Number(value);
        }
        return { ...item, [field]: updatedVal };
      }
      return item;
    }));
  };

  // Duplicate an expense item
  const handleDuplicateItem = (item) => {
    const duplicated = {
      ...item,
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      slNo: String(items.length + 1)
    };
    setItems(prev => [...prev, duplicated]);
  };

  // Delete a specific expense item
  const handleDeleteItem = (itemId) => {
    setItems(prev => {
      const filtered = prev.filter(item => item.id !== itemId);
      // Re-index slNo sequentially
      return filtered.map((item, idx) => ({
        ...item,
        slNo: String(idx + 1)
      }));
    });
  };

  return (
    <div className="editor-panel">
      {/* Employee & Form Metadata Card */}
      <div className="section-card">
        <h2 className="section-title">Claimant Details</h2>
        
        <div className="form-grid-2">
          <div className="form-group">
            <label htmlFor="meta-title">SI. NO / FY</label>
            <input 
              id="meta-title"
              type="text" 
              className="form-control"
              value={employeeDetails.title || ''} 
              onChange={e => handleMetaChange('title', e.target.value)}
              placeholder="e.g. Reimbursement 26-27"
            />
          </div>

          <div className="form-group">
            <label htmlFor="meta-date">Date</label>
            <input 
              id="meta-date"
              type="date" 
              className="form-control"
              value={employeeDetails.date || ''} 
              onChange={e => handleMetaChange('date', e.target.value)}
            />
          </div>
        </div>

        <div className="form-grid-2">
          <div className="form-group">
            <label htmlFor="meta-name">Employee Name</label>
            <div style={{ position: 'relative' }}>
              <input 
                id="meta-name"
                type="text" 
                className="form-control"
                style={{ paddingLeft: '2rem' }}
                value={employeeDetails.name || ''} 
                onChange={e => handleMetaChange('name', e.target.value)}
                placeholder="Enter Full Name"
              />
              <User size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="meta-code">Employee Code</label>
            <input 
              id="meta-code"
              type="text" 
              className="form-control"
              value={employeeDetails.code || ''} 
              onChange={e => handleMetaChange('code', e.target.value)}
              placeholder="e.g. M119"
            />
          </div>
        </div>

        <div className="form-grid-2">
          <div className="form-group">
            <label htmlFor="meta-no">Reimbursement No</label>
            <input 
              id="meta-no"
              type="text" 
              className="form-control"
              value={employeeDetails.reimbursementNo || ''} 
              onChange={e => handleMetaChange('reimbursementNo', e.target.value)}
              placeholder="e.g. 2026-27/001"
            />
          </div>

          <div className="form-group">
            <label htmlFor="meta-dept">Department</label>
            <div style={{ position: 'relative' }}>
              <input 
                id="meta-dept"
                type="text" 
                className="form-control"
                style={{ paddingLeft: '2rem' }}
                list="departments-list"
                value={employeeDetails.department || ''} 
                onChange={e => handleMetaChange('department', e.target.value)}
                placeholder="Select or Type Department"
              />
              <Building size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <datalist id="departments-list">
                {departments.map(dept => <option key={dept} value={dept} />)}
              </datalist>
            </div>
          </div>
        </div>
      </div>

      {/* Datalists for table items (placed globally in file) */}
      <datalist id="modes-list">
        {modes.map(mode => <option key={mode} value={mode} />)}
      </datalist>
      <datalist id="nature-list">
        {natureOfExpenses.map(noe => <option key={noe} value={noe} />)}
      </datalist>
      <datalist id="costcenters-list">
        {costCenters.map(cc => <option key={cc} value={cc} />)}
      </datalist>
      <datalist id="vendors-list">
        {vendors.map(v => <option key={v} value={v} />)}
      </datalist>
      <datalist id="assignees-list">
        {assignees.map(a => <option key={a} value={a} />)}
      </datalist>

      {/* Expense Grid / Items Section */}
      <div className="section-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="section-title">Expense Line Items</h2>
          <span className="item-badge">{items.length} {items.length === 1 ? 'item' : 'items'}</span>
        </div>

        <div className="items-list-container">
          {items.map((item, index) => (
            <div key={item.id} className="expense-item-row">
              
              {/* Card Title Bar */}
              <div className="item-row-header">
                <span className="item-badge">Row {index + 1}</span>
                <div className="item-actions">
                  <button 
                    type="button"
                    className="btn-icon-only" 
                    title="Duplicate Item"
                    onClick={() => handleDuplicateItem(item)}
                  >
                    <Copy size={14} />
                  </button>
                  {items.length > 1 && (
                    <button 
                      type="button"
                      className="btn-icon-only btn-danger" 
                      title="Delete Item"
                      onClick={() => handleDeleteItem(item.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Form Grid */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div className="form-grid-3">
                  <div className="form-group">
                    <label>Date</label>
                    <input 
                      type="date" 
                      className="form-control"
                      value={item.date || ''} 
                      onChange={e => handleItemChange(item.id, 'date', e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Vendor Name</label>
                    <input 
                      type="text" 
                      className="form-control"
                      list="vendors-list"
                      value={item.vendorName || ''} 
                      placeholder="e.g. ClearTrip"
                      onChange={e => handleItemChange(item.id, 'vendorName', e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Mode</label>
                    <input 
                      type="text" 
                      className="form-control"
                      list="modes-list"
                      value={item.mode || ''} 
                      placeholder="e.g. Flight"
                      onChange={e => handleItemChange(item.id, 'mode', e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-grid-3">
                  <div className="form-group">
                    <label>Nature of Expense</label>
                    <input 
                      type="text" 
                      className="form-control"
                      list="nature-list"
                      value={item.natureOfExpense || ''} 
                      placeholder="e.g. Relocation"
                      onChange={e => handleItemChange(item.id, 'natureOfExpense', e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>From</label>
                    <input 
                      type="text" 
                      className="form-control"
                      value={item.from || ''} 
                      placeholder="Source"
                      onChange={e => handleItemChange(item.id, 'from', e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>To</label>
                    <input 
                      type="text" 
                      className="form-control"
                      value={item.to || ''} 
                      placeholder="Destination"
                      onChange={e => handleItemChange(item.id, 'to', e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-grid-3">
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label>Purpose</label>
                    <input 
                      type="text" 
                      className="form-control"
                      value={item.purpose || ''} 
                      placeholder="Purpose of travel/expense"
                      onChange={e => handleItemChange(item.id, 'purpose', e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Cost Center</label>
                    <input 
                      type="text" 
                      className="form-control"
                      list="costcenters-list"
                      value={item.costCenter || ''} 
                      placeholder="e.g. Corporate"
                      onChange={e => handleItemChange(item.id, 'costCenter', e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-grid-3">
                  <div className="form-group">
                    <label>Work Assigned By</label>
                    <input 
                      type="text" 
                      className="form-control"
                      list="assignees-list"
                      value={item.workAssignedBy || ''} 
                      placeholder="Manager Name"
                      onChange={e => handleItemChange(item.id, 'workAssignedBy', e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>KMs (if applicable)</label>
                    <input 
                      type="number" 
                      className="form-control"
                      value={item.kms || ''} 
                      placeholder="0"
                      onChange={e => handleItemChange(item.id, 'kms', e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Amount (Rs)</label>
                    <div style={{ position: 'relative' }}>
                      <input 
                        type="number" 
                        className="form-control"
                        style={{ paddingLeft: '1.5rem', fontWeight: 600 }}
                        value={item.amount || ''} 
                        placeholder="0"
                        onChange={e => handleItemChange(item.id, 'amount', e.target.value)}
                      />
                      <span style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-muted)' }}>₹</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>

        <button 
          type="button" 
          className="btn btn-secondary" 
          style={{ borderStyle: 'dashed', borderWidth: '2px', padding: '0.75rem' }}
          onClick={handleAddItem}
        >
          <Plus size={16} /> Add New Expense Row
        </button>
      </div>

      {/* Advance Payments Card */}
      <div className="section-card">
        <h2 className="section-title">Advance & Deductions</h2>
        
        <div className="form-group" style={{ maxWidth: '250px' }}>
          <label htmlFor="advance-input">Less: Advance Paid (Rs)</label>
          <div style={{ position: 'relative' }}>
            <input 
              id="advance-input"
              type="number" 
              className="form-control" 
              style={{ paddingLeft: '1.5rem', fontWeight: 600 }}
              value={advance || ''} 
              onChange={e => setAdvance(parseFloat(e.target.value) || 0)}
              placeholder="0"
            />
            <span style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-muted)' }}>₹</span>
          </div>
        </div>
      </div>
    </div>
  );
}
