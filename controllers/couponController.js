const coupon = require("../models/couponModel");

//coupon page load
const loadCoupon = async (req, res) => {
  try {
    const coupons = await coupon.find({});
    res.render("couponList", { coupons });
  } catch (error) {
    console.log(error.message);
  }
};

//Add coupon Load
const addCoupon = async (req, res) => {
  try {
    res.render("addCoupon");
  } catch (error) {
    console.log(error.message);
  }
};

//add coupon post
const Addcouponpost = async (req, res) => {
  try {
    const code = req.body.code;
    couponCode = await coupon.findOne({ code: code });
    if (couponCode) {
      res.render("addCoupon", { message: "This Coupon Already Exist " });
    } else {
      const coupons = new coupon({
        code: req.body.code,
        discountType: req.body.discountType,
        discountAmount: req.body.amount,
        maxCartAmount: req.body.cartAmount,
        maxDiscountAmount: req.body.discountAmount,
        maxUsers: req.body.couponCount,
        expiryDate: req.body.date,
      });
      const couponData = await coupons.save();
      if (couponData) {
        res.redirect("/admin/coupon");
      } else {
        res.redirect("/admin/coupon");
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

// Apply coupon user
const applyCoupon = async (req, res) => {
  try {
    const code = req.body.code;
    const amount = Number(req.body.amount);
    const userExist = await coupon.findOne({
      code: code,
      user: { $in: [req.session.user_id] },
    });
    if (userExist) {
      res.json({ user: true });
    } else {
      const couponData = await coupon.findOne({ code: code });
      if (couponData) {
        if (couponData.maxUsers <= 0) {
          res.json({ limit: true });
        } else {
          if (couponData.status == false) {
            res.json({ status: true });
          } else {
            if (couponData.expiryDate <= new Date()) {
              res.json({ date: true });
            } else {
              if (couponData.maxCartAmount >= amount) {
                res.json({ cartAmount: true });
              } else {
                await coupon.findByIdAndUpdate(
                  { _id: couponData._id },
                  { $push: { user: req.session.user_id } }
                );
                await coupon.findByIdAndUpdate(
                  { _id: couponData._id },
                  { $inc: { maxUsers: -1 } }
                );
                if (couponData.discountType == "Fixed Amount") {
                  const disAmount = couponData.discountAmount;
                  const disTotal = Math.round(amount - disAmount);
                  return res.json({ amountOkey: true, disAmount, disTotal });
                } else if (couponData.discountType == "Percentage Type") {
                  const perAmount = (amount * couponData.discountAmount) / 100;
                  if (perAmount <= couponData.maxDiscountAmount) {
                    const disAmount = perAmount;
                    const disTotal = Math.round(amount - disAmount);
                    return res.json({ amountOkey: true, disAmount, disTotal });
                  }
                } else {
                  const disAmount = couponData.maxDiscountAmount;
                  const disTotal = Math.round(amount - disAmount);
                  return res.json({ amountOkey: true, disAmount, disTotal });
                }
              }
            }
          }
        }
      } else {
        res.json({ invalid: true });
      }
    }
  } catch (error) {
    console.log(error.message);
    console.error("Error occurred while loading apply coupon page:", error);
    res.status(500).send("Error occurred while loading apply coupon page.");
  }
};

//edit coupon
const editCoupon = async (req, res) => {
  try {
    const id = req.query.id;
    const couponData = await coupon.findOne({ _id: id });
    res.render("editCoupon", { couponData });
  } catch (error) {
    console.log(error.message);
  }
};

//edit coupon post
const updateCoupon = async (req, res) => {
  try {
    const couponId = req.query.id;
    const coupons = await coupon.findByIdAndUpdate(
      { _id: couponId },
      {
        code: req.body.code,
        discountType: req.body.discountType,
        discountAmount: req.body.amount,
        expiryDate: req.body.date,
        maxCartAmount: req.body.cartAmount,
        maxDiscountAmount: req.body.discountAmount,
        maxUsers: req.body.couponCount,
      }
    );
    await coupons.save();
    res.redirect("/admin/coupon");
  } catch (error) {
    console.log(error.message);
  }
};

//delete coupon
const deleteCoupon = async (req, res) => {
  try {
    const id = req.query.id;
    await coupon.deleteOne({ _id: id });
    res.redirect("/admin/coupon");
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  loadCoupon,
  addCoupon,
  Addcouponpost,
  applyCoupon,
  editCoupon,
  updateCoupon,
  deleteCoupon,
};
