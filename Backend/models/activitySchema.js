const mongoose=require('mongoose')

const activitySchema=new mongoose.Schema({
     type:{type:String, enum:['call', 'meeting', 'note', 'follow_up'], required:true},
     title:{type:String, required:true},
     description:{type:String},
     status:{type:String, enum:['pending', 'completed', 'cancelled'], default:'pending'},
     lead:{type:mongoose.Schema.Types.ObjectId, ref:'Lead', required:true},
     createdBy:{type:mongoose.Schema.Types.ObjectId, ref:'User', required:true}
},{
    timestamps:true
})

module.exports=mongoose.model('Activity', activitySchema)