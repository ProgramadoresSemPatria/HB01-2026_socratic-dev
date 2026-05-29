export type { RunnerLanguage } from '@/domain/stacks'

export type LogLevel = 'log' | 'info' | 'warn' | 'error'

export interface RunLog {
  level: LogLevel
  text: string
}

export interface TestResult {
  name: string
  passed: boolean
  message?: string
}

export interface RunResult {
  logs: RunLog[]
  error?: string
  tests: TestResult[]
  ok: boolean
  durationMs: number
}

export interface RunRequest {
  code: string
  language: import('@/domain/stacks').RunnerLanguage
  testsSource?: string
}
