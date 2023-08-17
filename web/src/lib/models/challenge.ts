export const availableCheckers = ['attachment', 'container']

export interface Challenge {
  id: number
  name: string
  content: string
  hidden: boolean
  game_id: number
  tag_id: number
  initial_score: number
  current_score: number
  minimum_score: number
  updated_at: number
  decay: number
  bucket: string
  checker: string
}

export interface ChallengeRepoInfo {
  last_commit_id: string
  last_commit_message: string
  config_file: string
}

export interface ChallengeStatus {
  solves: number
  score: number
  solved: boolean
}

export interface Tag {
  id: number
  name: string
}
