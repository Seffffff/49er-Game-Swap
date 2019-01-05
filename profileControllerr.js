var express = require('express');
var bodyParser = require('body-parser');
var session = require('express-session');
var app = express();
//var cookieParser = require('cookie-parser');
var path = require('path');

var userDB = require('../models/userDB');
var itemDB = require('../models/itemDB');
var userProfile = require('../models/userProfile');
var userItem = require('../models/userItem')
var urlencodedParser = bodyParser.urlencoded({extended: false});

//const toMySwaps = "C:\Users\ipodm\OneDrive\Desktop\Fall 2018\4166 - Network-Based Application Development\Assignment3\views\mySwaps;"



//set view engine to EJS
app.set('view engine', 'ejs');
//set the path for static resources to be accessible
app.use('/resources', express.static('resources'));



module.exports = function(app){

  app.use(session({secret: "Shh, it's a secret", resave: true,
  saveUninitialized: true}));
  var sesh;
  var theUser;

  //function for displaing the myItems page
  app.get('/myItems', async function(req, res){

    //you need to be logged in to display the items in their inventory
    //checks if there is a user on the session
    if(!req.session.theUser){
      var message = "You must be logged in to view the my items page";
      res.render(path.join(__dirname + '/../views/login'), {errorMessage: message});
    }
    else if(req.session.theUser){
      var link = new Array();
      var passedProfileInfo = new Array();
      var correctProfile = await userDB.getUserProfile(req.session.theUser);
      var profileItems = new Array();

      for(var i = 0; i < correctProfile.userItems.length; i++){
        profileItems[i] = await itemDB.getItem(correctProfile.userItems[i]);
        link[i] = "/item?itemCode=" + profileItems[i].itemCode;
      }

      res.render(path.join(__dirname + '/../views/myItems'),
      { theUser: req.session.theUser, currentProfile: profileItems, link: link});
     }
  });

  //function for handling the information passed from the myItems page
  app.post('/myItems', urlencodedParser, async function(req, res){
    var link = new Array();

    if(req.body.delete){
      var item = await itemDB.getItem(req.body.delete);
      console.log(req.body.delete);

      if(item != null){
        var userProfileItems = await userDB.getUserProfile(req.session.theUser);
        userProfileItems = userProfileItems.userItems;
        var correctProfile = new Array();


        if(userProfileItems.includes(req.body.delete)){

          for(var i = 0; i < userProfileItems.length; i++){
            correctProfile[i] = await itemDB.getItem(userProfileItems[i]);
            link[i] = "/item?itemCode=" + userProfileItems[i];
          }
          await userDB.removeUserItem(req.session.theUser, req.body.delete);
          req.session.sessionProfile = await userDB.getUserProfile(req.session.theUser);
          //res.render(__dirname + '/../views/myItems', { theUser: req.session.theUser, currentProfile: correctProfile, link: link});
          res.redirect(req.originalUrl);
        }

      }

    }//body.delete if

  });




}
