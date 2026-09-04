
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
  bio?: string | null
}

/** Favori */
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
  title?: string | null | null
  description?: string | null
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
