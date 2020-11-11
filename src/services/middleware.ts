import models from '../models'
import jwt from 'jsonwebtoken';
import { APIGatewayProxyHandler,APIGatewayProxyResult, APIGatewayEvent, Context } from "aws-lambda";
import { MessageUtil } from './message';


const Users = models.User;



// opts.issuer = 'accounts.examplesoft.com';
// opts.audience = 'yoursite.net';
 const authenticateUser = (handlerFunction:any)  =>{
    return async(event: APIGatewayEvent) => {
        try {
            const payload =   jwt.verify(extractTokenFromHeader(event.headers.Authorization), process.env.SECRET);
            event.user   =   await Users.findOne({ where: { id: payload.id } }) 
            return  handlerFunction(event)
        } catch (error) {
            if (error.name === 'JsonWebTokenError') {
                return unauthorized()
            } 
            console.error(error)
            return MessageUtil.error(500,{message:'Server error'});
        }
    }
}

function extractTokenFromHeader(headerAuth:string) {
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
    return MessageUtil.error(401,{message: 'unauthorized'})
}

function inputParser(handlerFunction:any) {
    return (event: APIGatewayEvent) => {
        const input = JSON.parse(event.body ?? '{}');
        if (Object.keys(input).length === 0) {
            return failed();
        }
        event.body = input
        return handlerFunction(event)
    };
}
// create jwt strategy
export { authenticateUser, inputParser }