insert into public.challenges (title, description, stack, level, client_briefing) values

(
  'API de controle de estoque',
  'Crie uma função que retorne os produtos que vencem em até 3 dias a partir de hoje.',
  'typescript',
  'beginner',
  'Seu Zé tem uma padaria de bairro. Hoje, joga pão fora todo dia porque esquece o que está perto do vencimento. Ele te pediu uma função que retorne os produtos que vencem em até 3 dias a partir de hoje. Só isso. Sem frontend, sem nada chique. Cada produto tem { nome, expiresAt } onde expiresAt é uma data no formato YYYY-MM-DD.'
),

(
  'Carrinho de e-commerce',
  'Implemente as funções de adicionar, remover e calcular total de um carrinho de compras.',
  'javascript',
  'beginner',
  'A Moda Aurora é uma loja de roupas que quer lançar seu primeiro e-commerce. A dona pediu algo simples: um carrinho que permita adicionar produtos, remover produtos e calcular o total com desconto. Cada produto tem { id, nome, preco, quantidade }. O desconto é de 10% quando o total passa de R$ 200.'
),

(
  'Sistema de autenticação com JWT',
  'Implemente funções de geração e validação de tokens JWT sem usar bibliotecas externas.',
  'typescript',
  'intermediate',
  'A Clínica Vitalis precisa de um sistema de login seguro para seu portal de pacientes. O tech lead quer que você entenda JWT de verdade, sem depender de libs que escondem a mágica. Implemente: geração de token com payload e expiração, validação de assinatura, e extração de dados do token. Use apenas crypto nativo do Node.'
);
