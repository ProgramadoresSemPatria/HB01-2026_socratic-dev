-- Code-runner fields the app needs per challenge (not in the original schema).
alter table public.challenges
  add column if not exists initial_code text not null default '',
  add column if not exists tests_source text not null default '',
  add column if not exists intro text not null default '';

-- Populate the seeded challenges with starter code, tests, and the tutor's opener.

update public.challenges set
  intro = $i$Olá. Antes de começar, leia o briefing à esquerda. Pensando no problema: que método de Array devolve só os elementos que satisfazem uma condição?$i$,
  initial_code = $c$// Cada produto tem { nome, expiresAt } onde expiresAt é 'YYYY-MM-DD'.

export function expiringProducts(produtos, hoje) {
  // devolva apenas os produtos que vencem em até 3 dias a partir de 'hoje'

}
$c$,
  tests_source = $t$const hoje = new Date('2026-05-27').getTime()
const produtos = [
  { nome: 'Pão francês', expiresAt: '2026-05-29' },
  { nome: 'Croissant', expiresAt: '2026-05-30' },
  { nome: 'Bolo de cenoura', expiresAt: '2026-06-15' },
  { nome: 'Torta', expiresAt: '2026-05-27' },
]
test('retorna os 3 que vencem em até 3 dias', () => {
  expect(exports.expiringProducts(produtos, hoje).length).toBe(3)
})
test('exclui o que vence depois de 3 dias', () => {
  expect(exports.expiringProducts(produtos, hoje).find((p) => p.nome === 'Bolo de cenoura')).toBe(undefined)
})
test('lista vazia devolve lista vazia', () => {
  expect(exports.expiringProducts([], hoje).length).toBe(0)
})
$t$
where title = 'API de controle de estoque';

update public.challenges set
  intro = $i$Olá. Leia o briefing. Antes de codar: como você representaria o carrinho — um array de itens? E o total, como soma preço × quantidade?$i$,
  initial_code = $c$// Cada produto: { id, nome, preco, quantidade }
// Desconto de 10% quando o total passa de 200.

export function total(carrinho) {

}
$c$,
  tests_source = $t$test('soma preço × quantidade', () => {
  expect(exports.total([{ id: 1, nome: 'a', preco: 50, quantidade: 2 }])).toBe(100)
})
test('aplica 10% de desconto acima de 200', () => {
  expect(exports.total([{ id: 1, nome: 'a', preco: 150, quantidade: 2 }])).toBe(270)
})
test('carrinho vazio total 0', () => {
  expect(exports.total([])).toBe(0)
})
$t$
where title = 'Carrinho de e-commerce';

update public.challenges set
  intro = $i$Olá. JWT tem 3 partes separadas por ponto: header.payload.signature. Antes de codar: o que cada parte guarda, e o que exatamente a assinatura protege?$i$,
  initial_code = $c$// Implemente geração e validação de um token simples (header.payload.signature).
// Use Web Crypto (crypto.subtle) para a assinatura HMAC.

export async function sign(payload, secret) {

}

export async function verify(token, secret) {

}
$c$
where title = 'Sistema de autenticação com JWT';
