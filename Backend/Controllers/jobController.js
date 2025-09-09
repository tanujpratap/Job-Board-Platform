const Job=require("../Models/job")
const { Op, fn, col, where, literal } = require("sequelize");
const createJobs=async(req,res)=>{
    try{
        const{title,description,skills,location,salary_range,experience}=req.body;
        //recruiter_id comes from logged-in user
        const recruiter_id=req.user.id;
        //validation
        if(!title||!description||!skills||!location||!salary_range||!experience){
            return res.status(400).json({message:"All field are requirred"})
        }
        const newJob=await Job.create({
            title,
            description,
            skills,
            location,
            salary_range,
            experience,
            recruiter_id,
        })
        res.status(201).json({message:"Job created Successfully",job:newJob})
    }
    catch(error){
        console.error("error creating job:",error.message)
        res.status(500).json({message:"Internal server error"})
    }
}

const getJobs=async (req,res)=>{
    try{
        let {page=1,limit=10,location,skills}=req.query;
        page=parseInt(page)
        limit=parseInt(limit)
        const whereClause={};
        //filtering Condition
        if(location){
            whereClause.location={[Op.iLike]:`%${location}%`};//case-insensitive search

        }
        if(skills){
          const skillsArray = Array.isArray(skills)
        ? skills
        : skills.split(',').map(s => s.trim());
     whereClause[Op.or] = skillsArray.map(skill =>
    where(
      fn("EXISTS",
        literal(`SELECT 1 FROM unnest("skills") AS s WHERE s ILIKE '%${skill}%'`)
      ),
      true
    )
  );
}
        
        //pagination calculation
        const offset=(page-1)*limit;
        const{rows:jobs,count}=await Job.findAndCountAll({
            where:whereClause,
            limit,
            offset,
            order:[["createdAt","DESC"]],
        })
        return res.status(200).json({
            total:count,
            page,
            totalPages:Math.ceil(count/limit),
            jobs,


        })


    }
    catch(error){
        console.error("Error fetching jobs:",error.message);
        return res.status(500).json({message:"Internal Server Error"})
    }
}
const updateJobs=async(req,res)=>{
try{
    const{id}=req.params;
    const recruiterId=req.user.id;//from auth Middleware
    const{
        title,
        description,
        skills,
        location,
        salary_range,
        experience,
    }=req.body;
    //1.find job by id
    const job=await Job.findByPk(id);
    if(!job){
        return res.status(404).json({message:"job not found"})
    }
//check recruiter ownership
if(job.recruiter_id!==recruiterId){
    return res.status(403).json({message:"Not authorized to update this job"})
}
//3. update only provided fields
await job.update({
    title:title??job.title,
    description:description??job.description,
    skills:skills??job.skills,
    location:location??job.location,
    salary_range:salary_range??job.salary_range,
experience:experience??job.experience
})
return res.status(200).json({message:"job updated successfully",job})
}
catch(err){
    console.error("error while updating the job",err.message)
    return res.status(500).json({message:"Internal Server error"})
}
}
const deleteJob=async(req,res)=>{
    try{
        const jobId=req.params.id;
        const recruiterId=req.user.id;
        const job=await Job.findOne({
            where:{
                id:jobId,
                recruiter_id:recruiterId
            }
        })
        if(!job){
            return res.status(404).json({message:"job not found or not owned by you"})
        }
        //soft delete=update status
        job.status="inactive";
        await job.save();
return res.status(200).json({message:"job soft deleted (marked as inactive) "})
    }
    catch(err){
        console.error("Errror soft deleting job:",err.message)
        return res.status(500).json({message:"Internal server Error"})
    }
}
module.exports={createJobs,getJobs,updateJobs,deleteJob}