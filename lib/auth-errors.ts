import type { AuthError } from "@supabase/supabase-js";

// Mensagens específicas para os erros que o usuário consegue agir em cima.
const MESSAGES: Record<string, string> = {
  user_already_exists: "Já existe uma conta com esse email.",
  email_exists: "Já existe uma conta com esse email.",
  weak_password: "Senha muito fraca. Use pelo menos 6 caracteres.",
  over_email_send_rate_limit:
    "Limite de emails atingido. Aguarde alguns minutos e tente de novo.",
  over_request_rate_limit:
    "Muitas tentativas em pouco tempo. Aguarde alguns minutos.",
  email_provider_disabled:
    "O cadastro por email está desativado no Supabase deste projeto.",
  signup_disabled: "Os cadastros estão desativados neste projeto.",
  email_address_invalid: "Esse email não é aceito. Tente outro.",
  email_not_confirmed:
    "Confirme seu email antes de entrar — procure a mensagem na caixa de entrada.",
  invalid_credentials: "Email ou senha incorretos.",
  validation_failed: "Dados inválidos. Confira os campos.",
};

/**
 * Traduz o erro do Supabase. Sem correspondência, devolve a mensagem original
 * junto do código — engolir o motivo real só torna o problema indiagnosticável.
 */
export function authErrorMessage(error: AuthError, fallback: string) {
  if (error.code && MESSAGES[error.code]) {
    return MESSAGES[error.code];
  }

  const detail = [error.message, error.code && `código: ${error.code}`]
    .filter(Boolean)
    .join(" · ");

  return detail ? `${fallback} (${detail})` : fallback;
}
