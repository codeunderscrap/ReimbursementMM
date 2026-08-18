/**
 * Converts a number to its Indian English word representation for currency.
 * E.g., 9411 -> "Nine Thousand Four Hundred Eleven Rupees Only"
 */
export function numberToWords(num) {
  if (num === null || num === undefined || isNaN(num)) return '';
  
  // Format to 2 decimal places to avoid floating point issues
  const value = parseFloat(num);
  if (value < 0) return 'Negative ' + numberToWords(Math.abs(value));
  
  const formatted = value.toFixed(2);
  const parts = formatted.split('.');
  const whole = parseInt(parts[0], 10);
  const paise = parseInt(parts[1], 10);
  
  if (whole === 0 && paise === 0) return 'Zero Rupees Only';
  
  const single = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 
    'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const double = [
    '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
  ];
  
  function convertWhole(n) {
    if (n === 0) return '';
    if (n < 20) return single[n];
    if (n < 100) return double[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + single[n % 10] : '');
    
    // Hundreds
    if (n < 1000) {
      return single[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + convertWhole(n % 100) : '');
    }
    
    // Thousands (up to 99,999)
    if (n < 100000) {
      return convertWhole(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 !== 0 ? ' ' + convertWhole(n % 1000) : '');
    }
    
    // Lakhs (up to 99,99,999)
    if (n < 10000000) {
      return convertWhole(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 !== 0 ? ' ' + convertWhole(n % 100000) : '');
    }
    
    // Crores
    return convertWhole(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 !== 0 ? ' ' + convertWhole(n % 10000000) : '');
  }
  
  let result = '';
  if (whole > 0) {
    result += convertWhole(whole) + ' Rupees';
  }
  
  if (paise > 0) {
    if (whole > 0) result += ' and ';
    result += convertWhole(paise) + ' Paise';
  }
  
  result += ' Only';
  return result;
}
