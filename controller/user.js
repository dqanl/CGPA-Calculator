import { User } from '../schema/userSchema.js';
import { StatusCodes } from 'http-status-codes';
import { UnauthenticatedError } from '../errors/index.js';
import { v4 as uuidv4 } from 'uuid';

// Get all messages for the authenticated user
export const getMessages = async (req, res) => {
  const userId = req.user.userId; // Extract userId from the token payload

  try {
    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: 'User not found' });
    }

    // Extract query parameters for pagination
    const { page = 1, limit = 10 } = req.query; // Default to page 1 and 10 messages per page

    // Sort messages by timestamp (most recent first)
    const sortedMessages = user.messages.sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    );

    // Paginate messages
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedMessages = sortedMessages.slice(startIndex, endIndex);

    // Respond with the paginated and sorted messages
    res.status(StatusCodes.OK).json({
      messages: paginatedMessages,
      uniqueString: user.uniqueString,
      messageCount: user.messages.length,
      totalPages: Math.ceil(user.messages.length / limit),
      currentPage: parseInt(page),
    });
  } catch (error) {
    console.error('Error in /getMessages:', error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: 'Internal Server Error' });
  }
};


// Regenerate the user's unique string
export const regenerateString = async (req, res) => {
  const userId = req.user.userId;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: 'User not found' });
    }

    const oldUniqueString = user.uniqueString;
    user.uniqueString = uuidv4();
    await user.save();

    res.status(StatusCodes.CREATED).json({
      oldUniqueString,
      newUniqueString: user.uniqueString,
    });
  } catch (error) {
    console.error('Error in /regenerateString:', error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: 'Internal Server Error' });
  }
};

// Delete a specific message for the authenticated user
export const deleteMessage = async (req, res) => {
  const userId = req.user.userId;
  const messageId = req.params.id;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $pull: { messages: { _id: messageId } } }, // Remove message by its ID
      { new: true } // Return the updated user document
    );

    if (!updatedUser) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: 'User not found' });
    }

    res.status(StatusCodes.OK).json({
      msg: 'Message successfully deleted',
      updatedMessages: updatedUser.messages,
    });
  } catch (error) {
    console.error('Error in /deleteMessage:', error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: 'Internal Server Error' });
  }
};

// Delete the authenticated user's account
export const deleteUser = async (req, res) => {
  const userId = req.user.userId;
  const { password } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({ msg: 'User not found' });
    }

    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: 'Incorrect password, please try again' });
    }

    await User.findByIdAndDelete(userId);
    res
      .status(StatusCodes.OK)
      .json({ msg: 'User account deleted successfully' });
  } catch (error) {
    console.error('Error in /deleteUser:', error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: 'Internal Server Error' });
  }
};
