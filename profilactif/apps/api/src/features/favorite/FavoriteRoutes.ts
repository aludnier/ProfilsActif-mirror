import { Hono } from 'hono'
import {createFavoriteHandler, deleteFavoriteHandler, getFavoritesByRecruiterHandler} from './FavoriteHandler.js'

export const favoriteRoutes = new Hono()

favoriteRoutes.post('/', createFavoriteHandler)
favoriteRoutes.get('/recruiter/:recruiterId', getFavoritesByRecruiterHandler)
favoriteRoutes.delete('/:id', deleteFavoriteHandler)