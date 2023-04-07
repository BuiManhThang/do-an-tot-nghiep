import { Router } from 'express'
import UserController from '../controllers/userController'
import { authorize, authorizeAdmin } from '../common/authorize'

const userController = new UserController()
const userRouter = Router()

userRouter.get('/paging', authorizeAdmin, userController.getPaging)
userRouter.get('/current-user', authorize, userController.getCurrentUser)
userRouter.get('/new-code', authorizeAdmin, userController.getNewCode)
userRouter.get('/:id', authorizeAdmin, userController.getById)
userRouter.get('/', authorizeAdmin, userController.getAll)

userRouter.post('/register', userController.register)
userRouter.post('/sign-in', userController.signIn)
userRouter.post('/sign-out', userController.signOut)
userRouter.post('/', authorizeAdmin, userController.create)

userRouter.put('/:id', userController.update)
userRouter.delete('/:id', authorizeAdmin, userController.delete)

export default userRouter
