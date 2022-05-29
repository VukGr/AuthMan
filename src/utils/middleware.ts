import {NextFunction, Request, Response} from "express"
import logger from "./logger"

const errorHandler = (err: Error, _: Request, res: Response, next: NextFunction) => {
  logger.error(err.message)

  if (err.name === 'CastError') {
    return res.status(400).json({ error: 'Malformatted id.' })
  } else if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message })
  }

  next(err)
}

const unknownEndpoint = (_req: Request, res: Response) => {
  res.status(404).send({ error: 'Unknown endpoint.' })
}

export default {
    errorHandler,
    unknownEndpoint
}
