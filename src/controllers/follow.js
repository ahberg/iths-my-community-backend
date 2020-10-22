import db from "../models"
const Follow = db.Follower 

const follow = async(req,res) => {
    const follow = await Follow.create({ownerId:req.user.id,targetId:req.params.targetUserId})
    res.json({success:true,follow:follow.dataValues})
} 

const unFollow = async(req,res) => {
    const follow = await Follow.findOne({where:{ownerId:req.user.id,targetId:req.params.targetUserId}})
    follow.destroy();
    res.json({success:true,follow:false})
} 


export {follow,unFollow}