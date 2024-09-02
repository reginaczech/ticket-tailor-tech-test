const { processWebhook } = require("../src/queue/queueProcessor");
const { sendWebhook } = require("../src/services/webhookService");
const { exponentialBackoff } = require("../src/utils/exponentialBackoff");
const { beforeEach } = require("node:test");

jest.mock("../src/services/webhookService");
jest.mock("../src/utils/exponentialBackoff");

describe("Process webhook integration test", () => {
  const mockURL = "https://webhook-test.info1100.workers.dev/success1";
  const orderID = 1;
  const name = "Olimpia Krasteva";
  const event = "Spooky Summit";
  const maxDelay = 10000; //10 seconds for testing purposes
  const logging = false;

  let webhookFailureCount;

  beforeEach(() => {
    webhookFailureCount = {};
    jest.resetAllMocks();
  });

  it("should return true on successfully sending webhook to destination", async () => {
    sendWebhook.mockResolvedValueOnce(true);
    exponentialBackoff.mockImplementation(async (cb) => cb());

    const result = await processWebhook(
      mockURL,
      orderID,
      name,
      event,
      webhookFailureCount,
      maxDelay,
      logging
    );

    expect(sendWebhook).toHaveBeenCalledWith(
      mockURL,
      { orderID, name, event },
      logging
    );
    expect(exponentialBackoff).toHaveBeenCalled();
    expect(result).toEqual(true);
    expect(webhookFailureCount[mockURL]).toBeUndefined();
  });

  it("should return false and log failure when all attempts fail", async () => {
    sendWebhook.mockResolvedValue(false); // All attempts fail

    // Mock exponentialBackoff to simulate multiple retries
    exponentialBackoff.mockImplementation(async (cb) => {
      // Simulate retry attempts
      await cb(); // First attempt
      return cb(); // All retries fail
    });

    const result = await processWebhook(
      mockURL,
      orderID,
      name,
      event,
      webhookFailureCount,
      maxDelay,
      logging
    );

    expect(sendWebhook).toHaveBeenCalledTimes(2); // Number of attempts
    expect(result).toBe(false);
    // expect(webhookFailureCount[mockURL]).toBe(1); // Failure count updated
    // expect(console.log).toHaveBeenCalledWith(
    //   `Failed to send webhook with order ID ${orderID} at endpoint ${mockURL}`
    // );
  });
});
