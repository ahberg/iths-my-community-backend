import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt'
import models from '../models'
import { APIGatewayProxyHandler as APIHandler } from 'aws-lambda'
import passport from 'passport';

const Users = models.User;


const  checkPass  = (passport) => {
    const opts:{[key: string]: { prop:  any}} = {};

    opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
    opts.secretOrKey = process.env.SECRET;
    passport.use(
      new JwtStrategy(opts, (jwt_payload, done) => {
        if(jwt_payload.id == undefined) {
          return done(null, false);
        }
        Users.findAll({ where: { id: jwt_payload.id } })
          .then(user => {
            if (user.length) {
              return done(null, user[0]);
            }
            return done(null, false);
          })
          .catch(err => console.log(err));
      })
    );
  }
// opts.issuer = 'accounts.examplesoft.com';
// opts.audience = 'yoursite.net';
const  authenticate:APIHandler  = async(event,context) => {
  const result  = checkPass(passport)
  console.log(result)

    return {
      statusCode: 200,
      body: 'No results',
    };
}

const failed = async(): Promise<APIGatewayProxyResult> => {
    return {
        statusCode: 500,
        body: 'input JSON not valid'
  }
  }

function inputParser(handler: (event ) => Promise): (event: APIGatewayEvent) => Promise{
    return (event: APIGatewayEvent) => {
      const input  = JSON.parse(event.body ?? {});
      console.log(Object.keys(input).length) 
      if(Object.keys(input).length === 0) {
          return failed();
      } 
      event.body = input
      return  handler(event)
    };
}
// create jwt strategy
export  {authenticate,inputParser}