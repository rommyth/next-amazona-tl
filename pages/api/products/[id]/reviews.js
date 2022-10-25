// /api/product/${idproduct}/reviews

import mongoose from 'mongoose';
import { getSession } from 'next-auth/react';
import Product from '../../../../models/Product';
import db from '../../../../utils/db';

async function handler(req, res) {
  const session = await getSession({ req });
  const { user } = session;

  if (req.method === 'GET') {
    return getHandler(req, res);
  } else if (req.method === 'POST') {
    return postHandler(req, res, user);
  } else {
    return res.status(400).send({ message: 'Method not allowed' });
  }
}

const getHandler = async (req, res) => {
  await db.connect();
  const product = await Product.findById(req.query.id);
  await db.disconnect();
  if (product) {
    res.send(product.reviews);
  } else {
    res.status(404).send({ message: 'Product not Found' });
  }
};

const postHandler = async (req, res, user) => {
  await db.connect();
  const product = await Product.findById(req.query.id);
  console.log(user);

  if (product) {
    const existReview = product.reviews.find((x) => x.user === user._id);
    if (existReview) {
      await Product.updateOne(
        { _id: req.query.id, 'reviews_id': existReview._id },
        {
          $set: {
            'reviews.$.comment': req.body.comment,
            'reviews.$.rating': Number(req.body.rating),
          },
        }
      );
      await db.disconnect();
      return res.send({ message: 'Review Updated' });
    } else {
      const review = {
        user: mongoose.Types.ObjectId(user._id),
        name: user.name,
        rating: Number(req.body.rating),
        comment: req.body.comment,
      };
      product.reviews.push(review);
      product.numReviews = product.reviews.length;
      product.rating =
        product.reviews.reduce((a, c) => c.rating + a, 0) /
        product.reviews.length;
      await product.save();
      await db.disconnect(
        res.status(201).send({ message: 'Review submitted' })
      );
    }
  }
  await db.disconnect();
  return res.status(404).send({ message: 'Product not Found' });
};
export default handler;
