// import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import _ from 'underscore';
import ToursDB from '../models/tours.info.model';
import LocationsDB from '../models/locations.info.model';
import BookingDB from '../models/booking.model';
import { catchAsync } from '../classes/catchAsync';
import { AppError, pluginGlobalErrorHandler as globalErrorHandler } from './appError';
import HandlerFactory from './handlerFactory';
const factory = new HandlerFactory();
import multer from 'multer';
import sharp from 'sharp';
import BusDB from '../models/bus.model'
const routeUploads = path.join(__dirname,'../img/tours');
console.log( 'routeUploads 🦊', routeUploads );
// import { log } from "util";

export default class tourCtrl {
    constructor(){}

    multerStorage = multer.memoryStorage();

    addFolder = catchAsync( async ( req: any, res: any, next: any ) => {
        console.log( 'entrando a pictures desde TOURS' );
        
        req.params._folder = 'tours';
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

    public uploadTourImages = this.upload.fields([
        { name: 'imageCover', maxCount: 1 },
        { name: 'images', maxCount: 3 }
    ]);

    public resizeTourImages = catchAsync( async ( req: any, res: any, next: any ) => {
        if (!req.files.imageCover || !req.files.images) return next();
        console.log( 'no error resizeUserPhoto' );
        // 1) imagecover
        const imageCoverFileName = `tour-${req.params._id}-${Date.now()}-cover.jpeg`;
        await sharp(req.files.imageCover[0].buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({quality: 90})
        .toFile(`${routeUploads}/${imageCoverFileName}`);

        req.body.imageCover = imageCoverFileName;

        // 2) images
        req.body.images = [];

        await Promise.all(
            req.files.images.map(async (file: any, i: any) => {
                const filename = `tour-${req.params._id}-${Date.now()}-${i + 1}.jpeg`;
    
                await sharp(file.buffer)
                .resize(2000, 1333)
                .toFormat('jpeg')
                .jpeg({quality: 90})
                .toFile(`${routeUploads}/${filename}`);
    
                req.body.images.push(filename);
            })
        );

        console.log( req.body );
        next();
    })

    // upload.array('images', 5);
    // upload.single('image');

    public createTour = factory.createOne(ToursDB);
    public getTours = factory.getAll(ToursDB, [{ path: 'startLocations', select: '-__v' }]);
    public getOneTour = factory.getOne( ToursDB, [{ path: 'reviews', select: '-__v' },{ path: 'startLocations', select: '-__v' },{ path: 'locations', select: '-__v' }] );
    public updateOneTour = factory.updateOne(ToursDB);
    public deleteOnetour = factory.deleteOne(ToursDB);

    public readFile = (req: any, res: any, next: any) => {
        req.filename = '';
        req.myTours = [ ];
        req.filename = path.join(`${__dirname}`, `../data/tours-simple.json`);
        console.log(req.filename);
        req.myTours = JSON.parse( fs.readFileSync(req.filename, 'utf-8') );

        next();
    };

    public checkID = (req: any, res: any, next: any) => {
        req.status = '';
        req.myOneTour = {};
        req.tour = [];
        req._status = 0;

        const _id = parseInt(req.params._id);
        console.log('_id middleware', _id);
        req.tour = req.myTours.filter((el: any) => el.id === _id);
    
        req.status = req.tour.length === 1 ? 'success' : 'fail';
        req._status = req.tour.length === 1 ? 200 : 404; ;
        req.myOneTour = req.tour.length === 1 ? req.tour[0] : { message: 'Invalid id' };

        next( );
    };

    public aliasTopTours = ( req: any, res: any, next: any ) => {
        req.query.limit = 5;
        req.query.sort = '-ratingsAverage,price';
        req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
        next();
    };

    public getMonthlyPlan = catchAsync(async ( req: any, res: any, next: any ) => {
        const year = req.params._year * 1;
        const plan = await ToursDB.aggregate([
            { $unwind: '$startDates' },
            { $match: { startDates: {
                $gte: new Date(`${year}-01-01`),
                $lte: new Date(`${year}-12-31`)
            }}},
            { $group: {
                _id: { $month: '$startDates' },
                numTourStarts: { $sum: 1 },
                tours: { $push: '$name' }
            }},
            { $addFields: { month: '$_id' }},
            { $project: { _id: 0 } },
            { $sort: { numTourStarts: -1 } },
            { $limit: 12 }
        ]);
        console.log( 'respuesta ⛽️' );
        res.status(200).json({
            status: 'success',
            totalDocuments: plan.length,
            data: plan
        });
    });

    public getTourStats = catchAsync(async ( req: any, res: any, next: any ) => {
        const stats = await ToursDB.aggregate([
            { $match: { ratingsAverage: { $gte: 4.5 } } },
            { $group: {
                    // _id: { $toUpper: '$difficulty' },
                    // _id: { $toUpper: '$ratingsAverage' },
                    _id: '$difficulty',
                    numTours: { $sum: 1 },
                    numRatings: { $sum: '$ratingsQuantity' },
                    avgRating: { $avg: '$ratingsAverage' },
                    avgPrice: { $avg: '$price' },
                    minPrice: { $min: '$price' },
                    maxPrice: { $max: '$price' }
                }
            },
            // { $match: { _id: { $ne: 'easy' } } },
            { $sort: { avgPrice: 1 } }
        ]);
        console.log( 'respuesta 🚆' );
        res.status(200).json({
            status: 'success',
            results: stats.length,
            data: stats
        });
    });

    public getToursWithinFirst = catchAsync(async ( req: any, res: any, next: any ) => {
        const { _distance, _latlng, _unit } = req.params;
        const [ _lat, _lng ] = _latlng.split(',');
        const radius = _unit === 'mi' ? _distance / 3963.2 : _distance / 6378.1;
        if ( !_lat || !_lng ) {
            let msg = 'Please provide latitude and longitude in the format lat,lng';
            next( new AppError( msg, 400 ) );
        }

        const _locations = await LocationsDB.find(
            {coordinates: {$geoWithin: { $centerSphere: [ [ _lng, _lat ], radius ]}}}
        );
        req.locations = _locations;
        next();
    });

    public getToursWithinFinal = catchAsync( async ( req: any, res: any, next: any ) => {
        const _ids = req.locations.map( (loc: any) => loc._id );
        const _tours: any = await ToursDB.find({'startLocations': { $in: _ids }});

        if ( _tours.length < 1 ) {
            next( new AppError( 'There is no one tour founded', 404 ) );
        }

        const myLocs = req.locations.map( ( loc: any, idx: any ) => {
            const myTour = _tours.map( ( tour: any, idx1: any ) => {
                let newTour: any = {};
                newTour._id = tour._id;
                newTour.name = tour.name;
                newTour.startLocations = loc;
                if (String(loc._id) === String(tour.startLocations)) {
                    return newTour;
                }
            });
            const compacts = _.reject(myTour, _.isUndefined);
            if ( compacts.length ) {
                return compacts
            }
        });

        const _docs = _.reject(myLocs, _.isUndefined);

        let newDocs = _docs.map( (_doc:any) => {
            return _doc[0];
        });
        
        return res.status(200).json({
            status: 'success',
            unit: req.params._unit,
            results: newDocs.length,
            data: newDocs
        });
    });

    public getDistances = catchAsync(async (req: any, res: any, next: any) => {
        const { _latlng, _unit } = req.params;
        const [ _lat, _lng ] = _latlng.split(',');
        if ( !_lat || !_lng ) {
            let msg = 'Please provide latitude and longitude in the format lat,lng';
            next( new AppError( msg, 400 ) );
        }

        const _multiplier = _unit === 'mi' ? 0.000621371 : 0.001;

        const _distances = await LocationsDB.aggregate([
            {
                $geoNear: {
                    near: {
                        type: 'Point',
                        coordinates: [ _lng * 1, _lat * 1 ]
                    },
                    distanceField: 'distance',
                    distanceMultiplier: _multiplier
                }
            },
            {
                $project: {
                    distance: 1,
                    address: 1,
                    description: 1
                }
            }
        ]);

        req.locations = _distances;
        next();
    });

    public getMyTours = catchAsync( async ( req: any, res: any, next: any ) => {
        const bookings = await BookingDB.find({user: req.user._id});
        const tourIds = bookings.map( (el: any) => el.tour );
        const tours = await ToursDB.find( { _id: { $in: tourIds} } );

        return res.status(200).json({
            status: 'success',
            data: tours
        });
    });

    public createBus = catchAsync( async ( req: any, res: any, next: any) => {
        const newBus = await BusDB.create( req.body );
        return res.status(200).json({
            status: 'success',
            data: newBus
        });
    })
}