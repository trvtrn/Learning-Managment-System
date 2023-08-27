const bcrypt = require('bcrypt');
const path = require('path');
const { sendEmail, createToken } = require('../utils/helpers');
const {
  doesUserExist,
  deletePasswordTokens,
  getUserIdByEmail,
  addNewUser,
  getPasswordByEmail,
  getPasswordResetToken,
  getUserDetailsById,
  updateUserPassword,
  emailAlreadyRegistered,
  storePasswordResetToken,
  deleteUser,
} = require('../scripts/database');

const crypto = require('crypto');

/**
 * Handler for POST /api/auth/user route
 */
const createUserHandler = (req, res) => {
  const { email, password, firstName, lastName } = req.body;

  // Check if email already registered
  if (emailAlreadyRegistered(email)) {
    return res.status(409).json({ message: 'Email already registered' });
  }

  // Generate a salt & hash the password
  const salt = bcrypt.genSaltSync(parseInt(process.env.BCRYPT_SALT));
  const hashedPassword = bcrypt.hashSync(password, salt);

  // Add new user to database
  const userId = addNewUser(firstName, lastName, email, hashedPassword);

  // Generate token
  const token = createToken(userId);

  // Send userId and token to result
  res.status(200).json({ userId, token });
};

/**
 * Handler for POST /api/auth/login route
 */
const loginHandler = (req, res) => {
  const { email, password } = req.body;

  // confirm user exists
  if (!emailAlreadyRegistered(email)) {
    return res.status(404).json({ message: 'Email not registered to an account' });
  }

  const storedPassword = getPasswordByEmail(email);

  // Compare the password with the hashed password
  if (bcrypt.compareSync(password, storedPassword)) {
    // Generate a token and return it
    const userId = getUserIdByEmail(email);
    const token = createToken(userId);

    // Send userId and token to result
    res.status(200).json({ userId, token });
  } else {
    res.status(404).json({ message: 'Incorrect password' });
  }
};

/**
 * Handler for DELETE /api/auth/user route
 */
// Delete a user using the token
const deleteUserHandler = async (req, res) => {
  // Convert token to userId
  const userId = req.userId;

  // Check conversion was successful
  if (userId === -1) {
    return res.status(403).json({ message: 'unauthenticated' });
  }

  // Delete user by userId
  deleteUser(userId);

  return res.status(200).json({ success: true });
};

/**
 * Handler for POST /api/auth/reset route
 */
const sendResetLinkHandler = async (req, res) => {
  const { email } = req.body;

  // Check email registered to an account
  if (!emailAlreadyRegistered(email)) {
    return res.status(404).json({ message: 'Email not registered to an account' });
  }

  const userId = getUserIdByEmail(email);

  // Delete any reset tokens currently alive for the user
  deletePasswordTokens(userId);

  // Generate code
  let resetToken = crypto.randomBytes(32).toString('hex');
  const salt = bcrypt.genSaltSync(parseInt(process.env.BCRYPT_SALT));
  const hashedToken = bcrypt.hashSync(resetToken, salt);

  // Store hashedToken in db
  storePasswordResetToken(userId, hashedToken);

  const userDetails = getUserDetailsById(userId);
  const link = `${process.env.DOMAIN}:${process.env.CLIENT_PORT}/linkreset?token=${resetToken}&userId=${userId}`;

  const info = sendEmail(
    userDetails.email,
    'Toodles Password Reset Request',
    { name: userDetails.firstName, link: link },
    path.resolve(__dirname, '../assets/requestResetPassword.handlebars')
  );
  return res.status(200).json({ userId, resetToken });
};

/**
 * Handler for PUT /api/auth/reset route
 */
const testResetCodeHandler = async (req, res) => {
  const { userId, token, password } = req.body;

  if (!doesUserExist(userId)) {
    return res.status(401).json({ message: 'userId invalid' });
  }

  // Get hashedToken from db for the userId
  const hashedToken = getPasswordResetToken(userId);

  // Check token matches hashedToken in the db
  const tokenValid = await bcrypt.compare(token, hashedToken);
  if (!tokenValid) {
    return res.status(401).json({ message: 'Invalid token' });
  }

  deletePasswordTokens(userId);

  // Encrypt new password and update in db
  const salt = bcrypt.genSaltSync(parseInt(process.env.BCRYPT_SALT));
  const hashedPassword = bcrypt.hashSync(password, salt);
  updateUserPassword(userId, hashedPassword);

  // Get user details for email
  const userDetails = getUserDetailsById(userId);

  // Send 'password successfully reset' email
  const info = await sendEmail(
    userDetails.email,
    'Password Reset Successfully',
    { name: userDetails.firstName },
    path.resolve(__dirname, '../assets/resetPasswordSuccessful.handlebars')
  );
  return res.status(200).json({ passwordUpdated: true });
};

/**
 * Handler for GET /api/auth/user route
 */
const getUserDetailsByTokenHandler = (req, res) => {
  // Convert token to userId
  const userId = req.userId;

  // Check userId exists
  if (userId === -1) {
    return res.status(403).json({ message: 'unauthenticated' });
  }

  // Get user details by userId
  return res.status(200).json(getUserDetailsById(userId));
};

/**
 * Handler for GET /api/auth/user/:userId route
 */
const getUserDetailsByIdHandler = (req, res) => {
  const userId = parseInt(req.params.userId);
  if (!doesUserExist(userId)) {
    return res.status(404).send({ message: `User with id ${userId} not found` });
  }
  return res.status(200).json(getUserDetailsById(userId));
};

module.exports = {
  createUserHandler,
  loginHandler,
  sendResetLinkHandler,
  testResetCodeHandler,
  deleteUserHandler,
  getUserDetailsByTokenHandler,
  getUserDetailsByIdHandler,
};
