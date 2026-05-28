-- The first "design" challenges were UI design system (tokens/components),
-- which belongs in Figma. Replace them with SYSTEM DESIGN (architecture)
-- challenges — the intended track (how to distribute data, services, etc.).

update public.challenges set
  title = 'Distribuir os dados de usuários',
  description = 'Desenhe como armazenar e distribuir os dados de milhões de usuários entre serviços.',
  client_briefing = $b$A NuBlue cresceu para milhões de usuários e o banco único não aguenta mais.

Desenhe no canvas como distribuir os dados de usuário e ligue com setas o fluxo:
1. Os serviços e quem acessa o quê.
2. Onde os dados vivem: banco principal (escrita), réplicas de leitura, cache.
3. Como particionar/shardar os usuários para escalar.
4. O caminho de uma LEITURA e de uma ESCRITA — e onde estava o gargalo.$b$,
  intro = $i$Olá. Antes de desenhar: o que cresce mais rápido aqui — as leituras ou as escritas? Por que isso muda onde você coloca cache e réplica?$i$
where title = 'Tokens de cor para dark mode';

update public.challenges set
  title = 'Arquitetura de um encurtador de URL',
  description = 'Desenhe a arquitetura de um encurtador de URL (tipo bit.ly) que aguente escala.',
  client_briefing = $b$Uma startup quer lançar um encurtador de URL como o bit.ly.

Desenhe a arquitetura no canvas e ligue o fluxo com setas:
1. O serviço de API e o banco que guarda o mapeamento código → URL longa.
2. Como gerar o código curto (e evitar colisão).
3. O caminho de CRIAR um link.
4. O caminho de REDIRECIONAR (que é o mais acessado) — e onde um cache ajudaria.$b$,
  intro = $i$Olá. Pra começar: quando alguém acessa o link curto, o que precisa acontecer e em quantos passos? Onde esse dado está guardado?$i$
where title = 'Anatomia de um componente Botão';
