var http = require('http');
var fs = require('fs');
var express = require('express');
var app = express();
var path = require('path');
var itemDB = require('../models/itemDB');
var bodyParser = require('body-parser');
var session = require('express-session');
var userProfile = require('../models/userProfile');
var appp = require('./app');

var urlencodedParser = bodyParser.urlencoded({extended: false});
var profileController = require('./profileController')(app);

//set view engine to EJS
app.set('view engine', 'ejs');
//set the path for static resources to be accessible
app.use('/resources', express.static('resources'));

module.exports = function(app){

  app.use(session({secret: "Shh, it's a secret", resave: true,
  saveUninitialized: true}));
  var sesh;
  var theUser;

  //function for rendering the categories page
  app.get('/categories', async function(req, res){
    console.log(req.session);
    var actionLink = new Array();
    var shooterLink = new Array();
    var actionCount = 0;
    var shooterCount = 0;
    var aa = new Array();
    var fps = new Array();

    //dislays items the user doesn't have if the users logged in
    if (req.session.theUser){
      var userItems = await userProfile.getUserItems(req.session.theUser);
      userItems = userItems[0].userItems;
      var unownedItems = await userProfile.unownedItems(userItems);
      console.log(unownedItems.length);

      //output sanitization
      for(var i = 0; i < unownedItems.length; i++){
       if(!itemDB.gameTitles.includes(unownedItems[i].itemName)){
          console.log(unownedItems[i].itemName);
          res.send("There is some malicious information on the page. Please try again");
       }

       //gets lists of unowned items by catgory
       if(unownedItems.catalogCategory == "Action-Adventure"){
         aa[actionCount].push(unownedItems[i]);
         actionLink[actionCount] = "item?itemCode=" + unownedItems[i].itemCode;
         actionCount++;
       }
       else if(unownedItems.catalogCategory == "FPS"){
         fps[shooterCount].push(unownedItems[i]);
         shooterLink[actionCount] = "item?itemCode=" + unownedItems[i].itemCode;
         shooterCount++;
       }
      }

      res.render(__dirname + '/../views/categories', {theUser: req.session.theUser, action: aa, shooter: fps, aLink: actionLink, sLink: shooterLink});
        //userProfile.unownedItems(userProfile.sethsItems);

    }
    else{
      if(req.query.itemCode != null && req.query.itemCode === '0001' || req.query.itemCode === '0002' || req.query.itemCode === '0003' || req.query.itemCode === '0004' || req.query.itemCode === '0005' || req.query.itemCode === '0006'){
        var allGames = await itemDB.getItems();
        var allGamesLength = await itemDB.allGames.length;
        var correctGame = await itemDB.getItem(req.query.itemCode);

        if(!(itemDB.gameTitles.includes(correctGame.itemName)) || !(itemDB.imageURLs.includes(correctGame.imageURL)) || !(itemDB.ratings.includes(correctGame.rating)) || !(itemDB.descriptions.includes(correctGame.description)) || !(itemDB.catalogCategories.includes(correctGame.category))){
          res.render(__dirname + '/../views/item', {theUser: req.session.theUser, qs: req.query.itemCode, game: correctGame});
        }
        else{
          res.send("There is some malicious information on the page. Please try again");
        }

      }
      else{
        res.render(__dirname + '/../views/categories', {theUser: req.session.theUser})
        console.log(req.query);
        }
    }//close sesh if statement

  });//closes app.get

}//close module exports
