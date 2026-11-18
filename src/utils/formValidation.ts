export type ServiceScope =
  | 'gestao-estrategica'
  | 'identidade-visual'
  | 'completo';

export interface ProposalFormValues {
  name: string;
  contact: string;
  brand: string;
  scope: ServiceScope;
  message: string;
}

export interface ProposalFormErrors {
  name?: string;
  contact?: string;
  message?: string;
}

export function validateProposalForm(
  values: ProposalFormValues
): ProposalFormErrors {
  const errors: ProposalFormErrors = {};
  const trimmedName = values.name.trim();
  const trimmedContact = values.contact.trim();
  const trimmedMessage = values.message.trim();

  if (trimmedName.length < 2) {
    errors.name = 'Informe seu nome para podermos iniciar a conversa.';
  }

  const looksLikeEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedContact);
  const digitsCount = trimmedContact.replace(/\D/g, '').length;
  const looksLikePhone = digitsCount >= 8 && digitsCount <= 15;

  if (!looksLikeEmail && !looksLikePhone) {
    errors.contact = 'Informe um e-mail válido ou telefone/WhatsApp com DDD.';
  }

  if (trimmedMessage.length < 10) {
    errors.message = 'Conte brevemente sobre sua marca ou desafio atual.';
  }

  return errors;
}

export function getScopeLabel(scope: ServiceScope): string {
  switch (scope) {
    case 'gestao-estrategica':
      return 'Gestão estratégica de conteúdo (contrato mínimo 6 meses)';
    case 'identidade-visual':
      return 'Identidade visual (serviço avulso)';
    case 'completo':
      return 'Gestão estratégica + Identidade visual';
  }
}

export function buildMailtoHref(values: ProposalFormValues): string {
  const subject = encodeURIComponent(
    `Proposta de Estratégia — ${values.brand.trim() || values.name.trim()}`
  );
  const body = encodeURIComponent(
    [
      `Nome: ${values.name.trim()}`,
      `Contato: ${values.contact.trim()}`,
      `Marca / @: ${values.brand.trim() || 'Não informado'}`,
      `Interesse: ${getScopeLabel(values.scope)}`,
      '',
      'Sobre a marca:',
      values.message.trim(),
    ].join('\n')
  );
  return `mailto:flaviabritoconsultora@gmail.com?subject=${subject}&body=${body}`;
}
