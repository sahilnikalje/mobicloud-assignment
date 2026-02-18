const mongoose=require('mongoose')

const dealSchema=new mongoose.Schema({
    title:{type:String, required:true},
    value:{type:Number, required:true},
    stage:{type:String, enum:['prospect', 'negotiation', 'won', 'lost'], default:'prospect'},
    probability:{type:Number, default:0},
    expectedCloseDate:{type:Date},
    notes:{type:String},
    lead:{type:mongoose.Schema.Types.ObjectId, ref:'Lead', required:true},
    assignedTo:{type:mongoose.Schema.Types.ObjectId, ref:'User', required:true},
    createdBy:{type:mongoose.Schema.Types.ObjectId, ref:'User', required:true}
},{
    timestamps:true
})