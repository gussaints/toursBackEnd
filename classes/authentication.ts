import UsersDB from '../models/users.info.model';
import { promisify } from 'util';
import { catchAsync } from '../classes/catchAsync';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../global/environment';
import crypto from 'crypto';
import { AppError, pluginGlobalErrorHandler as globalErrorHandler} from '../classes/appError';
import eMailTrapClass from '../classes/email';
import nodemailer from 'nodemailer';

export default class authCtrl {
    constructor(){}

    public signToken = (id: any) => {
        const expiresIn = { expiresIn: 60 * 60 } || { expiresIn: '1h' };
        return jwt.sign({ id }, process.env.JWT_SECRET || JWT_SECRET, expiresIn);
    };

    public createSendToken = ( user: any, statusCode: any, res: any ) => {
        const token = this.signToken(user._id);
        let checking = false;
        const cookieOptions: any = {
            expires: new Date(Date.now() + ( 60 * 60 * 1000 )),
            httpOnly: true
        }
        if ( process.env.NODE_ENV === 'production') {
            cookieOptions.secure = true;
            checking = true;
        }
        user['password'] = '🏎';

        res.cookie( 'jwt', token, cookieOptions );

        return res.status(statusCode).json({
            status: 'success',
            secure: checking,
            results: 1,
            token,
            data: user
        })
    }

    public protect = catchAsync( async ( req: any, res: any, next: any) => {

        // 1) Getting token and check of it's there
        let token: any = '';
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
            token = String(req.headers.authorization.split(' ')[1]);
        }
        if ( !token ) {
            return next( new AppError('You are not logged in! Please log in to get access', 401));
        }

        // 2) Verification token
        const decoded: any = await promisify(jwt.verify)( token, process.env.JWT_SECRET || JWT_SECRET );
        // arrojara estos 2 errores con el catchAsync: JsonWebTokenError || TokenExpiredError
        // console.log( Number(decoded.exp), Number(Date.now()), Number(decoded.exp) - Number(Date.now()), decoded );

        // 3) Check if user still exists
        const currentUser: any = await UsersDB.findById(decoded.id);
        if ( !currentUser ) {
            return next( new AppError( 'The user belonging to this token does not exist', 401 ) );
        }

        // 4) Check if user changed  password after the token was issued
        const verifyPassword = await currentUser.changedPasswordAfter(decoded.iat);
        // console.log( 'verifyPassword', verifyPassword );
        
        if ( verifyPassword ) {
            return next( new AppError( 'User recently changed password! Please log in again !', 401 ));
        }
        
        // Access to the protected route
        req.user = currentUser;
        next();
    });

    public signup = catchAsync( async (req: any, res: any, next: any) => {
        const user = await UsersDB.create(req.body);
        const url = `http://localhost:4444/store/me`;
        console.log( 'signup', url );

        await new eMailTrapClass(user, url).sendWelcome();
        await this.createSendToken(user, 201, res);
    });

    public logout = ( req: any, res: any, next: any ) => {
        res.cookie('jwt', 'go out right now!', {
            expires: new Date( Date.now() + ( 10 * 1000 ) ),
            httpOnly: true
        });
        // console.log( 'validando cookies', res.cookie );
        
        res.status(200).json({status: 'success'});
    }

    public login = catchAsync(async ( req: any, res: any, next: any ) => {
        const { email, password } = req.body;

        // 1) check if email and password exist
        if (!email || !password) {
            return next(new AppError('Please provide email and password!', 400));
        }
        // 2) check if user exists and password is correct
        const user: any = await UsersDB.findOne({ email }).select('+password');
        if ( !user ) {
            return next(new AppError('Incorrect email or password - 333', 401));
        }
        const correctPassword = await user.correctPassword( password, user['password'] );
        // const correctPassword = await bcrypt.compare(password, user['password']);;
        if ( !correctPassword ) {
            return next(new AppError('Incorrect email or password - 777', 401));
        }
        
        // 3) if everything is ok, send token to client
        await this.createSendToken(user, 200, res);
        
    });

    public restrictTo = (...roles: any) => {
        return ( req: any, res: any, next: any) => {
            // console.log( roles );
            if ( !roles.includes(req.user.role) ) {
                return next(new AppError('You do not have permission to perform this action', 403));
            }
            if ( req.params._id === req.user._id ) {
                return next(new AppError('You can not delete yourself', 403));
            }
            next();
        }
    };

    public forgotPassword = catchAsync( async ( req: any, res: any, next: any ) => {
        // console.log();
        // 1) Get user based on POSTed email
        const user: any = await UsersDB.findOne({ email: req.body.email });
        if ( !user ) {
            return next( new AppError('There is no user with this email address', 403) );
        }

        // 2) Generate the random reset token
        const resetToken = user.createPasswordResetToken();
        await user.save({ validateBeforeSave: false });
        
        
        try {
            // 3) Send it to user's email
            const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/reset-password/${resetToken}`;
            // const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email`;
            
            const eMailTrap = await new eMailTrapClass(user, resetURL).sendPasswordReset();

            return res.status(200).json({
                status: 'success',
                message: 'Token sent to email'
            });
        } catch (err) {
            user.passwordResetToken = undefined;
            user.passwordResetTokenExpiry = undefined;
            await user.save({ validateBeforeSave: false });

            return next( new AppError('There was an error sending the email, try again later', 500));
        }
    });

    public resetPassword = catchAsync( async ( req: any, res: any, next: any ) => {
        // 1) Get user based on the token
        const hashedToken = crypto
        .createHash('sha256')
        .update(req.params._token)
        .digest('hex');

        const user: any = await UsersDB.findOne({
            passwordResetToken: hashedToken,
            passwordResetTokenExpiry: { $gt: Date.now() }
        });

        // 2) If token has not expired, and there is user, set the new password
        if ( !user ) {
            return next( new AppError('Token is invalid or has expired', 400) );
        }
        user.password = req.body.password;
        user.passwordConfirm = req.body.passwordConfirm;
        user.passwordResetToken = undefined;
        user.passwordResetTokenExpiry = undefined;
        await user.save();

        // 3) Update passwordChangedAt property for the user
        // userSchema.pre('save'... in the user.info.model file
        // 4) Log the user in, send JWT
        await this.createSendToken(user, 200, res);

    });

    public updatePassword = catchAsync( async ( req: any, res: any, next: any) => {
        // 1) Get user from collection
        const user: any = await UsersDB.findById( req.user._id ).select('+password');
        const correctPassword = await user.correctPassword( req.body.passwordCurrent, user.password );

        // 2) Check if POSTed current password is correct
        if ( !user || !correctPassword ) {
            return next( new AppError('Your current password is wrong', 401));
        }

        // 3) If so, update password
        user.password = req.body.password;
        user.passwordConfirm = req.body.passwordConfirm;
        await user.save();

        // 4) Log user in, send JWT
        await this.createSendToken(user, 200, res);

    })
}