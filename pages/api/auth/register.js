import User from '../../../models/User';
import db from '../../../utils/db';
import bcrypt from 'bcryptjs';
async function handler(req, res) {
  await db.connect();
  const hashPassword = bcrypt.hashSync(req.body.password);

  const user = await User.findOne({ email: req.body.email });
  if (user) {
    return res.status(400).send({ message: 'Email is used' });
  } else {
    const newUser = new User({
      name: req.body.name,
      email: req.body.email,
      password: hashPassword,
      isAdmin: false,
    });
    const userRegister = await newUser.save();
    await db.disconnect();
    res.send(userRegister);
  }
}
export default handler;
