const { User } = require('../models/User');

const authenticate = async (req, res, next) => {
  const token = req.header('x-auth');
  try {
    const user = await User.findByToken(token);
    if (!user) {
      throw new Error();
    }
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).send();
  }
};

module.exports = { authenticate };
