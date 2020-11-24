import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getUserPosts } from './post';
import { inputParser, authenticateUser, addSequelize } from '../services/middleware'

// load input validation
import validateRegisterForm from '../validation/register';
import validateLoginForm from '../validation/login';

import { APIGatewayProxyHandler as APIHandler } from 'aws-lambda'
import { MessageUtil } from '../services/message'
import { DynamoDB } from 'aws-sdk';
import * as uuid from 'uuid'
import { json } from 'sequelize/types';


const DB = new DynamoDB.DocumentClient({params: {TableName: process.env.DYNAMODB_TABLE_USER}});


const defaultValues = {
  followers: [],
  password: '',
  profileImg: '/static/img/default-user-profile-img.png',
  userImg: '/static/img/default-user-bkg-img.jpg',
};

const getPasswordHash = (password) => {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
};

const findUserByUsername = async (username: string) => {
  const search = {
    IndexName: 'usernameGSI',
    KeyConditionExpression: "username = :v_username",
    ExpressionAttributeValues: {
      ":v_username": username
    }
  }

  const result = await DB.query(search).promise();
  if(result.Items.length) {
    return result.Items[0]
  } 
  return null
}

const generateAuthToken = async (payload) => {
  const token = jwt.sign(
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
  const user = await findUserByUsername(username)
  if (user) {
    return MessageUtil.error(400, { success: false, message: 'Username already exists!' })
  }

  const newUser = {
    id:uuid.v4(),
    username,
    name,
    password,
    bio,
  };
  newUser.password = getPasswordHash(newUser.password)

  const put = {
    Item: newUser
  }
  return DB.put(put).promise().then((R) => {
    return MessageUtil.success({ success: true, user });
  }).catch((e) => {
    return MessageUtil.error(500, { success: false, message: e });
  });

}

const login: APIHandler = async (event, context) => {
  const postInput: any = event.body
  const { errors, isValid } = validateLoginForm(postInput);


  // check validation
  if (!isValid) {
    return MessageUtil.error(400, errors);
  }
  const { username, password } = postInput;
  const search = {
    IndexName: 'usernameGSI',
    KeyConditionExpression: "username = :v_username",
    ExpressionAttributeValues: {
      ":v_username": username
    }
  }

  const result = await DB.query(search).promise();
  const user = result.Items[0]

  // check for user
  if (!user) {
    errors.message = 'User not found!';
    return MessageUtil.error(404, errors);
  }

  const originalPassword = user.password;
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
  const search = {
    FilterExpression: 'NOT id = :uuid',
    ExpressionAttributeValues: {':uuid': event.user.id},
    //ProjectionExpression: 'id, username'

  }
  const results = await DB.scan(search).promise();
  const users = results.Items;
  users.forEach((u) => {
    u.password = '',
    Object.assign(u, defaultValues);
  });
  return MessageUtil.success({ success: true, users });
};

const currentUserInfo = async (event, context) => {
  const user = event.user;
  const TableName = process.env.DYNAMODB_TABLE_USER
  let followingIds = []
  if(typeof user.following == 'object') {
    
    let queryParams = {RequestItems: {}};
    followingIds = user.following.values

    queryParams.RequestItems[TableName] = {
      Keys: followingIds.reduce((a,c,i) => {
        a[i] = {'id': c}
        return a
     },[]),
     ExpressionAttributeNames: {
       '#n': 'name'
     },
     ProjectionExpression: 'id, username, #n'
   } 
   const results = await DB.batchGet(queryParams).promise();
   user.following = results.Responses[TableName]
  } else {
    user.following = []
  }
  const { id, username } = user;
  const payload = { id, username }; // jwt payload
 
  user.posts = await getUserPosts(id); 
  Object.assign(user, defaultValues);

  const token = await generateAuthToken(payload);
  return MessageUtil.success({ success: true, user, token });
};

// fetch user by userId
const userInfoByUsername: APIHandler = async (event, context) => {
  const { username } = event.pathParameters;

  const user = await findUserByUsername(username)
  if (user == null) {
    return MessageUtil.success({ success: false, msg: `user ${username} not found` });
  }
  const posts = await getUserPosts(user.id);
  //const following = await event.db.Follower.findAll(query);
  //user.following = following.map((f) => f.targetId);
  user.following = []
  Object.assign(user, defaultValues);
  user.posts = posts;
  return MessageUtil.success({ success: true, user });
};

// update a user's info
const update: APIHandler = async (event, context) => {
  type Input = { [key: string]: { prop: string } };
  const postInput: any = event.body
  const fields: Input = {};
  const id = event.user.id

  if (typeof postInput.name !== 'undefined') {
    fields.name = postInput.name;
  }
  if (typeof postInput.bio !== 'undefined') {
    fields.bio = postInput.bio;
  }
  if (typeof postInput.password !== 'undefined') {
    fields.password = getPasswordHash(postInput.password);
  }
  const update = {
    Item:fields,
    Key: {
      id: id,
    }
  }
  return DB.update(update).promise()
    .then((user) => MessageUtil.success({ message: 'User updated', update:fields }))
    .catch((err) => {
      return MessageUtil.error(500, err)
    });
};
// delete a user
const deleteUser: APIHandler = (event, context) => {
  const id = event.user.id;
  return DB.delete({ Key: { id: id } }).promise()
    .then(() => MessageUtil.success({ msg: 'User has been deleted successfully!' }))
    .catch((err) => { return MessageUtil.error(500, { msg: 'Failed to delete!' }) });
};

export const routeCreate = inputParser(create)
export const routeLogin = inputParser(login)
export const routeUserInfo = authenticateUser(currentUserInfo)
export const routeFindAll = authenticateUser(findAllUsers)
export const routeFind = authenticateUser(userInfoByUsername)
export const routeUserUpdate = authenticateUser(inputParser(update))
export const routeUserDelete = authenticateUser(deleteUser)

