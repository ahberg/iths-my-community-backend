import jwt from 'jsonwebtoken';
import { APIGatewayProxyHandler, APIGatewayProxyResult, APIGatewayEvent, Context } from "aws-lambda";
import { MessageUtil } from './message';
import { DynamoDB } from 'aws-sdk';



// opts.issuer = 'accounts.examplesoft.com';
// opts.audience = 'yoursite.net';
const authenticateUser = (handlerFunction: any) => {
    return async (event: APIGatewayEvent) => {
        const DB = new DynamoDB.DocumentClient()
    
        try {
            const payload = jwt.verify(extractTokenFromHeader(event.headers.Authorization), process.env.SECRET);
            const  params  = {
                TableName:process.env.DYNAMODB_TABLE_USER,
                Key: {
                    id:payload.id
                }
            }
            const result  = await DB.get(params).promise()
            event.user  = result.Item
            return handlerFunction(event)
        } catch (error) {
             if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
                return unauthorized()
            } 
            return MessageUtil.error(500, { message: error});
        }
    }
}

function extractTokenFromHeader(headerAuth: string) {
    if (headerAuth && headerAuth.split(' ')[0] === 'Bearer') {
        return headerAuth.split(' ')[1];
    } else {
        return headerAuth;
    }
}

const failed = async (): Promise<APIGatewayProxyResult> => {
    return MessageUtil.error(500, {
        message: 'input JSON not valid'
    })
}


const unauthorized = async (): Promise<APIGatewayProxyResult> => {
    return MessageUtil.error(401, { message: 'unauthorized' })
}

function inputParser(handlerFunction: any) {
    return (event: APIGatewayEvent) => {
        const input = JSON.parse(event.body ?? '{}');
        if (Object.keys(input).length === 0) {
            return failed();
        }
        event.body = input
        return handlerFunction(event)
    };
}

function addSequelize(handlerFunction: any) {
    return async (event: APIGatewayEvent) => {

    /*     const db = await dbPromise();
        event.db = db */
        try {
            return await handlerFunction(event)
        }
        finally {
            //await db.sequelize.connectionManager.close();
        }
    };
}

// create jwt strategy
export { authenticateUser, inputParser, addSequelize }