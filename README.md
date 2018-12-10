-m 'init commit'
Uses Json Web Tokens (https://jwt.io/), where FE will be sending requests with the JWT in the `x-authentication-token` header and PostgreSQL DB.

## Install Dep

npm install

## Set up database

(Assume PostgreSQL is already installed)
In console:
Update the database config in app.js to your credentials
Run:
CREATE TABLE users(
email VARCHAR(40), password VARCHAR(80), firstname VARCHAR(20), lastname VARCHAR(20)
);

## Run Server

node app.js

## Postman Calls

Sign-up Call:
POST
http://localhost:3000/signup

Header:
[{"key":"Content-Type","value":"application/json","description":""}]

Body:
{
"email": "meret3",
"password": "password2",
"firstname": "firstname2",
"lastname": "lastname2"
}

Login Call:
POST
http://localhost:3000/login

Header:
[{"key":"Content-Type","value":"application/json","description":""}]

Body:
{
"email": "name@email.com",
"password": "password"
}

Users Call (GET):
GET
http://localhost:3000/users

Header:
[{"key":"x-access-token","value":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Im1lcmV0MyIsImlhdCI6MTUyOTI2OTIyNCwiZXhwIjoxNTI5MzU1NjI0fQ.vZBBDg0n-PsnXKVlSE2yOnhRGlE_rdPJl8IKRCybeYI","description":""}]

- Token is the token returned from sign-in or login

Users Call (PUT):
PUT
http://localhost:3000/users

Header:
Header:
[{"key":"Content-Type","value":"application/json","description":""}, {"key":"x-access-token","value":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Im1lcmV0MyIsImlhdCI6MTUyOTI2OTIyNCwiZXhwIjoxNTI5MzU1NjI0fQ.vZBBDg0n-PsnXKVlSE2yOnhRGlE_rdPJl8IKRCybeYI","description":""}]

- Token is the token returned from sign-in or login

Body:
{
"firstname": "lastfirstname",
"lastname": " "
}
