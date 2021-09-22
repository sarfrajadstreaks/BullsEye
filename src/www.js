const express=require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const app=express();
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var port= process.env.PORT || '3000'
const server=app.listen(port, ()=>{
    console.log('Server started at'+port);
})

module.exports=app;