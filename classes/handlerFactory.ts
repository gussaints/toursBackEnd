import { catchAsync } from './catchAsync';
import { AppError, pluginGlobalErrorHandler as globalErrorHandler} from './appError';
// import { Model } from 'mongoose';
import APIFeatures from './apiFeatures';
import _ from 'underscore';

export default class handlerFactory {
    constructor(){}

    public deleteOne = ( Model: any ) => catchAsync(async ( req: any, res: any, next: any ) => {
        let _doc = await Model.findByIdAndDelete(req.params._id);

        if ( !_doc ) {
            return next( new AppError('No document found with that ID', 404) );
        }

        console.log( 'respuesta 🛵' );
        return res.status( 204 ).json({
            status: 'success',
            data: _doc
        });
    });

    public updateOne = ( Model: any ) => catchAsync(async ( req: any, res: any, next: any ) => {
        let _doc = await Model.findByIdAndUpdate(req.params._id, req.body, { new: true, runValidators: true });

        if ( !_doc ) {
            return next( new AppError('No document found with that ID', 404) );
        }

        console.log( 'respuesta ✈️' );
        return res.status( 201 ).json({
            status: 'success',
            results: 1,
            data: _doc
        });
    });

    public createOne = ( Model: any ) => catchAsync(async ( req: any, res: any, next: any ) => {
        let _doc = await Model.create(req.body);

        console.log( 'respuesta 🚂🦼', _doc );
        return res.status( 201 ).json({
            status: 'success',
            results: 1,
            data: _doc
        });
    });

    public getOne = ( Model: any, popOptions?: any ) => catchAsync(async ( req: any, res: any, next: any ) => {
        
        let query = Model.findById(req.params._id);
        if ( popOptions && popOptions.length > 0 ) {
            popOptions.map( (onePop: any) => {
                query = query.populate(onePop);
            });
        }
        
        let _doc = await query;
        // let _doc = await Model.findById(req.params._id).populate('reviews');
        
        if ( !_doc ) {
            return next( new AppError('No document found with that ID', 404) );
        }

        console.log( 'respuesta 🏰- 🚟' );
        return res.status( 200 ).json({
            status: 'success',
            results: 1,
            data: _doc
        });
    });

    public getAll = ( Model: any, popOptions?: any ) => catchAsync(async (req: any, res: any, next: any) => {
        // To allow for nested GET Reviews on Tour
        let filter: any = {};
        if ( req.params._idTour ) {
            console.log( 'entrando por la parte de /api/v1/tours/_idTour/reviews', req.params._idTour );
            filter['tour'] = req.params._idTour;
        }
        // EXECUTE QUERY
        let query = Model.find(filter);
        // si hay popOptions, habra populate
        if ( popOptions !== undefined ) {
            popOptions.map( (onePop: any) => {
                query = query.populate(onePop);
            });
        }
        const features = new APIFeatures( query, req.query )
        .filter()
        .sort()
        .limitFields();
        const _clone = _.clone(features.query);
        const numTours = await _clone.count();
        // funciona para ver las graficas de busqueda
        // const _docs = await features.paginate().query.explain();
        console.log( 'HASTA AQUI ES LO NORMAL', popOptions );
        let _docs = await features.paginate().query;
        // const numTours = await Model.countDocuments({ secretTour: { $ne: true } });
        const page = req.query.page * 1 || 1;
        const limit = req.query.limit * 1 || 100;
        const skip = (page - 1) * limit;

        if ( req.query.page ) {
            if (skip >= numTours) {
                // throw Error('This page does not exists - v1');
                return next( new AppError('This page does not exists - v1', 404) );
            }
        }

        // query.sort().select().skip().limit()
        console.log( 'respuesta 🚘 - 🚘 - 🚘' );
        res.status(200).json({
            status: 'success',
            totalDocuments: numTours,
            since: skip+1,
            results: _docs.length,
            data: _docs
        });
    });
}