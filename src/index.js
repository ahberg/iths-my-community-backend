
import express from 'express';
import passport from 'passport';
import bodyParser from 'body-parser';
import cors from 'cors';
import models from './models'
import serverlessHttp from 'serverless-http'
import genPass from './config/passport'

const app = express();

app.use(bodyParser.json());

let port = process.env.PORT || 8080;

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
genPass(passport)

//default route
app.get('/', (req, res) => res.send('Hello my World'));
//require('./routes/user.js')(app);
import userRoutes from './routes/user';
userRoutes(app)
import postRoutes from './routes/post'
postRoutes(app)
import followRoute from './routes/follow'
followRoute(app)
//create a server

if(process.env.NODE_ENV === 'development') {
  var server = app.listen(port, function() {
    var host = server.address().address;
    var port = server.address().port;
    console.log('App listening at http://%s:%s', host, port);
  });
} else {
  exports.handler = serverlessHttp(app)
}