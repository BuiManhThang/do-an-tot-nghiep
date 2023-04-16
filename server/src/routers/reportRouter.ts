import { Router } from 'express'
import { authorizeAdmin } from '../common/authorize'
import ReportController from '../controllers/reportController'

const reportController = new ReportController()
const reportRouter = Router()

reportRouter.get('/statistical-revenue', authorizeAdmin, reportController.getStatisticalRevenue)
reportRouter.get('/total', authorizeAdmin, reportController.getTotal)

export default reportRouter
