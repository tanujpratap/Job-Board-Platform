const express=require('express')
const router=express.Router();
const jobController=require('../Controllers/jobController')
const authMiddleware=require("../middlewares/authMiddleware")
const roleMiddleware=require('../middlewares/roleMiddleware')

router.post("/createJobs",authMiddleware,roleMiddleware(['recruiter']),jobController.createJobs)
router.get("/getJobs",authMiddleware,jobController.getJobs)
router.post("/updateJobs/:id",authMiddleware,roleMiddleware(['recruiter']),jobController.updateJobs)
router.delete("/deleteJob/:id",authMiddleware,roleMiddleware(['recruiter']),jobController.deleteJob)

module.exports=router;