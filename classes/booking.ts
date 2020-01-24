import fs from "fs";
import path from "path";
import _ from 'underscore';
import ToursDB from '../models/tours.info.model';
import BookingDB from '../models/booking.model';
import LocationsDB from '../models/locations.info.model';
import { catchAsync } from '../classes/catchAsync';
import { AppError, pluginGlobalErrorHandler as globalErrorHandler } from './appError';
import HandlerFactory from './handlerFactory';
const factory = new HandlerFactory();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export default class Booking {
    constructor() {}

    public getCheckoutSession = catchAsync( async (req: any, res: any, next: any) => {
        const _idTour = req.params._idTour;
        console.log( _idTour );
        // 1) get the currently booked tour
        const tour: any = await ToursDB.findById(_idTour)
        // 2) create checkout session
        const success_url = `http://127.0.0.1:4444/store/?ta=${_idTour}&iu=${req.user._id}&ma=${tour.price}`;
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            success_url: success_url,
            cancel_url: `http://127.0.0.1:4444/store/${_idTour}`,
            customer_email: req.user.email,
            client_reference_id: _idTour,
            line_items: [{
                name: `${tour.name} Tour`,
                description: `${tour.summary}`,
                images: [`https://www.wdshuttletours.com/img/tours/${tour.imageCover}`],
                amount: tour.price * 100,
                currency: 'usd',
                quantity: 1
            }]
        });
        // 3) create session as response
        return res.status(200).json({
            status: 'success',
            session
        });
    });

    public createBookingCheckOut = catchAsync( async ( req: any, res: any, next: any ) => {
        const { tour, user, price } = req.query;
        console.log('pasando por bookings', tour, user, price);
        if ( !tour && !user && !price ) return next();
        await BookingDB.create( { tour, user, price } )
        next();
    });

    public createBooking = factory.createOne(BookingDB);
    public getBooking = factory.getOne(BookingDB);
    public getAllBookings = factory.getAll(BookingDB);
    public updateBooking = factory.updateOne(BookingDB);
    public deleteBooking = factory.deleteOne(BookingDB);
}