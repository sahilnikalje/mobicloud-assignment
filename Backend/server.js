const express=require('express')
const cors=require('cors')
const morgan=require('morgan')
const rateLimit=require('express-rate-limit')
const dotenv=require('dotenv').config()
const connectDB = require('./config/db')

const authRoutes=require('./routes/authRoutes')
const userRoutes=require('./routes/userRoutes')
const leadRoutes=require('./routes/leadRoutes')
const dealRoutes=require('./routes/dealRoutes')
const activityRoutes=require('./routes/activityRoutes')

const app=express()

const PORT=process.env.PORT

app.use(express.json())
app.use(morgan('dev'))
app.use(cors({origin:process.env.VITE_URI, credentials:true}))

const limiter=rateLimit({windowMs:15*60*1000, max:100})

app.use('/api', limiter)

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/leads', leadRoutes)
app.use('/api/deals', dealRoutes)
app.use('/api/activities', activityRoutes)


app.use((err,req,res,next)=>{
    const status=err.status || 500
    res.status(status).json({success:false, message:err.message})
})


const startServer=async()=>{
    try{
        await connectDB()
        app.listen(PORT, ()=>{
            console.log(`Server running on port ${PORT}`)
        })
    }
    catch(err){
        console.error(err.message)
    }
}
startServer()