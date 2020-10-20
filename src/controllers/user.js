import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../models";
import { getUserPosts } from "./post";

const User = db.User;

// load input validation
import validateRegisterForm from "../validation/register";
import validateLoginForm from "../validation/login";


const defaultValues = {
 // following: [],
  followers: [],
  password: "",
  profileImg: "/static/img/default-user-profile-img.png",
  userImg: "/static/img/default-user-bkg-img.jpg",
};

const getPasswordHash = (password) => {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
};

const generateAuthToken = async(payload)  => {
 let token = await jwt.sign(
    payload,
    process.env.SECRET,
    {
      expiresIn: 36000,
    })
   return `Bearer ${token}`
   
}

// create user
const create = (req, res) => {
  const { errors, isValid } = validateRegisterForm(req.body);
  let { username, name, password,bio } = req.body;

  // check validation
  if (!isValid) {
    let message = Object.values(errors)[0]
    return res.status(400).json({success:false ,message:message });
  } 

  User.findAll({ where: { username } }).then((user) => {
    if (user.length) {
      return res.status(400).json({ success: false,message: "Username already exists!" });
    } else {
      let newUser = {
        username,
        name,
        password,
        bio,
      };
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          User.create(newUser)
            .then((user) => {
              res.json({success:true, user:user});
            })
            .catch((err) => {
              res.status(500).json({success:false ,message:err });
            });
        });
      });
    }
  });
};

const login = async(req, res) => {
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
    .then(async(user) => {
      //check for user
      if (!user) {
        errors.message = "User not found!";
        return res.status(404).json(errors);
      }

      let originalPassword = user.dataValues.password;
      //check for password
      bcrypt
        .compare(password, originalPassword)
        .then(async(isMatch) => {
          if (isMatch) {
            // user matched
            user = user.dataValues
            const { id, username } = user;
            const payload = { id, username }; //jwt payload
            Object.assign(user,defaultValues);
            let token = await generateAuthToken(payload);        
              res.json({
                success: true,
                token: token,
                user: user,
              })
          } else {
            errors.message = "Password not correct";
            return res.status(400).json(errors);
          }
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => res.status(500).json({ err }));
};

// fetch all users
const findAllUsers = async(req, res) => {
const Op = require("sequelize").Op
const search = {
  where: {
    id: {
      [Op.ne]: req.user.id}
    },
  raw : true   
}
let results = await User.findAll(search)
let users = results
users.forEach((u) => {
 Object.assign(u,defaultValues)
})
res.json({success:true,users:users})
    
};

const currentUserInfo = async (req, res) => {
  let user = req.user.dataValues
  const { id, username } = user;
  const payload = { id, username }; //jwt payload
  const query = {where:{ownerId: id},attributes:['targetId']}
  let following = await db.Follower.findAll(query)
  user.following = following.map( f => f.targetId)  
  user.posts = await getUserPosts(id);
  Object.assign(user,defaultValues)

  let token = await generateAuthToken(payload);        
  res.json({
    success: true,
    token: token,
    user: user,
  })

};

// fetch user by userId
const userInfoByUsername = async(req, res) => {
  const username = req.params.username;
   
    let user = await  User.findOne({ where: { username }, raw : true    })
    if (user == null) {
      return res.json({ success:false, msg: `user ${username} not found` });
    }
   let posts = await getUserPosts(user.id)
   const query = {where:{ownerId: user.id},attributes:['targetId']}
   let following = await db.Follower.findAll(query)
   user.following = following.map( f => f.targetId)  
    Object.assign(user,defaultValues)
    user.posts = posts
    res.json({success:true,user: user});


};

// update a user's info
const update = (req, res) => {
  let fields = {};
  const id = req.params.userId;

  if (typeof req.body.name != "undefined") {
    fields.name = req.body.name;
  }
  if (typeof req.body.bio != "undefined") {
    fields.bio = req.body.bio;
  }
  if (typeof req.body.password != "undefined") {
    fields.password = getPasswordHash(req.body.password);
  }

  User.update(fields, { where: { id } })
    .then((user) => res.status(200).json({ message: "User updated" }))
    .catch((err) => res.status(500).json({ err }));
};

// delete a user
const deleteUser = (req, res) => {
  const id = req.params.userId;

  User.destroy({ where: { id } })
    .then(() => res.status.json({ msg: "User has been deleted successfully!" }))
    .catch((err) => res.status(500).json({ msg: "Failed to delete!" }));
};

const userPosts = (req, res) => {
  let posts = [];

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
