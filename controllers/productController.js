const User = require("../models/userModels");
const admin = require("../models/adminModel");
const CatDB = require("../models/categoryModel");
const productdb = require("../models/prodectModel");
const sharp = require("sharp");
const path = require("path");
const { name } = require("ejs");

//product page get
const productload = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * 8;

    const data = await productdb.find().sort({ _id: -1 }).skip(skip).limit(8);

    totalProducts = await productdb.countDocuments({});
    totalPages = Math.ceil(totalProducts / 8);

    res.render("productsList", {
      data,
      totalPages: totalPages,
      currentPage : page,
    });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

//add product page get
const addProductload = async (req, res, next) => {
  try {

    const categoryData = await CatDB.find({ is_blocked: false });

    res.render("addProduct", { Catdata: categoryData });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

//product adding page post
const insertProduct = async (req, res, next) => {
  try {
    const imgarr = [];

    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const filePath = path.join(
          __dirname,
          "../public/assets/CropedImages",
          req.files[i].filename
        );
        await sharp(req.files[i].path)
          .resize({ width: 250, height: 250 })
          .toFile(filePath);
        imgarr.push(req.files[i].filename);
      }
    }
    const { name, stock, price, description, blocked, category } = req.body;
    const catData = await CatDB.findOne({name:category});
    const data = new productdb({
      name,
      price,
      description,
      image: imgarr,
      category:catData._id,
      stock,
      blocked,
    });
    const product = await data.save();
    if (product) {
      res.redirect("/admin/productsList");
    } else {
      res.redirect("/admin/addProduct");
    }
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

// product editing page get
const editProduct = async (req, res, next) => {
  try {
    const id = req.query.id;
    const editData = await productdb
      .findById({ _id: id })
      .populate("category.category");
    const data = await CatDB.find({ is_blocked: false });
    res.render("edit_products", { dataedit: editData, Catdata: data });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

//product editing page post
const updateProduct = async (req, res, next) => {
  try {
    const editimage = [];
    const name = req.body.name;
    if (name.trim().length == 0) {
      res.redirect("/admin/edit_products");
    } else {
      const id = req.query.id;

      if (req.files && req.files.length > 0) {
        for (let i = 0; i < req.files.length; i++) {
          const filePath = path.join(
            __dirname,
            "../public/assets/CropedImages",
            req.files[i].filename
          );
          await sharp(req.files[i].path)
            .resize({ width: 250, height: 250 })
            .toFile(filePath);
          editimage.push(req.files[i].filename);

        }
        const { name, stock, price, discription,category } = req.body;
        const catData = await CatDB.findOne({name:category});
        await productdb.findByIdAndUpdate(id, {
          $set: {
            name,
            price,
            discription,
            category:catData._id,
            image: editimage,
            stock,
          },
        });

        res.redirect("/admin/productsList");
      } else {
        const id = req.query.id;
        const { name, stock, price, discription,category } = req.body;
        const catData = await CatDB.findOne({name:category});
        await productdb.findByIdAndUpdate(id, {
          $set: {
            name,
            price,
            discription,
            category:catData._id,
            stock,
          },
        });
        res.redirect("/admin/productsList");
      }
    }
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

//product blocking get
const productBlock = async (req, res, next) => {
  try {
    const id = req.query.id;
    const productData = await productdb.findOne({ _id: id });
    if (productData.is_blocked === true) {
      res.redirect("/admin/productsList");
    } else {
      await productdb.findByIdAndUpdate(
        { _id: id },
        { $set: { is_blocked: true } }
      );
      res.redirect("/admin/productsList");
    }
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

//product unblocking get
const productUnblock = async (req, res, next) => {
  try {
    const id = req.query.id;
    const productData = await productdb.findOne({ _id: id });
    if (productData.is_blocked === false) {
      res.redirect("/admin/productsList");
    } else {
      await productdb.findByIdAndUpdate(
        { _id: id },
        { $set: { is_blocked: false } }
      );
      res.redirect("/admin/productsList");
    }
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

//remove single image from edit_product post
const postdelete_image = async (req, res, next) => {
  try {
    const position = req.body.position;
    const id = req.body.id;
    const productImage = await productdb.findById(id);
    const image = productImage.image[position];
    const data = await productdb.updateOne(
      { _id: id },
      { $pullAll: { image: [image] } }
    );
    if (data) {
      res.json({ success: true });
    } else {
      res.redirect("/admin/productsList");
    }
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

module.exports = {
  productload,
  addProductload,
  insertProduct,
  editProduct,
  updateProduct,
  productBlock,
  productUnblock,
  postdelete_image,
};
