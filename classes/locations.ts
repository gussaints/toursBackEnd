// import { catchAsync } from './catchAsync';
// import { AppError, pluginGlobalErrorHandler as globalErrorHandler} from './appError';
import HandlerFactory from './handlerFactory';
import LocationDB from '../models/locations.info.model';

const factory = new HandlerFactory();

export default class Locations {
    constructor(){ }

    public getLocations = factory.getAll(LocationDB);
    public getOneLocation = factory.getOne(LocationDB);
    public createOneLocation = factory.createOne(LocationDB);
    public updateOneLocation = factory.updateOne(LocationDB);
    public deleteOneLocation = factory.deleteOne(LocationDB);
}