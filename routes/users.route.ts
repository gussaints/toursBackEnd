import { Router } from "express";
import userClass from "../classes/users";
import authClass from '../classes/authentication';
import routerPictures from '../routes/picture.route';
import path from 'path';

const routeUsers = Router();
const usersCtrl = new userClass();
const authCtrl = new authClass();

// routeUsers.use('/pictures/:_name', usersCtrl.addFolder, routerPictures);

// No necesitan el `token` del `login`
routeUsers.route('/reset-password/:_token').patch(authCtrl.resetPassword);
routeUsers.route('/forgot-password').post(authCtrl.forgotPassword);
routeUsers.route('/signup').post(authCtrl.signup);
routeUsers.route('/login').post(authCtrl.login);
routeUsers.route('/logout').get(authCtrl.logout);

// Protege todos los `path` de aqui en adelante
routeUsers.use(authCtrl.protect);

routeUsers.route('/updateMyPassword')
.patch(authCtrl.updatePassword);
routeUsers.route('/updateMe')
.patch(usersCtrl.uploadUserPhoto, usersCtrl.resizeUserPhoto, usersCtrl.updateMe);
routeUsers.route('/deleteMe')
.delete(usersCtrl.deleteMe);
routeUsers.route('/me')
.get(usersCtrl.getMe, usersCtrl.getOneUser);


// Solo los developers y admin podran accesar a los siguientes `path`
routeUsers.use(authCtrl.restrictTo('developer', 'admin'));

routeUsers.route('/:_id')
.get(usersCtrl.getOneUser)
.patch(usersCtrl.updateOneUser)
.delete(usersCtrl.deleteOneUser);

routeUsers.route('/')
.get(usersCtrl.getAllUsers)
.post(usersCtrl.createUser);

export default routeUsers;