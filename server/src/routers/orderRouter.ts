import { Router } from 'express'
import OrderController from '../controllers/orderController'
import { authorizeAdmin } from '../common/authorize'

const orderController = new OrderController()
const orderRouter = Router()

orderRouter.get('/paging', orderController.getPaging)
orderRouter.get('/new-code', authorizeAdmin, orderController.getNewCode)
orderRouter.get('/:id', orderController.getById)
orderRouter.get('/', authorizeAdmin, orderController.getAll)

orderRouter.post('/', authorizeAdmin, orderController.create)

orderRouter.put('/:id', authorizeAdmin, orderController.update)
orderRouter.delete('/:id', authorizeAdmin, orderController.delete)

export default orderRouter
