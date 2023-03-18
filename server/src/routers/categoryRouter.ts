import { Router } from 'express'
import CategoryController from '../controllers/categoryController'
import { authorizeAdmin } from '../common/authorize'

const categoryController = new CategoryController()
const categoryRouter = Router()

categoryRouter.get('/paging', categoryController.getPaging)
categoryRouter.get('/new-code', authorizeAdmin, categoryController.getNewCode)
categoryRouter.get('/:id', categoryController.getById)
categoryRouter.get('/', authorizeAdmin, categoryController.getAll)

categoryRouter.post('/', authorizeAdmin, categoryController.create)

categoryRouter.put('/:id', authorizeAdmin, categoryController.update)
categoryRouter.delete('/:id', authorizeAdmin, categoryController.delete)

export default categoryRouter
