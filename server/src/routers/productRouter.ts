import { Router } from 'express'
import ProductController from '../controllers/productController'
import { authorizeAdmin } from '../common/authorize'

const productController = new ProductController()
const productRouter = Router()

productRouter.get('/paging', productController.getPaging)
productRouter.get('/new-code', authorizeAdmin, productController.getNewCode)
productRouter.get('/:id', productController.getById)
productRouter.get('/', authorizeAdmin, productController.getAll)

productRouter.post('/', authorizeAdmin, productController.create)

productRouter.put('/:id', authorizeAdmin, productController.update)
productRouter.delete('/:id', authorizeAdmin, productController.delete)

export default productRouter
