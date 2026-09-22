import { describe, expect, it } from 'vitest';
import { buildWhatsAppLink, buildWhatsAppReminderMessage } from '../reminders';

describe('WhatsApp & Email Reminders Engine', () => {
  it('should format WhatsApp reminder text with currency and invoice details', () => {
    const msg = buildWhatsAppReminderMessage(
      'Apex Traders',
      'INV-2026-081',
      12500,
      '2026-09-30'
    );

    expect(msg).toContain('Apex Traders');
    expect(msg).toContain('INV-2026-081');
    expect(msg).toContain('₹12,500');
  });

  it('should generate a valid WhatsApp API web link', () => {
    const link = buildWhatsAppLink('9845012345', 'Hello World');

    expect(link).toContain('https://api.whatsapp.com/send?phone=919845012345');
    expect(link).toContain('text=Hello%20World');
  });
});
