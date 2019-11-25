import { Router, Request, Response } from "express";

const routerTravel = Router();

routerTravel.get('/', ( req: Request, res: Response ) => {
    console.log();
    res.json({
        ok: true,
        travelGet: 'todo esta bien gracias a Dios'
    });
});

routerTravel.post('/', ( req: Request, res: Response ) => {
    const cuerpo = req.body.cuerpo;
    const de = req.body.de;

    res.json({
        ok: true,
        travelPost: 'todo bien gracias a Dios',
        cuerpo,
        de
    });
});

routerTravel.post('/:_id', ( req: Request, res: Response ) => {
    const cuerpo = req.body.cuerpo;
    const de = req.body.de;
    const _id = req.params._id;

    res.json({
        ok: true,
        travelPost: 'todo bien gracias a Dios',
        cuerpo,
        de,
        _id
    });
})

export default routerTravel;