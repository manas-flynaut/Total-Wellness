const log4js = require('log4js')
const logger = log4js.getLogger()
logger.level = 'debug'

const loggerUtil = (message, logType = 'INFO') => {
    logType === 'INFO' || logType === 'SERVER'
        ? logger.info(message)
        : logType === 'ERROR'
            ? logger.error(message)
            : null
}

const log = (data) => {
    logger.debug(data)
}

module.exports = { loggerUtil, log };