import express from 'express';
import { SERVER_PORT } from '../global/environment';
import socketIO from 'socket.io';
import http from 'http';


export default class Server{
    private static _instance: Server;
    public app: express.Application;
    public port: number;
    public io: socketIO.Server;
    private httpServer: http.Server;

    private constructor(){
        this.app = express();
        this.port = SERVER_PORT;

        this.httpServer = new http.Server( this.app );
        this.io = socketIO( this.httpServer );

        this.escucharSockets();
    }

    public static get instance( ){
        return this._instance || ( this._instance = new this( ) );
    }

    private escucharSockets( ) {
        console.log('escuchando sockets - conectar');
        this.io.on('connection', cliente => {
            console.log( 'nuevo cliente', cliente.id );
        });
    }

    close(){
        this.httpServer.close(() => {
            console.log('jajajajaja');
            
            process.exit(1);
        })
    }

    start( callback: Function ){
        console.log(`${process.env.PORT}`);
        
        this.httpServer.listen( this.port, callback() );
    }
}