import models from '../models'
import jwt from 'jsonwebtoken';
import { APIGatewayProxyHandler,APIGatewayProxyResult, APIGatewayEvent, Context } from "aws-lambda";


const Users = models.User;



// opts.issuer = 'accounts.examplesoft.com';
// opts.audience = 'yoursite.net';
 const authenticateToken = (handlerFunction:any)  =>{
    return async(event: APIGatewayEvent) => {
        try {
            const payload =   jwt.verify(extractTokenFromHeader(event.headers.Authorization), process.env.SECRET);
            event.user   =   await Users.findOne({ where: { id: payload.id } }) 
            return  handlerFunction(event)
        } catch (e) {
            console.error(e);
            return unauthorized()
        }
    }
    
}

function extractTokenFromHeader(headerAuth) {
    if (headerAuth && headerAuth.split(' ')[0] === 'Bearer') {
        return headerAuth.split(' ')[1];
    } else {
        return headerAuth;
    }
}

const failed = async (): Promise<APIGatewayProxyResult> => {
    return {
        statusCode: 500,
        body: 'input JSON not valid'
    }
}

const unauthorized = async (): Promise<APIGatewayProxyResult> => {
    return {
        statusCode: 401,
        body: 'Unauthorized'
    }
}

function inputParser(handler: (event) => Promise): (event: APIGatewayEvent) => Promise {
    return (event: APIGatewayEvent) => {
        const input = JSON.parse(event.body ?? {});
        if (Object.keys(input).length === 0) {
            return failed();
        }
        event.body = input
        return handler(event)
    };
}
// create jwt strategy
export { authenticateToken, inputParser }