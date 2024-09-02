# Ticket Tailor Tech Test

This application processes a queue of webhooks and sends them to their destination. It handles failure and retries with an exponential back-off strategy.

### Prerequisites
- Node.js (version 18 or above): Download and install from the [Node.js website](https://nodejs.org/en).
- A command-line interface (CLI) such as Terminal or Command Prompt

### Installation
1. Clone the repo:
  `git clone <repo-url>`
2. Navigate to Project Directory using the CLI:
  `cd <repo-directory>`
3. Install dependencies:
  `npm i`

### Run the Application
To run the application, in the terminal run:
  `npm start`

### Run Tests
To run the tests, in the terminal run:
  `npm test`

FYI: I struggled with testing of the unhappy paths in the exponentialBackoff and queueProcessor tests. My idea for the tests was chaining the resolved values to return first false, then true. Then to return a promise from the exponentialBackoff function to resolve after fast-forwarding the time. I was unable to achieve a successful test. I am happy to share my code and thought process further if required.

### Design Decisions and Considerations
##### Modularity:
- Organized the project into separate modules for services (sending webhooks), utility functions (exponential backoff), and queueing processes. This modular approach enhances code readability, maintainability and testability.
##### Handling HTTP Requests - Trade-Offs:
- Opted for native `fetch` built-in API. Required dependency is Node.js 18+, however I leveraged the built-in `fetch` API to avoid adding extra dependencies and keeping the sending mechanism lightweight. While Axios provides more features and configuration options, the large library size is not required for the current needs of the sending mechanism.
- Additional option is to utilize a lighter external library of `node-fetch` which works on earlier versions of Node.js, however Node.js 18 is the active LTS and recommended version for new projects.
##### Exponential Backoff Strategy:
- Opted for utilizing SetTimeout to delay the retrying of the callback function (sendWebhook). However, setTimeout is an async function that schedules tasks to run after a specified delay but doesn't pause the execution of other functions in the stack, so I needed to create a new promise that would resolve on the time delay.
##### Handling Webhook Endpoint Failures:
- Opted to map each failed URL to an object and increase the count after the webhook has failed for that particular webhook event.
##### Handling Reading of Files:
- Opted reading the files line by line (readLine) instead of the whole file at once (readFile). Readfile may be simpler to implement, however readline allows for a more memory efficient approach and takes into consideration larger files (queues). The mechanism reads each line and performs sequential actions on each webhook, additionally allowing for failures of multiple webhooks to be handled effectively.
##### Security Considerations
- Ensure webhook URL starts with HTTPS to ensure that the data is encrypted in transit.
- Responses from the webhook endpoint POST request result into true (success) or false (failure), hence do not need to consider sanitizing the results from the response. Additional logging can be introduced into the webhook services to allow for monitoring of the received data from the webhook.
- The exponential backoff with a maximum delay time and a maximum number of attempts prevents against overwhelming the server and Denial of Service (DoS) attacks.
- Sanitize and validate the input data from the webhooks file utilizing a validator library to validate. This ensures that some security measures are taken to ensure rouge or malicious data is not processed and sent to the webhook. The validation is based on an allowed events array which checks if the event is found in the list of approved events. This may limit types of endpoints and orders that can be sent, however the trade off is better security.
