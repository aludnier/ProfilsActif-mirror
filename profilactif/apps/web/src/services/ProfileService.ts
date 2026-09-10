import axiosInstance from '@/shared/api-client'
import type { Profile, ProfileConsultation, UpdateProfileInput } from '@/shared/types/api'

export interface ProfilePage {
  data: Profile[]
  page: number
  limit: number
  total: number
  totalPages: number
}

export class ProfileService {

  static async getProfiles(): Promise<Profile[]> {
    const { data } = await axiosInstance.get<Profile[]>('/profiles')
    return Promise.all(
      data.map(async (profile) => ({
        ...profile,
        competences: await this.getCompetences(profile.id).catch(() => []),
      })),
    )
  }

  static async getProfilesPage(filters: {
    page: number
    limit: number
    niveau?: string
    secteur?: string
    localisation?: string
    competence?: string
    types?: string[]
    modalites?: string[]
    certification?: string
    contratDu?: string
    contratAu?: string
  }): Promise<ProfilePage> {
    const { data } = await axiosInstance.get<ProfilePage>('/profiles/catalogue', {
      params: {
        page: filters.page,
        limit: filters.limit,
        niveau: filters.niveau === 'all' ? undefined : filters.niveau,
        secteur: filters.secteur || undefined,
        localisation: filters.localisation || undefined,
        competence: filters.competence || undefined,
        types: filters.types?.join(',') || undefined,
        modalites: filters.modalites?.join(',') || undefined,
        certification: filters.certification || undefined,
        contratDu: filters.contratDu || undefined,
        contratAu: filters.contratAu || undefined,
      },
    })
    return data
  }

  static async getConsultations(id: string): Promise<ProfileConsultation[]> {
    const { data } = await axiosInstance.get<ProfileConsultation[]>(`/profiles/${id}/consultations`)
    return data
  }

  static async getProfile(id: string): Promise<Profile> {
    const { data } = await axiosInstance.get<Profile>(`/profiles/${id}`)
    return data
  }

  static async updateProfile(id: string, updates: UpdateProfileInput): Promise<Profile> {
    const { data } = await axiosInstance.patch<Profile>(`/profiles/${id}`, updates)
    return data
  }
  static async getCompetences(id: string): Promise<string[]> {
    const { data } = await axiosInstance.get<{ competences: string[] }>('/profiles/' + id + '/competences')
    return data.competences
  }

  static async updateCompetences(id: string, competences: string[]): Promise<string[]> {
    const { data } = await axiosInstance.put<{ competences: string[] }>('/profiles/' + id + '/competences', { competences })
    return data.competences
  }


  static async uploadPhoto(id: string, fichier: File): Promise<{ path: string; status: string }> {
    const corps = new FormData()
    corps.append('photo', fichier)
    const { data } = await axiosInstance.post<{ path: string; status: string }>(
      `/profiles/${id}/photo`,
      corps,
      { headers: { 'Content-Type': undefined } },
    )
    return data
  }

  static async deletePhoto(id: string): Promise<void> {
    await axiosInstance.delete(`/profiles/${id}/photo`)
  }

  static async getPhotoBlob(id: string): Promise<string | null> {
    try {
      const { data } = await axiosInstance.get<Blob>(`/profiles/${id}/photo`, {
        responseType: 'blob',
      })
      return URL.createObjectURL(data)
    } catch {
      return null
    }
  }

}

export default ProfileService
