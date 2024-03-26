/**
 * Express webserver / controller
 */

// import express
const express = require('express');
const bcrypt = require('bcrypt');

// import the cors -cross origin resource sharing- module
const cors = require('cors');

// create a new express app
const webapp = express();

// import authentication functions
const { authenticateUser, verifyUser } = require('./utils/auth');
// enable cors
webapp.use(cors());

// Middleware to parse incoming JSON data
webapp.use(express.json());

// configure express to parse request bodies
webapp.use(express.urlencoded({ extended: true }));

// import the db function
const dbLib = require('./DbOperations');

// root endpoint route
webapp.get('/', (req, resp) => {
  resp.json({ message: 'hello CIS3500 friends!!! You have dreamy eyes' });
});

/**
 * Login endpoint
 * The name is used to log in
 */
webapp.post('/login', (req, res) => {
  // check that the name was sent in the body
  if (!req.body.email || !req.body.password) {
    res.status(401).json({ error: `empty or missing name: ${req.body}` });
    return;
  }
  // authenticate the user
  try {
    const token = authenticateUser(req.body.email);
    res.status(201).json({ apptoken: token });
  } catch (err) {
    res.status(401).json({ error: 'authentication failed' });
  }
});

/**
 * Route implementation POST /register
 * to register new user
 */
webapp.post('/register', async (req, resp) => {
  // parse the body
  if (!req.body.email || !req.body.password) {
    resp.status(400).json({ message: 'missing name, email or major in the body' });
    return;
  }

  // test if the email exists, if true then return 400
  // TODO: change func to be getUserByEmail
  if (dbLib.getStudentByName(req.body.email)) {
    resp.status(400).json({ message: 'email already exists' });
    return;
  }

  const hashedPassword = await bcrypt.hash(req.body.password, 10);

  // post the data to the db
  try {
    const newUser = {
      email: req.body.email,
      password: hashedPassword,
    };
    console.log(newUser);
    const result = await dbLib.addUser(newUser);
    console.log(result);
    resp.status(201).json({ data: { id: result } });
  } catch (err) {
    resp.status(400).json({ message: 'There was an error' });
  }
});

/**
 * route implementation GET /students
 */
webapp.get('/students', async (req, resp) => {
  try {
    // get the data from the DB
    const students = await dbLib.getStudents();
    // send response
    resp.status(200).json({ data: students });
  } catch (err) {
    // send the error code
    resp.status(400).json({ message: 'There was an error' });
  }
});

/**
   * route implementation GET /student/:id
   */
webapp.get('/student/:id', async (req, res) => {
  console.log('READ a student');
  try {
    // get the data from the db
    const results = await dbLib.getStudent(req.params.id);
    if (results === undefined) {
      res.status(404).json({ error: 'unknown student' });
      return;
    }
    // send the response with the appropriate status code
    res.status(200).json({ data: results });
  } catch (err) {
    res.status(404).json({ message: 'there was error' });
  }
});

/**
 * route implementation DELETE /student/:id
 */
webapp.delete('/student/:id', async (req, res) => {
  try {
    const result = await dbLib.deleteStudent(req.params.id);
    if (result.deletedCount === 0) {
      res.status(404).json({ error: 'student not in the system' });
      return;
    }
    // send the response with the appropriate status code
    res.status(200).json({ message: result });
  } catch (err) {
    res.status(400).json({ message: 'there was error' });
  }
});

/**
* route implementation PUT /student/:id
*/
webapp.put('/student/:id', async (req, res) => {
  console.log('UPDATE a student');
  // parse the body of the request
  if (!req.body.major) {
    res.status(404).json({ message: 'missing major' });
    return;
  }
  try {
    const result = await dbLib.updateStudent(req.params.id, req.body.major);
    // send the response with the appropriate status code
    res.status(200).json({ message: result });
  } catch (err) {
    res.status(404).json({ message: 'there was error' });
  }
});

// export the webapp
module.exports = webapp;