import { Guest } from './bajamba-data';

/**
 * Normalizes Indonesian phone numbers into international E.164 format without '+'
 * Example: 0812-3456-7890 -> 6281234567890
 */
export function normalizeIndonesianPhone(phone: string): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('62')) {
    return digits;
  }
  if (digits.startsWith('0')) {
    return `62${digits.slice(1)}`;
  }
  if (digits.startsWith('8')) {
    return `62${digits}`;
  }
  return digits;
}

/**
 * Generates the web link to view the ticket directly
 */
export function getTicketPublicUrl(ticketCode: string): string {
  if (typeof window !== 'undefined' && window.location.origin) {
    return `${window.location.origin}/?tab=register&ticket=${encodeURIComponent(ticketCode)}`;
  }
  return `https://makanbajamba-sawahlunto.id/?ticket=${encodeURIComponent(ticketCode)}`;
}

/**
 * Formats a concise WhatsApp message containing participant name, ticket code, and barcode link
 * as requested: "Pesan ringkas berisi kode tiket dan link saja"
 */
export function formatConciseTicketMessage(guest: Guest): string {
  const ticketUrl = getTicketPublicUrl(guest.ticketCode);

  return (
    `Halo *${guest.name}*,\n\n` +
    `Berikut adalah E-Tiket Resmi Acara *Makan Bajamba Sawahlunto* Anda:\n` +
    `• Kode Tiket: *${guest.ticketCode}*\n` +
    `• Link E-Tiket & Barcode: ${ticketUrl}\n\n` +
    `_Silakan buka link di atas untuk melihat barcode/QR Code dan tunjukkan kepada panitia saat tiba di lokasi._`
  );
}

/**
 * Generates the full WhatsApp Click-to-Chat URL
 * https://wa.me/{phone}?text={encodedText}
 */
export function generateWhatsAppTicketLink(guest: Guest): string {
  const cleanPhone = normalizeIndonesianPhone(guest.phone);
  const message = formatConciseTicketMessage(guest);
  const encodedText = encodeURIComponent(message);

  if (cleanPhone) {
    return `https://wa.me/${cleanPhone}?text=${encodedText}`;
  }
  return `https://wa.me/?text=${encodedText}`;
}

/**
 * Opens the WhatsApp Click-to-Chat link in a new window/tab safely
 */
export function openWhatsAppTicket(guest: Guest): void {
  const waUrl = generateWhatsAppTicketLink(guest);
  if (typeof window !== 'undefined') {
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  }
}
