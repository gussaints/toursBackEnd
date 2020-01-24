import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: './config.env'});
import Server from './classes/server';
import { AppError, pluginGlobalErrorHandler as globalErrorHandler } from './classes/appError';
import routerTours from './routes/tours.route';
import routerUsers from './routes/users.route';
import routerReviews from './routes/reviews.route';
import routerLocations from './routes/locations.route';
import routerBookings from './routes/booking.route';
import routerPictures from './routes/picture.route';
import bodyParser from 'body-parser';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import expMongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import express from 'express';
import cookieParser from 'cookie-parser';
// Http Parameter Pollution
import hpp from 'hpp';
import { DB_REMOTE, DB_PASSWORD } from './global/environment';

const limiter = rateLimit({
  max: 100,
  windowMs: 60*60*1000,
  message: 'Too many requests from this IP, Please try again in an hour!'
})

process
  .on('unhandledRejection', (err: any, p) => {
    console.error(err.name, err.message, 'Unhandled Rejection at Promise 🚨 shutting down...');
    process.exit(1)
  })
  .on('uncaughtException', (err: any) => {
    console.error(err.name, err.message, 'Uncaught Exception thrown 🚨 shutting down...');
    process.exit(1);
  });

// import express from 'express';
// const server = new Server();
const server = Server.instance;
const DB = DB_REMOTE.replace(
    '<PASSWORD>',
    DB_PASSWORD
);

server.app.use( helmet() );
// middleware
if (process.env.NODE_ENV === 'development') {
    server.app.use(morgan('dev'));
}
// Cross Domain
server.app.use( cors({ origin: true, credentials: true }) );
// Configurar cabeceras y cors
// server.app.use((req: any, res: any, next: any) => {
//   res.header('Access-Control-Allow-Origin', '*');
//   res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
//   res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
//   res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
//   console.log( req.cookies, 10101010101 );
  
//   next();
// });

// server.app.use( '/api', limiter );
// server.app.use( bodyParser.urlencoded({extended: true}) );
// server.app.use( bodyParser.json({ limit: '10kb' }) );
server.app.use( express.urlencoded({ extended: true }));
server.app.use( express.json({ limit: '10kb' }) );
server.app.use( cookieParser( ) );

// Data sanitization against NOSQL query injection
server.app.use( expMongoSanitize() );
// Data sanitization against XSS
server.app.use( xss() );
// Prevent Parameter Pollution
server.app.use( hpp({
  whitelist: [
    'duration',
    'ratingsQuantity',
    'ratingsAverage',
    'maxGroupSize',
    'difficulty',
    'price'
  ]
}));
// server.app.use( express.static(`${__dirname}/public`) );




mongoose
.connect( DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}).then( ( con: any ) => {
    // console.log( con.connections );
    console.log(`Connected to the database successfully`);
});
server.app.use( ( req: any, res: any, next: any ) => {
  req.requestTime = new Date().toISOString();
  // console.log( 'checando las cookies', req.cookies, req.headers);
  
  next();
});

// rutas
server.app.use('/api/v1/bookings', routerBookings);
server.app.use('/api/v1/tours', routerTours);
server.app.use('/api/v1/users', routerUsers);
server.app.use('/api/v1/reviews', routerReviews);
server.app.use('/api/v1/locations', routerLocations);
server.app.use('/api/v1/pictures', routerPictures);

// not found
server.app.all('*', ( req, res, next ) => {
    next(new AppError(`Cant find ${ req.originalUrl } on this server`, 404));
});

server.app.use(globalErrorHandler);

server.start(()=>{
    console.log(`server running at port ${ server.port }`);
});