const express=require('express')
const{getDeals, createDeal, updateDeal, deleteDeal, getPipelineStats}=require('../controllers/dealController')
const {protect}=require('../middlewares/authMiddleware')

const router=express.Router()

router.use(protect)
router.get('/pipeline', getPipelineStats)
router.get('/', getDeals)
router.post('/', createDeal)
router.put('/:id', updateDeal)
router.delete('/:id', deleteDeal)

module.exports=router