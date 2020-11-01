import passport from "passport";
import config from "../config/config";
import { allowOnly } from "../services/routesHelper";
import {
  create,
  login,
  findAllUsers,
  userInfoByUsername,
  update,
  deleteUser,
  currentUserInfo
} from "../controllers/user";

export default (app) => {
  // create a new user
  app.post(
    "/api/user",
    //passport.authenticate('jwt', { session: false }),
    create
  );

  // user login
  app.post("/api/user/login", login);

  app.get(
    "/api/user/info",
    passport.authenticate("jwt", {
      session: false,
    }),
    currentUserInfo,
  );

  //retrieve all users
  app.get(
    "/api/users",
    passport.authenticate("jwt", {
      session: false,
    }),
    findAllUsers
  );

  // retrieve user by id
  app.get(
    "/api/users/:username",
    passport.authenticate("jwt", {
      session: false,
    }),
    userInfoByUsername
  );

  // update a user with id
  app.put(
    "/api/users/:userId",
    passport.authenticate("jwt", {
      session: false,
    }),
    update
  );

  // delete a user
  app.delete(
    "/api/users/:userId",
    passport.authenticate("jwt", {
      session: false,
    }),
    deleteUser
  );

};
