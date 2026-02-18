const mongoose=require('mongoose')

const leadSchema=new mongoose.Schema({
    name:{type:String, required:true, trim:true},
    email:{type:String, required:true},
    phone:{type:String},
    company:{type:String},
    status:{type:String, enum:['new', 'contacted', 'qualified', 'unqualified', 'converted'], default:'new'},
    source:{type:String, enum:['website', 'referal', 'social_media', 'cold_call', 'email', 'other'], default:'other'},
    priority:{type:String, enum:['low', 'medium', 'high'], default:'medium'},
    notes:{type:String},
    assignedTo:{type:mongoose.Schema.Types.ObjectId, ref:'User', required:true},
    createdBy:{type:mongoose.Schema.Types.ObjectId, ref:'User', required:true}
},{
    timestamps:true
})

module.exports=mongoose.model('Lead', leadSchema)