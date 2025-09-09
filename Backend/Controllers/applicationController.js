const streamifier = require('streamifier');
const cloudinary=require('../utils/cloudinary')
const Application=require('../Models/application')
const Job=require('../Models/job');
const User=require('../Models/user')
const { where } = require('sequelize');

const applyToJob=async(req,res)=>{
    try{
        const {id:jobId}=req.params;
        const userId=req.user.id;//from jwt middleware

        //1.Validate Job
        const job=await Job.findByPk(jobId);
        if(!job) return res.status(404).json({message:"Job not found"})

            //2. upload resume
            const file=req.file;
        if(!file) return res.status(400).json({message:"resume is requirred"})

          //cloudinary stream upload
          const streamUpload=(fileBuffer)=>{
            return new Promise((resolve,reject)=>{
                let stream=cloudinary.uploader.upload_stream(
                    {
                        resource_type:"raw",folder:"resume"
                    },//raw for pdf/docx
                    (error,result)=>{
                        if(result) resolve(result);
                        else reject (error)
                    }
                )
                streamifier.createReadStream(fileBuffer).pipe(stream);
            })
          }
const result = await streamUpload(req.file.buffer);

    // save in Application table
    const application = await Application.create({
      job_id: req.params.id,
      applicant_id: req.user.id,
      resume_url: result.secure_url,
      status: "applied",
    });
    
     res.status(201).json({ message: "Applied successfully", application });
}
    catch(err){
         console.error("Error applying:", err);
        res.status(500).json({message:"Server error",error:err.message})
    }
}

const getMyApplications=async(req,res)=>{
    try{
        let{page=1,limit=10,status}=req.query;
        page=parseInt(page)
        limit=parseInt(limit)
        const whereClause={applicant_id:req.user.id};
        if(status){
            whereClause.status=status;//filter by status if provided

        }
        const offset=(page-1)*limit;
        const{rows:applications,count}=await Application.findAndCountAll({
            where:whereClause,
            include:[
                {
model:Job,
attributes:["id","title","location","skills","salary_range"],

                },
            ],
            order:[["createdAt","DESC"]],
            limit,
            offset,
        })
        return res.status(200).json({
            total:count,
            page,
            totalPages:Math.ceil(count/limit),
            applications,
        })
    }
    catch(err){
        console.error("error fetching applications",error.message);
        return res.status(500).json({message:"Internal Server Error"})
    }
}

const getJobApplications=async(req,res)=>{
try{
    const{id}=req.params;//job id
    let {page=1,limit=10,status}=req.query;
    page=parseInt(page)
    limit=parseInt(limit)
    //check if this job belongs to logged-in user
    const job=await Job.findOne({where:{id,recruiter_id:req.user.id}})
if(!job){
    return res.status(403)
    .json({message:"Forbidden:You are not recruiter for this job"})
}

//build filter for applications
const whereClause={job_id:id}
if(status){
    whereClause.status=status;}
    const offset=(page-1)*limit;
    const{rows:applications,count}=await Application.findAndCountAll({
        where:whereClause,
        include:[
            {
                model:User,
                as:"applicant",//make sure association is defined
                attributes:["id","name","email"],
            }
        ],
        order:[["createdAt","DESC"]],
        limit,
        offset,
    })
    return res.status(200).json({
        total:count,
        page,
        totalPages:Math.ceil(count/limit),
        applications,
    })

}
catch(err){
    console.error("error fetching job application",err.message)
    return res.status(500).json({message:"internal Server Error"})
}

}
module.exports={applyToJob,getMyApplications,getJobApplications}