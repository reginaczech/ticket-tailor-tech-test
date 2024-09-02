const { processQueue } = require("./queue/queueProcessor.js");
const path = require("path");

const filePath = path.resolve(__dirname, "../webhooks.txt");
const maxAttempts = 5;
const maxDelay = 6000; //1 minute //TODO:

//Set the logging to true to view the logging - to support with running the code in development.
const logging = true;

processQueue(filePath, maxAttempts, maxDelay, logging);
