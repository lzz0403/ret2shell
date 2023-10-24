export interface Submission {
  id: number
  created_at: number
  user_id: number
  challenge_id: number
  content: string
  solved: boolean
  team_id: number | null
}

export interface SubmissionOnlyUserInfo {
  id: number
  created_at: number
  user_id: number
  user_name: string
}

export interface SubmissionOnlyTeamInfo {
  id: number
  created_at: number
  team_id: number
  team_name: string
}
