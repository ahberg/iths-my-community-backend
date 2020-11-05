import {create} from './controllers/user'
import { APIGatewayProxyHandler } from 'aws-lambda' 

 class Response1 {
  constructor() {
    this.body = '';
  }

  json(j) {
    this.body = j;
    this.json = JSON.stringify(j);
  }
  
  status(code) {
    this.code = code;
  }
  
  getResonse() {
    return JSON.stringify(this.body);
  }
}
const Response = require('mock-express-response');
const Request = require('mock-express-request');

const createUser: APIGatewayProxyHandler = async (event, context, callback) => {
  
  context.callbackWaitsForEmptyEventLoop = false;
  const req = new Request({
    method: 'POST',
    url: '',
    body: JSON.parse(event.body || ''),
    headers: {
      Accept: 'application/json',
    },
  });
  
  const res = new Response();
  await create(req, res);
  console.log(res._getString())
  callback(null, {
    statusCode: 200,
    body: res._getString
  });
}; 


const testTypeScript: APIGatewayProxyHandler = async (event) => {
  return {
    statusCode: 200,
    body: 'Hej',
  };
};


export {testTypeScript,createUser}
