import { getSession } from 'next-auth/react';
import db from '../../../utils/db';
import User from '../../../models/User';
import bcrypt from 'bcryptjs';

const handler = async (req, res) => {
  if (req.method !== 'PUT') {
    return res.status(400).send({ message: `${req.method} not supported` });
  }

  const session = await getSession({ req });
  if (!session) {
    return res.status(401).send({ message: 'Signin required' });
  }

  const { user } = session;
  const { name, email, password } = req.body;

  if (
    !name ||
    !email ||
    !email.includes('@') ||
    (password && password.trim().length < 5)
  ) {
    res.status(422).json({
      message: 'Validation error',
    });
    return;
  }

  await db.connect();
  const toUpdateUser = await User.findById(user._id);
  toUpdateUser.name = name;
  toUpdateUser.email = email;
  if (password) {
    toUpdateUser.password = bcrypt.hashSync(password);
  }
  await toUpdateUser.save();
  await db.disconnect();
  res.send({ message: 'User updated' });
};

export default handler;
