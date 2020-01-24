import { Router } from 'express';
import ClassBooking from '../classes/booking';
import ClassAuth from '../classes/authentication';
let routeBookings = Router();

let bookCtrl = new ClassBooking();
let authCtrl = new ClassAuth();

routeBookings
.use(authCtrl.protect);

routeBookings.route('/checkout-session/:_idTour')
.get(bookCtrl.getCheckoutSession);

routeBookings
.use( authCtrl.restrictTo('developer', 'admin', 'lead-guide', 'guide') );

routeBookings.route('/')
.get(bookCtrl.getAllBookings)
.post(bookCtrl.createBooking);

routeBookings.route('/:_id')
.get(bookCtrl.getBooking)
.patch(bookCtrl.updateBooking)
.delete(bookCtrl.deleteBooking);

export default routeBookings;