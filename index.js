/**
 * Required External Modules
 */
const express=require("express");
const path = require("path");
const session = require('express-session');
const crypto = require('crypto');
/**
 * App Variables
 */
const app=express();
const port=process.env.PORT|| 8000;

/**
 *  App Configuration
 */
app.set("views",path.join(__dirname,"views"));
app.set("view engine","pug");
app.use(express.static(path.join(__dirname, "public")));
app.use(session({secret: 'ssshhhhh'}));
app.use(express.urlencoded({ extended: true })); 
/**
 * Routes Definitions
 */
    app.get("/", (req,res)=>{
        res.render("index", {title:"Home"})
    })
    //app.post()
    app.post("/team", (req,res)=>{
        sess = req.session;
        var mykey = crypto.randomUUID({disableEntropyCache : true});
        var TeamName=req.body.TeamName;
        var AdminName=req.body.AdminName
        sess.id=mykey;
        sess.TeamName=TeamName
        sess.AdminName=AdminName
        res.render("board", {name:TeamName})
    })
/**
 * Server Activation
 */
app.listen(port , ()=>{
    console.log(`Server running at http://localhost:${port}`);
})