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


  app.get('/myItems', async function(req, res, next){
    sesh = req.session;
    req.session.theUser = req.query.userid;
    res.locals.theUser = theUser;


    var allUsers = await userDB.getUsers();

    if(await userProfile.doesUserExist(theUser)){
      var correctProfile = userProfile.sethsItems;
      console.log(correctProfile);
      console.log("oyyy");

      sesh = req.session;
      req.session.theUser = req.query.userid;
      theUser = req.session.theUser;
      res.locals.theUser = theUser;

      //console.log(correctProfile);
      //console.log(userProfile.sethsItems.userItems);
      //if req.query.action == null && req

      /*if(req.query.action != null && userProfile.sethsItems != null){
        console.log("action not null");
        console.log(req.query.action);

        if(req.query.action == "update"){
          console.log("action = update")
          if(req.query.theItem == '0001' ||
              req.query.theItem == '0002' || req.query.theItem == '0003' ||
              req.query.theItem == '0004' || req.query.theItem == '0005' ||
              req.query.theItem == '0006'){
                //console.log(userProfile.addUserItem(req.query.theItem))
                if(userProfile.addUserItem(req.query.theItem).status == "pending"){
                  console.log("pending fired")
                  req.query.swapItem = userProfile.addUserItem(req.query.theItem);

                    if(req.query.swapItem.isSwapped == false){
                      res.render(path.join(__dirname + '/../views/mySwaps'), {theUser: req.session.theUser});
                      console.log(req.query.swapItem.isSwapped);
                    }
                    else if(req.query.swapItem.isSwapped == true){
                      req.query.userItem = userProfile.getUserItems(req.query.theItem);


                        res.render(path.join(__dirname + '/../views/item'),
                      {theUser: req.session.theUser, qs: req.query.userItem[0].itemCode, game: req.query.userItem[0]});
                }
                //req.add.userProfile.correlatingUserItem
                //console.log(userProfile.addUserItem(req.query.theItem))
              }
              else{
                var correctGame = await itemDB.getItem(req.query.theItem);
                //console.log(correctGame);
                if(!(itemDB.gameTitles.includes(correctGame.itemName)) || !(itemDB.imageURLs.includes(correctGame.imageURL)) || !(itemDB.ratings.includes(correctGame.rating)) || !(itemDB.descriptions.includes(correctGame.description)) || !(itemDB.catalogCategories.includes(correctGame.category))){
                  res.render(path.join(__dirname + '/../views/item'), {theUser: req.session.theUser, qs: req.query.theItem, game: correctGame});
                } else{
                  res.send("There is some malicious information on the page. Please try again");
                }
              }
            }
          }//close update if statement


        else if(req.query.action == "accept" || req.query.action == "reject" ||
                req.query.action == "withdraw"){
          console.log("action = accept/reject/withdraw");

          if(req.query.theItem == '0001' ||
              req.query.theItem == '0002' || req.query.theItem == '0003' ||
              req.query.theItem == '0004' || req.query.theItem == '0005' ||
              req.query.theItem == '0006'){
                var theItem = req.query.theItem;
                //console.log("item" + theItem);
                //console.log("hello" + userProfile.addUserItem(theItem));
                //console.log("hello" + userProfile.addUserItem(req.query.theItem));


                var returned = userProfile.addUserItem(req.query.theItem);
                console.log(userItem.getUserItem(returned.item).status)



                if(userItem.getUserItem(returned.item).status == "pending"){
                  console.log(userProfile.addUserItem(req.query.theItem).status);

                  if(req.query.action == "reject" || req.query.action == "withdraw"){
                    req.query.action = "available";
                    correctProfile = userProfile.sethsItems;
                    console.log(req.query.action);
                    req.session.sessionProfile = correctProfile;
                    res.render(path.join(__dirname + '/../views/mySwaps'));
                  }
                  else if(req.query.action == "accept"){
                    req.query.action = "swapped";
                    correctProfile = userProfile.sethsItems;
                    console.log(correctProfile);
                    req.session.sessionProfile = correctProfile;
                    //console.log(req.session);
                    res.render(path.join(__dirname + '/../views/mySwaps'));
                  }
                }//closes user profile if
              } //closes item validation if
              else{
                res.render(path.join(__dirname + '/../views/mySwaps'));
              }

        }//closes accept/reject/withdraw else if

        else if(req.query.action == "offer"){
          console.log("action = offer")
          if(req.query.theItem == '0001' ||
              req.query.theItem == '0002' || req.query.theItem == '0003' ||
              req.query.theItem == '0004' || req.query.theItem == '0005' ||
              req.query.theItem == '0006'){
                //console.log(userProfile.sethsItems);
                var itemAmount = userProfile.sethsItems.userItems.length;
                var noItems = true;
                var availableGames = {};
                var itemsForSwap;
                //var allUserItems = userItem.allUserItems;
                //console.log(itemDB.getItem(req.query.theItem));
                //console.log(userItem.getUserItem(userProfile.sethsItems.userItems[0].itemName).status);

                for(var i = 0; i < itemAmount; i++){
                  if(userItem.getUserItem(userProfile.sethsItems.userItems[i].itemName).status == 'available'){
                    var k = 0;
                    console.log("first if")
                    noItems = false;
                    //console.log(userItem.getUserItem(userProfile.sethsItems.userItems[i].itemName));
                    availableGames[k] = userItem.getUserItem(userProfile.sethsItems.userItems[i].itemName);
                    k++;
                  }
                }
                if(noItems == false){
                  console.log("no items is false");
                  res.render(path.join(__dirname + '/../views/swap'),
                {gameItems: availableGames});
                }
                else{
                  var emptyMessage = "Sorry, you do not have any available items for swapping. Please add more items to start swapping again!";
                  var correctGame = await itemDB.getItem(req.query.theItem);
                  console.log(emptyMessage);

                  if(!(itemDB.gameTitles.includes(correctGame.itemName)) || !(itemDB.imageURLs.includes(correctGame.imageURL)) || !(itemDB.ratings.includes(correctGame.rating)) || !(itemDB.descriptions.includes(correctGame.description)) || !(itemDB.catalogCategories.includes(correctGame.category))){
                    res.render(path.join(__dirname + '/../views/item'),
                    {qs: req.query.theItem, game: correctGame,
                    message: emptyMessage});
              } else{
                res.send("There is some malicious information on the page. Please try again");
              }

            }//close outer else

              }//close theItem if statement
        }//close offer else if

        else if(req.query.action == "delete"){
          console.log("action = delete")
          if(req.query.theItem == '0001' ||
              req.query.theItem == '0002' || req.query.theItem == '0003' ||
              req.query.theItem == '0004' || req.query.theItem == '0005' ||
              req.query.theItem == '0006'){
                var usersItemList = userProfile.getUserItems();
                var usersItemListLength = usersItemList.length;

                for(var i = 0; i < usersItemListLength; i++){
                  if(req.query.theItem == usersItemList[i].itemCode){
                    //console.log('for loop fired');
                    //console.log(usersItemList[i].itemName);
                    //console.log(userItem.getUserItem(usersItemList[i].itemName));
                    var removeItem = userItem.getUserItem(usersItemList[i].itemName);
                    //console.log(userProfile.getUserItems());
                    userProfile.removeUserItem(removeItem);
                    req.session.sessionProfile = userProfile.sethsItems;
                    res.render(path.join(__dirname + '/../views/mySwaps'));
                  }
                }
              }
              else{
                res.render(path.join(__dirname + '/../views/mySwaps'));
              }
        }//close delete else if

        else if(req.query.action == "signout"){
          console.log("action = signout")
          req.session.destroy();
          res.render(__dirname + '/../views/categories');
        }//close signout else if

    }//if action isnt null
      else if (req.query.action == null && await userProfile.getUserItems(req.session.theUser) != null){
        console.log("action is null")

//same problem, have to be able to access the variables and pass them into
//the user profile function
          var correctProfile = await userProfile.getUserItems(req.session.theUser);
          var passedProfileInfo = {};
          var link = {};
        //  console.log(correctProfile[0].userItems);
          correctProfile = correctProfile[0].userItems;

          for (var i = 0;  i < correctProfile.length; i++){
            passedProfileInfo[i] = await itemDB.getItem(correctProfile[i]);
            //console.log(passedProfileInfo[i]);
            link[i] = "/item?itemCode=" + passedProfileInfo[i].itemCode;
            console.log("link " + [i] + " = "+ link[i]);
          }
          console.log(link[0]);

          for(var i = 0; i < passedProfileInfo.length; i++){
            if(!(itemDB.gameTitles.includes(passedProfileInfo.itemName)) || !(itemDB.catalogCategories.includes(passedProfileInfo.catalogCategory)) || !(itemDB.ratings.includes(passedProfileInfo.rating)) ){
              //console.log(unownedItems[i].itemName);
              res.send("There is some malicious information on the page. Please try again");
            }
          }

          res.render(__dirname + '/../views/myItems', {qs: req.query.userid,
          currentProfile: passedProfileInfo, link: link});
      }
      else if (req.query.action == null){
        console.log(userProfile.sethsItems)
        //console.log(userProfile.getUserItems);
        return res.send("This profile is empty");
      }*/
    }//user = 1


    ///////this doesnt fire when no user id is passed
    if(!req.session.theUser){
      //console.log('No user ID provided');
      theUser = await userDB.getUserProfile("0001");
      //console.log("theUser" + theUser);
      console.log("no userID passed");
      var link = {};
      var passedProfileInfo = {};

      //since there is no session variable that has the userID, this line
      //attaches the userID to the theUser variable on the session object

      //console.log(await userDB.getUserProfile("0001").userID);
      req.session.theUser = "0001";
      //console.log("session user " + req.session.theUser);
      res.locals.theUser = req.session.theUser;
      //console.log("local user " + res.locals.theUser)
      req.session.currentProfile = userProfile.sethsItems;
      //console.log(req.session.currentProfile)


      var correctProfile = userProfile.sethsItems;
      console.log(correctProfile.userItems);

      for (var i = 0;  i < correctProfile.userItems.length; i++){
        console.log(correctProfile.userItems[i])
        passedProfileInfo[i] = await itemDB.getItem(correctProfile.userItems[i]);
        link[i] = "/item?itemCode=" + passedProfileInfo[i].itemCode;
        //console.log("link " + [i] + " = "+ link[i]);
      }
      //console.log(passedProfileInfo);

      for(var i = 0; i < passedProfileInfo.length; i++){
        if(!(itemDB.gameTitles.includes(passedProfileInfo.itemName)) || !(itemDB.catalogCategories.includes(passedProfileInfo.catalogCategory)) || !(itemDB.ratings.includes(passedProfileInfo.rating)) ){
          //console.log(unownedItems[i].itemName);
          res.send("There is some malicious information on the page. Please try again");
        }
      }

      res.render(__dirname + '/../views/myItems', {qs: "0001",
      currentProfile: passedProfileInfo, link: link});
    }

  });//app.get

/*
*Started on this to perform the actual swapping. com back to it
******************************
*********************
********************************
********************************
**********************************
*/

  app.post('/myItems', urlencodedParser, async function(req, res){
    console.log(req.body + "post called");

    if(userProfile.getUserItems(req.session.theUser) != null){
      console.log("action not null");
      console.log(req.query.action);

      if(req.query.action == "update"){
        console.log("action = update");
        if(req.body.theItem == '0001' ||
            req.query.theItem == '0002' || req.query.theItem == '0003' ||
            req.query.theItem == '0004' || req.query.theItem == '0005' ||
            req.query.theItem == '0006'){
              //console.log(userProfile.addUserItem(req.query.theItem))
              if( await userProfile.addUserItem(req.query.theItem).status == "pending"){
                console.log("pending fired")
                req.query.swapItem = await userProfile.addUserItem(req.query.theItem);

                  if(req.query.swapItem.isSwapped == false){
                    res.render(path.join(__dirname + '/../views/mySwaps'), {theUser: req.session.theUser});
                    console.log(req.query.swapItem.isSwapped);
                  }
                  else if(req.query.swapItem.isSwapped == true){
                    req.query.userItem = userProfile.getUserItems(req.query.theItem);


                      res.render(path.join(__dirname + '/../views/item'),
                    {theUser: req.session.theUser, qs: req.query.userItem[0].itemCode, game: req.query.userItem[0]});
              }
              //req.add.userProfile.correlatingUserItem
              //console.log(userProfile.addUserItem(req.query.theItem))
            }
            else{
              var correctGame = await itemDB.getItem(req.query.theItem);
              //console.log(correctGame);
              if(!(itemDB.gameTitles.includes(correctGame.itemName)) || !(itemDB.imageURLs.includes(correctGame.imageURL)) || !(itemDB.ratings.includes(correctGame.rating)) || !(itemDB.descriptions.includes(correctGame.description)) || !(itemDB.catalogCategories.includes(correctGame.category))){
                res.render(path.join(__dirname + '/../views/item'), {theUser: req.session.theUser, qs: req.query.theItem, game: correctGame});
              } else{
                res.send("There is some malicious information on the page. Please try again");
              }
            }
          }
        }//close update if statement


      else if(req.query.action == "accept" || req.query.action == "reject" ||
              req.query.action == "withdraw"){
        console.log("action = accept/reject/withdraw");

        if(req.query.theItem == '0001' ||
            req.query.theItem == '0002' || req.query.theItem == '0003' ||
            req.query.theItem == '0004' || req.query.theItem == '0005' ||
            req.query.theItem == '0006'){
              var theItem = req.query.theItem;
              //console.log("item" + theItem);
              //console.log("hello" + userProfile.addUserItem(theItem));
              //console.log("hello" + userProfile.addUserItem(req.query.theItem));


              var returned = userProfile.addUserItem(req.query.theItem);
              console.log(userItem.getUserItem(returned.item).status)



              if(userItem.getUserItem(returned.item).status == "pending"){
                console.log(userProfile.addUserItem(req.query.theItem).status);

                if(req.query.action == "reject" || req.query.action == "withdraw"){
                  req.query.action = "available";
                  correctProfile = userProfile.sethsItems;
                  console.log(req.query.action);
                  req.session.sessionProfile = correctProfile;
                  res.render(path.join(__dirname + '/../views/mySwaps'));
                }
                else if(req.query.action == "accept"){
                  req.query.action = "swapped";
                  correctProfile = userProfile.sethsItems;
                  console.log(correctProfile);
                  req.session.sessionProfile = correctProfile;
                  //console.log(req.session);
                  res.render(path.join(__dirname + '/../views/mySwaps'));
                }
              }//closes user profile if
            } //closes item validation if
            else{
              res.render(path.join(__dirname + '/../views/mySwaps'));
            }

      }//closes accept/reject/withdraw else if

      else if(req.query.action == "offer"){
        console.log("action = offer")
        if(req.query.theItem == '0001' ||
            req.query.theItem == '0002' || req.query.theItem == '0003' ||
            req.query.theItem == '0004' || req.query.theItem == '0005' ||
            req.query.theItem == '0006'){
              //console.log(userProfile.sethsItems);
              var itemAmount = userProfile.sethsItems.userItems.length;
              var noItems = true;
              var availableGames = {};
              var itemsForSwap;
              //var allUserItems = userItem.allUserItems;
              //console.log(itemDB.getItem(req.query.theItem));
              //console.log(userItem.getUserItem(userProfile.sethsItems.userItems[0].itemName).status);

              for(var i = 0; i < itemAmount; i++){
                if(userItem.getUserItem(userProfile.sethsItems.userItems[i].itemName).status == 'available'){
                  var k = 0;
                  console.log("first if")
                  noItems = false;
                  //console.log(userItem.getUserItem(userProfile.sethsItems.userItems[i].itemName));
                  availableGames[k] = userItem.getUserItem(userProfile.sethsItems.userItems[i].itemName);
                  k++;
                }
              }
              if(noItems == false){
                console.log("no items is false");
                res.render(path.join(__dirname + '/../views/swap'),
              {gameItems: availableGames});
              }
              else{
                var emptyMessage = "Sorry, you do not have any available items for swapping. Please add more items to start swapping again!";
                var correctGame = await itemDB.getItem(req.query.theItem);
                console.log(emptyMessage);

                if(!(itemDB.gameTitles.includes(correctGame.itemName)) || !(itemDB.imageURLs.includes(correctGame.imageURL)) || !(itemDB.ratings.includes(correctGame.rating)) || !(itemDB.descriptions.includes(correctGame.description)) || !(itemDB.catalogCategories.includes(correctGame.category))){
                  res.render(path.join(__dirname + '/../views/item'),
                  {qs: req.query.theItem, game: correctGame,
                  message: emptyMessage});
            } else{
              res.send("There is some malicious information on the page. Please try again");
            }

          }//close outer else

            }//close theItem if statement
      }//close offer else if

      else if(req.body.action == "delete"){
        console.log("action = delete")

              var usersItemList = userProfile.getUserItems();
              var usersItemListLength = usersItemList.length;

              for(var i = 0; i < usersItemListLength; i++){
                if(req.query.theItem == usersItemList[i].itemCode){
                  //console.log('for loop fired');
                  //console.log(usersItemList[i].itemName);
                  //console.log(userItem.getUserItem(usersItemList[i].itemName));
                  var removeItem = userItem.getUserItem(usersItemList[i].itemName);
                  //console.log(userProfile.getUserItems());
                  userProfile.removeUserItem(removeItem);
                  req.session.sessionProfile = userProfile.sethsItems;
                  res.render(path.join(__dirname + '/../views/mySwaps'));
                }
              }

      }//close delete else if

      else if(req.query.action == "signout"){
        console.log("action = signout")
        req.session.destroy();
        res.render(__dirname + '/../views/categories');
      }//close signout else if

  }//if action isnt null
    else if (req.query.action == null && await userProfile.getUserItems(req.session.theUser) != null){
      console.log("action is null")

//same problem, have to be able to access the variables and pass them into
//the user profile function
        var correctProfile = await userProfile.getUserItems(req.session.theUser);
        var passedProfileInfo = {};
        var link = {};
      //  console.log(correctProfile[0].userItems);
        correctProfile = correctProfile[0].userItems;

        for (var i = 0;  i < correctProfile.length; i++){
          passedProfileInfo[i] = await itemDB.getItem(correctProfile[i]);
          //console.log(passedProfileInfo[i]);
          link[i] = "/item?itemCode=" + passedProfileInfo[i].itemCode;
          console.log("link " + [i] + " = "+ link[i]);
        }
        console.log(link[0]);

        for(var i = 0; i < passedProfileInfo.length; i++){
          if(!(itemDB.gameTitles.includes(passedProfileInfo.itemName)) || !(itemDB.catalogCategories.includes(passedProfileInfo.catalogCategory)) || !(itemDB.ratings.includes(passedProfileInfo.rating)) ){
            //console.log(unownedItems[i].itemName);
            res.send("There is some malicious information on the page. Please try again");
          }
        }

        res.render(__dirname + '/../views/myItems', {theUser: req.query.userid,
        currentProfile: passedProfileInfo, link: link});
    }

      res.render(__dirname + '/../views/item', {game: req.body});
  });


    //res.render(__dirname + '/../views/myItems', {qs: req.query.userid});

  }//closes module exports
