const User  = require('../models/user');
const jwt = require('jwt-simple');
const config = require('../config');

const tokenForUser = (user) => jwt.encode({ sub: user.id, iat: new Date().getTime() }, config.secret);

exports.signin = (req, res, next) => {
  return res.status(200).json({ token: tokenForUser(req.user) });
}

exports.signup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) return res.status(422).send({ error: 'You must provide a valid user '});

  User.findOne({ email: email }, (err, existingUser) => {
    if (err) return next (err);

    if (existingUser) {
      return res.status(422).send({error: 'Email is in use'});
    } else {
      const user = new User({
        email: email,
        password: password
      });

      user.save((err) => {
        if (err) return next(err);

        return res.status(200).json({ token: tokenForUser(user) });
      });
    }
  });
}