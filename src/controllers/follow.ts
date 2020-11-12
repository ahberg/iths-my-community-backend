import { inputParser, authenticateUser, addSequelize } from "../services/middleware";
import { APIGatewayEvent } from 'aws-lambda'
import { MessageUtil } from '../services/message'

const follow = async (event: APIGatewayEvent) => {
    const follow = await event.db.Follower.create({ ownerId: event.user.id, targetId: event.pathParameters.targetUserId })
    return MessageUtil.success({ success: true, follow: follow.dataValues })
}

const unFollow = async (event: APIGatewayEvent) => {
    const follow = await event.db.Follower.findOne({ where: { ownerId: event.user.id, targetId: event.pathParameters.targetUserId } })
    await follow.destroy();
    return MessageUtil.success({ success: true, follow: false })
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
