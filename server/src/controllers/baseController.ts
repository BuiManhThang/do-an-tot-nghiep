import { Prisma, PrismaClient } from '@prisma/client'
import { Response } from 'express'

export class BaseController {
  serverError = (res: Response, error: any, msg: string = 'Server Error') => {
    console.log(error)
    return res.status(500).json({
      msg,
      error,
    })
  }

  clientError = (res: Response, error: any, msg: string = 'Client Error') => {
    return res.status(400).json({
      msg,
      error,
    })
  }

  notFound = (res: Response) => {
    return res.sendStatus(404)
  }

  notContent = (res: Response) => {
    return res.sendStatus(204)
  }

  success = (res: Response, data: any) => {
    return res.status(200).json(data)
  }

  created = (res: Response, data: any) => {
    return res.status(201).json(data)
  }

  updated = (res: Response, data: any) => {
    return res.status(200).json(data)
  }

  deleted = (res: Response, data: any) => {
    return res.status(200).json(data)
  }

  unauthorized = (res: Response) => {
    return res.sendStatus(401)
  }
}
