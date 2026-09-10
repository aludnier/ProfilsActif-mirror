import { Conflit, Interdit, NonTrouve } from '../../shared/errors.js'
import { FavoriteRepository, type NewFavorite } from './FavoriteRepository.js'

export class FavoriteService {
  constructor(private readonly favoriteRepository = new FavoriteRepository()) {}

  async createFavorite(data: NewFavorite) {
    const existing = await this.favoriteRepository.findByRecruiterAndSeeker(
      data.recruiterId,
      data.seekerId,
    )

    if (existing) {
      throw new Conflit('Ce profil est déjà dans les favoris', 'FAVORITE_DEJA_EXISTANT')
    }

    return this.favoriteRepository.create(data)
  }

  async getFavoritesByRecruiter(recruiterId: string) {
    return this.favoriteRepository.findByRecruiter(recruiterId)
  }

  async deleteFavorite(id: string, recruiterId: string) {
    const favorite = await this.favoriteRepository.findById(id)

    if (!favorite) {
      throw new NonTrouve('Favori introuvable', 'FAVORITE_NON_TROUVE')
    }
    if (favorite.recruiterId !== recruiterId) {
      throw new Interdit('Ce favori ne vous appartient pas', 'FAVORITE_NON_PROPRIETAIRE')
    }

    await this.favoriteRepository.delete(id)
  }
}
