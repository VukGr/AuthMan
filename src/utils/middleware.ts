import {NextFunction, Request, Response} from "express"
import jwt from "jsonwebtoken"
import config from "./config"
import logger from "./logger"

const errorHandler = (err: Error, _: Request, res: Response, next: NextFunction) => {
  logger.error(err.message)

  if (err.name === 'CastError') {
    return res.status(400).json({ error: 'Malformatted id.' })
  } else if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message })
  } else if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Invalid authorization token.' })
  }

  next(err)
}

const unknownEndpoint = (_req: Request, res: Response) => {
  res.status(404).send({ error: 'Unknown endpoint.' })
}

const getToken = (req: Request) => {
  const authorization = req.get('Authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer '))
    return authorization.substring(7)
  else 
    return ""
}

export interface AuthedRequest extends Request {
  token?: { id: string } & { [id: string]: any }
}

const authRequired = (req: AuthedRequest, res: Response, next: NextFunction) => {
  const token = getToken(req) 
  const decodedToken = jwt.verify(token, config.SECRET) as { id: string }
  if (!decodedToken.id)
    return res.status(401).json({ error: 'Authentication token missing or invalid' })
  req.token = decodedToken

  next()
}

const permissionRequired = (permission: string) => {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (req.token && req.token[permission] === true)
      next()
    else
      return res.status(403).json({
        error: 'You do not have permission to execute this action.'
      })
  }
}

export default {
    errorHandler,
    unknownEndpoint,
    authRequired,
    permissionRequired
}
