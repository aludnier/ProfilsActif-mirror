import {Interdit, NonTrouve, ValidationInvalide} from '../../shared/errors.js'
import {AdminRepository} from './AdminRepository.js'
import type {ListUsersInput, UpdateUserRoleInput, UpdateUserStatusInput} from './AdminSchema.js'

export class AdminService {constructor(private readonly adminRepository = new AdminRepository()) {}

  async getUsers(filters: ListUsersInput) {
    return this.adminRepository.findUsers(filters)
  }

  async getUserById(id: string) {
    const user =
      await this.adminRepository.findUserById(id)

    if (!user) {
      throw new NonTrouve(
        'Utilisateur introuvable',
        'UTILISATEUR_NON_TROUVE',
      )
    }

    return user
  }

  async updateUserStatus(id: string, data: UpdateUserStatusInput, currentAdminId?: string) {
    const user = await this.getUserById(id)

    if (
      currentAdminId &&
      currentAdminId === id &&
      data.status !== 'active'
    ) {
      throw new Interdit(
        'Vous ne pouvez pas désactiver votre propre compte administrateur',
        'AUTO_DESACTIVATION_INTERDITE',
      )
    }

    if (user.status === 'deleted') {
      throw new ValidationInvalide(
        'Cet utilisateur est déjà supprimé',
        'UTILISATEUR_DEJA_SUPPRIME',
      )
    }

    await this.adminRepository.updateUserStatus(
      id,
      data,
    )

    return this.getUserById(id)
  }

  async updateUserRole(
    id: string,
    data: UpdateUserRoleInput,
    currentAdminId?: string,
  ) {
    await this.getUserById(id)

    if (
      currentAdminId &&
      currentAdminId === id &&
      data.role !== 'admin'
    ) {
      throw new Interdit(
        'Vous ne pouvez pas retirer votre propre rôle administrateur',
        'AUTO_RETRAIT_ADMIN_INTERDIT',
      )
    }

    await this.adminRepository.updateUserRole(
      id,
      data,
    )

    return this.getUserById(id)
  }

  async deleteUser(
    id: string,
    currentAdminId?: string,
  ) {
    await this.getUserById(id)

    if (currentAdminId && currentAdminId === id) {
      throw new Interdit(
        'Vous ne pouvez pas supprimer votre propre compte',
        'AUTO_SUPPRESSION_INTERDITE',
      )
    }

    await this.adminRepository.deleteUser(id)

    return this.getUserById(id)
  }
}