const { sendWebhook } = require("../src/services/webhookService");

//Unit tests to test the behavior of the function, not to make a network request to the API

//Mock the fetch module:
global.fetch = jest.fn();
//Mock the data:
const successMockURL = "https://webhook-test.info1100.workers.dev/success1";
const failMockURL = "https://webhook-test.info1100.workers.dev/fail1";
const successData = { orderId: 1, name: "Olimpia Krasteva", event: "Spooky Summit" };
const failData = { orderId: 2, name: "Kumaran Powell", event: "Serene Sands" };

describe("sendWebhook unit test", () => {

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("returns true on successfully sending webhook to destination", async () => {
    //Mock the response
    fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
    });
    const success = await sendWebhook(successMockURL, successData, false);
    expect(success).toEqual(true);
  });

  it("returns false on failing to send webhook to destination", async () => {
    //Mock the response
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });
    const success = await sendWebhook(failMockURL, failData, false);
    expect(success).toEqual(false);
  });
});
