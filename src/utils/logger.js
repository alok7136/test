// const { format } = require("path/posix");

// const { createLogger, format, transports } = require("winston");
import pkg from 'winston';
const  {createLogger , format ,transports} = pkg;
const logger = createLogger({
	transports: [
		new transports.Console(),
		new transports.File({ filename: "log/error.log" })
	],
	exitOnError: false,
	format: format.combine(
		format.label(),
		format.timestamp(),
		format.prettyPrint(),
		format.json()
	)
});

export default logger;
