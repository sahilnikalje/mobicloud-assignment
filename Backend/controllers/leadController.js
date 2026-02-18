const Lead=require('../models/LeadSchema')

const getLeads=async(req,res)=>{
    try{
        const{page=1, limit=10, status, priority, search}=req.query
        const query={}

        if(req.user.role==='sales') query.assignedTo=req.user._id
        if(status) query.status=status
        if(priority) query.priority=priority
        if(search){
            query.$or=[
                {name:{$regex:search, $options:'i'}},
                {email:{$regex:search, $options:'i'}},
                {company:{$regex:search, $options:'i'}}
            ]
        }

        const total=await Lead.countDocuments(query)
        const leads=await Lead.find(query)
        .populate('assignedTo', 'name email')
        .sort({createdAt:-1})
        .skip((page-1)*limit)
        .limit(Number(limit))

        res.json({success:true, data:leads, total, page:Number(page), pages:Math.ceil(total/limit)})
    }
    catch(err){
        res.status(500).json({success:false, message:err.message})
    }
}


const getLead=async(req,res)=>{
    try{
        const lead=await Lead.findById(req.params.id).populate('assignedTo', 'name email')
        if(!lead){
            return res.status(404).json({success:false, message:"Lead not found"})
        }

        res.json({success:true, data:lead})
    }
    catch(err){
        res.status(500).json({success:false, message:err.message})
    }
}


const createLead=async(req,res)=>{
    try{
        const{name, email}=req.body
        if(!name || !email){
            return res.status(400).json({success:false, message:"All fields are mandetory"})
        }

        const lead=await Lead.create({
            ...req.body,
            assignedTo:req.body.assignedTo || req.user._id,
            createdBy:req.user._id
        })
        res.status(201).json({success:true, data:lead})
    }
    catch(err){
        res.status(500).json({success:false, message:err.message})
    }
}


const updateLead=async(req,res)=>{
    try{
        const lead=await Lead.findByIdAndUpdate(req.params.id, req.body, {new:true})
        if(!lead){
            return res.status(404).json({success:false, message:"Lead not found"})
        }

        res.json({success:true, data:lead})
    }
    catch(err){
        res.status(500).json({success:false, message:err.message})
    }
}


const deleteLead=async(req,res)=>{
    try{
        await Lead.findByIdAndDelete(req.params.id)
        res.json({success:true, message:'Lead deleted'})
    }
    catch(err){
        res.status(500).json({success:false, message:err.message})
    }
}


const getLeadStats=async(req,res)=>{
    try{
        const match=req.user.role==='sales' ? {assignedTo:req.user._id} : {}
        const stats=await Lead.aggregate([{$match:match}, {$group:{_id:'$status', count:{$sum:1}}}])
        res.json({success:true, data:stats})
    }
    catch(err){
        res.status(500).json({success:false, message:err.message})
    }
}



module.exports={getLeads, getLead, createLead, updateLead, deleteLead, getLeadStats}