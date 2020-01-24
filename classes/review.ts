import ReviewDB from '../models/reviews.info.model';
// import { catchAsync } from './catchAsync';
import HandlerFactory from './handlerFactory';
const factory = new HandlerFactory();

export default class Review {
    constructor(){}

    public createReview = factory.createOne(ReviewDB);
    public getReviews = factory.getAll(ReviewDB);
    public getOneReview = factory.getOne(ReviewDB);
    public updateOneReview = factory.updateOne(ReviewDB);
    public deleteOneReview = factory.deleteOne(ReviewDB);

    public setTourUserIds = ( req: any, res: any, next: any ) => {
        // Allow nested routes 
        // funciona la referencia PATERN
        // porque un REVIEW solo pertenece a un TOUR
        if ( !req.body.tour || !req.body.user ) {
            console.log( 'entrando por la parte de /api/v1/tours/_idTour/reviews', req.params._idTour );
            req.body.tour = req.params._idTour || req.body.tour;
            req.body.user = req.user._id || req.body.user;
        }
        
        next();
    }
}