import { NonTrouve } from '../../shared/errors.js'
import { VideoRepository } from './VideoRepository.js'
import type {CreateVideoInput, UpdateVideoInput} from './VideoSchema.js'
export class VideoService {constructor(private readonly videoRepository = new VideoRepository()) {}

  async getVideo(id: string) {
    const video = await this.videoRepository.findById(id)

    if (!video) {
      throw new NonTrouve(
        'Vidéo introuvable',
        'VIDEO_NON_TROUVEE',
      )
    }

    return video
  }

  async getVideosBySeeker(seekerId: string) {
    return this.videoRepository.findBySeekerId(seekerId)
  }

  async createVideo(data: CreateVideoInput) {
    return this.videoRepository.create(data)
  }

  async updateVideo(
    id: string,
    data: UpdateVideoInput,
  ) {
    await this.getVideo(id)
    await this.videoRepository.update(id, data)

    return this.getVideo(id)
  }

  async deleteVideo(id: string) {
    await this.getVideo(id)
    await this.videoRepository.delete(id)
  }
}