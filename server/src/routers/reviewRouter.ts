import { Router } from 'express'
import ReviewController from '../controllers/reviewController'
import { authorizeAdmin, authorize } from '../common/authorize'

const reviewController = new ReviewController()
const reviewRouter = Router()

reviewRouter.get('/paging', reviewController.getPaging)
reviewRouter.get('/:id', reviewController.getById)
reviewRouter.get('/', authorizeAdmin, reviewController.getAll)

reviewRouter.post('/', authorize, reviewController.create)

reviewRouter.put('/:id', authorize, reviewController.update)
reviewRouter.delete('/:id', authorize, reviewController.delete)

export default reviewRouter
