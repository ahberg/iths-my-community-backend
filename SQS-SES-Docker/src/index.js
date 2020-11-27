const AWS = require('aws-sdk');
// Set the region

// Create an SQS service object

const sqs = new AWS.SQS({ apiVersion: '2012-11-05' });
const queueURL = process.env.SQS_URL;

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

async function receiveEmailMessage() {
  console.log('start Receive');
  const MessageData = await sqs.receiveMessage(params).promise().catch((err) => {
    if (err.stack) {
      console.error('ReceiveMessage error', err);
      process.exit(1);
    }
  });
 
    const EmailMessage = MessageData.Messages[0];
    console.log(EmailMessage.MessageAttributes)
  

  

  receiveEmailMessage();
  /*   const deleteParams = {
    QueueUrl: queueURL,
    ReceiptHandle: data.Messages[0].ReceiptHandle,
  };
 */
/*    sqs.deleteMessage(deleteParams, (err, data1) => {
    if (err) {
      console.log('Delete Error', err);
    } else {
      console.log('Message Deleted', data1);
    }
  });
 */
}

receiveEmailMessage();
