const validator = require("validator");

/* Validates the input data */
const validateData = (url, orderID, name, event, allowedEvents) => {
  return (
    validator.isURL(url) &&
    validator.isInt(orderID, { min: 1 }) &&
    validator.isLength(name, { min: 1 }) &&
    allowedEvents.includes(event)
  );
};

module.exports = { validateData };
