const User = require("../models/userModels");
const admin = require("../models/adminModel");
const CatDB = require("../models/categoryModel");
const productdb = require("../models/prodectModel");

//product page get
const productload = async (req, res) => {
  try {
    const data = await productdb.find();

    res.render("productsList", { data });
  } catch (error) {
    console.log(error.message);
  }
};

//add product page get
const addProductload = async (req, res) => {
  try {
    // const id=req.body.id

    const categoryData = await CatDB.find({ is_blocked: false });

    res.render("addProduct", { Catdata: categoryData });
  } catch (error) {
    console.log(error.message);
  }
};

//product adding page post
const insertProduct = async (req, res) => {
  try {
    const imgarr = [];
    if (req.files && req.files.length) {
      for (let i = 0; i < req.files.length; i++) {
        imgarr.push(req.files[i].filename);
      }
    }

    const data = new productdb({
      name: req.body.name,
      price: req.body.price,
      description: req.body.description,
      image: imgarr,
      // brand: req.body.brand, // Add brand field
      // gender: req.body.gender, // Add gender field
      category: req.body.category,
      stock: req.body.stock,
      blocked: false,
    });

    const product = await data.save();
    if (product) {
      res.redirect("/admin/productsList");
    } else {
      res.redirect("/admin/addProduct");
    }
  } catch (error) {
    console.log(error.message);
  }
};

// product editing page get
const editProduct = async (req, res) => {
  try {
    const id = req.query.id;
    const editData = await productdb.findById({ _id: id });
    const data = await CatDB.find({ is_blocked: false });
    res.render("edit_products", { dataedit: editData, Catdata: data });
  } catch (error) {
    console.log(error.message);
  }
};
//product editing page post
const updateProduct = async (req, res) => {
  try {
    const editimage = [];
    const name = req.body.name;
    if (name.trim().length == 0) {
      res.redirect("/admin/edit_products");
    } else {
      if (req.files.length != 0) {
        const id = req.query.id;
        for (let i = 0; i < req.files.length; i++) {
          editimage.push(req.files[i].filename);
        }
        await productdb.findByIdAndUpdate(id, {
          $set: {
            name: req.body.name,
            price: req.body.price,
            discription: req.body.discription,
            category: req.body.category,
            image: editimage,
            stock: req.body.stock,
          },
        });
        res.redirect("/admin/productsList");
      } else {
        const id = req.query.id;
        await productdb.findByIdAndUpdate(id, {
          $set: {
            name: req.body.name,
            price: req.body.price,
            discription: req.body.discription,
            category: req.body.category,

            stock: req.body.stock,
          },
        });
        res.redirect("/admin/productsList");
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

//product blocking get
const productBlock = async (req, res) => {
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
  }
};

//product unblocking get
const productUnblock = async (req, res) => {
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
  }
};

//remove single image from edit_product post
const postdelete_image = async (req, res) => {
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
  }
};

//  products filtered by brand get
// const filterBrand = async (req, res) => {
//   const { brand } = req.params;
//   try {
//     const products = await productdb.find({ brand }); // Use Product model instead of 'productdb'
//     res.json(products);
//   } catch (error) {
//     res.status(500).json({ message: 'Error fetching products by brand' });
//   }
// };

// get products filtered by gender
// const filterGender = async (req, res) => {
//   const { gender } = req.params;
//   try {
//     const products = await productdb.find({ gender }); // Use Product model instead of 'productdb'
//     res.json(products);
//   } catch (error) {
//     res.status(500).json({ message: 'Error fetching products by gender' });
//   }
// };

module.exports = {
  productload,
  addProductload,
  insertProduct,
  editProduct,
  updateProduct,
  productBlock,
  productUnblock,
  postdelete_image,
  // filterGender,
  // filterBrand,
};
