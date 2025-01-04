import express from 'express';
import sendMessage from '../controller/message.js';
const Router = express.Router();

Router.route('/:id').post(sendMessage);

export default Router;
