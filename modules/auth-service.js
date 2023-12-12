const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs'); 
dotenv.config();

let User;

const userSchema = new mongoose.Schema({
  userName: { type: String, unique: true },
  password: String,
  email: String,
  loginHistory: [
    {
      dateTime: Date,
      userAgent: String,
    },
  ],
});

userSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 10);
  }
  next();
});

const initialize = () => {
  return new Promise((resolve, reject) => {
    const db = mongoose.createConnection(process.env.MONGODB);

    db.on('error', (err) => {
      reject(err);
    });

    db.once('open', () => {
      User = db.model('users', userSchema);
      resolve();
    });
  });
};

const registerUser = (userData) => {
  return new Promise((resolve, reject) => {
    if (userData.password !== userData.password2) {
      reject('Passwords do not match');
      return;
    }
    const newUser = new User(userData);
    newUser.save()
      .then(() => resolve())
      .catch((err) => {
        if (err.code === 11000) {
          reject('User Name already taken');
        } else {
          reject(`There was an error creating the user: ${err}`);
        }
      });
  });
};

const checkUser = (userData) => {
  return new Promise((resolve, reject) => {
    User.findOne({ userName: userData.userName })
      .then((user) => {
        if (!user) {
          reject(`Unable to find user: ${userData.userName}`);
          return;
        }

        bcrypt.compare(userData.password, user.password)
          .then((passwordMatch) => {
            if (!passwordMatch) {
              reject(`Incorrect Password for user: ${userData.userName}`);
              return;
            }

            if (user.loginHistory.length === 8) {
              user.loginHistory.pop();
            }

            user.loginHistory.unshift({ dateTime: new Date().toString(), userAgent: userData.userAgent });

            User.updateOne({ userName: user.userName }, { $set: { loginHistory: user.loginHistory } })
              .then(() => resolve(user))
              .catch((err) => reject(`There was an error verifying the user: ${err}`));
          })
          .catch(() => reject(`Unable to find user: ${userData.userName}`));
      })
      .catch(() => reject(`Unable to find user: ${userData.userName}`));
  });
};

module.exports = {
  initialize,
  registerUser,
  checkUser,
};
