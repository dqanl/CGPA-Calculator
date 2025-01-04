import { User } from '../schema/userSchema.js';
import { v4 as uuidv4 } from 'uuid';
import { StatusCodes } from 'http-status-codes';
import { BadRequestError, UnauthenticatedError } from '../errors/index.js';
function generateFallbackEmail() {
  return `fallback_${uuidv4()}@example.com`; // Generate fallback email
}

export const createUser = async (req, res) => {
  try {
    let { username, password, email, expirationHours } = req.body;
    console.log('Request body:', req.body);
    console.log(email === '');
    if (email === '') {
      email = generateFallbackEmail(); // Generate the fallback email
      req.body.email = email; // Update the email in the request body
    }
    // Create the user in the database
    const newUser = await User.create(req.body);

    // Generate a token for the new user
    const token = newUser.createJwt();

    res.status(StatusCodes.CREATED).json({
      name: newUser.username,
      email: newUser.email, // Email will always exist because it’s required
      token,
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      const message = `${
        field.charAt(0).toUpperCase() + field.slice(1)
      } already exists`;
      return res.status(StatusCodes.BAD_REQUEST).json({ message });
    }
    res.status(StatusCodes.BAD_REQUEST).json(error);
  }
};

export const login = async (req, res) => {
  const { emailOrUsername, password } = req.body;

  // Check if email/username and password are provided
  if (!emailOrUsername || !password) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      msg: 'Please provide an email/username and password',
    });
  }

  try {
    // Find user by email or username
    const user = await User.findOne({
      $or: [{ email: emailOrUsername }, { username: emailOrUsername }],
    });

    // If user doesn't exist
    if (!user) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: 'Invalid email/username or password' }); // Generalized error for security
    }

    // Validate password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: 'Invalid email/username or password' }); // Generalized error for security
    }

    // Generate JWT
    const token = user.createJwt();

    // Set the token as an HTTP-only cookie
    res.cookie('jwtToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
      sameSite: 'Strict', // Prevent CSRF
      maxAge: 3 * 60 * 60 * 1000, // 3 hours
    });

    // Send a successful response
    res.status(StatusCodes.OK).json({
      user: { username: user.username, email: user.email },
      message: 'Login successful',
    });
  } catch (error) {
    console.error('Error in login controller:', error.message);

    // Handle unexpected server errors
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: 'Something went wrong during login. Please try again later.',
    });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie('jwtToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
      sameSite: 'Strict',
    });
    res.status(StatusCodes.OK).json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Logout failed',
      error: error.message,
    }); 
  }
};
