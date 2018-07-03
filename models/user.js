const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt-nodejs');

const fHandleCallback = (next, fn) => {
  return (err, ...args) => {
    if (err) return next(err);
    fn(...args);
  }
}

const userSchema = new Schema({
  email: {
    type: String,
    unique: true,
    lowercase: true
  },
  password: String
});

userSchema.pre('save', 
  function(next) {
    let user = this;
    bcrypt.genSalt(10, 
      fHandleCallback(next, 
        salt => {
          bcrypt.hash(user.password, 
            salt, 
            null, 
            fHandleCallback(next, 
              hash => {
                user.password = hash;
                next();
              })
          )
        })
    )
  });

userSchema.methods.comparePassword = function(candidatePassword, callback) {
  bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
    if (err) return callback(err);
    callback(null, isMatch);
  })
}

const ModelClass = mongoose.model('user', userSchema);

module.exports = ModelClass;