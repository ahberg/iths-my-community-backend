import { APIGatewayProxyHandler } from "aws-lambda"
import { MessageUtil } from "../services/message"
import { DynamoDB } from 'aws-sdk';
import { addSequelize, inputParser } from "../services/middleware";



const importUser: APIGatewayProxyHandler = async (event, context) => {
  const search = {
    where: {
    },
    raw: true,
  };
  const results = await event.db.User.findAll(search);
 
  
   
  //const DB = new DynamoDB.DocumentClient
    return MessageUtil.success(process.env)
 

  try {
    const result = await DB.put(user).promise()
    return MessageUtil.success({ message: 'Hej' })
  } catch (e) {
    return MessageUtil.error(500, e)
  }
}

export  const runTest = addSequelize(inputParser(importUser))