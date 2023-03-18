import { Router } from 'express'
import ReviewController from '../controllers/reviewController'
import { authorizeAdmin } from '../common/authorize'

const reviewController = new ReviewController()
const reviewRouter = Router()

reviewRouter.get('/paging', reviewController.getPaging)
reviewRouter.get('/:id', reviewController.getById)
reviewRouter.get('/', authorizeAdmin, reviewController.getAll)

reviewRouter.post('/', authorizeAdmin, reviewController.create)

reviewRouter.put('/:id', authorizeAdmin, reviewController.update)
reviewRouter.delete('/:id', authorizeAdmin, reviewController.delete)

export default reviewRouter
