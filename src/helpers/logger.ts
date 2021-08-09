import winston from 'winston'
import { format } from 'date-fns'

const { combine, timestamp, label, colorize, align, printf } = winston.format

const _getFormat = printf(obj => {
  const timestamp = format(new Date(), "yyyy-MM-dd'T'HH:mm:ssxxxxx")
 
  let logFormat = `${timestamp} [${obj.level}]: ${obj.message}`
  if (obj.stack) logFormat += '\n' + obj.stack
  return logFormat
})

const createLogger = () => {
  winston.addColors({
    info: 'green',
    warn: 'yellow',
    error: 'red',
    verbose: 'blue'
  })
  return winston.createLogger({
    transports: [
      // new winston.transports.File({ filename: 'error.log', level: 'error' }),
      // new winston.transports.File({ filename: 'combined.log' })
      new winston.transports.Console({
        level: process.env.LOGGER_LEVEL,
        format: combine(
          colorize(),
          _getFormat,
          align()
        )
      })
    ],
    exitOnError: false
  })
}

const logger = createLogger()

export default logger
