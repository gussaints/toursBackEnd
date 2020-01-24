import { Router } from 'express';
import ClassPicture from '../classes/picture';

const routePicture = Router({ mergeParams: true });
const picCtrl = new ClassPicture;

routePicture.route('/:_name').get(picCtrl.getImage);


export default routePicture;