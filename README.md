# Bootcamp App API Project
Backend API for Bootcamp Web application, which is a bootcamp directory website made with Express to manage bootcamps, course, users, and authentication

## Getting Started

1. Ensure you have Node.js installed.
2. Create a free [Mongo Atlas](https://www.mongodb.com/atlas/database) database online or start a local MongoDB database.
3. Create a `.env` file with a `MONGO_URL` property set to your MongoDB connection string.
4. Set `API_URL = /api/v1` in file `.env`
5. Set your `SECRET = secret-value-example` in file `.env`
6. In the terminal, run: `npm install`

## Running the Project
1. In the terminal, run: `npm start`
2. Browse to [localhost:5000/api/v1](http://localhost:5000/api/v1)

## Docker
1. Ensure you have the latest version of Docker installed
2. Run `docker build -t bootcamp-web-api .`
3. Run `docker run -it -p 5000:5000 bootcamp-web-api`
4. Post file in `{BASE_URL/api/v1/bootcamps}` does not work because `requested access to the resource is denied` so follow these steps bellow
5. Run `docker exec --user root -it yourContainerId //bin//sh` to go to docker container that has been running
6. Run `ls -all` to make sure that there is a `public` folder right there
7. Run `chmod -R 777 public`. But people say that it is not recommended to change to `777`