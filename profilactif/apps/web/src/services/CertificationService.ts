import axiosInstance from '@/shared/api-client'

export class CertificationService {
  static async getCertifications(): Promise<any[]> {
    const { data } = await axiosInstance.get('/certifications')
    return data
  }
}

export default CertificationService
