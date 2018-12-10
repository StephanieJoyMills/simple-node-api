// App setup
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const bodyParser = require('body-parser');

// Db setup/config
const pg = require('pg');
const dbConfig = {
  user: 'smills',
  database: 'MyDatabase',
  password: null,
  port: 5432,
};
const pool = new pg.Pool(dbConfig);

// jwt setup
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('./config/config');
const VerifyToken = require('./VerifyToken');

// Request logging
const morgan = require('morgan');
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true,
}));

// PUT /users
// send:
// header - x-authentication-token
// body - json
// {
//   "firstName": "NewFirstName",
//   "lastName": "NewLastName"
// }
app.put('/users', VerifyToken, (req, res, next) => {
  const user = req.body;
  if (user.firstname === '' && user.lastname === '') {
    return next('No content to update');
  }
  pool.connect((err, client, done) => {
    if (err) {
      return next(err);
    }
    // If firstname or lastname isnt sent, don't update
    let queryString = 'UPDATE users SET ';
    const arr = [];
    let i = 1;
    if (user.firstname !== '') {
      queryString = `${queryString}firstname=($${i}) `;
      i += 1;
      arr.push(user.firstname);
    }
    if (user.lastname !== '') {
      if (i === 2) {
        queryString = `${queryString}, lastname=($${i}) `;
      } else {
        queryString = `${queryString}lastname=($${i}) `;
      }
      i += 1;
      arr.push(user.lastname);
    }
    queryString = `${queryString}WHERE email=($${i})`;
    arr.push(req.email);
    client.query(queryString, arr, (err2, result) => {
      done();
      if (err2) {
        return next(err2);
      }
      return res.json('success');
    });
  });
});

// GET /users
// send - x-authentication-token
// response - json
// {
//   "users": [
//     {
//       "email": "test@axiomzen.co",
//       "firstName": "Alex",
//       "lastName": "Zimmerman"
//     }
//   ]
// }
app.get('/users', VerifyToken, (req, res, next) => {
  pool.connect((err, client, done) => {
    if (err) {
      return next(err);
    }
    client.query('SELECT email, firstname, lastname FROM users;', [], (err, result) => {
      done();
      if (err) {
        return next(err);
      }
      return res.json(result.rows);
    });
  });
});

//   POST /login
//   send - json
//   {
//     "email": "test@axiomzen.co",
//     "password": "axiomzen"
//   }
//   response - json
//   {
//     "token": "some_jwt_token"
//   }
app.post('/login', (req, res, next) => {
  const user = req.body;
  pool.connect((err, client, done) => {
    if (err) {
      return next(err);
    }
    // check if in database return token
    client.query('SELECT email, password FROM users where email = $1', [user.email], (err, check) => {
      done();
      if (err) {
        return res.status(500).send('Error on the server.');
      }
      if (!check) {
        return res.status(404).send('No user found.');
      }
      const passwordIsValid = bcrypt.compareSync(user.password, check.rows[0].password);
      if (!passwordIsValid) {
        return res.status(401).send({ auth: false, token: null });
      }
      const token = jwt.sign({ id: user.email }, config.secret, {
        expiresIn: 86400, // expires in 24 hours
      });
      return res.status(200).send({ auth: true, token });
    });
  });
});

// POST /signup
// send - json
// {
//   "email": "test@axiomzen.co",
//   "password": "axiomzen",
//   "firstName": "Alex",
//   "lastName": "Zimmerman"
// }
// response - json
// {
//     "token": "some_jwt_token"
// }
app.post('/signup', (req, res, next) => {
  const user = req.body;
  const hashedPassword = bcrypt.hashSync(user.password, 8);
  pool.connect((err, client, done) => {
    if (err) {
      return next(err);
    }
    // Check to see if email is already in db
    client.query('SELECT email FROM users where email = $1', [user.email], (err, check) => {
      done();
      if (err) {
        return res.status(500).send('Error on the server.');
      }
      if (check.rowCount !== 0) {
        return res.status(404).send('Email already in use. Please choose another');
      }
      // Insert data into db
      client.query('INSERT INTO users(email, password, firstname, lastname) VALUES($1, $2, $3, $4);', [user.email, hashedPassword, user.firstname, user.lastname], (err2, result) => {
        done();
        if (err2) {
          return next(err2);
        }
        const token = jwt.sign({ id: user.email }, config.secret, {
          expiresIn: 86400, // 25 hours
        });
        return res.status(200).send({ auth: true, token });
      });
    });
  });
});

app.listen(port, () =>
  console.log(`Express server listening on port ${port}`));
