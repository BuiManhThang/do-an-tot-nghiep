export type Category = {
  id: string
  code: string
  name: string
  image: string
  desc?: string
  createdAt: Date
  updatedAt: Date
}

export type CreateCategory = {
  code: string
  name: string
  image: string
  desc?: string
}
