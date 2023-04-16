import { Request, Response, NextFunction } from 'express'
import { verify, Secret } from 'jsonwebtoken'
import { DecodedData } from '../models/entity'

export const authorize = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const formattedDecodedData = await authorizeFunc(req)
    if (!formattedDecodedData.userId) return res.sendStatus(401)
    req.body.userIdFromToken = formattedDecodedData.userId
    req.body.userIsAdmin = formattedDecodedData.isAdmin
    return next()
  } catch (error) {
    return res.sendStatus(401)
  }
}

export const authorizeAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const formattedDecodedData = await authorizeFunc(req)
    if (!formattedDecodedData.isAdmin || !formattedDecodedData.userId) {
      return res.sendStatus(401)
    }
    req.body.userIdFromToken = formattedDecodedData.userId
    req.body.userIsAdmin = formattedDecodedData.isAdmin
    return next()
  } catch (error) {
    return res.sendStatus(401)
  }
}

export const authorizeResetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const formattedDecodedData = await authorizeFunc(req)
    if (!formattedDecodedData.email) {
      return res.sendStatus(401)
    }
    req.body.email = formattedDecodedData.email
    return next()
  } catch (error) {
    return res.sendStatus(401)
  }
}

const authorizeFunc = async (req: Request): Promise<DecodedData> => {
  if (!req.headers.authorization?.startsWith('Bearer ')) {
    throw Error('Unauthorized')
  }
  const authorizationArr = req.headers.authorization.split(' ')
  if (authorizationArr.length !== 2) {
    throw Error('Unauthorized')
  }
  const token = authorizationArr[1]
  const secretKey: Secret = process.env.JWT_SECRET_KEY || ''
  const decodedData = verify(token, secretKey)
  const formattedDecodedData = decodedData as DecodedData
  return formattedDecodedData
}
