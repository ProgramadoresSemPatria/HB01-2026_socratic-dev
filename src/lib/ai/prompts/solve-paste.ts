import type { ChallengeKind } from '@/domain/challenge-kinds'

const CODE_SYS = `Você resolve um desafio de programação. Sua solução DEVE passar em TODOS os testes fornecidos pelo usuário — esses testes são a verdade do desafio. Retorne APENAS o código da solução final, completo e correto, na linguagem da stack, com "export" nas funções pedidas. SEM markdown, SEM cercas de código, SEM explicação — somente o código que vai direto no editor.`

const DESIGN_SYS = `Você resolve um desafio de SYSTEM DESIGN (arquitetura) gerando um diagrama PROFISSIONAL e didático.
Responda APENAS com JSON válido (sem markdown):
{ "nodes": [{ "id": string, "label": string, "type": string, "note": string }], "edges": [{ "from": string, "to": string, "label": string }] }

Regras de CONTEÚDO:
- nodes: 5 a 7 componentes. "type" DEVE ser um de: "client","gateway","service","database","cache","queue","storage","external".
- "label": 1 a 2 palavras (ex.: "API", "Auth", "Postgres", "Redis"). NUNCA inclua nomes de pessoas (Maria, João, Thiago) nos labels nem nas notes — esses nomes vêm do briefing mas o diagrama é genérico.
- "note": MÁXIMO 3 palavras, descritivo, sem o nome do componente (ex.: "valida tokens", "guarda pedidos", "leitura rápida"). NUNCA frases longas.
- edges: "label" = 1 palavra de ação (ex.: "envia", "consulta", "salva", "publica"). from/to = ids existentes.

Regras de ESTRUTURA (essenciais pra ficar legível):
- Sempre tenha PELO MENOS UMA camada com 2+ nós lado a lado (ex.: cache + database na mesma linha embaixo, ou 2 services no meio). Isso quebra a coluna única que fica feia.
- Use VÁRIOS tipos diferentes pra formar 3 a 5 camadas distintas: client (topo) → gateway/auth → services → fila/cache → database/storage (base).
- NÃO crie arestas que pulam etapas (cliente direto pro banco) — sempre passe pela camada do meio.
- Inclua pelo menos um banco de dados ("database" ou "storage") na base.
- Português do Brasil, tom de tech lead resolvendo um problema real.`

export function solvePasteSystem(kind: ChallengeKind): string {
  return kind === 'design' ? DESIGN_SYS : CODE_SYS
}
