// Process webhooks with exponential backoff
const exponentialBackoff = async (cb, maxDelay) => {
  let success = false;
  let timeDelay = 100; //start with 1 s //TODO:

  while (!success && timeDelay <= maxDelay) {
    //callback function here to allow for modularity
    success = await cb();

    if (success) {
      console.log("Successfully sent webhook");
      return true;
    } else {
      //SetTimeout is an async function that schedules tasks to run after a specified delay nbut doesnt block the exectution of the subsequent code
      //Creating a new promise to delay the retrying of the webhook
      console.log(`Retrying at endpoint in ${timeDelay} s`);
      await new Promise((resolve) => setTimeout(resolve, timeDelay));
      timeDelay = timeDelay * 2;
    }
  }
};

module.exports = { exponentialBackoff };
