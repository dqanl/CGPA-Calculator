import express from 'express';

import { createUser, login, logout } from '../controller/auth.js';
const Router = express.Router();

Router.route('/register').post(createUser)
Router.route('/login').post(login)
Router.route('/logout').post(logout)

export default Router;
