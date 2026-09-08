export function formatRupiah(amount: number): string {
  if (typeof amount !== 'number' || isNaN(amount)) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatStock(stock: number, unit: string): string {
  const cleanStock = Number(stock) || 0;
  const isKg = (unit || '').toLowerCase().trim() === 'kg' || (unit || '').toLowerCase().trim() === 'kilogram';
  if (isKg) {
    const whole = Math.floor(cleanStock);
    const frac = Math.round((cleanStock - whole) * 100) / 100;
    let fracStr = '';
    if (frac === 0.25) fracStr = '1/4';
    else if (frac === 0.5) fracStr = '1/2';
    else if (frac === 0.75) fracStr = '3/4';
    else if (frac > 0) fracStr = `${frac}`;

    if (whole > 0 && fracStr) return `${whole} ${fracStr} kg`;
    if (fracStr) return `${fracStr} kg`;
    return `${whole} kg`;
  }
  const formatted = cleanStock % 1 === 0 ? cleanStock.toString() : cleanStock.toFixed(1).replace('.0', '');
  return `${formatted} ${unit || 'pcs'}`;
}

export function formatQty(qty: number, unit: string): string {
  const cleanQty = Number(qty) || 0;
  const isKg = (unit || '').toLowerCase().trim() === 'kg' || (unit || '').toLowerCase().trim() === 'kilogram';

  if (isKg) {
    const whole = Math.floor(cleanQty);
    const frac = Math.round((cleanQty - whole) * 100) / 100;

    let fracStr = '';
    if (frac === 0.25) fracStr = '1/4';
    else if (frac === 0.5) fracStr = '1/2';
    else if (frac === 0.75) fracStr = '3/4';
    else if (frac > 0) fracStr = `${frac}`;

    if (whole > 0 && fracStr) {
      return `${whole} ${fracStr} kg`;
    }
    if (fracStr) {
      return `${fracStr} kg`;
    }
    return `${whole} kg`;
  }

  const formatted = cleanQty % 1 === 0 ? cleanQty.toString() : cleanQty.toFixed(2).replace(/\.?0+$/, '');
  return `${formatted} ${unit || 'pcs'}`;
}

export function cleanPhone(phone: string): string {
  if (!phone) return '';
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.substring(1);
  } else if (!cleaned.startsWith('62')) {
    cleaned = '62' + cleaned;
  }
  return cleaned;
}
