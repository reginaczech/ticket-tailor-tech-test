const fs = require("fs");
const readline = require("readline");

const filePath = "webhooks.txt";
const maxAttempts = 5;
const maxDelay = 6000; //1 minute

// POST WEBHOOK FUNCTION - Make HTTP POST requests to webhook endpoint receiver
// move to util folder
const sendWebhook = async (url, data) => {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    return true; // Success
  } catch (error) {
    console.error(`Error sending webhook: ${error.message}`);
    return false; // Failure
  }
};

// FUNCTION: Process webhooks with exponential backoff
const processWebhook = async (
  url,
  orderID,
  name,
  event,
  webhookFailureCount
) => {
  let success = false;
  let timeDelay = 100; //start with 1 s

  while (!success && timeDelay <= maxDelay) {
    success = await sendWebhook(url, { orderID, name, event });

    if (success) {
      console.log(`Successfully sent webhook with order ID ${orderID} at endpoint ${url}`);
      return;
    } else {
      //SetTimeout is an async function that schedules tasks to run after a specified delay nbut doesnt block the exectution of the subsequent code
      //Creating a new promise to delay the retrying of the webhook
      console.log(
        `Retrying to sent webhook with order ID ${orderID} at endpoint ${url} in ... ${timeDelay} s`
      );
      await new Promise((resolve) => setTimeout(resolve, timeDelay));
      timeDelay = timeDelay * 2;
    }
  }

  //If no success, breaks out of while loop and updates the webhook failure count hashmap
  console.log(
    `Failed to sent webhook with order ID ${orderID} at endpoint ${url} `
  );
  webhookFailureCount[url] = (webhookFailureCount[url] || 0) + 1;
};

//This will read each line in the queue
//Then process the results
const processQueue = async (filePath) => {
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

      await processWebhook(url, orderID, name, event, webhookFailureCount);
      console.log("failure count ---- ", webhookFailureCount)
    }
  }
};

processQueue(filePath);
