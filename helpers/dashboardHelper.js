const Order = require("../models/orderModel");

//total Revnue
const totalRevenue = async () => {
  const revenue = await Order.aggregate([
    {
      $match: { status: { $eq: "delivered" } },
    },
    {
      $group: {
        _id: null,
        revenue: { $sum: "$totalAmount" },
      },
    },
  ]);
  const totalRevenue = revenue.length > 0 ? revenue[0].revenue : 0;
  return totalRevenue;
};

// Sales by categorie.
const categorySales = async () => { 
  const catSales = await Order.aggregate([
      {
          $match : { status : { $ne : "pending"} }
      },
      {
          $unwind : "$product"
      },
      {
          $lookup :
          {
              from: "product",
              localField : "product.productId",
              foreignField: "_id",
              as: "productsData"
          }
      },
      {
          $unwind : "$productsData"
      },
      {
          $lookup : 
          {
              from: "categories",
              localField : "productsData.category",
              foreignField : "_id",
              as: "category"
          }
      },
      {
          $unwind : "$category"
      },
      {
          $group : 
          {
              _id: "$category.name",
              qty : { $sum : "$product.quantity"}
          }
      }
  ]);

  
  console.log("Category Sales Data:", catSales);
  return catSales
}


// Fetching payment method amount.
const paymentMethod = async()=>{
  const totalPayment = await Order.aggregate([
      {
          $match : { status: { $eq: "delivered"} }
      },
      {
          $group: {
              _id: "$paymentMethod",
              amount: { $sum: "$totalAmount" }
          }
      }
  ])
  const result = totalPayment.length > 0 ? totalPayment : 0
  return result
};

// const monthlyEarning = async ( currentMonthStartDate, now ) =>{

//   const monthlyEarning = await Order.aggregate([
//       {
//           $match : 
//           {
//             Date : 
//               {
//                   $gte : currentMonthStartDate,
//                   $lt : now
//               },
//               status :
//               {
//                   $ne : "pending"
//               }
//           }
//       },
//       {
//           $group : 
//           {
//               _id : null,
//               monthlyEarning : 
//               {
//                   $sum : "$totalAmount"
//               }
//           }
//       }
//   ])
//   const result = monthlyEarning.length > 0 ? monthlyEarning[0].monthlyEarning : 0
//   return result
// }


module.exports = {
  totalRevenue,
  categorySales,
  paymentMethod,
  // monthlyEarning,

};
