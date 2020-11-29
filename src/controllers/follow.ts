import { inputParser, authenticateUser, addSequelize } from "../services/middleware";
import { APIGatewayEvent } from 'aws-lambda'
import { MessageUtil } from '../services/message'
import { DynamoDB } from "aws-sdk";
const DB = new DynamoDB.DocumentClient({ params: { TableName: process.env.DYNAMODB_TABLE_USER } });

const follow = async (event: APIGatewayEvent) => {
    const id = event.user.id;
    const update = {
        Key: {
            id: id,
        },
        UpdateExpression: "ADD following :v",
        ExpressionAttributeValues: {
            ":v": DB.createSet(event.pathParameters.targetUserId)
        }
    }
    await DB.update(update).promise()
    return MessageUtil.success({ success: true, targetId: event.pathParameters.targetUserId })
}

const unFollow = async (event: APIGatewayEvent) => {
    const id = event.user.id;
    const update = {
        Key: {
            id: id,
        },
        UpdateExpression: "DELETE following :v",
        ExpressionAttributeValues: {
            ":v": DB.createSet(event.pathParameters.targetUserId)
        }
    }
    await DB.update(update).promise()
    return MessageUtil.success({ success: true, targetId: event.pathParameters.targetUserId })
}


const setFollow = async (event: APIGatewayEvent) => {
    switch (event.httpMethod) {
        case ('POST'): {
            return follow(event)
        }
        case ('DELETE'): {
            return unFollow(event)
        }
    }
}


export const route = addSequelize(authenticateUser(setFollow))
