import fs from 'fs'
import path from 'path'
import colors from 'colors'
import { mkdirp } from 'mkdirp'
import dayjs from 'dayjs'
import winston from 'winston'
import FileRotateTransport from './transport'
import { handleDefault, levels } from './utils/common'

const development = process.env.NODE_ENV === 'development'
const production = process.env.NODE_ENV === 'production'

const localPath = path.join(path.dirname(__dirname), '../logs')
const servePath = '/data/logs/'
const situation = !(development || production)
const root = !situation ? servePath : localPath

export default function luckyLogger(config = {}) {
  const defaults = {
    appName: 'app',
    dailyRotateFile: {
      maxFiles: 30,
      maxSize: '10M',
    },
    fileName: 'app',
    format: winston.format.json(),
    root,
  }

  const options = Object.assign({}, defaults, config)

  let logsPath = path.join(options.root, options.appName)

  // log output directory
  if (!fs.existsSync(logsPath)) {
    try {
      mkdirp.sync(logsPath)
    } catch (err) {
      console.log(colors.red(`Create '${servePath}' directory is failure!`))
      logsPath = path.join(localPath, options.appName)
      mkdirp.sync(logsPath)
    }
  }

  const timestamp = () => dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss')
  const { maxFiles, maxSize } = options.dailyRotateFile

  const openMeans: any = {}

  levels.forEach(data => {
    const logger = winston.createLogger({
      level: 'verbose',
      format: options.format,
      transports: [
        new FileRotateTransport({
          filename: `${options.fileName}.${data.type}.log`,
          size: maxSize,
          interval: '1d',
          immutable: false,
          intervalBoundary: true,
          path: logsPath,
          rotate: maxFiles,
        }),
      ],
    })

    // If it is a local environment
    // The log will be displayed in the terminal
    if (situation) {
      const pass = data.type === 'info' || data.type === 'warn'
      logger.add(
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.printf(info => {
              const { message } = info
              const news = pass
                ? (colors as any)[data.color](JSON.stringify(message))
                : (colors as any)[data.color](message)
              const response = `[${timestamp()}][${data.type}] ${
                data.icon
              } \n${news}`
              return response
            }),
          ),
        }),
      )
    }

    openMeans[data.type] = logger
  })

  /**
   * handleLogger
   * Consolidation log
   * @param {Object} data
   */
  function handleLogger({
    level,
    datum,
  }: {
    level?: {
      color: string;
      icon: string;
      type: string;
    };
    datum?: any;
  } = {}) {
    const data = Object.assign({}, datum, {
      timestamp: timestamp(),
    })

    if (!level?.type) return

    openMeans[level.type][level.type](data)
  }

  /**
   * handleDaily
   */
  function handleDaily() {
    const result: any = {}
    levels.forEach(data => {
      const content = {
        error: null,
        message: null,
      }

      result[data.type] = (...args: any[]) => {
        if (args.length > 0) {
          const temp = args[0]
          if (data.type === 'error') {
            content.error = temp
            content.message = args[1] || null
          } else {
            content.message = temp
          }
        }

        const datum = handleDefault({
          err: content.error,
          message: content.message,
        })

        handleLogger({
          level: data,
          datum,
        })
      }
    })

    return result
  }

  return handleDaily()
}
