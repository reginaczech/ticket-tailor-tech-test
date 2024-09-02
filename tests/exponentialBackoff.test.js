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

  it("should retry and return true after successful on second attempt", async () => {
    const cb = jest
      .fn()
      .mockResolvedValueOnce(false) // First attempt fails
      .mockResolvedValueOnce(true); // Second attempt succeeds

    const resultPromise = exponentialBackoff(cb, maxDelay, true);

    // Advance time and log
    console.log("Advancing timers by 1000ms");
    jest.advanceTimersByTime(1000);
    expect(cb).toHaveBeenCalledTimes(1);

    console.log("Advancing timers by 2000ms");
    jest.advanceTimersByTime(2000);

    const result = await resultPromise;

    expect(cb).toHaveBeenCalledTimes(2);
    expect(result).toBe(true);
  });
});
