const error500 = (req,res,next)=>{
    res.status(500);
    if(req.accepts("html")){
        res.render('error/500',{error})
        return;
    }
}

const error404 = (req,res,next)=>{
    res.status(404);
    if(req.accepts('html')){
        res.render('error/404',{url:req.url})
        return
    }
}

module.exports ={
    error500,
    error404
}