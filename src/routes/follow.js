import  passport from 'passport'
import {follow, unFollow}  from '../controllers/follow'

module.exports = (app) => {
    app.post(
    '/api/follow/:targetUserId',
    passport.authenticate('jwt',{session:false}),
    follow
    )

    app.delete(
    '/api/follow/:targetUserId',
    passport.authenticate('jwt',{session:false}),
    unFollow
    )
}



