const asyncHandler=(requestHandler)=>{
    return (req,res,next)=>{
        Promise.resolve(requestHandler(req,res,next)).catch((err)=>next(err))
    }
}
    

export {asyncHandler}
//high order function :-that take func as a paramenter or return a parameter
/*const asyncHandler=()=>{}
    const asyncHandler=(fun)=>{()=>{}}
        const asyncHandler=()=>aync ()=>{}
    
    */
   
   /*
   using try catch block
const asyncHandler=(fun)=>async (req,res,next)=>{
    try{
        await fun(req,res,next)
    }
    catch(error){
        res.status(error.code||500).json({
            success:false,
            message:error.message
        })
        console.log("Error is at there :- ",error)
    }
}
    */