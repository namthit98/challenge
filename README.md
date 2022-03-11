# This repository shows how you can build API with NestJS, Prisma and Manage subscriptions with Stripe

## Features of this application

This application is basically an API for manage subscriptions with Stripe. It provides a possibility to perform sign up, sign in, create subscription and cancel subscription.

## Running the application

1. Register Stripe then add secret key to `.env` file as `STRIPE_KEY`
2. Execute command `docker-compose up` to run database and application.
3. Call API `http://localhost:8000/api/v1/stripes/sync` with GET method to sync product of Stripe with system.

Note: If you use `Visual Studio Code` then install `REST Client` extension. You can check file `src/requests.http` to test all API.

# API Routes:

BASE_URL: http://localhost:8000/api/v1

- GET

  - /stripes/sync : Sync data (plan) Stripe with system
  - /plans : List all plans
  - /users : List all users
  - /subscriptions : List own subscription

- POST

  - /users

    - Body
      username: String (required): The username of user
      password: String (required): The password of user
      fullname: String (required): The fullname of user
      email: String (required): The email of user

  - /users/login

    - Body
      username: String (required): The username to login
      password: String (required): The password to login

  - /subscriptions/create-session
    - Body
      planId: String (required): The id of plan

- DELETE
  - /subscriptions/:id Delete subscription by its id
