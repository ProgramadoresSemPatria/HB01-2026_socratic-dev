import type { ChallengeKind } from '@/domain/challenge-kinds'
import type { LevelId } from '@/domain/levels'

const CODE_SYSTEM = `Você gera desafios de programação realistas para uma plataforma de tutoria socrática.
Responda APENAS com um objeto JSON válido (sem markdown, sem comentários), com exatamente estas chaves:
{ "title": string, "description": string, "client_briefing": string, "intro": string, "initial_code": string, "tests_source": string }

Regras:
- title: curto e concreto. description: 1 frase do que implementar.
- client_briefing: 2 a 4 frases, com um cliente fictício e o FORMATO dos dados de entrada.
- intro: a primeira fala do tutor socrático — uma pergunta que faça o aluno pensar. NUNCA a resposta.
- initial_code: a(s) assinatura(s) da(s) função(ões) com "export", corpo vazio e comentários. SEM a solução. Código válido na linguagem da stack.
- tests_source: testes no formato test('nome', () => { expect(exports.NOME(args)).toBe(valor) }). Use exports.<funcao> para acessar a solução do aluno. Cubra os edge cases adequados ao nível.
- Tudo em português do Brasil. A DIFICULDADE deve seguir estritamente o nível pedido.`

const DESIGN_SYSTEM = `Você gera desafios de SYSTEM DESIGN (arquitetura de software) para uma plataforma de tutoria socrática, onde o aluno DESENHA a arquitetura num canvas — serviços, bancos de dados, filas, caches, APIs e como os dados fluem e são distribuídos. NÃO é design de UI/Figma e NÃO se escreve código.
Responda APENAS com um objeto JSON válido (sem markdown, sem comentários), com exatamente estas chaves:
{ "title": string, "description": string, "client_briefing": string, "intro": string }

Regras:
- title: curto e concreto (ex.: "Distribuir os dados de usuários entre serviços", "Arquitetura de um feed em tempo real").
- description: 1 frase do que o aluno deve ARQUITETAR no canvas.
- client_briefing: 3 a 5 frases com um cliente fictício, os requisitos (escala, latência, consistência) e os PASSOS do que desenhar (componentes/serviços, onde cada dado vive, como replica/particiona, o caminho de uma request), pedindo pra ligar com setas o fluxo dos dados.
- intro: a primeira fala do tutor socrático — uma pergunta que faça o aluno pensar antes de desenhar. NUNCA a resposta.
- Tudo em português do Brasil. Adeque a complexidade ao nível.`

const CODE_LEVEL: Record<LevelId, string> = {
  beginner:
    'Nível INICIANTE: variáveis, condicionais, loops, arrays e strings. UMA função simples, sem algoritmos complexos. 2 a 3 testes diretos.',
  intermediate:
    'Nível INTERMEDIÁRIO: estruturas de dados (Map/Set), manipulação de objetos e arrays, async/await, e vários edge cases. Problema realista de produto. 3 a 4 testes, incluindo casos de borda.',
  advanced:
    'Nível AVANÇADO, pegada de entrevista de BIG TECH (Google, Meta, Amazon): algoritmo ou estrutura de dados NÃO-trivial, exija complexidade de tempo/espaço ótima, e cubra muitos edge cases (entrada vazia, muito grande, duplicados, limites/overflow). Inspire-se em problemas estilo LeetCode Hard / entrevista FAANG, mas embrulhados num briefing de cliente realista. 4 a 6 testes, incluindo os casos de borda difíceis. O initial_code pode ter assinatura com a complexidade esperada no comentário.',
}

const DESIGN_LEVEL: Record<LevelId, string> = {
  beginner:
    'Nível INICIANTE: um serviço + um banco. Modelagem de dados simples, CRUD, onde guardar cada coisa. Sem distribuição complexa.',
  intermediate:
    'Nível INTERMEDIÁRIO: múltiplos serviços, cache, fila de mensagens, réplica de leitura. Trade-offs de consistência e latência.',
  advanced:
    'Nível AVANÇADO: alta escala — particionamento/sharding, distribuição e replicação de dados, consistência eventual, teorema CAP, multi-região e gargalos.',
}

export function challengeSystem(kind: ChallengeKind): string {
  return kind === 'design' ? DESIGN_SYSTEM : CODE_SYSTEM
}

export function levelGuide(kind: ChallengeKind, level: LevelId): string {
  return (kind === 'design' ? DESIGN_LEVEL : CODE_LEVEL)[level]
}
