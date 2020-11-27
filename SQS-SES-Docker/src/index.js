const AWS = require('aws-sdk');
// Set the region

// Create an SQS service object

const sqs = new AWS.SQS({ apiVersion: '2012-11-05' });
const queueURL = process.env.SQS_URL;

async function sendEmail(email) {
  // Create sendEmail params
  const params = {
    Destination: { /* required */
      ToAddresses: [
        email.to,
      /* more items */
      ],
    },
    Message: { /* required */
      Body: { /* required */
        Text: {
          Charset: 'UTF-8',
          Data: email.body,
        },
      },
      Subject: {
        Charset: 'UTF-8',
        Data: email.subject,
      },
    },
    Source: process.env.EMAIL, /* required */
  };

  const sendPromise = new AWS.SES({ apiVersion: '2010-12-01' }).sendEmail(params).promise();
  sendPromise.then(
    (data) => {
      console.log(data.MessageId);
    },
  ).catch(
    (err) => {
      console.error(err, err.stack);
    },
  );
}

async function receiveEmailMessage() {
  const params = {
    AttributeNames: [
      'SentTimestamp',
    ],
    MaxNumberOfMessages: 1,
    MessageAttributeNames: [
      'All',
    ],
    QueueUrl: queueURL,
    WaitTimeSeconds: 20,
  };
  console.log('start Receive');
  const MessageData = await sqs.receiveMessage(params).promise().catch((err) => {
    if (err.stack) {
      console.error('ReceiveMessage error', err);
      process.exit(1);
    }
  });
  if (MessageData.Messages !== undefined) {
    const EmailMessage = MessageData.Messages[0];
    const email = {
      to: EmailMessage.MessageAttributes.To.StringValue,
      subject: EmailMessage.MessageAttributes.Subject.StringValue,
      body: EmailMessage.Body,
    };
    await sendEmail(email);

    const deleteParams = {
      QueueUrl: queueURL,
      ReceiptHandle: EmailMessage.ReceiptHandle,
    };
    sqs.deleteMessage(deleteParams).promise().catch((err) => {
      console.log('Delete Error', err);
    });
  }
  receiveEmailMessage();
}
// sendEmail();
receiveEmailMessage();
