const Deal=require('../models/dealSchema')

const getDeals=async(req,res)=>{
    try{
        const{stage, leadId}=req.query
        const query={}

        if(req.user.role==='sales') query.assignedTo=req.user._id
        if(stage) query.stage=stage
        if(leadId) query.lead=leadId

        const deals=await Deal.find(query)
        .populate('Lead', 'name email company')
        .populate('assignedTo', 'name')
        .sort({createdAt:-1})

        res.json({success:true, data:deals})
    }
    catch(err){
        res.status(500).json({success:false, message:err.message})
    }
}

const createDeal=async(req,res)=>{
    try{
        const{title, value, lead}=req.body
        if(!title || !value ||!lead){
            return res.status(400).json({success:false, message:'All fields are mandetory'})
        }

        const deal=await Deal.create({
            ...req.body,
            assignedTo:req.user._id,
            createdBy:req.user._id
        })
        res.status(201).json({success:true, data:deal})
    }
    catch(err){
        res.status(500).json({success:false, message:err.message})
    }
}


const updateDeal=async(req,res)=>{
    try{
        const deal=await Deal.findByIdAndUpdate(req.params.id, req.body, {new:true})
                   .populate('lead', 'name email')

        if(!deal){
            return res.status(404).json({success:false, message:'Deal not found'})
        }

        res.json({success:true, data:deal})
    }
    catch(err){
        res.status(500).json({success:false, message:err.message})
    }
}


const deleteDeal=async(req,res)=>{
    try{
        await Deal.findByIdAndDelete(req.params.id)
        res.json({success:true, message:'Deal deleted'})
    }
    catch(err){
        res.status(500).json({success:false, message:err.message})
    }
}


const getPipelineStats=async(req,res)=>{
    try{
        const match=req.user.role==='sales' ? {assignedTo:req.user._id} : {}
        const stats=await Deal.aggregate([
            {$match:match},
            {$group:{_id:'$stage', count:{$sum:1}, totalValue:{$sum:'$value'}}}
        ])

        res.json({success:true, data:stats})
    }
    catch(err){
        res.status(500).json({success:false, message:err.message})
    }
}


module.exports={getDeals, createDeal, updateDeal, deleteDeal, getPipelineStats}
