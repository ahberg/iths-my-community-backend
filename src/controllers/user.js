import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import passport from 'passport';

import db from '../models';
const User = db.User;

// load input validation
import validateRegisterForm from '../validation/register';
import validateLoginForm from '../validation/login';

// create user
const create = (req, res) => {
  const { errors, isValid } = validateRegisterForm(req.body);
  let { 
    username, 
    name, 
    password, 
  } = req.body;

  // check validation
  if(!isValid) {
    return res.status(400).json(errors);
  }

  User.findAll({ where: { username } }).then(user => {
    if (user.length) {
      return res.status(400).json({ 'message': 'Username already exists!' });
    } else {
      let newUser = { 
        username, 
        name, 
        password, 
      };
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          User.create(newUser)
            .then(user => {
              res.json({ user });
            })
            .catch(err => {
              res.status(500).json({ err });
            });
        });
      });
    }
  });
};

const login = (req, res) => {
  const { errors, isValid } = validateLoginForm(req.body);

  // check validation
  if(!isValid) {
    return res.status(400).json(errors);
  }

  const { username, password } = req.body;

  User.findAll({ 
    where: { 
      username 
    } 
  })
  .then(user => {

    //check for user
    if (!user.length) {
      errors.username = 'User not found!';
      return res.status(404).json(errors);
    }
     
    let originalPassword = user[0].dataValues.password
    //check for password
    bcrypt
    .compare(password, originalPassword)
    .then(isMatch => {
      if (isMatch) {
        // user matched
        console.log('matched!')
        const { id, username } = user[0].dataValues;
        const payload = { id, username }; //jwt payload
        // console.log(payload)
        jwt.sign(payload, 'secret', { 
          expiresIn: 36000
        }, (err, token) => {
          user[0].password = ''
            res.json({
              success: true,
              token: 'Bearer ' + token,
              user: user[0]
            });
          });
        } else {
          errors.password = 'Password not correct';
          return res.status(400).json(errors);
        }
    }).catch(err => console.log(err));
  }).catch(err => res.status(500).json({err}));
};

// fetch all users
const findAllUsers = (req, res) => {
  User.findAll()
    .then(user => {
      res.json({ user });
    })
    .catch(err => res.status(500).json({ err }));
};

const currentUserInfo = (req, res) => {
  const { id, username } = req.user;
  const payload = { id, username }; //jwt payload
  var user = req.user.dataValues
  user.following = [] 
  user.followers = []
  user.posts = []
  user.profileImg = '/static/img/default-user-profile-img.png'
  user.userImg = '/static/img/default-user-profile-img.png'

        // console.log(payload)
        jwt.sign(payload, 'secret', { 
          expiresIn: 36000 
        }, (err, token) => {
            res.json({
              success: true,
              token: 'Bearer ' + token,
              user: user
            });
          });
};


// fetch user by userId
const findById = (req, res) => {
  const id = req.params.userId;
  
  User.findAll({ where: { id } })
    .then(user => {
      if(!user.length) {
        return res.json({ msg: 'user not found'})
      }
      res.json({ user })
    })
    .catch(err => res.status(500).json({ err }));
};

// update a user's info
const update = (req, res) => {
  let { firstname, lastname, HospitalId, role, image } = req.body;
  const id = req.params.userId;

  User.update(
    {
      firstname,
      lastname,
      role,
    },
    { where: { id } }
  )
    .then(user => res.status(200).json({ user }))
    .catch(err => res.status(500).json({ err }));
};

// delete a user
const deleteUser = (req, res) => {
  const id = req.params.userId;

  User.destroy({ where: { id } })
    .then(() => res.status.json({ msg: 'User has been deleted successfully!' }))
    .catch(err => res.status(500).json({ msg: 'Failed to delete!' }));
};

const userPosts = (req, res) => {
  let posts = [];

  res.json({posts})
}

export { 
    create, 
    login, 
    findAllUsers, 
    findById, 
    update, 
    deleteUser,
   userPosts,
   currentUserInfo
}