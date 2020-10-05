import passport from 'passport';
import config from '../config/config';
import { allowOnly } from '../services/routesHelper';
import { create, login, findAllposts, 
    findById, update, deletepost
} from '../controllers/post';

module.exports = (app) => {
  // create a new post
  app.post(
    '/api/posts/create',
    //passport.authenticate('jwt', { session: false }),
    create
  );

  // post login
  app.post('/api/posts/login', login);

  //retrieve all posts
  app.get(
    '/api/posts', 
    passport.authenticate('jwt', { 
      session: false 
    }),
    findAllposts
  );
}