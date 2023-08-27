import { SERVER_URL } from '../constants';
import { sendAuthenticatedRequest } from '../helpers';

/**
 * Registers user with given first name, last name, email and password
 * @param {string} firstName
 * @param {string} lastName
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{userId: number, token: string}>}
 */
export function register(firstName, lastName, email, password) {
  return fetch(`${SERVER_URL}/api/auth/user`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: email.trim(),
      password,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
    }),
  }).then((res) =>
    res.json().then((data) => {
      if (res.status < 200 || res.status > 299) {
        throw Error(data.message);
      }
      return data;
    })
  );
}

/**
 * Logs user in with given email and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{userId: number, token: string}>}
 */
export function login(email, password) {
  return fetch(`${SERVER_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  }).then((res) =>
    res.json().then((data) => {
      if (res.status !== 200) {
        throw Error(data.message);
      }
      return data;
    })
  );
}

/**
 * Requests a password reset
 * @param {email} email
 * @returns {Promise}
 */
export function requestPasswordReset(email) {
  return fetch(`${SERVER_URL}/api/auth/reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  }).then((res) =>
    res.json().then((data) => {
      if (res.status < 200 || res.status > 200) {
        throw Error(data.message);
      }
    })
  );
}

/**
 * Sets new password
 * @param {number} userId
 * @param {string} token
 * @param {string} password
 * @returns {Promise}
 */
export function resetPassword(userId, token, password) {
  return fetch(`${SERVER_URL}/api/auth/reset`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token, userId, password }),
  }).then((res) =>
    res.json().then((data) => {
      if (res.status < 200 || res.status > 299) {
        throw Error(data.message);
      }
    })
  );
}

/**
 * Gets current user details
 * @param {NavigateFunction} navigate
 * @returns {Promise<{
 *  userId: number,
 *  firstName: string,
 *  lastName: string,
 *  email: string
 * }>}
 */
export function getUser(navigate) {
  return sendAuthenticatedRequest('/api/auth/user', navigate);
}

/**
 * Gets user details by id
 * @param {number} userId
 * @param {NavigateFunction} navigate
 * @returns {Promise<{
 *  userId: number,
 *  firstName: string,
 *  lastName: string,
 *  email: string
 * }>}
 */
export function getUserById(userId, navigate) {
  return sendAuthenticatedRequest(`/api/auth/user/${userId}`, navigate);
}
