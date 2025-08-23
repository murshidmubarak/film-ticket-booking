// const noCache = (req, res, next) => {
//     res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private, max-age=0');
//     res.setHeader('Pragma', 'no-cache');
//     res.setHeader('Expires', '0');
//     next();
// };



// middlewares/auth.js
// const noCache = (req, res, next) => {
//     res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private, max-age=0");
//     res.setHeader("Pragma", "no-cache");
//     res.setHeader("Expires", "0");
//     next();
// };

// module.exports = { noCache };


const noCache = (req, res, next) => {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private, max-age=0");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    next();
};

// Enhanced cache prevention for payment-related routes
const paymentNoCache = (req, res, next) => {
    // Comprehensive cache prevention
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private, max-age=0, s-maxage=0");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.setHeader("Surrogate-Control", "no-store");
    res.setHeader("X-Accel-Expires", "0");
    
    // Prevent back button caching
    res.setHeader("Last-Modified", new Date().toUTCString());
    res.setHeader("ETag", `"${Math.random().toString(36)}"`);
    
    // Additional security headers for payment
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-Content-Type-Options", "nosniff");
    
    next();
};

const adminAuth = (req, res, next) => {
    if (req.session.user && req.session.user.isAdmin) {
        return next();
    }
    return res.redirect('/admin/login');
};

const userAuth = (req, res, next) => {
    if (req.session.user) {
        return next();
    }
    return res.redirect('/login');
};

const isLogin=async (req,res,next)=>{
    if(req.session.user){
        res.redirect('/')
    }else{
        next()           
    }
}

module.exports = { noCache, paymentNoCache, adminAuth, userAuth,isLogin };
