import { inputParser, authenticateUser, addSequelize } from "../services/middleware";
import { APIGatewayEvent } from 'aws-lambda'
import { MessageUtil } from '../services/message'
import { DynamoDB } from 'aws-sdk';
const DB = new DynamoDB.DocumentClient({ params: { TableName: process.env.DYNAMODB_TABLE_POST } });

const defaultFields = {
  comments: [],
  likes: [],
};
const getUserPosts = async (userId: number) => {
  let posts = [];
  const search = {
    KeyConditionExpression: "userId = :v_userId",
    ExpressionAttributeValues: {
      ":v_userId": userId,
    },
    ScanIndexForward: false,
    Limit: 30,
  }
  const result = await DB.query(search).promise();
  posts = result.Items;
  return posts
};

const create = (event: APIGatewayEvent) => {
  let newPost = {
    userId: event.user.id,
    content: event.body.content,
    createdAt: new Date().toISOString()
  };


  return DB.put({ Item: newPost }).promise()
    .then(() => {
      let completePost = Object.assign(defaultFields, newPost);
      return MessageUtil.success({ success: true, post: completePost });
    })
    .catch((err) => {
      return MessageUtil.error(500, { err });
    });
};

const deletePost = async (event: APIGatewayEvent) => {
  const id = event.pathParameters.postId;
  await DB.delete({ Key: { userId: event.user.id, createdAt: id } }).promise()
  return MessageUtil.success({ success: true })
};



const userPosts = async (event: APIGatewayEvent) => {
  const user = event.user;
  let followingIds = []
  if (typeof user.following == 'object') {
    followingIds = user.following.values
  }
  let posts = [];
  posts = await getUserPosts(user.id);
  for (const id of followingIds) {
    let p = await getUserPosts(id)
    posts.push(...p)
  }
  posts.sort((a, b) => (a.createdAt < b.createdAt) - (a.createdAt > b.createdAt))

  return MessageUtil.success({ success: true, posts });
};

export const routeCreate = authenticateUser(inputParser(create))
export const routeDelete = authenticateUser(deletePost)
export const routeUserPosts = authenticateUser(userPosts)
export { getUserPosts } 
