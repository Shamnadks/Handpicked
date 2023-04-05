const isLogin = async(req,res,next)=>{
  try{
    if(req.session.admin){
      next();
    }
    else{
      res.redirect('/admin');
    }
   

  }
  catch(error){
    next(error);
  }
}

const isLogout = async(req,res,next)=>{
  try{
    
    if(req.session.admin){
      res.redirect('/adminhome');
    }
    else{}
    next();

  }
  catch(error){
    next(error);
  }
}

module.exports= { 
  isLogin,
  isLogout
}