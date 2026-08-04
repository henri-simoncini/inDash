-- Dados de recebimento via Pix, usados para gerar o QR de cobrança.
-- Ficam no perfil do usuário, então herdam o RLS já existente.

create type public.pix_key_type as enum (
  'cpf',
  'cnpj',
  'email',
  'telefone',
  'aleatoria'
);

alter table public.profiles
  add column pix_key text,
  add column pix_key_type public.pix_key_type,
  -- Nome e cidade são exigidos pelo padrão EMV e aparecem para quem paga
  add column pix_name text,
  add column pix_city text;
