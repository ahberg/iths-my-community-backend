import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../models';
import { getUserPosts } from './post';
import { inputParser,authenticateToken } from '../services/middleware'

// load input validation
import validateRegisterForm from '../validation/register';
import validateLoginForm from '../validation/login';

import { APIGatewayProxyHandler as APIHandler } from 'aws-lambda'
import { MessageUtil } from '../services/message'

const { User } = db;

const defaultValues = {
  // following: [],
  followers: [],
  password: '',
  profileImg: '/static/img/default-user-profile-img.png',
  userImg: '/static/img/default-user-bkg-img.jpg',
};

const getPasswordHash = (password) => {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
};

const generateAuthToken = async (payload) => {
  const token =  jwt.sign(
    payload,
    process.env.SECRET,
    {
      expiresIn: 36000,
    },
  );
  return `Bearer ${token}`;
};

// create user
const create: APIHandler = async (event, context) => {
  const { errors, isValid } = validateRegisterForm(event.body);
  const {
    username, name, password, bio,
  } = event.body


  // check validation
  if (!isValid) {
    const message = Object.values(errors)[0];
    return MessageUtil.success({ success: false, message })
  }

  return User.findAll({ where: { username } }).then((user) => {
    if (user.length) {
      return MessageUtil.error(400, { success: false, message: 'Username already exists!' })
    }
    const newUser = {
      username,
      name,
      password,
      bio,
    };
    newUser.password = getPasswordHash(newUser.password)
    return User.create(newUser).then((user) => {
      return MessageUtil.success({ success: true, user });
    })
      .catch((err) => {
        return MessageUtil.error(500, { success: false, message: err });
      });

  });
};

const login: APIHandler = async (event, context) => {
  const postInput: any = event.body
  const { errors, isValid } = validateLoginForm(postInput);

  // check validation
  if (!isValid) {
    return MessageUtil.error(400, errors);
  }
  const { username, password } = postInput;
  console.log(password)

  const user = await User.findOne({
    where: {
      username,
    },
  });


  // check for user
  if (!user) {
    errors.message = 'User not found!';
    return MessageUtil.error(404, errors);
  }

  const originalPassword = user.dataValues.password;
  // check for password
  return bcrypt
    .compare(password, originalPassword)
    .then(async (isMatch) => {
      if (isMatch) {
        // user matched
        event.user = user;
        return await currentUserInfo(event, context);
      }
      errors.message = 'Password not correct';
      return MessageUtil.error(400, errors);
    })
}

// fetch all users
const findAllUsers: APIHandler = async (event, context) => {
  const { Op } = require('sequelize');
  const search = {
    where: {
      id: { [Op.ne]: event.user.id },
    },
    raw: true,
  };
  const results = await User.findAll(search);
  const users = results;
  users.forEach((u) => {
    Object.assign(u, defaultValues);
  });
  MessageUtil.success({ success: true, users });
};

const currentUserInfo = async (event, context) => {
  const user = event.user.dataValues;
  const { id, username } = user;
  const payload = { id, username }; // jwt payload
  const query = {
    raw: true,
    where: { ownerId: id },
    attributes: [
      ['targetId', 'id'],
      'target.username',
      'target.name',
    ],
    include: [{
      model: User,
      as: 'target',
      attributes: [],

    }],
  };
  const following = await db.Follower.findAll(query);
  user.following = following;
  user.posts = await getUserPosts(id);
  Object.assign(user, defaultValues);

  const token = await generateAuthToken(payload);
  return MessageUtil.success({ success: true, user, token });
};

// fetch user by userId
const userInfoByUsername: APIHandler = async (event, context) => {
  const { username } = event.pathParameters;

  const user = await User.findOne({ where: { username }, raw: true });
  if (user == null) {
    return MessageUtil.success({ success: false, msg: `user ${username} not found` });
  }
  const posts = await getUserPosts(user.id);
  const query = { where: { ownerId: user.id }, attributes: ['targetId'] };
  const following = await db.Follower.findAll(query);
  user.following = following.map((f) => f.targetId);
  Object.assign(user, defaultValues);
  user.posts = posts;
  return MessageUtil.success({ success: true, user });
};

// update a user's info
const update: APIHandler = async (event, context) => {
  type Input = { [key: string]: { prop: any } };
  const postInput: any = event.body
  const fields: Input = {};
  const id = event.pathParameters.userId;

  if (typeof postInput.name !== 'undefined') {
    fields.name = postInput.name;
  }
  if (typeof postInput.bio !== 'undefined') {
    fields.bio = postInput.bio;
  }
  if (typeof postInput.password !== 'undefined') {
    fields.password = getPasswordHash(postInput.password);
  }

  return User.update(fields, { where: { id } })
    .then((user) => MessageUtil.success({ message: 'User updated' }))
    .catch((err) => {
      return MessageUtil.error(500, err)
    });
};
// delete a user
const deleteUser: APIHandler = (event, context) => {
  const id = event.pathParameters.userId;


  return User.destroy({ where: { id } })
    .then(() => MessageUtil.success({ msg: 'User has been deleted successfully!' }))
    .catch((err) => { return MessageUtil.error(500, { msg: 'Failed to delete!' }) });
};

export const routeCreate = inputParser(create)
export const routeLogin = inputParser(login)
export const routeUserInfo = authenticateToken(currentUserInfo)
export const routeFindALl = authenticateToken(findAllUsers)
export const routeUserUpdate = authenticateToken(inputParser(update))
export const routeUserDelete = authenticateToken(deleteUser)

