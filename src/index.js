require("babel-core/register");
require("babel-polyfill");
import express from 'express';
import passport from 'passport';
import bodyParser from 'body-parser';
import cors from 'cors';
import models from './models'

const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express")

const app = express();

app.use(bodyParser.json());

let port = process.env.PORT || 8080;

const swaggerOptions = {
  swaggerDefinition: {
    info: {
      version: '3.0.0',
      title: 'My community API',
      description:"My community API for iths"
    },
    servers: [{url:"http://localhost:3009"}]
  },
  apis:['src/index.js'],
}


// Routes
/**
 * @swagger
 * /customers:
 *  get:
 *    description: Use to request all customers
 *    responses:
 *      '200':
 *        description: A successful response
 */
app.get("/customers", (req, res) => {
  res.status(200).send("Customer results");
});
app.get("/customers", (req, res) => {
  res.status(200).send("Customer results");
});
// set the view engine to ejs
app.set('view engine', 'ejs');

// make express look in the public directory for assets (css/js/img)
app.use(express.static(__dirname + '/public'));


app.use(cors());

// force: true will drop the table if it already exits
// models.sequelize.sync({ force: true }).then(() => {
  models.sequelize.sync().then(() => {
    console.log('Drop and Resync with {force: true}');
  });
  
  // passport middleware
  app.use(passport.initialize());
  
  // passport config
  require('./config/passport')(passport);
  
  //default route
  app.get('/', (req, res) => res.send('Hello my World'));
  require('./routes/user.js')(app);
  require('./routes/post.js')(app);
  require('./routes/follow.js')(app);
  //create a server
  var server = app.listen(port, function() {
    var host = server.address().address;
    var port = server.address().port;
    
    console.log('App listening at http://%s:%s', host, port);
  });
  
  const swaggerDocs = swaggerJsDoc(swaggerOptions)
  console.log(swaggerDocs)
  app.use('/api-docs',swaggerUi.serve, swaggerUi.setup(swaggerDocs));
  
