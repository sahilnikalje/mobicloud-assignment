const User=require('../models/userSchema')
const Lead=require('../models/LeadSchema')


const getAllUsers=async(req,res)=>{
    try{
        const users=await User.find().select('-password')
        res.json({success:true, data:users})
    }
    catch(err){
        res.status(500).json({success:false, message:err.message})
    }
}

const getUserWithLeads=async(req,res)=>{
    try{
        const user=await User.findById(req.params.id).select('-password')
        if(!user){
            return res.status(404).json({success:false, message:"User not found"})
        }

        const leads=await Lead.find({assignedTo:req.params.id})
        
        res.json({success:true, data:{user, leads}})
    }
    catch(err){
        res.status(500).json({success:false, message:err.message})
    }
}


const updateUser=async(req,res)=>{
    try{
        const user=await User.findByIdAndUpdate(req.params.id, req.body, {new:true}).select('-password')
        if(!user){
            return res.status(404).json({success:false, message:"User not found"})
        }
    }
    catch(err){
        res.status(500).json({success:false, message:err.message})
    }
}


const deleteUser=async(req,res)=>{
    try{
        await User.findByIdAndDelete(req.params.id)
        res.json({success:true, message:"User deleted"})
    }
    catch(err){
        res.status(500).json({success:false, message:err.message})
    }
}


module.exports={getAllUsers, getUserWithLeads, updateUser, deleteUser}