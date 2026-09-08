export type Role = 'seeker' | 'recruiter' | 'admin'

export type UserStatus = 'active' | 'suspended' | 'deleted'

export interface PublicUser {
  id: string
  firstName: string
  lastName: string
  mail: string
  phone: string | null
  role: Role
  status: UserStatus
  createdAt: string
}

export interface AuthResponse {
  token: string
  user: PublicUser
}

export interface SignupInput {
  firstName: string
  lastName: string
  mail: string
  phone?: string
  password: string
  role: 'seeker' | 'recruiter'
  location?: string
  targetSector?: string
}

export interface LoginInput {
  mail: string
  password: string
}

export interface Profile {
  id: string
  firstName: string
  lastName: string
  mail: string
  phone: string | null
  age: number | null
  location: string | null
  targetSector: string | null
  employmentType:
    | 'full_time'
    | 'part_time'
    | 'freelance'
    | 'internship'
    | null
  workMode: 'on_site' | 'hybrid' | 'remote' | null
  experienceYears: number | null
  certificationRate: number
  bio: string | null
  role: Role
  status: UserStatus
  createdAt: string
  updatedAt: string
}

export interface UpdateProfileInput {
  firstName?: string
  lastName?: string
  phone?: string | null
  age?: number | null
  location?: string
  targetSector?: string | null
  employmentType?:
    | 'full_time'
    | 'part_time'
    | 'freelance'
    | 'internship'
    | null
  workMode?: 'on_site' | 'hybrid' | 'remote' | null
  experienceYears?: number | null
  bio?: string | null
}

/** Favoris */

export interface Favorite {
  id: string
  recruiterId: string
  seekerId: string
  createdAt: string
}

export interface Contact {
  id: string
  recruiterId: string
  seekerId: string
  status: string
  createdAt: string
  updatedAt: string
}

export interface Skill {
  id: string
  name: string
  createdAt: string
}

export interface Video {
  id: string
  seekerId: string
  url: string
  title?: string | null
  description?: string | null
  status: 'pending' | 'approved' | 'rejected'
  moderatedBy?: string | null
  moderatedAt?: string | null
  moderationReason?: string | null
  createdAt: string
  updatedAt: string
}

export interface Recruiter extends PublicUser {
  companyName?: string
  companyLocation?: string
}

export interface Interaction {
  id: string
  type: string
  fromUserId: string
  toUserId: string
  createdAt: string
}


export type QuestionnaireStatus =
  | 'draft'
  | 'published'
  | 'archived'

export interface QuestionnaireCategory {
  code: string
  label: string
  weight: number
}

export interface QuestionnaireOption {
  id: string
  label: string
  points: number
}

export interface QuestionnaireQuestion {
  id: string
  category: string
  weight?: number
  type: 'single' | 'multiple'
  prompt: string
  options: QuestionnaireOption[]
}

export interface QuestionAttemp {
  id:string
  question:string
  responses:string[]
  weight:number
  type: 'single' | 'multiple'
}

export interface QuestionnaireContent {
  config?: {
    passThreshold?: number
    minCategoryScore?: number
    retakeDelayDays?: number
    badgeBands?: {
      min: number
      level: string
    }[]
  }

  categories?: QuestionnaireCategory[]
  questions?: QuestionnaireQuestion[]
}

export interface Questionnaire {
  id: string
  questionnaireId: string
  code: string
  title: string
  version: number
  status: QuestionnaireStatus
  content: QuestionnaireContent
  createdBy: string | null
  createdAt: string
  publishedAt: string | null
}

export type QuestionnaireAttemptStatus =
  | 'in_progress'
  | 'submitted'
  | 'abandoned'

export interface QuestionnaireAttempt {
  id: string
  questionnaireVersionId: string
  seekerId: string
  status: QuestionnaireAttemptStatus
  answers: Record<string, string[]>
  score: number | null
  startedAt: string
  submittedAt: string | null
  updatedAt: string
}

export interface CategoryScore {
  code: string
  label: string
  weight: number
  score: number
  questionCount: number
}

export interface ScoreResult {
  score: number
  passed: boolean
  badgeLevel: string | null
  categories: CategoryScore[]
}

export type AttemptUpdateResult = QuestionnaireAttempt & { result?: ScoreResult }


export interface AppNotification {
  id: string
  type: 'contact'
  read: boolean
  createdAt: string
  message: string | null
  recruiterId: string | null
  recruiterName: string | null
  recruiterMail: string | null
  recruiterPhone: string | null
}
