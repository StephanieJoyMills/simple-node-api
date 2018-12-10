User login flow; signup, login endpoints as well as an additional resource `users` that can be accessed if you are logged in.

Uses Json Web Tokens (https://jwt.io/), where FE will be sending requests with the JWT in the `x-authentication-token` header and PostgreSQL DB.
