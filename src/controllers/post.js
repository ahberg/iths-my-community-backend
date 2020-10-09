import db from "../models";
const Post = db.Post;

const create = (req, res) => {
  let newPost = {
    author: req.user.id,
    content: req.body.content,
  };
  Post.create(newPost);
  res.json({ newPost });
};

const userPosts = (req, res) => {
  let posts = [];
  Post.findAll()
    .then((post) => {
      res.json({ success: true, posts: post  
      });
    })
    .catch((err) => res.status(500).json({ err }));
};

const findPostById = (req, res) => {
  const id = req.params.postId;
  //let posts = [];
  Post.findAll({where: {id}})
  .then((posts) => {
    if(posts.length == 0) {
      res.json({ success: true, post:[] });
    }
    const defaultFields = {
      comments:[],
      likes:[]
    }
    const post = Object.assign(defaultFields,posts[0].dataValues);
      res.json({ success: true, post:post });
    })
    .catch((err) => res.status(500).json({ err }));
};

export { create, userPosts, findPostById };
