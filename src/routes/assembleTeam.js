const app=require('../www');
const express=require('express')
const socket = require("socket.io");
//var router=app.Router();
var router=express.Router();
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
const team_id_players_id=new Map();
const player_details=new Map();
router.get("/", (req, res) => {
    var cook = req.cookies;
    if (Object.keys(cook).length === 0) {
        res.render("index", { title: "Home" })
    }
    else {
        var player_detail=player_details.get(cook.player_id);
        res.render("admin_board", { 
            team_id:player_detail.team_id,
            team_name:player_detail.team_name,
            player_id:cook.player_id
        })
    }

});
router.post("/team", (req, res) => {
    var cook = req.cookies;
    var teamName = req.body.team_name;
    var playerName = req.body.player_name
    if (Object.keys(cook).length === 0) {
        var teamId = crypto.randomUUID({ disableEntropyCache: true });
        var playerId = crypto.randomUUID({ disableEntropyCache: true });
        res.cookie("player_id", playerId, { maxAge: validity, httpOnly: false })
        //res.cookie("team_id", teamId, { maxAge: validity, httpOnly: false })
        var player_detail={
            team_id:teamId,
            team_name:teamName,
            player_name:playerName,
            client_id:null,
            is_admin:true
        }
        var players_list=new Set();
        players_list.add(playerId);
        team_id_players_id.set(teamId,players_list)
        player_details.set(playerId,player_detail);
        res.render("admin_board", { 
            team_id:player_detail.team_id,
            team_name:player_detail.team_name,
            player_id:cook.player_id
         })
    }
    else {
        var player_detail=player_details.get(cook.player_id);
        res.render("admin_board", { 
            team_id:player_detail.team_id,
            team_name:player_detail.team_name,
            player_id:cook.player_id
        })
    }

});
router.get("/add/:teamid", (req, res) => {
    var cook = req.cookies;
    var teamId = req.params.team_id
    var teamName=req.query.team_name
    if (Object.keys(cook).length === 0) {
        var playerId = crypto.randomUUID({ disableEntropyCache: true });
        res.cookie("player_id", playerId, { maxAge: validity, httpOnly: false });
         var players_list=team_id_players_id.get(teamId);
        players_list.add(playerId);
        team_id_players_id.set(teamId,players_list)
        res.render("add_member_board", { 
            team_name: teamName, 
            team_id: teamId,
            player_id:playerId 
        })
    }else{
        res.render("add_member_board", { 
            team_name: teamName, 
            team_id: teamId,
            player_id:cook.player_id 
        })
    }
});
router.post("/success", (req, res) => {
    var player_id=req.body.player_id;
    var player_name = req.body.player_name;
    
    var team_id = req.body.team_id;
    var team_name=req.body.team_name;

    var player_detail={
        team_id:team_id,
        team_name:team_name,
        player_name:player_name,
        client_id:null,
        is_admin:false
    }
    player_details.set(player_id,player_detail);
    res.render("success_add_team", {
        team_id:team_id,
        player_id:player_id
    });
});
const io = socket(server);
io.on("connection", function (client) {
    console.log("made socket connection:" + client.id);

    client.on("joined", function (data) {
        var player_detail=player_details.get(data.player_id);
        player_detail.client_id=client.id;
        player_details.set(data.player_id,player_detail);
        var players_list=team_id_players_id.get(data.team_id);
        players_list.forEach(element => {
            var detail=player_details.get(element);
            io.to(detail.client_id).emit("update",{player_name:detail.player_name});
        });
    })

    client.on("start",function(data){
        var players_list=team_id_players_id.get(data.team_id);
        players_list.forEach(element => {
            var detail=player_details.get(element);
            io.to(detail.client_id).emit("update",{player_name:detail.player_name});
        });
    })
})