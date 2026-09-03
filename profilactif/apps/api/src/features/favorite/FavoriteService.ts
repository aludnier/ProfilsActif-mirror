import {
  Conflit,
  NonTrouve,
} from '../../shared/errors.js'
import { FavoriteRepository } from './FavoriteRepository.js'
import type { CreateFavoriteInput } from './FavoriteSchema.js'

export class FavoriteService {
  constructor(
    private readonly favoriteRepository = new FavoriteRepository(),
  ) {}

  async createFavorite(data: CreateFavoriteInput) {
    const existing =
      await this.favoriteRepository.findByRecruiterAndSeeker(
        data.recruiterId,
        data.seekerId,
      )

    if (existing) {
      throw new Conflit(
        'Ce profil est déjà dans les favoris',
        'FAVORITE_DEJA_EXISTANT',
      )
    }

    return this.favoriteRepository.create(data)
  }

  async getFavoritesByRecruiter(recruiterId: string) {
    return this.favoriteRepository.findByRecruiter(recruiterId)
  }

  async deleteFavorite(id: string) {
    const favorite = await this.favoriteRepository.findById(id)

    if (!favorite) {
      throw new NonTrouve(
        'Favori introuvable',
        'FAVORITE_NON_TROUVE',
      )
    }

    await this.favoriteRepository.delete(id)
  }
}