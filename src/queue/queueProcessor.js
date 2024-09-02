const fs = require("fs");
const readline = require("readline");
const { exponentialBackoff } = require("../utils/exponentialBackoff");
const { sendWebhook } = require("../services/webhookService");
const { validateData } = require("../utils/validateData");

/* Process Webhook functionality: sends a webhook to its destination with exponential backoff */
const processWebhook = async (
  url,
  orderID,
  name,
  event,
  webhookFailureCount,
  maxDelay,
  logging
) => {
  const success = await exponentialBackoff(
    () => sendWebhook(url, { orderID, name, event }, logging),
    maxDelay,
    logging
  );

  if (!success) {
    if (logging)
      console.log(
        `Failed to sent webhook with order ID ${orderID} at endpoint ${url} `
      );

    webhookFailureCount[url] = (webhookFailureCount[url] || 0) + 1; //Update failure count for webhook endpoint url
  }
  
  return success;
};

/* Process Queue of Webhooks functionality: reads each line of a file and sequentially processes each webhook. En */
const processQueue = async (
  filePath,
  allowedEvents,
  maxAttempts,
  maxDelay,
  logging
) => {
  //Map of failure count at webhook endpoints
  const webhookFailureCount = {};

  // Design Decision: readline vs readFile - readline offers sequential, line by line processing and is more memory efficient for larger files
  const queue = readline.createInterface({
    input: fs.createReadStream(filePath),
    crlfDelay: Infinity,
  });

  for await (const line of queue) {
    const [url, orderID, name, event] = line
      .split(",")
      .map((item) => item.trim());
    //Security consideration: ensure the URL starts with HTTPS
    if (
      url.startsWith("https") &&
      validateData(url, orderID, name, event, allowedEvents) //validates the input data
    ) {
      if (webhookFailureCount[url] >= maxAttempts) {
        if (logging) {
          console.log(
            `Maximum unsuccessful attempts made to webhook endpoint ${url}`
          );
        }
        continue;
      }

      await processWebhook(
        url,
        orderID,
        name,
        event,
        webhookFailureCount,
        maxDelay,
        logging
      );

      if (logging) {
        console.log("Webhook endpoint failure count:", webhookFailureCount);
      }
    }

    if (logging) console.log(`Invalid data input at url: ${url}.`);
  }
};

module.exports = { processWebhook, processQueue };
