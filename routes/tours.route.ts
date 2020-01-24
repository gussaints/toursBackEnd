import { Router } from "express";
import tourClass from "../classes/tours";
import authClass from '../classes/authentication';
import bookClass from '../classes/booking';
import routerReviews from './reviews.route';
// import routerPictures from './picture.route';

const routerTours = Router();
const tourCtrl = new tourClass();
const authCtrl = new authClass();
const bookCtrl = new bookClass();

// GET | POST    /tours/11111111/reviews
// GET           /tours/11111111/reviews/00000000
// Todas las rutas de `Reviews` se pasan a `.use()
// necesito ponerle el `path` '/:_idTour/reviews',
// para que no aplique a todos los `path` que siguen
// routerTours.use('/pictures/:_name', tourCtrl.addFolder, routerPictures);
routerTours.use('/:_idTour/reviews', routerReviews);

routerTours.route('/bus').post(tourCtrl.createBus);

routerTours.route('/monthly-plan/:_year')
.get(
    authCtrl.protect,
    authCtrl.restrictTo('developer', 'admin', 'lead-guide', 'guide'),
    tourCtrl.getMonthlyPlan
);

routerTours.route('/top-5-cheap')
.get(tourCtrl.aliasTopTours, tourCtrl.getTours);

routerTours.route('/tour-stats')
.get(tourCtrl.getTourStats);

routerTours.route('/within/:_distance/center/:_latlng/unit/:_unit')
.get( tourCtrl.getToursWithinFirst, tourCtrl.getToursWithinFinal );

routerTours.route('/distances/:_latlng/unit/:_unit')
.get( tourCtrl.getDistances, tourCtrl.getToursWithinFinal );

routerTours.route('/my-tours')
.get( authCtrl.protect, tourCtrl.getMyTours );

routerTours.route('/:_id')
.get(tourCtrl.getOneTour)
.patch(
    authCtrl.protect,
    authCtrl.restrictTo('developer', 'admin', 'lead-guide'),
    tourCtrl.uploadTourImages,
    tourCtrl.resizeTourImages,
    tourCtrl.updateOneTour
)
.delete(
    authCtrl.protect,
    authCtrl.restrictTo('developer', 'admin', 'lead-guide'),
    tourCtrl.deleteOnetour
);

routerTours.route('/')
.get( bookCtrl.createBookingCheckOut, tourCtrl.getTours )
.post(
    authCtrl.protect,
    authCtrl.restrictTo('developer', 'admin', 'lead-guide'),
    tourCtrl.createTour
);

export default routerTours;