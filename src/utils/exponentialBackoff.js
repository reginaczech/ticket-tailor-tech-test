/* Exponential backoff function: modular function which checks for the success of the callback function
and retries using an exponential time delay until max time is reached or successful result. */

const exponentialBackoff = async (cb, maxDelay, logging) => {
  let success = false;
  let timeDelay = 100; //start with 1 s //TODO:

  while (!success && timeDelay <= maxDelay) {
    //Callback function here to allow for modularity
    success = await cb();

    if (success) {
      if (logging) console.log("Successfully sent webhook");
      return true;
    } else {
      if (logging) console.log(`Retrying at endpoint in ${timeDelay} ms`);

      await new Promise((resolve) => setTimeout(resolve, timeDelay));
      timeDelay = timeDelay * 2; //double time delay with each subsequent retry
    }
  }
};

module.exports = { exponentialBackoff };
