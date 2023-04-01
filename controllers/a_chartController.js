const dotenv = require("dotenv");
dotenv.config();
const Order = require('../model/orderSchema');
const moment = require('moment');



const salesGraph = async (req, res, next) => {
  try {
    const orders = await Order.find();
    const salesByDay = {};
    orders.forEach((order) => {
      const date = moment(order.date).format('YYYY-MM-DD');
      if (!salesByDay[date]) {
        salesByDay[date] = 0;
      }
      order.product.forEach((product) => {
        salesByDay[date] += product.price * product.quantity;
      });
    });

    const data = {
      labels: Object.keys(salesByDay),
      datasets: [
        {
          label: 'Sales',
          data: Object.values(salesByDay),
          fill: false,
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1,
        },
      ],
    };


    
    const Cancelorder = await Order.aggregate([
      {
        $match: {
          $or: [
            {
              status: "Returned",
            },
            {
              status: "Delivered",
            },
            {
              status: "Cancelled",
            },
          ],
        },
      },
      {
        $group: {
          _id: {
            status: "$status",
            date: {
              $month: "$date",
            },
          },
          sum: {
            $sum: 1,
          },
        },
      },
    ]);

    let months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    let Delivered = [];
    let delivered = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    let Returned = [];
    let returned = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    let Cancelled = [];
    let cancelled = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    Cancelorder.forEach((item) => {
      if (item._id.status == "Delivered") Delivered.push(item);

      if (item._id.status == "Returned") Returned.push(item);

      if (item._id.status == "Cancelled") Cancelled.push(item);
    });

    for (let index = 0; index < 12; index++) {
      months.forEach((item) => {
        if (Delivered[index]) {
          if (item == Delivered[index]._id.date)
            delivered[item - 1] = Delivered[index].sum;
        }

        if (Returned[index]) {
          if (item == Returned[index]._id.date)
            returned[item - 1] = Returned[index].sum;
        }

        if (Cancelled[index]) {
          if (item == Cancelled[index]._id.date)
            cancelled[item - 1] = Cancelled[index].sum;
        }
      });
    }

    const monthlyOrders = await Order.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          year: "$_id.year",
          month: "$_id.month",
          count: 1
        }
      }
    ]);

    const yearlyOrders = await Order.aggregate([
      {
        $group: {
          _id: { $year: "$date" },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          year: "$_id",
          count: 1
        }
      }
    ]);


    res.json(
      {
        chart: {
          delivered,
          cancelled,
          returned
        },
        data: data,
        monthlyOrders: monthlyOrders,
        yearlyOrders: yearlyOrders
      }

    );

  } catch (error) {
   
    next(error);
    res.status(500).send('Server error');
  }
};

const salesReport = async (req, res,next) => {
  try {
    const startDate = new Date(req.query.startDate);
    const endDate = new Date(req.query.endDate);

    const orders = await Order.find({ date: { $gte: startDate, $lte: endDate } }).lean();

    const orderData = [];
    const productData = [];

    orders.forEach(order => {
      const { orderId, date, payment_method, status, subtotal } = order;

      orderData.push({ orderId, date, payment_method, status, subtotal });

      order.product.forEach(product => {
        const { id, name, price, quantity } = product;

        productData.push({ orderId, id, name, price, quantity });
      });
    });

    res.json({ orders: orderData, products: productData });
  } catch (error) {
    next(error);
    res.status(500).json({ message: 'Failed to retrieve sales report data' });
  }
}


module.exports = {
  salesGraph,
  salesReport
}
