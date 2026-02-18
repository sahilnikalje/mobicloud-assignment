const express=require('express')
const{getAllUsers, getUserWithLeads, updateUser, deleteUser}=require('../controllers/userController')
const {protect, adminOnly}=require('../middlewares/authMiddleware')


router.use(protect, adminOnly)
router.get('/', getAllUsers)
router.get('/:id', getUserWithLeads)
router.put('/:id', updateUser)
router.delete('/:id', deleteUser)


module.exports=router