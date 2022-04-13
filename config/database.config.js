// const mongoose = require("mongoose");
// const logger = require("../utils/logger");

import mongoose from 'mongoose';
import logger from '../src/utils/logger.js';


const initConnection = () => {
	const uri = "mongodb://localhost:27017/wash-app";
	const connectionOptions = {
		useNewUrlParser: true,
		// useCreateIndex: true,
		// useFindAndModify: false,
		useUnifiedTopology: true,
		connectTimeoutMS: 10000,
		// user: "admin",
		// pass: "admin123",
		// authSource: "admin"
	};
	mongoose
		.connect(uri, connectionOptions)
		.then(() => {
			logger.info("Database connection successful.");
		})
		.catch((err) => {
			logger.error(`Database connection error :: ${JSON.stringify(err)}`);
		});
};

const closeConnection = () => {
	mongoose.connection.close();
};

export default {
	initConnection,
	closeConnection
};
