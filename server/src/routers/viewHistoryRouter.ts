import { Router } from 'express'
import ViewHistoryController from '../controllers/viewHistoryController'
import { authorizeAdmin, authorize } from '../common/authorize'

const viewHistoryController = new ViewHistoryController()
const viewHistoryRouter = Router()

viewHistoryRouter.get('/paging', authorize, viewHistoryController.getPaging)
viewHistoryRouter.get('/:id', authorizeAdmin, viewHistoryController.getById)
viewHistoryRouter.get('/', authorizeAdmin, viewHistoryController.getAll)

viewHistoryRouter.post('/user', authorize, viewHistoryController.userCreate)
viewHistoryRouter.post('/', authorizeAdmin, viewHistoryController.create)

viewHistoryRouter.put('/:id', authorizeAdmin, viewHistoryController.update)
viewHistoryRouter.delete('/:id', authorizeAdmin, viewHistoryController.delete)

export default viewHistoryRouter
