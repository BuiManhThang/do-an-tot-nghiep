import { Router } from 'express'
import AssociationRuleController from '../controllers/associationRuleController'
import { authorizeAdmin } from '../common/authorize'

const associationRuleController = new AssociationRuleController()
const associationRuleRouter = Router()

associationRuleRouter.get('/paging', authorizeAdmin, associationRuleController.getPaging)
associationRuleRouter.get('/suggestion', associationRuleController.getSuggestion)

export default associationRuleRouter
