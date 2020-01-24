import fs from 'fs';
import path from 'path';
import { catchAsync } from './catchAsync';

export default class Picture {
    constructor() {}

    public getImage = catchAsync( async ( req: any, res: any, next: any ) => {
        const _name = req.params._name;
        const _folder = _name.split('-')[0] + 's';
        const pathImagen = path.resolve( __dirname, `../img/${_folder}/${_name}`);
        if ( fs.existsSync( pathImagen ) ) {
            return res.sendFile( pathImagen );
        } else {
            const noImage = path.resolve( __dirname, `../img/${_folder}/default.jpg`);
            return res.sendFile( noImage );
        }
    });
}