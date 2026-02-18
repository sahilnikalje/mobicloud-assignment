const Activity=require('../models/activitySchema')

const getActivities=async(req,res)=>{
    try{
        const{type, status, leadId}=req.query
        const query={}

        if(req.user.role==='sales') query.createdBy=req.user._id
        if(type) query.type=type
        if(status) query.status=status
        if(leadId) query.lead=leadId

        const activities=await Activity.find(query)
                         .populate('lead', 'name company')
                         .populate('createdBy', 'name')
                         .sort({createdAt:-1})

        res.json({success:true, data:activities})
    }
    catch(err){
        res.status(500).json({success:false, message:err.message})
    }
}


const createActivity=async(req,res)=>{
    try{
        const{type, title, lead}=req.body
        if(!type || !title || !lead){
            return res.status(400).json({success:false, message:"All fields are mandetory"})
        }

        const activity=await Activity.create({...req.body, createdBy: req.user._id})

        res.status(201).json({success:true, data:activity})
    }
    catch(err){
        res.status(500).json({success:false, message:err.message})
    }
}


const updateActivity=async(req,res)=>{
    try{
        const activity=await Activity.findByIdAndUpdate(req.params.id, req.body, {new:true})
        if(!activity){
            return res.status(404).json({success:false, message:"Activity not found"})
        }
        res.json({success:true, data:activity})
    }
    catch(err){
        res.status(500).json({success:false, message:err.message})
    }
}


const deleteActivity=async(req,res)=>{
    try{
        await Activity.findByIdAndDelete(req.params.id)
        res.json({success:true, message:'Activity deleted'})
    }
    catch(err){
        res.status(500).json({success:false, message:err.message})
    }
}



module.exports={getActivities, createActivity, updateActivity, deleteActivity}