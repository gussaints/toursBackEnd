import Server from './classes/server';
import routerTravel from './routes/travel.route';
import bodyParser = require('body-parser');
import cors from "cors";

const server = new Server();

// middleware
server.app.use( bodyParser.urlencoded({extended: true}) );
server.app.use( bodyParser.json() );

// Cross Domain
server.app.use( cors({ origin: true, credentials: true }) );

// rutas
server.app.use('/travel', routerTravel);

server.start(()=>{
    console.log(`server running at port ${ server.port }`);
    
})