
import {create,} from './controllers/user'


import { APIGatewayProxyHandler,APIGatewayProxyResult, APIGatewayEvent, Context } from "aws-lambda";

type Input = {
  a: number;
  b: number;
};

const sum = async(input:Input ): Promise <APIGatewayProxyResult> => {
  console.log(input)
  const result = input.a + input.b 
  return {
      statusCode: 200,
      body: JSON.stringify(result),
  };
}

const failed = async(input:Input ): Promise<APIGatewayProxyResult> => {
  return {
      statusCode: 404,
      body: 'fel'
}
}

function inputParser(handler: ({ a, b }: Input) => Promise): (event: APIGatewayEvent) => Promise{
    return (event: APIGatewayEvent) => {
      const input  = JSON.parse(event.body ?? "{}");
      let check = input.a ?? false
      if(check === false) {
          return failed(input);
      } else {
        return  handler(input)
      }
    };
}

const  jsonSerializer = <Event>(handler: (event: Event) => Promise<object>): (event: Event) => Promise<APIGatewayProxyResult> => {
  return async (event: Event) => {
    console.log(handler)
    return {
      statusCode: 200,
      body: JSON.stringify(await handler(event)),
    };
  };
}

function jsonSerializer1<Event>(
  handler: (event: Event) => Promise<object>
): (event: Event) => Promise<APIGatewayProxyResult> {
  return async (event: Event) => {
    return {
      statusCode: 200,
      body: JSON.stringify(await handler(event)),
    };
  };
}


const https = require('https')
let url = "https://docs.aws.amazon.com/lambda/latest/dg/asdasd"

const myGeturl =  function(event) {
  const pr = new Promise(function(resolve, reject) {
    https.get(url, (res) => {
      console.log(res.headers)
        resolve(res.statusCode)
      }).on('error', (e) => {
        reject(e.statusCode)
      })
    })
  return pr
}

export const add: (
  event: APIGatewayEvent,
  context: Context
) => Promise<APIGatewayProxyResult> = inputParser(sum)



export const test = MyHandler(inputParser(sum))

function MyHandler<Event>(
  handler: (event: Event) => Promise<object>
): (event: Event) => Promise<APIGatewayProxyResult> {
  return async (event: Event) => {
   return myGeturl(event).then((status) => {
      return {
        statusCode: 200,
        body: JSON.stringify(status),
      }
    }).catch((status) => {
      return {
        statusCode: 200,
        body: JSON.stringify(status),
      }
    })
  }
}