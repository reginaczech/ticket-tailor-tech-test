const { exponentialBackoff } = require("../src/utils/exponentialBackoff");

jest.useFakeTimers();
jest.spyOn(global, "setTimeout");
jest.setTimeout(10000);

const maxDelay = 10000; //For testing purposes, setting as 10s

describe("Exponential Backoff unit test", () => {

  afterEach(() => {
    jest.clearAllTimers();
    jest.resetAllMocks();
  });

  it("should return true when callback function is successful after first attempt", async () => {
    const cb = jest.fn().mockResolvedValueOnce(true);

    const result = await exponentialBackoff(cb, maxDelay, false);

    expect(cb).toHaveBeenCalledTimes(1);
    expect(result).toBe(true);
  });

});
