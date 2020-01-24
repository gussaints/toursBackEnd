import { Router } from 'express';
import ClassLocation from '../classes/locations';
let routeLocations = Router({ mergeParams: true });

let locationCtrl = new ClassLocation();

routeLocations
.route('/:_id')
.get(locationCtrl.getOneLocation)
.patch(locationCtrl.updateOneLocation)
.delete(locationCtrl.deleteOneLocation);

routeLocations
.route('/')
.get(locationCtrl.getLocations)
.post(locationCtrl.createOneLocation);

export default routeLocations;