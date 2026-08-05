# inDash

Painel de gestão para freelancers: serviços, clientes, agenda, projetos e pagamentos em um lugar só.

**[Ver online →](https://in-dash.vercel.app)**

---

## O problema

Quem trabalha por conta acaba com o negócio espalhado: o combinado está no WhatsApp, o preço numa planilha, o prazo na memória e o "já me pagou?" na conversa do banco. O inDash junta isso num painel — você cadastra o serviço, define os fatores que alteram o preço, agenda o cliente, quebra o projeto em tarefas e registra o pagamento, com QR Code Pix gerado na hora.

## O que faz

**Serviços e preço**
Serviços com preço base e fatores multiplicativos (complexidade, prazo, personalizados). O preço final sai do preço base multiplicado pelos fatores escolhidos.

**Clientes**
Cadastro com busca, arquivamento e link direto para o WhatsApp a partir do telefone.

**Projetos**
Quadro por status (agendado, em andamento, finalizado, cancelado), TO-DO list por projeto com progresso em porcentagem e observação livre por tarefa. Um projeto só é finalizado com todas as tarefas concluídas.

**Agenda**
Calendário mensal dos projetos agendados, com lista alternativa no celular, e um painel de prazos próximos que não depende do mês navegado.

**Financeiro**
Registro de pagamentos por projeto, gráfico de ganhos por dia, semana, mês ou ano, e **cobrança via Pix**: o QR Code é gerado dentro do próprio projeto a partir da sua chave, já com o valor que falta receber.

**Estatísticas**
Recebido total e no mês com variação, a receber, ticket médio, projetos por status, taxa de entrega no prazo, recebimentos separados por forma de pagamento e serviço mais vendido.

**Configurações**
Tema, tamanho e estilo de fonte, alto contraste, chave Pix, senha e sons da interface.

## Stack

| Camada | Escolha |
| --- | --- |
| Framework | Next.js 16 (App Router, Turbopack) · React 19 · TypeScript |
| Estilo | Tailwind CSS v4 · shadcn/ui sobre [Base UI](https://base-ui.com) |
| Banco e auth | Supabase (Postgres + Auth + RLS) |
| Formulários | React Hook Form · Zod |
| Gráficos | Recharts |
| Animação | anime.js (scroll) · ogl (fundo WebGL do hero) |
| Fontes | Jersey 10 · Barlow · Kode Mono · Source Serif 4, via `next/font` |

## Rodando localmente

### Pré-requisitos

- Node.js 20.9 ou superior
- Uma conta no [Supabase](https://supabase.com) — o plano gratuito basta

### 1. Instale as dependências

```bash
npm install
```

### 2. Crie o banco

No painel do Supabase, crie um projeto e rode as migrations de `supabase/migrations/` **em ordem de nome**, colando cada arquivo no SQL Editor:

```
20260717120000_initial_schema.sql   -- tabelas, enums, triggers e RLS
20260803120000_pix_recebimento.sql  -- dados de recebimento via Pix
20260805120000_task_notes.sql       -- observação nas tarefas
```

Com a [CLI do Supabase](https://supabase.com/docs/guides/cli) instalada, dá para aplicar tudo de uma vez:

```bash
supabase db push
```

### 3. Configure as variáveis

```bash
cp .env.example .env.local
```

Preencha com os valores de **Settings → API** do seu projeto:

```
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
```

> Cole **apenas o valor**, sem o nome da variável junto. Uma URL malformada derruba o login com `Invalid supabaseUrl`.

### 4. Login com Google (opcional)

O login por email e senha funciona sem configuração extra. Para o botão do Google, ative o provedor em **Authentication → Providers → Google** no Supabase e registre o Client ID e o Secret do Google Cloud Console.

### 5. Rode

```bash
npm run dev
```

Abra [localhost:3000](http://localhost:3000).

## Scripts

```bash
npm run dev     # desenvolvimento
npm run build   # build de produção (roda o type check)
npm run start   # sobe o build
npm run lint    # ESLint
```

## Estrutura

```
app/
  (auth)/            login, cadastro e recuperação de senha
  dashboard/         área logada — uma pasta por seção, com suas server actions
  page.tsx           landing page
components/
  landing/           hero, seções e efeitos da landing
  ui/                shadcn/ui
  <domínio>/         projects, clients, finance, agenda, settings...
lib/
  supabase/          clients de servidor e navegador, validação de config
  validations/       schemas Zod, um por domínio
  pix.ts             geração do BR Code (EMV + CRC16)
supabase/migrations/ schema versionado
proxy.ts             renovação de sessão a cada request
```

## Decisões técnicas

**RLS em todas as tabelas.** A segurança está no banco, não só na aplicação: cada policy filtra por `user_id`, então uma consulta que escape de um filtro no código ainda assim não devolve dados de outro usuário.

**Snapshot dos fatores no projeto.** Ao criar um projeto, o valor de cada fator multiplicativo é copiado para `project_multipliers.factor_snapshot`. Reajustar um fator depois vale para os projetos novos, mas não reescreve o preço dos antigos.

**Pix sem serviço externo.** O BR Code segue o padrão EMV com CRC16-CCITT, calculado dentro do próprio projeto — sem chave de API, sem dependência de terceiros e sem enviar o valor da cobrança para fora.

**O proxy falha aberto.** Se a renovação de sessão quebra (configuração ausente, Supabase fora do ar), a requisição segue em vez de derrubar o site inteiro. É seguro porque o layout da área logada revalida a sessão e o RLS protege os dados de qualquer forma.

**Server Components por padrão.** As páginas buscam dados no servidor; `"use client"` aparece só onde há estado ou evento. As mutações são Server Actions, validadas com Zod nos dois lados.

**A landing tem identidade fixa.** Ela não segue o tema nem a fonte escolhidos na conta — é material de apresentação, e mudar de cara conforme a preferência de quem já é usuário não faria sentido.

**Movimento é opcional.** Os fundos WebGL e as animações de scroll respeitam `prefers-reduced-motion`, e os sons de clique e digitação podem ser desligados em Configurações.

---

made by Henrique Simoncini
