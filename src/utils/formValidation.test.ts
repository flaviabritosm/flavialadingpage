import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildMailtoHref,
  getScopeLabel,
  validateProposalForm,
} from './formValidation';

test('validateProposalForm rejects short or invalid fields', () => {
  const errors = validateProposalForm({
    name: 'A',
    contact: 'invalido',
    brand: '',
    scope: 'gestao-estrategica',
    message: 'oi',
  });
  assert.ok(errors.name);
  assert.ok(errors.contact);
  assert.ok(errors.message);
});

test('validateProposalForm accepts valid email or WhatsApp contact', () => {
  assert.deepEqual(
    validateProposalForm({
      name: 'Mariana',
      contact: 'mariana@estudiomar.com.br',
      brand: '@estudiomar',
      scope: 'gestao-estrategica',
      message: 'Quero estruturar o posicionamento da nossa marca autoral.',
    }),
    {}
  );

  assert.deepEqual(
    validateProposalForm({
      name: 'Lucas',
      contact: '(11) 98765-4321',
      brand: 'Casa Norte',
      scope: 'identidade-visual',
      message: 'Buscamos identidade visual avulsa para lançamento.',
    }),
    {}
  );
});

test('buildMailtoHref includes recipient, scope, and brand details', () => {
  const href = buildMailtoHref({
    name: 'Camila',
    contact: 'camila@atelie.com',
    brand: 'Ateliê Rosa',
    scope: 'completo',
    message: 'Precisamos organizar calendário e posicionamento.',
  });
  assert.ok(href.startsWith('mailto:flaviabritoconsultora@gmail.com?'));
  assert.ok(href.includes('Ateli%C3%AA%20Rosa'));
  assert.ok(getScopeLabel('identidade-visual').includes('serviço avulso'));
});
