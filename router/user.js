import express from 'express';
// import { sendMessage, getMessages } from '../controller/message.js';
import {
  getMessages,
  deleteMessage,
  regenerateString,
  deleteUser,
} from '../controller/user.js';
const Router = express.Router();
 
Router.route('/delete').delete(deleteUser);
Router.route('/messages').get(getMessages);
Router.route('/messages/:id').delete(deleteMessage);
Router.route('/regenerate-id').patch(regenerateString);
export default Router;
