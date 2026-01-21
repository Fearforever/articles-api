## API Documentation

## Description
NestJS REST API with authentication, articles, caching and tests.

## Run
npm install
npm run start:dev

## Docs
Swagger UI available at:
http://localhost:3000/api

## Authentication
- POST /auth/register
- POST /auth/login

Use Bearer token for protected endpoints.

## Articles
- GET /articles
- GET /articles/:id
- POST /articles (auth)
- PATCH /articles/:id (auth, author only)
- DELETE /articles/:id (auth, author only)
