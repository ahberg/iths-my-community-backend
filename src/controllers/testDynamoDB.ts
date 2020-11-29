import { APIGatewayProxyHandler } from "aws-lambda"
import { MessageUtil } from "../services/message"
import { DynamoDB } from 'aws-sdk';
//import { addSequelize, inputParser } from "../services/middleware";
import { authenticateUser } from "../services/middleware";
import * as uuid from 'uuid';



const importUser: APIGatewayProxyHandler =  async(event, context) => {
  //const myDB = await dbPromise();
 


  return MessageUtil.success({success:true})  
}

export  const runTest =  importUser