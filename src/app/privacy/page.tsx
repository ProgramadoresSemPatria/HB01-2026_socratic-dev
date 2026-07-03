'use client'

import { Navbar } from '@/components/navbar'
import { useT } from '@/lib/i18n'

const copy = {
  en: {
    eyebrow: 'Legal',
    title: 'Privacy Policy',
    effective: 'Effective July 3, 2026',
    intro:
      'Socratic.dev is operated by Borderless Coding Labs. This policy explains what data we collect, why we collect it, and who touches it. Plain language, no surprises.',
    sections: [
      {
        h: '1. What we collect',
        body: [
          'Account data: your email and password, used for authentication.',
          'Preferences: your learning track, stack, level, language, and theme.',
          'Your work on challenges: the code you write, the diagrams you draw, and the messages you exchange with the tutor.',
          'Usage metrics: hints used, independence score, and time spent on challenges.',
          'Technical data: error reports and basic device information, used for debugging.',
        ],
      },
      {
        h: '2. How we use it',
        body: [
          'We use this data to operate the AI tutor, save your progress, improve the product, and keep the platform secure and free of abuse. That is it.',
        ],
      },
      {
        h: '3. Who we share it with',
        body: [
          'We rely on a small set of processors to run the service. Supabase (AWS us-east-1) hosts our database and authentication. Vercel hosts the application.',
          'Anthropic powers the tutor: the challenge text, your code, diagrams, and tutor messages are sent to the Claude API to generate responses. Under the commercial terms we use, Anthropic does not train models on this data.',
          'PostHog handles product analytics (US region), and Sentry handles error monitoring and session replay for debugging.',
          'We do not sell your data. Ever.',
        ],
      },
      {
        h: '4. Cookies and local storage',
        body: [
          'We use cookies and local storage for your login session, your language and theme preferences, and analytics. Nothing beyond what the product needs to work.',
        ],
      },
      {
        h: '5. Retention',
        body: [
          'We keep your data for as long as your account exists. You can ask us to delete it at any time and we will remove it.',
        ],
      },
      {
        h: '6. Your rights (LGPD)',
        body: [
          'Under Brazil’s LGPD you can request access to your data, correction, deletion, and portability. To exercise any of these rights, write to luizrenan179@gmail.com and we will respond.',
        ],
      },
      {
        h: '7. Children',
        body: [
          'Socratic.dev is not directed at children under 13, and we do not knowingly collect data from them.',
        ],
      },
      {
        h: '8. Changes',
        body: [
          'When this policy changes, we publish the updated version on this page. Material changes will be flagged clearly.',
        ],
      },
    ],
  },
  pt: {
    eyebrow: 'Legal',
    title: 'Política de Privacidade',
    effective: 'Vigente desde 3 de julho de 2026',
    intro:
      'O Socratic.dev é operado pela Borderless Coding Labs. Esta política explica quais dados coletamos, por que coletamos e quem tem acesso a eles. Linguagem simples, sem surpresas.',
    sections: [
      {
        h: '1. O que coletamos',
        body: [
          'Dados de conta: seu email e senha, usados para autenticação.',
          'Preferências: sua trilha de aprendizado, stack, nível, idioma e tema.',
          'Seu trabalho nos desafios: o código que você escreve, os diagramas que desenha e as mensagens que troca com o tutor.',
          'Métricas de uso: hints usados, score de independência e tempo gasto nos desafios.',
          'Dados técnicos: relatórios de erro e informações básicas do dispositivo, usados para debug.',
        ],
      },
      {
        h: '2. Para que usamos',
        body: [
          'Usamos esses dados para operar o tutor de IA, salvar seu progresso, melhorar o produto e manter a plataforma segura e livre de abuso. Só isso.',
        ],
      },
      {
        h: '3. Com quem compartilhamos',
        body: [
          'Dependemos de um conjunto pequeno de operadores para rodar o serviço. O Supabase (AWS us-east-1) hospeda nosso banco de dados e a autenticação. A Vercel hospeda a aplicação.',
          'A Anthropic alimenta o tutor: o texto dos desafios, seu código, diagramas e mensagens ao tutor são enviados à API do Claude para gerar as respostas. Sob os termos comerciais que usamos, a Anthropic não treina modelos com esses dados.',
          'O PostHog cuida do analytics de produto (região US), e o Sentry cuida do monitoramento de erros e replay de sessão para debug.',
          'Não vendemos seus dados. Nunca.',
        ],
      },
      {
        h: '4. Cookies e armazenamento local',
        body: [
          'Usamos cookies e armazenamento local para sua sessão de login, suas preferências de idioma e tema, e analytics. Nada além do que o produto precisa para funcionar.',
        ],
      },
      {
        h: '5. Retenção',
        body: [
          'Mantemos seus dados enquanto sua conta existir. Você pode pedir a exclusão a qualquer momento e nós removeremos tudo.',
        ],
      },
      {
        h: '6. Seus direitos (LGPD)',
        body: [
          'Pela LGPD, você pode solicitar acesso aos seus dados, correção, exclusão e portabilidade. Para exercer qualquer um desses direitos, escreva para luizrenan179@gmail.com e responderemos.',
        ],
      },
      {
        h: '7. Crianças',
        body: [
          'O Socratic.dev não é direcionado a menores de 13 anos, e não coletamos dados deles de forma consciente.',
        ],
      },
      {
        h: '8. Mudanças',
        body: [
          'Quando esta política mudar, publicaremos a versão atualizada nesta página. Mudanças materiais serão sinalizadas com clareza.',
        ],
      },
    ],
  },
}

export default function PrivacyPage() {
  const t = useT(copy)
  return (
    <div className='bg-background relative flex min-h-screen flex-col'>
      <Navbar />
      <main className='container-main flex-1 pt-[120px] pb-24 md:pb-32'>
        <div className='max-w-2xl'>
          <p className='text-muted-foreground font-mono text-[11px] tracking-[0.14em] uppercase'>
            {t.eyebrow}
          </p>
          <h1 className='font-heading text-ink mt-3 text-[32px] leading-none font-light tracking-[-0.03em] sm:text-[40px]'>
            {t.title}
          </h1>
          <p className='text-muted-foreground mt-4 font-mono text-[11px] tracking-[0.14em] uppercase'>
            {t.effective}
          </p>
          <p className='text-muted-foreground mt-8 text-[15px] leading-relaxed'>
            {t.intro}
          </p>
          <div className='mt-12 flex flex-col gap-10'>
            {t.sections.map((s) => (
              <section key={s.h} className='border-border border-t pt-8'>
                <h2 className='font-heading text-ink text-[22px] leading-tight font-light tracking-[-0.02em]'>
                  {s.h}
                </h2>
                {s.body.map((p) => (
                  <p
                    key={p}
                    className='text-muted-foreground mt-4 text-[15px] leading-relaxed'
                  >
                    {p}
                  </p>
                ))}
              </section>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
