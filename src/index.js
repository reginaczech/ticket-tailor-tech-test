const { processQueue } = require("./queue/queueProcessor.js");
const path = require("path");

const filePath = path.resolve(__dirname, "../webhooks.txt");
// const filePath = "../webhooks.txt";
const maxAttempts = 5;
const maxDelay = 6000; //1 minute //TODO:

processQueue(filePath, maxAttempts, maxDelay);