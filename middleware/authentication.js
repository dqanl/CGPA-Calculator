import jwt from 'jsonwebtoken';
import { UnauthenticatedError } from '../errors/index.js';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

const auth = async (req, res, next) => {
  // First, check for the token in the Authorization header
  let token =
    req.headers.authorization && req.headers.authorization.startsWith('Bearer ')
      ? req.headers.authorization.split(' ')[1] // Extract token from Authorization header
      : null;

  // If no token in Authorization header, check the cookies
  if (!token) {
    const cookies = req.headers.cookie;
    if (cookies) {
      const cookieToken = cookies
        .split(';')
        .find((cookie) => cookie.trim().startsWith('jwtToken='))
        ?.split('=')[1]; // Extract jwtToken from cookies

      if (cookieToken) {
        token = cookieToken;
      }
    }
  }

  // If there's no token, throw an UnauthenticatedError
  if (!token) {
    throw new UnauthenticatedError('Authentication token missing or invalid');
  }

  try {
    // Verify the token using JWT_SECRET from environment variables
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user info to the request object for later use
    req.user = {
      userId: payload.userId,
      username: payload.name, // Adjust according to your token's payload structure
    };

    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.error('JWT Verification Error:', error.message); // Log error for debugging
    throw new UnauthenticatedError('Authentication failed'); // General error for the user
  }
};

export default auth;
