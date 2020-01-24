import { Router } from 'express';
import ReviewClass from '../classes/review';
import AuthClass from '../classes/authentication';

const ReviewCtrl = new ReviewClass();
const AuthCtrl = new AuthClass();
// Esto es para que pueda utilizar los parametros
// que vienen de otros `router` como por ejemplo `routerTours`
const routeReviews = Router({ mergeParams: true });
routeReviews.use(AuthCtrl.protect);

routeReviews
.route('/:_id')
.get(ReviewCtrl.getOneReview)
.patch(
    AuthCtrl.restrictTo('developer','client','admin'),
    ReviewCtrl.updateOneReview
)
.delete(
    AuthCtrl.restrictTo('developer','client','admin'),
    ReviewCtrl.deleteOneReview
);

routeReviews
.route('/')
.get(ReviewCtrl.getReviews)
// POST   /tours/11111111/reviews
// POST   /reviews
.post(
    AuthCtrl.restrictTo('developer','client'),
    ReviewCtrl.setTourUserIds,
    ReviewCtrl.createReview
);


export default routeReviews;