import db from "../models"
import { inputParser,authenticateUser } from "../services/middleware";
import { APIGatewayEvent } from 'aws-lambda'
import { MessageUtil } from '../services/message'
const Follow = db.Follower 

const follow = async(event:APIGatewayEvent) => {
    const follow = await Follow.create({ownerId:event.user.id,targetId:event.pathParameters.targetUserId})
    return MessageUtil.success({success:true,follow:follow.dataValues})
} 

const unFollow = async(event: APIGatewayEvent) => {
    const follow = await Follow.findOne({where:{ownerId:event.user.id,targetId:event.pathParameters.targetUserId}})
    follow.destroy();
    return MessageUtil.success({success:true,follow:false})
} 


export const routeFollow = authenticateUser(follow)
export const routeUnFollow = authenticateUser(unFollow)