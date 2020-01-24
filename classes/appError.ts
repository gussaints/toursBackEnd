export class AppError extends Error {
    statusCode: any;
    status: any;
    isOperational: boolean;
    message: any;
    constructor( message: any, statusCode: any ){
        super( message );
        
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;
        this.message = this.message;
        // console.log( this.message, 'checando' );
        

        Error.captureStackTrace( this, this.constructor );
    }
}

export const pluginGlobalErrorHandler: any  = ( err: any, req: any, res: any, next: any ) => {
    // console.log( 'err1', err );
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, res);
        // console.log( '🧩' );
        
    } else if (process.env.NODE_ENV === 'production') {
        let error0 = { ...err };
        // console.log( 'error0', error0, err.path, err.value, err.errmsg, err.stack );
        if ( !error0.message ) {
            error0.message = err.stack;
        }
        
        if ( error0.name === 'CastError') error0 = handleCastErrorDB(error0);
        if ( error0.code === 11000 ) error0 = handleDuplicateFieldsDB(error0);
        if ( error0.name === 'ValidationError') error0 = handleValidationErrorDB(error0);
        if ( error0.name === 'JsonWebTokenError' ) error0 = handleJWTError( );
        if ( error0.name === 'TokenExpiredError' ) error0 = handleJWTExpiredError( );
        sendErrorProd( error0, res );
        // console.log('🚐');
        
    }

}

const handleCastErrorDB = (err: any) => {
    const message = `Invalid ${err.path}: ${err.value}.`;
    return new AppError( message, 400 );
}

const handleDuplicateFieldsDB = ( err: any ) => {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    const message = `Duplicate field value: ${ value } Please use another value!`;
    return new AppError( message, 400 );
}

const handleValidationErrorDB = ( err: any ) => {
    const errors = Object.values(err.errors).map((el: any) => el.message);
    const message = `Invalid input data : ${ errors.join('. ') }`;
    return new AppError( message, 400 );
}

const handleJWTError = ( ) => {
    const message = `Invalid token, please log in again !`;
    return new AppError( message, 401 );
}

const handleJWTExpiredError = ( ) => {
    const message = `Your token has expired, please log in again !`;
    return new AppError( message, 401 );
}

const sendErrorDev = (err: any, res: any) => {
    res.status( err.statusCode ).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
    });
}

const sendErrorProd = ( err: any, res: any ) => {
    // console.log( err );
    
    if ( err.isOperational ) {
        res.status( err.statusCode ).json({
            status: err.status,
            message: err.message
        });
    } else {
        // console.log( 'error 🚨', err );
        
        res.status( 500 ).json({
            status: 'error',
            message: 'Something went very wrong'
        });
    }
    
}