// HTTP Post webhooks to webhook endpoint receiver

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

module.exports = { sendWebhook };