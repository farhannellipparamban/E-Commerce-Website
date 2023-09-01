const User = require("../models/userModels");
const admin = require("../models/adminModel");
const CatDB = require("../models/categoryModel");
const productdb = require("../models/prodectModel");

//category list get
const categoryLoad = async (req, res,next) => {
  try {
    const categryDetails = await CatDB.find();

    res.render("productCategory", { catData: categryDetails });
  } catch (error) {
    console.log(error.message);
    next(error)
  }
};

//add category page get
const add_categoryLoad = async (req, res,next) => {
  try {
    res.render("add_category");
  } catch (error) {
    console.log(error.message);
    next(error)
  }
};

// add category page post
const insert_category = async (req, res,next) => {
  try {
    const name = req.body.name;

    if (name.trim().length == 0) {
      res.redirect("/admin/productCategory");
    } else {
      const alredy = await CatDB.findOne({
        name: { $regex: name, $options: "i" },
      });

      if (alredy) {
        res.render("add_category", { message: "This category alredy exist " });
      } else {
        const Catdata = new CatDB({ name: name });

        const adddata = await Catdata.save();

        if (adddata) {
          res.redirect("/admin/productCategory");
        } else {
          res.render("add_category", { message: "somthing wrong " });
        }
      }
    }
  } catch (error) {
    console.log(error.message);
    next(error)
  }
};

// edit category page get
const edit_catLoad = async (req, res,next) => {
  try {
    const id = req.query.id;
    const name = req.body.name;
    const editData = await CatDB.findById({ _id: id });
    if (editData) {
      res.render("edit_category", { data: editData });
    } else {
      res.render("edit_category");
    }
  } catch (error) {
    console.log(error.message);
    next(error)
  }
};

//edit category page updation post
const updatecategory = async (req, res,next) => {
  try {
    const id = req.body.id;
    const data = await CatDB.findById({ _id: id });
    const name = req.body.name;

    if (name.trim().length === 0) {
      res.redirect("/admin/edit_category");
    } else {
      const alredy = await CatDB.findOne({
        name: { $regex: name, $options: "i" },
      });

      if (alredy) {
        res.render("edit_category", {
          data,
          message: "This category alredy exist ",
        });
      } else {
        await CatDB.findByIdAndUpdate(
          { _id: req.body.id },
          { $set: { name: req.body.name } }
        );

        res.redirect("/admin/productCategory");
      }
    }
  } catch (error) {
    console.log(error.message);
    next(error)
  }
};

//category blocking get
const catBlock = async (req, res,next) => {
  try {
    const id = req.query.id;
    const catData = await CatDB.findOne({ _id: id });
    if (catData.is_blocked === true) {
      res.redirect("/admin/productCategory");
    } else {
      await CatDB.findByIdAndUpdate(
        { _id: id },
        { $set: { is_blocked: true } }
      );
      res.redirect("/admin/productCategory");
    }
  } catch (error) {
    console.log(error.message);
    next(error)
  }
};

// category unblocking get
const catUnblock = async (req, res,next) => {
  try {
    const id = req.query.id;
    const catData = await CatDB.findOne({ _id: id });
    if (catData.is_blocked === false) {
      res.redirect("/admin/productCategory");
    } else {
      await CatDB.findByIdAndUpdate(
        { _id: id },
        { $set: { is_blocked: false } }
      );
      res.redirect("/admin/productCategory");
    }
  } catch (error) {
    console.log(error.message);
    next(error)
  }
};

module.exports = {
  categoryLoad,
  add_categoryLoad,
  insert_category,
  edit_catLoad,
  updatecategory,
  catBlock,
  catUnblock,
};
