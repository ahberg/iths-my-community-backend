import { inputParser,authenticateUser, addSequelize } from "../services/middleware";
import { APIGatewayEvent } from 'aws-lambda'
import { MessageUtil } from '../services/message'


const defaultFields = {
  comments: [],
  likes: [],
};
const getUserPosts = async (event:APIGatewayEvent,userId: number,following = []) => {
  let posts = [];
  following.push(userId);
  posts = await event.db.Post.findAll({ where: {author: following}, order: [["id", "DESC"]], limit: 10 });
  return posts;
};

const create = (event:APIGatewayEvent) => {
  let newPost = {
    author: event.user.id,
    content: event.body.content,
  };
  return event.db.Post.create(newPost)
    .then((post) => {
      let completePost = Object.assign(defaultFields, post.dataValues);
      return MessageUtil.success({ success: true, post: completePost });
    })
    .catch((err) => {
      return MessageUtil.error(500,{ err });
    });
};

const deletePost = async (event:APIGatewayEvent) => {
  const id = event.pathParameters.postId;
  await event.db.Post.destroy({ where: { id } })
  return MessageUtil.success({success:true})
};



const userPosts = async (event :APIGatewayEvent) => {
  let posts = [];
  const query = {where:{ownerId: event.user.id},attributes:['targetId']}
  let following = await event.db.Follower.findAll(query)
  following = following.map( f => f.targetId)
  posts = await getUserPosts(event,event.user.id,following);
 return MessageUtil.success({ success: true, posts: posts});
};

export const routeCreate = addSequelize(authenticateUser(inputParser(create)))
export const routeDelete = addSequelize(authenticateUser(deletePost))
export const routeUserPosts = addSequelize(authenticateUser(userPosts))
export {getUserPosts} 
