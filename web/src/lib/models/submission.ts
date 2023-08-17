export interface Submission {
  id: number
  created_at: number
  user_id: number
  challenge_id: number
  content: string
  solved: boolean
  with_score: boolean
}
