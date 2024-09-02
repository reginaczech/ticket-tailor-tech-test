const fs = require("fs");
const readline = require("readline");
const { exponentialBackoff } = require("../utils/exponentialBackoff");
const { sendWebhook } = require("../services/webhookService");

const processWebhook = async (
  url,
  orderID,
  name,
  event,
  webhookFailureCount,
  maxDelay
) => {
  const success = await exponentialBackoff(
    () => sendWebhook(url, { orderID, name, event }),
    maxDelay
  );

  if (!success) {
    console.log(
      `Failed to sent webhook with order ID ${orderID} at endpoint ${url} `
    );
    //Update failure count at webhook endpoint
    webhookFailureCount[url] = (webhookFailureCount[url] || 0) + 1;
  }
};

const processQueue = async (filePath, maxAttempts, maxDelay) => {
  //Hashmap of failure count at webhook endpoints
  const webhookFailureCount = {};

  // Function: Read webhook (line) from queue (txt file)
  const queue = readline.createInterface({
    input: fs.createReadStream(filePath),
    crlfDelay: Infinity,
  });

  for await (const line of queue) {
    const [url, orderID, name, event] = line
      .split(",")
      .map((item) => item.trim());
    if (url.includes("https")) {
      if (webhookFailureCount[url] >= maxAttempts) {
        console.log(
          `Maximum unsuccessful attempts made to webhook endpoing ${url}`
        );
        continue;
      }

      await processWebhook(
        url,
        orderID,
        name,
        event,
        webhookFailureCount,
        maxDelay
      );
      console.log("failure count ---- ", webhookFailureCount);
    }
  }
};

module.exports = { processQueue };
