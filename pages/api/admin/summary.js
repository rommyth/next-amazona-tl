import { getSession } from 'next-auth/react';
import db from '../../../utils/db';
import Order from '../../../models/Order';
import Product from '../../../models/Product';
import User from '../../../models/User';

const handler = async (req, res) => {
  const session = await getSession({ req });
  if (!session || (session && !session.user.isAdmin)) {
    return res.status(401).send({ message: 'login required' });
  }

  await db.connect();
  const orderCount = await Order.countDocuments();
  const productCount = await Product.countDocuments();
  const userCount = await User.countDocuments();

  const orderPriceGroup = await Order.aggregate([
    {
      $group: {
        _id: null,
        sales: { $sum: '$totalPrice' },
      },
    },
  ]);

  const ordersPrice = orderPriceGroup.length > 0 ? orderPriceGroup[0].sales : 0;

  const salesData = await Order.aggregate([
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
        totalSales: { $sum: '$totalPrice' },
      },
    },
  ]);

  await db.disconnect();
  res.send({ orderCount, productCount, userCount, ordersPrice, salesData });
};

export default handler;
