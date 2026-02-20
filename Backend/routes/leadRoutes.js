const express=require('express')
const{getLead, getLeads, createLead, updateLead, deleteLead, getLeadStats}=require('../controllers/leadController')
const{protect}=require('../middlewares/authMiddleware')

const router=express.Router()

router.use(protect)
router.get('/stats', getLeadStats)
router.get('/', getLeads)
router.post('/', createLead)
router.get('/:id', getLead)
router.put('/:id', updateLead)
router.delete('/:id', deleteLead)

module.exports=router