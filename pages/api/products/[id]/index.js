import Product from '../../../../models/Product';
import db from '../../../../utils/db';

export default async function handler(req, res) {
  await db.connect();
  const product = await Product.findById(req.query.id);
  await db.disconnect();
  res.send(product);
}
