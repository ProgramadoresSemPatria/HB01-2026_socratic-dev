import type { Locale } from '@/lib/i18n'

export const STACK_OPTIONS = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'react', label: 'React' },
]

export const LANGUAGE_OPTIONS: readonly { value: Locale; label: string }[] = [
  { value: 'en', label: 'EN' },
  { value: 'pt', label: 'PT' },
]

export const copy = {
  en: {
    dateLocale: 'en-US',
    levelOptions: [
      { value: 'beginner', label: 'Beginner' },
      { value: 'intermediate', label: 'Intermediate' },
      { value: 'advanced', label: 'Advanced' },
    ],
    trackOptions: [
      { value: 'code', label: 'Code' },
      { value: 'design', label: 'System Design' },
    ],
    avatarAlt: 'Your avatar',
    yourProfile: 'Your profile',
    certificate: 'View my certificate',
    memberSince: 'Member since',
    statCompleted: 'Completed',
    statIndependence: 'Independence',
    statHints: 'Hints used',
    preferences: 'Preferences',
    prefsNote:
      'Your next challenges are based on these choices. Changes save automatically.',
    trackLabel: 'Track',
    trackDesc: 'What kind of challenges you get next.',
    trackPlaceholder: 'Pick a track',
    stackLabel: 'Stack',
    stackDesc: 'Language for code challenges.',
    stackPlaceholder: 'Pick a stack',
    difficultyLabel: 'Difficulty',
    difficultyDesc: 'How hard the next one should be.',
    levelPlaceholder: 'Pick a level',
    appearanceLabel: 'Appearance',
    appearanceDesc: 'Light, dark, or follow your system.',
    themeOptions: [
      { value: 'light', label: 'Light' },
      { value: 'dark', label: 'Dark' },
      { value: 'system', label: 'System' },
    ],
    languageLabel: 'Language',
    languageDesc: 'Interface language.',
    shareLabel: 'Community solutions',
    shareDesc:
      'Share your solutions on the "how others solved it" page, under a masked name. Only people who completed the challenge can see them.',
    shareOptions: [
      { value: 'on', label: 'On' },
      { value: 'off', label: 'Off' },
    ],
    redoSetup: 'Redo setup',
    signOut: 'Sign out',
    loadError: "Couldn't load your data.",
    retry: 'Retry',
  },
  pt: {
    dateLocale: 'pt-BR',
    levelOptions: [
      { value: 'beginner', label: 'Iniciante' },
      { value: 'intermediate', label: 'Intermediário' },
      { value: 'advanced', label: 'Avançado' },
    ],
    trackOptions: [
      { value: 'code', label: 'Código' },
      { value: 'design', label: 'System Design' },
    ],
    avatarAlt: 'Seu avatar',
    yourProfile: 'Seu perfil',
    certificate: 'Ver meu certificado',
    memberSince: 'Membro desde',
    statCompleted: 'Concluídos',
    statIndependence: 'Independência',
    statHints: 'Hints usados',
    preferences: 'Preferências',
    prefsNote:
      'Seus próximos desafios são baseados nessas escolhas. As alterações são salvas automaticamente.',
    trackLabel: 'Trilha',
    trackDesc: 'O tipo de desafio que você recebe.',
    trackPlaceholder: 'Escolher trilha',
    stackLabel: 'Stack',
    stackDesc: 'Linguagem dos desafios de código.',
    stackPlaceholder: 'Escolher stack',
    difficultyLabel: 'Dificuldade',
    difficultyDesc: 'O quão difícil deve ser o próximo.',
    levelPlaceholder: 'Escolher nível',
    appearanceLabel: 'Aparência',
    appearanceDesc: 'Claro, escuro ou seguir o sistema.',
    themeOptions: [
      { value: 'light', label: 'Claro' },
      { value: 'dark', label: 'Escuro' },
      { value: 'system', label: 'Sistema' },
    ],
    languageLabel: 'Idioma',
    languageDesc: 'Idioma da interface.',
    shareLabel: 'Soluções da comunidade',
    shareDesc:
      'Compartilhe suas soluções na página "como outros resolveram", com nome mascarado. Só quem completou o desafio consegue ver.',
    shareOptions: [
      { value: 'on', label: 'Ativo' },
      { value: 'off', label: 'Inativo' },
    ],
    redoSetup: 'Refazer setup',
    signOut: 'Sair',
    loadError: 'Não foi possível carregar seus dados.',
    retry: 'Tentar novamente',
  },
} as const
