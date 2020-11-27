import { SQS } from 'aws-sdk'
// Set the region 

const sqs = new SQS
// Create an SQS service object

class Message {
    to: string;
    content: string;
  }
  

const sendEmailMesssage = async (Message: Message) => {
    const params = {
        DelaySeconds: 10,
        MessageAttributes: {
            "Subject": {
                DataType: "String",
                StringValue: "My community - new message"
            },
            "To": {
                DataType: "String",
                StringValue: Message.to
            }
        },
        MessageBody: Message.content,

        QueueUrl: process.env.SQS_URL
    };

    sqs.sendMessage(params, function (err, data) {
        if (err) {
            console.log("Error", err);
        } else {
            console.log("SQS message Send", data.MessageId);
        }
    });
}

export default sendEmailMesssage