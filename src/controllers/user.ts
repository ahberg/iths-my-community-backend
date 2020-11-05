import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../models';
import { getUserPosts } from './post';


// load input validation
import validateRegisterForm from '../validation/register';
import validateLoginForm from '../validation/login';

import {APIGatewayProxyHandler as APIHandler}  from 'aws-lambda' 
import{MessageUtil } from '../services/message'
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
  const token = await jwt.sign(
    payload,
    process.env.SECRET,
    {
      expiresIn: 36000,
    },
  );
  return `Bearer ${token}`;
};

// create user
const create: APIHandler = async(event, context) => {
  const { errors, isValid } = validateRegisterForm(JSON.parse(event.body));
  const {
    username, name, password, bio,
  } = JSON.parse(event.body);
  
  
  // check validation
  if (!isValid) {
    const message = Object.values(errors)[0];
    return MessageUtil.success({ success: false, message })
  }
  
  return User.findAll({ where: { username } }).then((user) => {
    if (user.length) {
      return MessageUtil.error(400,{ success: false, message: 'Username already exists!' })
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
          return MessageUtil.error(500,{ success: false, message: err });
        });
      
      });
};

const login = async (req, res) => {
  const { errors, isValid } = validateLoginForm(req.body);

  // check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  const { username, password } = req.body;

  User.findOne({
    where: {
      username,
    },
  })
    .then(async (user) => {
      // check for user
      if (!user) {
        errors.message = 'User not found!';
        return res.status(404).json(errors);
      }

      const originalPassword = user.dataValues.password;
      // check for password
      bcrypt
        .compare(password, originalPassword)
        .then(async (isMatch) => {
          if (isMatch) {
            // user matched
            req.user = user;
            return await currentUserInfo(req, res);
          }
          errors.message = 'Password not correct';
          return res.status(400).json(errors);
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => res.status(500).json({ err }));
};

// fetch all users
const findAllUsers = async (req, res) => {
  const { Op } = require('sequelize');
  const search = {
    where: {
      id: { [Op.ne]: req.user.id },
    },
    raw: true,
  };
  const results = await User.findAll(search);
  const users = results;
  users.forEach((u) => {
    Object.assign(u, defaultValues);
  });
  res.json({ success: true, users });
};

const currentUserInfo = async (req, res) => {
  const user = req.user.dataValues;
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
  res.json({
    success: true,
    token,
    user,
  });
};

// fetch user by userId
const userInfoByUsername = async (req, res) => {
  const { username } = req.params;

  const user = await User.findOne({ where: { username }, raw: true });
  if (user == null) {
    return res.json({ success: false, msg: `user ${username} not found` });
  }
  const posts = await getUserPosts(user.id);
  const query = { where: { ownerId: user.id }, attributes: ['targetId'] };
  const following = await db.Follower.findAll(query);
  user.following = following.map((f) => f.targetId);
  Object.assign(user, defaultValues);
  user.posts = posts;
  res.json({ success: true, user });
};

// update a user's info
const update = (req, res) => {
  const fields = {};
  const id = req.params.userId;

  if (typeof req.body.name !== 'undefined') {
    fields.name = req.body.name;
  }
  if (typeof req.body.bio !== 'undefined') {
    fields.bio = req.body.bio;
  }
  if (typeof req.body.password !== 'undefined') {
    fields.password = getPasswordHash(req.body.password);
  }

  User.update(fields, { where: { id } })
    .then((user) => res.status(200).json({ message: 'User updated' }))
    .catch((err) => res.status(500).json({ err }));
};

// delete a user
const deleteUser = (req, res) => {
  const id = req.params.userId;

  User.destroy({ where: { id } })
    .then(() => res.status.json({ msg: 'User has been deleted successfully!' }))
    .catch((err) => res.status(500).json({ msg: 'Failed to delete!' }));
};

const userPosts = (req, res) => {
  const posts = [];

  res.json({ posts });
};

export {
  create,
  login,
  findAllUsers,
  userInfoByUsername,
  update,
  deleteUser,
  userPosts,
  currentUserInfo,
};
