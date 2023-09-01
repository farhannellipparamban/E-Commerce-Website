const User = require("../models/userModels");
const admin = require("../models/adminModel");
const productdb = require("../models/prodectModel");
const CatDb = require("../models/categoryModel");
const user_address = require("../models/addressModel");

//addAddress get
const addressLoad = async (req, res,next) => {
  try {
    const loadlogIn = req.session.user_id;
    const userd = await User.findOne({ _id: req.session.user_id });
    res.render("addAddress", { loadlogIn, user: userd.name });
  } catch (error) {
    console.log(error.message);
    next(error)
  }
};

//address verification post
const verifyAddress = async (req, res,next) => {
  try {
    const loadlogIn = req.session.user_id;
    const user = req.session.user_id;
    const userData = await User.findOne({ _id: req.session.user_id });
    const dataaddress = await user_address.findOne({
      user: req.session.user_id,
    });

    if (dataaddress) {
      const update = await user_address.updateOne(
        { user: user },
        {
          $push: {
            address: {
              fname: req.body.fname,
              sname: req.body.sname,
              mobile: req.body.mobile,
              email: req.body.email,
              address: req.body.address,
              city: req.body.city,
              pin: req.body.pin,
            },
          },
        }
      );
      res.redirect("/myacco");
    } else {
      const data = new user_address({
        user: userData._id,
        address: [
          {
            fname: req.body.fname,
            sname: req.body.sname,
            mobile: req.body.mobile,
            email: req.body.email,
            address: req.body.address,
            city: req.body.city,
            pin: req.body.pin,
          },
        ],
      });
      const addressData = await data.save();
      if (addressData) {
        res.redirect("/myacco");
      } else {
        res.render("addAddress", { loadlogIn });
      }
    }
  } catch (error) {
    console.log(error.message);
    next(error)
  }
};

//delete Adress get
const deleteaddress = async (req, res,next) => {
  try {
    const id = req.query.id;
    await user_address.updateOne(
      { user: req.session.user_id },
      { $pull: { address: { _id: id } } }
    );
    res.redirect("/myacco");
    // res.json({ remove: true });
  } catch (error) {
    console.log(error.message);
    next(error)
  }
};

const deleteaddressCheckout = async (req, res,next) => {
  try {
    const id = req.query.id;
    await user_address.updateOne(
      { user: req.session.user_id },
      { $pull: { address: { _id: id } } }
    );
    res.redirect("/checkout");
    // res.json({ remove: true });
  } catch (error) {
    console.log(error.message);
    next(error)
  }
};

//edit Address get
const editAddress = async (req, res,next) => {
  try {
    const loadlogIn = req.session.user_id;
    const id = req.query.id;
    const userd = await User.findOne({ _id: req.session.user_id });
    const userId = req.session.user_id;
    const index = req.query.index;
    const editData = await user_address.findOne({ user: userId });
    const value = editData.address[index];
    res.render("editAddress", { loadlogIn, user: userd.name, value, index });
  } catch (error) {
    console.log(error.message);
    next(error)
  }
};

//edit Address post
const updateAddress = async (req, res,next) => {
  try {
    const index = req.body.index;
    const fname = req.body.fname;
    const sname = req.body.sname;
    const mobile = req.body.mobile;
    const email = req.body.email;
    const address = req.body.address;
    const city = req.body.city;
    const pin = req.body.pin;

    if (
      fname.trim().length == 0 ||
      sname.trim().length == 0 ||
      mobile.trim().length == 0 ||
      email.trim().length == 0 ||
      address.trim().length == 0 ||
      city.trim().length == 0 ||
      pin.trim().length == 0
    ) {
      res.redirect("/myacco");
    } else {
      const dataeditaddress = await user_address.findOne({
        user: req.session.user_id,
      });
      if (dataeditaddress) {
        const update = await user_address.updateOne(
          { user: req.session.user_id },
          {
            $set: {
              [`address.${index}`]: {
                fname: req.body.fname,
                sname: req.body.sname,
                mobile: req.body.mobile,
                email: req.body.email,
                address: req.body.address,
                city: req.body.city,
                pin: req.body.pin,
              },
            },
          }
        );
      }
      res.redirect("/myacco");
    }
  } catch (error) {
    console.log(error.message);
    next(error)
  }
};

//address checkout
const verifyAddresscheck = async (req, res,next) => {
  try {
    const user = req.session.user_id;

    const userData = await User.findOne({ _id: req.session.user_id });
    const dataaddress = await user_address.findOne({
      user: req.session.user_id,
    });
    if (dataaddress) {
      const update = await user_address.updateOne(
        { user: user },
        {
          $push: {
            address: {
              fname: req.body.fname,
              sname: req.body.sname,
              mobile: req.body.mobile,
              email: req.body.email,
              address: req.body.address,
              city: req.body.city,
              pin: req.body.pin,
            },
          },
        }
      );
      res.redirect("/checkout");
    } else {
      const data = new user_address({
        user: userData._id,
        address: [
          {
            fname: req.body.fname,
            sname: req.body.sname,
            mobile: req.body.mobile,
            email: req.body.email,
            address: req.body.address,
            city: req.body.city,
            pin: req.body.pin,
          },
        ],
      });
      const addressData = await data.save();

      if (addressData) {
        res.redirect("/checkout");
      } else {
        res.render("addAddress");
      }
    }
  } catch (error) {
    console.log(error.message);
    next(error)
  }
};

//edit post checkout
const posteditaddresscheck = async (req, res,next) => {
  try {
    const index = req.body.index;
    const fname = req.body.fname;
    const sname = req.body.sname;
    const email = req.body.email;
    const mobile = req.body.mobile;
    const address = req.body.address;
    const city = req.body.city;
    const pin = req.body.pin;

    if (
      fname.trim().length == 0 ||
      sname.trim().length == 0 ||
      mobile.trim().length == 0 ||
      email.trim().length == 0 ||
      address.trim().length == 0 ||
      city.trim().length == 0 ||
      pin.trim().length == 0
    ) {
      res.redirect("/myacco");
    } else {
      const dataeditaddress = await user_address.findOne({
        user: req.session.user_id,
      });
      if (dataeditaddress) {
        const update = await user_address.updateOne(
          { user: req.session.user_id },
          {
            $set: {
              [`address.${index}`]: {
                fname: req.body.fname,
                sname: req.body.sname,
                email: req.body.email,
                mobile: req.body.mobile,
                address: req.body.address,
                city: req.body.city,
                pin: req.body.pin,
              },
            },
          }
        );
      }
      res.redirect("/checkout");
    }
  } catch (error) {
    console.log(error.message);
    next(error)
  }
};

module.exports = {
  addressLoad,
  verifyAddress,
  deleteaddress,
  editAddress,
  updateAddress,
  verifyAddresscheck,
  posteditaddresscheck,
  deleteaddressCheckout,
};
