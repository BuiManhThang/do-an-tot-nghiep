import { Product } from './product'

export type AssociationRule = {
  id: string
  antecedents: string[]
  consequents: string[]
  antecedentSupport: number
  consequentSupport: number
  support: number
  confidence: number
  lift: number
  productAntecedents: Product[]
  productConsequents: Product[]
}

export type CreateAssociationRule = {
  min_support: number
  min_confidence: number
}
