import test from 'node:test';
import assert from 'node:assert/strict';
import { WHATSAPP_CTA_URL } from './cta.ts';

test('WhatsApp CTA URL points to official WhatsApp endpoint with exact phone and quote text', () => {
  assert.equal(
    WHATSAPP_CTA_URL,
    'https://api.whatsapp.com/send/?phone=558594198966&text=Ol%C3%A1%2C+vim+da+sua+p%C3%A1gina+e+gostaria+de+um+or%C3%A7amento+para+a+minha+marca&type=phone_number&app_absent=0'
  );

  const url = new URL(WHATSAPP_CTA_URL);
  assert.equal(url.origin, 'https://api.whatsapp.com');
  assert.equal(url.searchParams.get('phone'), '558594198966');
  assert.equal(
    url.searchParams.get('text'),
    'Olá, vim da sua página e gostaria de um orçamento para a minha marca'
  );
  assert.equal(url.searchParams.get('type'), 'phone_number');
  assert.equal(url.searchParams.get('app_absent'), '0');
});
