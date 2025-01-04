import { User } from '../schema/userSchema.js';
import { StatusCodes } from 'http-status-codes';
import { BadRequestError } from '../errors/index.js';

export const sendMessage = async (req, res) => {
  let { uniqueString, message } = req.body;
  if (!uniqueString) uniqueString = req.params.id;
  if (!message) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ error: 'Please provide a valid unique string and message' });
  }

  try {
    const user = await User.findOne({ uniqueString });

    if (!user) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({
          error:
            'Invalid unique string or link, or the user account has expired.',
        });
    }

    user.messages.push({ content: message });
    await user.save();

    res
      .status(StatusCodes.ACCEPTED)
      .json({ message: 'Message sent successfully' });
  } catch (error) {
    console.error(`Error in sendMessage route: ${error.message}`, {
      stack: error.stack,
    });
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: 'Internal Server Error' });
  }
};

export default sendMessage;
