const User = require('../models/user');
const jwt = require('jwt-simple');
const config = require('../config');

function tokenForUser(user) {
  // don't use email because email can change
  // sub is the default 'subject' of the token - who does it belong to
  // iat : issued at time
  const timestamp =  new Date().getTime();
  return jwt.encode({ sub: user.id, iat: timestamp }, config.secret);
}

exports.signup = function(req, res, next) {
  // user req.body to access to the post request data
  const email  = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(422).send({ error: 'You must provide email and password' });
  }

  // see if a user with the given email exists
  User.findOne({ email: email }, function(err, existingUser) {
    if (err) {
      return next(err);
    }

    // if a user with email does exist, return an error
    if (existingUser) {
      return res.status(422).send({ error: 'Email is in use' });
    }

    // if a user with email does NOT exist, create and save new user record
    // creates user in memory
    const user = new User({
      email: email,
      password: password
    })

    // async save
    user.save(function(err) {
      if (err) {
        return next(err);
      }

      // responsd to request indicating the user was created
      res.json({ token: tokenForUser(user) });
    });

  });
};

exports.signin = function(req, res, next) {
  // User has already had their email and password auth'd
  // We just need to give them a token
  res.send({ token: tokenForUser(req.user) })
};
