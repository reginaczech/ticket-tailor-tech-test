const { processQueue } = require("./queue/queueProcessor.js");
const path = require("path");

const filePath = path.resolve(__dirname, "../webhooks.txt");
const maxAttempts = 5;
const maxDelay = 60000; //1 minute
const allowedEvents = [
  "Spooky Summit",
  "Serene Sands",
  "Glow Gallery",
  "Fall Foliage Farm",
  "Prism Pavilion",
];

//Set the logging to true to view the logging - to support with running the code in development.
const logging = true;

processQueue(filePath, allowedEvents, maxAttempts, maxDelay, logging);
