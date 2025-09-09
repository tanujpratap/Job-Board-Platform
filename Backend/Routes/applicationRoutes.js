const express=require('express')
const router=express.Router()
const upload=require('../utils/multer')
const applicationController=require('../Controllers/applicationController')
const authMiddleware=require('../middlewares/authMiddleware')
router.post('/apply/:id',authMiddleware,upload.single("resume"),applicationController.applyToJob)
router.get('/getApplications/:id',authMiddleware,applicationController.getMyApplications)
router.get('/getJobApplications/:id',authMiddleware,applicationController.getJobApplications)

module.exports=router