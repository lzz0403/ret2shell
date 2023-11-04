export interface Submission {
  id: number
  created_at: number
  user_id: number
  challenge_id: number
  content: string
  solved: boolean
  team_id: number | null
}

export interface SubmissionWithInfo {
  id: number
  created_at: number
  user_id: number
  user_name: string
  challenge_id: number
  challenge_name: string
  game_id: number
  tag_id: number
  tag_name: number
  content: string
  solved: boolean
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
