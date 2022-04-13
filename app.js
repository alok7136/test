import express from 'express';
import bodyParser from 'body-parser';
const app = express();
import database from './config/database.config.js';
import logger from './src/utils/logger.js';

const PORT = 3000;

database.initConnection();





app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));


app.listen(PORT, () => {
	logger.info(`server listening on port ${PORT}`);
});


export default app;
