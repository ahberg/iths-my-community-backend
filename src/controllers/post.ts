import db from "../models";
import { inputParser,authenticateUser } from "../services/middleware";
import { APIGatewayEvent } from 'aws-lambda'
import { MessageUtil } from '../services/message'

const Post = db.Post;

const defaultFields = {
  comments: [],
  likes: [],
};
const getUserPosts = async (userId,following = []) => {
  let posts = [];
  following.push(userId);
  posts = await Post.findAll({ where: {author: following}, order: [["id", "DESC"]], limit: 10 });
  return posts;
};

const create = (event:APIGatewayEvent) => {
  let newPost = {
    author: event.user.id,
    content: event.body.content,
  };
  return Post.create(newPost)
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
  await Post.destroy({ where: { id } })
  return MessageUtil.success({success:true})
};



const userPosts = async (event :APIGatewayEvent) => {
  let posts = [];
  const query = {where:{ownerId: event.user.id},attributes:['targetId']}
  let following = await db.Follower.findAll(query)
  following = following.map( f => f.targetId)
  posts = await getUserPosts(event.user.id,following);
 return MessageUtil.success({ success: true, posts: posts});
};

const findPostById = async(event:APIGatewayEvent) => {
  const id = event.pathParameters.postID;
  //let posts = [];
  Post.findAll({ where: { id } })
    .then((posts) => {
      if (posts.length == 0) {
        res.json({ success: true, post: [] });
      }

      const post = Object.assign(defaultFields, posts[0].dataValues);
      res.json({ success: true, post: post });
    })
    .catch((err) => res.status(500).json({ err }));

    const posts = await   Post.findAll({ where: { id } })
    if(posts == 0) {
     return MessageUtil.success({ success: true, post: [] });
    }
    return MessageUtil.success({success: true, post: posts})

};


export const routeCreate = authenticateUser(inputParser(create))
export const routeDelete = authenticateUser(deletePost)
export const routeUserPosts = authenticateUser(userPosts)
export {getUserPosts} 
