const bcrypt=require('bcryptjs')
const jwt=require('jsonwebtoken')
const User=require('../models/userSchema')

const generateToken=(id)=>jwt.sign(
    {id}, 
    process.env.JWT_SECRET, 
    {expiresIn: '7d'}
)

const register=async(req,res)=>{
    try{
        const{name, email, password}=req.body
        if(!name || !email || !password){
            return res.status(400).json({success:false, message:"All fields are mandetory"})
        }
        const userExist=await User.findOne({email})
        if(userExist){
            return res.status(400).json({success:false, message:"User already exist"})
        }

        const hashedPassword=await bcrypt.hash(password, 10)
        const user=await User.create(
            {
                name,
                email,
                password:hashedPassword,
                role:role || 'sales'
            }
        )

        res.status(201).json(
            {
                success:true, 
                token:generateToken(user._id), 
                user:{
                    id:user._id,
                    name:user.name,
                    email:user.email,
                    role:user.role
                }
            }
        )
    }
    catch(err){
        res.status(500).json({success:false, message:err.message})
    }
}



const login=async(req,res)=>{
    try{
        const{email, password}=req.body
        if(!email || !password){
            return res.status(400).json({success:false, message:"All fields are mandetory"})
        }

        const user=await User.findOne({email})
        if(!user){
            return res.status(401).json({success:false, message:"User does not exist"})
        }

        const match=await bcrypt.compare(password, user.password)
        if(!match){
            return res.status(401).json({success:false, message:"Invalid Credentials"})
        }

        res.json({
            success:true,
            token:generateToken(user._id),
            user:{
                id:user._id,
                name:user.name,
                email:user.email,
                role:user.role,
            }
        })
    }
    catch(err){
        res.status(500).json({success:true, message:err.message})
    }
}

module.exports={register, login}