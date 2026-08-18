import React, { useState, useRef, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  FileText, 
  Printer, 
  Download, 
  Trash2, 
  Upload, 
  Sparkles, 
  Moon, 
  Sun, 
  RefreshCw,
  LogOut
} from 'lucide-react';
import confetti from 'canvas-confetti';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

// Utilities
import { numberToWords } from './utils/numberToWords';
import { generateReimbursementDocx } from './utils/docxGenerator';
import { parseReimbursementExcel, exportToExcel } from './utils/excelHandler';

// Components
import FormEditor from './components/FormEditor';
import PreviewPane from './components/PreviewPane';
import Login from './components/Login';

export default function App() {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('mm_reimbursement_auth') === 'true' || 
           sessionStorage.getItem('mm_reimbursement_auth') === 'true';
  });

  const handleLoginSuccess = (rememberMe) => {
    setIsAuthenticated(true);
    if (rememberMe) {
      localStorage.setItem('mm_reimbursement_auth', 'true');
    } else {
      sessionStorage.setItem('mm_reimbursement_auth', 'true');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('mm_reimbursement_auth');
    sessionStorage.removeItem('mm_reimbursement_auth');
  };

  // Theme state
  const [theme, setTheme] = useState('light');

  // Employee details state
  const [employeeDetails, setEmployeeDetails] = useState({
    title: 'Reimbursement 26-27',
    name: 'Md Arsalan',
    code: 'M119',
    date: new Date().toISOString().split('T')[0],
    reimbursementNo: '2026-27/001',
    department: 'IT'
  });

  // Expense items state
  const [items, setItems] = useState([
    {
      id: 'default-item-1',
      slNo: '1',
      date: '2026-07-06',
      vendorName: 'ClearTrip',
      mode: 'Flight',
      natureOfExpense: 'Relocation',
      from: 'New Delhi',
      to: 'Banglore',
      purpose: 'WORK',
      costCenter: 'Corporate',
      workAssignedBy: 'Anurag',
      kms: 1744,
      amount: 9411
    }
  ]);

  // Advance state
  const [advance, setAdvance] = useState(0);

  // Reference for PDF download capture
  const previewRef = useRef(null);

  // Sync theme attribute with HTML document tag
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Calculations
  const subTotal = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const totalReimbursement = Math.max(0, subTotal - (Number(advance) || 0));
  const totalInWords = numberToWords(totalReimbursement);

  // Load sample data matching the original Excel file
  const handleLoadSample = () => {
    setEmployeeDetails({
      title: 'Reimbursement 26-27',
      name: 'Md Arsalan',
      code: 'M119',
      date: '2026-08-18',
      reimbursementNo: '2026-27/001',
      department: 'IT'
    });
    setItems([
      {
        id: 'sample-item-1',
        slNo: '1',
        date: '2026-07-06',
        vendorName: 'ClearTrip',
        mode: 'Flight',
        natureOfExpense: 'Relocation',
        from: 'New Delhi',
        to: 'Banglore',
        purpose: 'WORK',
        costCenter: 'Corporate',
        workAssignedBy: 'Anurag',
        kms: 1744,
        amount: 9411
      }
    ]);
    setAdvance(0);
    triggerSuccessConfetti();
  };

  // Reset form to blank fields
  const handleReset = () => {
    setEmployeeDetails({
      title: `Reimbursement ${new Date().getFullYear().toString().substr(-2)}-${(new Date().getFullYear() + 1).toString().substr(-2)}`,
      name: '',
      code: '',
      date: new Date().toISOString().split('T')[0],
      reimbursementNo: '',
      department: ''
    });
    setItems([
      {
        id: `item-${Date.now()}`,
        slNo: '1',
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
      }
    ]);
    setAdvance(0);
  };

  // Import from an Excel file
  const handleImportExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = parseReimbursementExcel(evt.target.result);
        if (parsed.employeeDetails.name || parsed.items.length > 0) {
          setEmployeeDetails(parsed.employeeDetails);
          setItems(parsed.items);
          setAdvance(parsed.advance);
          triggerSuccessConfetti();
        } else {
          alert("Could not extract reimbursement data. Make sure you use the standard template.");
        }
      } catch (err) {
        console.error("Error reading file: ", err);
        alert("Failed to parse Excel file. Please ensure it follows the correct format.");
      }
    };
    reader.readAsArrayBuffer(file);
    // Reset file input so same file can be uploaded again
    e.target.value = '';
  };

  // Export Excel: Fetch template file, update details and trigger download
  const handleExportExcel = async () => {
    try {
      let templateBuffer = null;
      try {
        const response = await fetch('/template.xlsx');
        if (response.ok) {
          templateBuffer = await response.arrayBuffer();
        }
      } catch (fetchErr) {
        console.warn("Could not fetch excel template, writing clean file instead.", fetchErr);
      }

      const buffer = await exportToExcel({
        employeeDetails,
        items,
        advance,
        totalReimbursement,
        totalInWords
      }, templateBuffer);

      downloadBlob(buffer, `Reimbursement_${employeeDetails.name || 'Form'}.xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      triggerSuccessConfetti();
    } catch (err) {
      console.error(err);
      alert("Failed to export Excel file.");
    }
  };

  // Export Word Document
  const handleExportDocx = () => {
    try {
      const docxBlob = generateReimbursementDocx({
        employeeDetails,
        items,
        advance,
        totalReimbursement,
        totalInWords
      });

      docxBlob.then(blob => {
        downloadBlob(blob, `Reimbursement_${employeeDetails.name || 'Form'}.docx`, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        triggerSuccessConfetti();
      }).catch(err => {
        console.error(err);
        alert("Failed to build Word document.");
      });
    } catch (err) {
      console.error(err);
      alert("Failed to export Word document.");
    }
  };

  // Export PDF: Direct local download via Canvas capture
  const handleExportPdfDirect = async () => {
    const element = previewRef.current;
    if (!element) return;

    try {
      // Capture element as canvas image
      const canvas = await html2canvas(element, {
        scale: 2, // High resolution
        useCORS: true,
        logging: false
      });
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 210; // A4 size width in mm
      const pageHeight = 297; // A4 size height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Add image to PDF. Handles multiple pages if needed
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`Reimbursement_${employeeDetails.name || 'Form'}.pdf`);
      triggerSuccessConfetti();
    } catch (err) {
      console.error("PDF download failed:", err);
      alert("Direct PDF compilation failed. Please use 'Print / Save PDF' as an alternative.");
    }
  };

  // Print PDF: Triggers native print which formats via print CSS
  const handlePrint = () => {
    window.print();
  };

  // Toggle Theme
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Helper: File Downloader
  const downloadBlob = (data, filename, mimeType) => {
    const blob = new Blob([data], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  // Helper: Visual celebration
  const triggerSuccessConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#0f5132', '#1b4332', '#2d6a4f', '#d8f3dc']
    });
  };

  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="app-container">
      {/* Top Navbar */}
      <nav className="top-nav">
        <div className="brand-section">
          <div className="logo-circle">MM</div>
          <div className="brand-text">
            <h1>MiniMines</h1>
            <p>Reimbursement Form Generator</p>
          </div>
        </div>

        <div className="action-bar">
          {/* Load Sample Button */}
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={handleLoadSample}
            title="Load the Md Arsalan sample data from the Excel template"
          >
            <Sparkles size={16} style={{ color: 'var(--primary)' }} />
            Load Sample Data
          </button>

          {/* Import Excel */}
          <div className="file-upload-wrapper">
            <button type="button" className="btn btn-secondary">
              <Upload size={16} />
              Import Excel
            </button>
            <input 
              type="file" 
              accept=".xlsx, .xls" 
              onChange={handleImportExcel} 
              title="Upload standard reimbursement sheet"
            />
          </div>

          {/* Clear Form */}
          <button 
            type="button" 
            className="btn btn-secondary btn-icon-only" 
            onClick={handleReset} 
            title="Reset Form Fields"
          >
            <RefreshCw size={16} />
          </button>

          {/* Theme Toggle */}
          <button 
            type="button" 
            className="theme-toggle" 
            onClick={toggleTheme}
            title="Toggle Light/Dark Theme"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {/* Logout Button */}
          <button 
            type="button" 
            className="btn btn-secondary btn-icon-only btn-danger" 
            onClick={handleLogout}
            title="Log Out of Portal"
            style={{ marginLeft: '0.25rem' }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </nav>

      {/* Main Workspace */}
      <main className="dashboard-workspace">
        {/* Left Side Form Editor */}
        <FormEditor 
          employeeDetails={employeeDetails}
          setEmployeeDetails={setEmployeeDetails}
          items={items}
          setItems={setItems}
          advance={advance}
          setAdvance={setAdvance}
        />

        {/* Right Side Live A4 Page Preview */}
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, position: 'relative' }}>
          
          {/* Live Preview Export Action Panel */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'flex-end', 
            alignItems: 'center', 
            gap: '0.75rem',
            padding: '1rem 2.5rem 0 2.5rem',
            backgroundColor: 'var(--bg-preview)',
            borderBottom: '1px solid var(--border-color)'
          }}>
            <span style={{ marginRight: 'auto', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              Live Print Preview
            </span>
            
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={handlePrint}
              title="Print directly or use browser Save to PDF"
            >
              <Printer size={16} />
              Print / Save PDF
            </button>

            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={handleExportPdfDirect}
              title="Instantly compile PDF file client-side"
            >
              <Download size={16} />
              Direct PDF
            </button>

            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={handleExportDocx}
              title="Download Microsoft Word document"
            >
              <FileText size={16} style={{ color: '#2b579a' }} />
              Export Word
            </button>

            <button 
              type="button" 
              className="btn btn-primary" 
              onClick={handleExportExcel}
              title="Save back into the original Excel format"
            >
              <FileSpreadsheet size={16} />
              Export Excel
            </button>
          </div>

          {/* Actual Sheet Container */}
          <PreviewPane 
            employeeDetails={employeeDetails}
            items={items}
            advance={advance}
            totalReimbursement={totalReimbursement}
            totalInWords={totalInWords}
            previewRef={previewRef}
          />
        </div>
      </main>
    </div>
  );
}
