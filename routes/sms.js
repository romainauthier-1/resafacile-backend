const twilio = require("twilio");

const authToken = process.env.TWILIO_AUTH_TOKEN;
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const twilioPhoneNumber = process.env.TWILIO_NUMBER;
const client = twilio(accountSid, authToken);

async function sendSMS(to, body) {
  const message = await client.messages.create({
    body,
    from: twilioPhoneNumber,
    to,
  });
  return message;
}

module.exports = sendSMS;
