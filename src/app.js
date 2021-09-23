const express=require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
const teamAssembleRouters=require('./routes/assembleTeam')
//var logger = require('morgan');

const app=express();
//app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "..",'public')));
app.set("views", path.join(__dirname,"..", "views"));
app.set("view engine", "pug");
app.use("/",teamAssembleRouters);
module.exports=app;