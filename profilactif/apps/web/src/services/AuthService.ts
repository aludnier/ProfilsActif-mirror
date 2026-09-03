import axiosInstance from '@/shared/api-client'
import type { AuthResponse, LoginInput, PublicUser, SignupInput } from '@/shared/types/api'

export class AuthService {
  static async signup(input: SignupInput): Promise<AuthResponse> {
    const { data } = await axiosInstance.post<AuthResponse>('/auth/signup', input)
    return data
  }

  static async login(input: LoginInput): Promise<AuthResponse> {
    const { data } = await axiosInstance.post<AuthResponse>('/auth/login', input)
    return data
  }

  static async getMe(): Promise<PublicUser> {
    const { data } = await axiosInstance.get<PublicUser>('/auth/me')
    return data
  }
}

export default AuthService
