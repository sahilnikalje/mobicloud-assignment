const bcrypt=require('bcryptjs')
const jwt=require('jsonwebtoken')
const User=require('../models/userSchema')

const generateToken=(id)=>jwt.sign(
    {id}, 
    process.env.JWT_SECRET_KEY, 
    {expiresIn: '7d'}
)

const register=async(req,res)=>{
    try{
        const{name, email, password, role}=req.body
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
                role:role
            }
        )

        res.status(201).json(
            {
                success:true, 
                message:"Registered successfully",
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
            message:"Loggedin successfully",
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
        res.status(500).json({success:false, message:err.message})
    }
}


const getMe=async(req,res)=>{
    res.json({success:true, user:req.user})
}


module.exports={register, login, getMe}