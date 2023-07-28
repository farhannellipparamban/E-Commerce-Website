const express =require('express')
const admin_route=express()
const session=require("express-session")
const config=require("../config/config")
const upload=require('../config/multer')
const path= require('path')
const adminAuth=require('../middlware/adminAuth')


admin_route.use(session({secret:'abcd',resave:false,saveUninitialized:false}))

admin_route.set('views','./views/admin')

//controllers
const adminController=require("../controllers/adminController")
const productController =require('../controllers/productController')
const catController =require("../controllers/categoryController")

//login
admin_route.get('/',adminAuth.isLogout,adminController.loadLogin)
admin_route.post('/',adminController.verifyLogin)

//admin home
admin_route.get('/dashboard',adminController.loadDashboard)

//logout
admin_route.get('/logout',adminAuth.isLogin,adminController.logout)

//User Details
admin_route.get('/userList',adminAuth.isLogin,adminController.userList)
admin_route.get('/verify_user',adminAuth.isLogin,adminController.veryfiUser)
admin_route.get('/Block_user',adminAuth.isLogin,adminController.blockUser)
admin_route.get('/Unblock_user',adminAuth.isLogin,adminController.unblockUser)

// category page in category controller
admin_route.get('/productCategory',adminAuth.isLogin,catController.categoryLoad)
admin_route.get('/add_category',adminAuth.isLogin,catController.add_categoryLoad)
admin_route.post('/add_category',adminAuth.isLogin,catController.insert_category)
admin_route.get('/edit_category',adminAuth.isLogin,catController.edit_catLoad)
admin_route.post('/edit_category',catController.updatecategory)
admin_route.get('/catBlock',adminAuth.isLogin,catController.catBlock)
admin_route.get("/catUnblock",adminAuth.isLogin,catController.catUnblock)


// Products page in productContreoller
admin_route.get('/productsList',adminAuth.isLogin,productController.productload)
admin_route.get('/addProduct',adminAuth.isLogin,productController.addProductload)
admin_route.post('/addProduct',adminAuth.isLogin,upload.upload.array('image',5),productController.insertProduct)
admin_route.get('/edit_products',adminAuth.isLogin,upload.upload.array('image',5),productController.editProduct)
admin_route.post('/edit_products',adminAuth.isLogin,upload.upload.array('image',5),productController.updateProduct)
admin_route.post('/delete_image', adminAuth.isLogin, productController.postdelete_image);
admin_route.get('/productBlock',adminAuth.isLogin,productController.productBlock)
admin_route.get('/productUnblock',adminAuth.isLogin,productController.productUnblock)
// admin_route.get('/products/brand/:brand', productController.filterBrand);
// admin_route.get('/products/gender/:gender', productController.filterGender);

//order_details
admin_route.get('/ordersList',adminAuth.isLogin,adminController.orderDetails)


module.exports = admin_route
