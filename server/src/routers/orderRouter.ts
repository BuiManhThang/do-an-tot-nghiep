import { Router } from 'express'
import OrderController from '../controllers/orderController'
import { authorizeAdmin, authorize } from '../common/authorize'

const orderController = new OrderController()
const orderRouter = Router()

orderRouter.get('/update-custom', authorizeAdmin, orderController.updateCustom)
orderRouter.get('/paging', orderController.getPaging)
orderRouter.get('/new-code', authorizeAdmin, orderController.getNewCode)
orderRouter.get('/:id', authorize, orderController.getById)
orderRouter.get('/', authorizeAdmin, orderController.getAll)

orderRouter.post('/', authorize, orderController.create)

orderRouter.put('/:id', authorizeAdmin, orderController.update)
orderRouter.delete('/:id', authorize, orderController.delete)

export default orderRouter
