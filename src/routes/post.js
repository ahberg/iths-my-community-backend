import passport from 'passport';
import config from '../config/config';
import { allowOnly } from '../services/routesHelper';
import { create, deletePost,userPosts,findPostById}  from '../controllers/post';

export default (app) => {
  // create a new post
  app.post(
    '/api/post',
    passport.authenticate('jwt', { session: false }),
    create
  );
  


  app.get(
    "/api/user/posts",
    passport.authenticate("jwt", {
      session: false,
    }),
    userPosts
  );

  app.delete(
    "/api/post/:postId",
    passport.authenticate("jwt", {
      session: false,
    }),
    deletePost
  );

  app.get(
    '/api/post/:postId',
    passport.authenticate('jwt', {
      session:false
    }),
    findPostById
  )


};