export type ChatRole = 'user' | 'ai'

export interface ChatMsg {
  role: ChatRole
  text: string
  hintLevel?: 1 | 2 | 3
}
