import { Router } from 'express'
import InventoryReceiptController from '../controllers/inventoryReceiptController'
import { authorizeAdmin, authorize } from '../common/authorize'

const inventoryReceiptController = new InventoryReceiptController()
const inventoryReceiptRouter = Router()

inventoryReceiptRouter.get('/paging', authorizeAdmin, inventoryReceiptController.getPaging)
inventoryReceiptRouter.get('/new-code', authorizeAdmin, inventoryReceiptController.getNewCode)
inventoryReceiptRouter.get('/:id', authorizeAdmin, inventoryReceiptController.getById)

inventoryReceiptRouter.post('/', authorize, inventoryReceiptController.create)

export default inventoryReceiptRouter
