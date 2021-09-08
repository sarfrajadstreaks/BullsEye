/** * Required External Modules */
const express = require("express");
const path = require("path");
const crypto = require('crypto');
const cookieParser = require("cookie-parser");
const socket = require("socket.io");

/** * App Variables */
const app = express();
const port = process.env.PORT || 8000;
var teams = [];
var clientsIds = {}
///////////////////////
const users_id_client_id=new Map();
const users_id_users_name=new Map();
const users_id_teams_id=new Map();
const teams_id_teams_name=new Map();
///////////////////////
const validity = 1000 * 60 * 60;
var sess;
/** *  App Configuration */
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
/** * Routes Definitions */
app.get("/", (req, res) => {
    var cook = req.cookies;
    if (Object.keys(cook).length === 0) {
        res.render("index", { title: "Home" })
    }
    else {
        var teamDetail = {};
        teamDetail["team_id"] = cook.team_id;
        teamDetail["uid"] = cook.user_id
        teamDetail["teamName"] = cook.user_id
        teamDetail["members"] = [cook.userName];
        res.render("admin_board", { detail: teamDetail })
    }

})
app.post("/team", (req, res) => {
    var cook = req.cookies;
    var teamName = req.body.TeamName;
    var userName = req.body.AdminName
    if (Object.keys(cook).length === 0) {
        var teamId = crypto.randomUUID({ disableEntropyCache: true });
        var userId = crypto.randomUUID({ disableEntropyCache: true });
        res.cookie("user_id", userId, { maxAge: validity, httpOnly: false })
        res.cookie("team_id", teamId, { maxAge: validity, httpOnly: false })
        users_id_client_id.set(userId,null);
        users_id_teams_id.set(userId,teamId);
        teams_id_teams_name.set(teamId,teamName)
        users_id_users_name.set(userId,userName)
        res.render("admin_board", { teamId:teamId,teamName:teamName,playerId:userId })
    }
    else {
        users_id_client_id.set(cook.user_id,null);
        users_id_teams_id.set(cook.user_id,cook.team_id);
        teams_id_teams_name.set(teamId,teamName)
        users_id_users_name.set(userId,userName)
        res.render("admin_board", { teamId:teamId,teamName:teamName,playerId:userId })
    }

})
app.get("/add/:teamid", (req, res) => {
    var cook = req.cookies;
    var teamId = req.params.teamid
    var teamName=teams_id_teams_name.get(teamId);
    if (Object.keys(cook).length === 0) {
        var userId = crypto.randomUUID({ disableEntropyCache: true });
        res.cookie("user_id", userId, { maxAge: validity, httpOnly: false })
        res.cookie("team_id", teamId, { maxAge: validity, httpOnly: false })
        res.render("add_member_board", { teamName: teamName, teamId: teamId,userId:userId })
    }else{
        res.render("add_member_board", { teamName: teamName, teamId: teamId,userId:cook.user_d })
    }
});
app.post("/success", (req, res) => {
    var playerName = req.body.playerName;
    var teamId = req.body.teamId;
    var userId=req.body.userId;
    users_id_client_id.set(userId,null);
    users_id_teams_id.set(userId,teamId);
    users_id_users_name.set(userId,playerName)
    res.render("success_add_team", {teamid:teamId,userId:userId});
});
/** * Server Activation */
const server = app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
})

const io = socket(server);
io.on("connection", function (client) {
    console.log("made socket connection:" + client.id);
    client.on("joined", function (data) {
        users_id_client_id.set(data.player_id,client.id);
        users_id_teams_id.set(data.player_id,data.teamId)
        for(let users of users_id_teams_id.keys()){
            if(users_id_teams_id.get(users)===data.teamId){   
                io.to(users_id_client_id.get(users)).emit("update",{name:users_id_users_name.get(users)});
            }
        }
    })

    client.on("start",function(data){
        for(let users of users_id_teams_id.keys()){
            if(users_id_teams_id.get(users)===data.teamId){   
                io.to(users_id_client_id.get(users)).emit("starting",{msg:"Starting..in 2sec"});
            }
        }
    })
})
