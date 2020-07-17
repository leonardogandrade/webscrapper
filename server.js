const express = require('express');
const server = express();
const cors = require('cors');
const mongoose = require('mongoose');
const requireDir = require('require-dir');
require('dotenv').config();

//Database
try{
    mongoose.connect(process.env.MONGO,{useNewUrlParser : true, useUnifiedTopology : true});
    console.log('database connetion OK')
}catch(err){
    console.log(err);
}

//Configs
server.use(cors());
server.use(express.json());

//Models
requireDir('./src/models');

//Routes
server.use('/api',require('./src/routes'));

try{
    server.listen(process.env.PORT || 3002);
    console.log(`server is listenning on port ${process.env.PORT}`)
}catch(err){
    throw err;
}