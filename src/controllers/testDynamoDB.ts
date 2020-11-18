import { APIGatewayProxyHandler } from "aws-lambda"
import { MessageUtil } from "../services/message"
import { DynamoDB } from 'aws-sdk';
import { addSequelize, inputParser } from "../services/middleware";
//import dbPromise from '../models'
import { useAsPath } from "tslint/lib/configuration";
import { isTemplateExpression } from "typescript";



const importUser: APIGatewayProxyHandler =  async(event, context) => {
  //const myDB = await dbPromise();
  const DB = new DynamoDB.DocumentClient()
  const TableName = process.env.DYNAMODB_TABLE
  let importData =  '[{\"id\":1,\"username\":\"anton\",\"name\":\"Anton\",\"password\":\"$2a$10$.tQh3lBslABU7gfLZDikzuUt6Iz8uW4XvGjwfLtqeGasu3mhv/rQO\",\"bio\":\"I like programming.\",\"createdAt\":\"2020-10-12T10:01:32.000Z\",\"updatedAt\":\"2020-11-10T14:53:25.000Z\"},{\"id\":2,\"username\":\"abba\",\"name\":\"Abba\",\"password\":\"$2a$10$pVsgcRO3qQ5NnBdRl4Dg..oQhOur5XpXxXclnW2EWjPz5hlrs6MDW\",\"bio\":\"I am Abba and I have won the Eurovosion song contest.\",\"createdAt\":\"2020-10-15T09:19:12.000Z\",\"updatedAt\":\"2020-10-15T09:21:26.000Z\"},{\"id\":3,\"username\":\"lah\",\"name\":\"Lars Ahrenberg\",\"password\":\"$2a$10$7UC4PlX3ueLUghfhPWZ1HuzN7grbs/dB0iIE8bFLrcxF10jgr08My\",\"bio\":\"Bor i Linköping\",\"createdAt\":\"2020-10-18T09:00:55.000Z\",\"updatedAt\":\"2020-10-18T09:00:55.000Z\"},{\"id\":4,\"username\":\"pile\",\"name\":\"Elisabet Gustavsson\",\"password\":\"$2a$10$QSNMKYpiE/aCXVcmjeS/0ut2vkQlcNZMTR4QO6x3GXdlhZumBcmei\",\"bio\":\"Pensionär\",\"createdAt\":\"2020-10-18T09:14:47.000Z\",\"updatedAt\":\"2020-10-18T09:14:47.000Z\"},{\"id\":5,\"username\":\"david\",\"name\":\"David Sundelius\",\"password\":\"$2a$10$z5LEcL4MSc/wimxk1yJ9zeBu0FHIiUC8LK.dq3IK94Qb2d3Ll5qPm\",\"bio\":\"Hello World5678 TESTING\",\"createdAt\":\"2020-10-21T12:57:22.000Z\",\"updatedAt\":\"2020-10-29T15:01:03.000Z\"},{\"id\":6,\"username\":\"jagar\",\"name\":\"jagar\",\"password\":\"$2a$10$LWHEmOkHmHLT6Q/jMcmrGew0smXG06YMdrHsVrW6wWA8jnldMj1aS\",\"bio\":\"jagar\",\"createdAt\":\"2020-11-01T10:16:33.000Z\",\"updatedAt\":\"2020-11-01T10:16:33.000Z\"}]'
  let  users  = JSON.parse(importData);
  
   users.forEach(u => {
     const put = {
       TableName,
       Item:u
      }
      DB.put(put).promise()
   });
  return MessageUtil.success({yes:''})
  const putData = {
    TableName: process.env.DYNAMODB_TABLE,
    RequestItems: JSON.parse(importData),
  }
  
}

export  const runTest = importUser