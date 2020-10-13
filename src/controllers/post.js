import db from "../models";
const Post = db.Post;

const defaultFields = {
  comments: [],
  likes: [],
};

const create = (req, res) => {
  let newPost = {
    author: req.user.id,
    content: req.body.content,
  };
  Post.create(newPost)
    .then((post) => {
      let completePost = Object.assign(defaultFields, post.dataValues);
      res.json({ success: true, post: completePost });
    })
    .catch((err) => {
      res.status(500).json({ err });
    });
};

const deletePost = async (req, res) => {
  const id = req.params.postId;
  await Post.detroy({ where: { id } })
  return res.json({success:true})
};

const getUserPosts = async (userId) => {
  let posts = [];
  posts = await Post.findAll({ where: {author: userId}, order: [["id", "DESC"]], limit: 10 });
  return posts;
};


const userPosts = async (req, res) => {
  let posts = [];
  let user = req.user.username
  posts = await getUserPosts(req.user.id);
  res.json({ success: true, posts: posts});
};

const findPostById = (req, res) => {
  const id = req.params.postId;
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
};

export { create, deletePost, userPosts, findPostById, getUserPosts };
