const winston = require('winston');
module.exports.logger  = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { service: 'user-service' },
    transports: [
    ],
  });