// import { Request, Response } from 'express';
// import path from 'path';
// import fs from 'fs';
import path from 'path';
import UsersDB from '../models/users.info.model';
// import { catchAsync } from '../classes/catchAsync';
import { AppError, pluginGlobalErrorHandler as globalErrorHandler} from '../classes/appError';
import HandlerFactory from './handlerFactory';
import multer from 'multer';
import sharp from 'sharp';
import { catchAsync } from './catchAsync';
const factory = new HandlerFactory();
const routeUploads = path.join(__dirname,'../img/users');
console.log( 'routeUploads 🦊', routeUploads );

// const multerStorage = multer.diskStorage({
//     destination: ( req: any, file: any, cb: any ) => {
//         cb( null, routeUploads );
//     },
//     filename: ( req: any, file: any, cb: any ) => {
//         const ext = file.mimetype.split('/')[1];
//         cb( null, `user-${ req.user._id }-${ Date.now() }.${ ext }`);
//     }
// });

export default class Users {
    constructor(){}

    getAllUsers = factory.getAll(UsersDB);
    getOneUser = factory.getOne(UsersDB);
    // Do NOT update password with these
    updateOneUser = factory.updateOne(UsersDB);
    deleteOneUser = factory.deleteOne(UsersDB);
    multerStorage = multer.memoryStorage();

    addFolder = catchAsync( async ( req: any, res: any, next: any ) => {
        console.log( 'entrando a pictures desde USERS' );
        req.params._folder = 'users';
        next();
    })

    multerFilter = ( req: any, file: any, cb: any) => {
        console.log( 'no error multerFilter' );
        if ( file.mimetype.startsWith('image') ) {
            cb( null, true );
        } else {
            cb( new AppError('Not an image!, Please upload only images', 400), false );
        }
    }

    upload = multer({
        // dest: routeUploads,
        storage: this.multerStorage,
        fileFilter: this.multerFilter
    });

    getMe = ( req: any, res: any, next: any ) => {
        req.params._id = req.user._id;
        next();
    }

    filterObj = (myObj: any, ...allowedFields: any) => {
        const newObj: any = {};
        Object.keys(myObj).forEach(el => {
            if ( allowedFields.includes( el ) ) newObj[el] = myObj[el];
        })
        return newObj;
    }

    uploadUserPhoto = this.upload.single('photo');

    resizeUserPhoto = catchAsync(async ( req: any, res: any, next: any ) => {
        if (!req.file) return next();
        req.file.filename = `user-${ req.user._id }-${ Date.now() }.jpeg`;
        console.log( 'no error resizeUserPhoto' );
        

        await sharp(req.file.buffer)
        .resize(500, 500)
        .toFormat('jpeg')
        .jpeg({quality: 90})
        .toFile(`${routeUploads}/${req.file.filename}`);

        next( );
    })

    updateMe = catchAsync(async ( req: any, res: any, next: any ) => {
        
        // 1) Create error if user POSTs password data
        if ( req.body.password || req.body.passwordConfirm ) {
            return next( new AppError('This route is not for password updates. Please use /updateMyPassword', 400) );
        }

        // 2) Filtered out unwanted fields names that are not allowed to be updated
        const filteredBody = this.filterObj( req.body, 'name', 'email' );
        if ( req.file ) filteredBody.photo = req.file.filename;

        // 3) Update user document
        const updatedUser: any = await UsersDB
            .findByIdAndUpdate(
                req.user._id, filteredBody,
                { new: true, runValidators: true }
        );

        updatedUser.password = '🏎';

        return res.status(200).json({
            status: 'success',
            results: 1,
            data: updatedUser
        })
    });

    deleteMe = catchAsync(async ( req: any, res: any, next: any ) => {
        await UsersDB.findByIdAndUpdate(req.user._id, { active: false });

        return res.status(204).json({
            status: 'success',
            data: null
        }); 
    });

    createUser = ( req: any, res: any, next: any ) => {
        next( new AppError( 'This route is not defined. Please use /signup instead', 500 ) );
    };

}