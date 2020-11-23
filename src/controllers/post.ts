import { inputParser,authenticateUser, addSequelize } from "../services/middleware";
import { APIGatewayEvent } from 'aws-lambda'
import { MessageUtil } from '../services/message'
import { DynamoDB } from 'aws-sdk';
const DB = new DynamoDB.DocumentClient({params: {TableName: process.env.DYNAMODB_TABLE_POST}});

const defaultFields = {
  comments: [],
  likes: [],
};
const getUserPosts = async (event:APIGatewayEvent,userId: number,following = []) => {
  let posts = [];
  following.push(userId);
  const search = {
    KeyConditionExpression: "userId = :v_userId",
    ExpressionAttributeValues: {
      ":v_userId": userId
    }
  }
  const result = await DB.query(search).promise();
  return result.Items;
};

const create = (event:APIGatewayEvent) => {
  let newPost = {
    userId: event.user.id,
    content: event.body.content,
    createdAt: new Date().toISOString()
  };
  

  return DB.put({Item:newPost}).promise()
    .then(() => {
      let completePost = Object.assign(defaultFields, newPost);
      return MessageUtil.success({ success: true, post: completePost });
    })
    .catch((err) => {
      return MessageUtil.error(500,{ err });
    });
};

const deletePost = async (event:APIGatewayEvent) => {
  const id = event.pathParameters.postId;
  await DB.delete({Key:{userId:event.user.id,createdAt:id}}).promise()
  return MessageUtil.success({success:true})
};



const userPosts = async (event :APIGatewayEvent) => {
  let posts = [];
/*   const query = {where:{ownerId: event.user.id},attributes:['targetId']}
  let following = await event.db.Follower.findAll(query)
  following = following.map( f => f.targetId) */
  const following = []
  posts = await getUserPosts(event,event.user.id,following);
 return MessageUtil.success({ success: true, posts: posts});
};

export const routeCreate = authenticateUser(inputParser(create))
export const routeDelete = authenticateUser(deletePost)
export const routeUserPosts = authenticateUser(userPosts)
export {getUserPosts} 
