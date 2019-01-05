var http = require('http');
var fs = require('fs');
var express = require('express');
var app = express();
var path = require('path');
var itemDB = require('../models/itemDB');
var bodyParser = require('body-parser');
var session = require('express-session');
var userItem = require('../models/userItem')
var userProfile = require('../models/userProfile');
var userDB = require('../models/userDB');
var offerDB = require('../models/offerDB');
var feedbackDB = require('../models/feedbackDB');

app.use(express.json());
const {check, validationResult } = require('express-validator/check');

//mongoose stuff
var mongoose = require('mongoose');
mongoose.connect('mongodb://test:test123@ds155263.mlab.com:55263/4166assignment')

var urlencodedParser = bodyParser.urlencoded({extended: false});
//var profileController = require('./profileController')(app);
var profileControllerr = require('./profileControllerr')(app);
var catalogController = require('./catalogController')(app);

app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');
app.use('/resources', express.static('../resources'));
app.use('/Pictures', express.static('../Pictures'));

app.use(session({secret: "Shh, it's a secret", resave: true,
saveUninitialized: true, cookie: {maxAge: 60000}}));
var sesh;
var theUser;
module.exports.sesh = sesh;
module.exports.theUser = theUser;

app.get('/', async function(req, res){
  sesh = req.session;
  var test = await userDB.hashPassword("sef");
  res.render(__dirname + '/../views/index');
});

app.get('/index', function(req, res){
  res.render(__dirname + '/../views/index', {theUser: req.session.theUser});
});

app.get('/swap', function(req, res){
  if(!req.session.theUser){
    res.render(__dirname + '/../views/login');
  }
  else if(req.session.theUser){
    console.log(req.session)
    res.render(__dirname + '/../views/swap', {games: availableGames});
  }
});

app.get('/contact', function(req, res){
  res.render(__dirname + '/../views/contact', {theUser: req.session.theUser});
});

app.get('/about', function(req, res){
  res.render(__dirname + '/../views/about', {theUser: req.session.theUser});
});


//Function for running the /item page. the item page dynamically displays the specific
//item that needs to be shows and renders it on the item.ejs tempplate. this
app.get('/item', async function(req, res){

  if(res.locals.theUser){
    res.session.theUser = res.locals.theUser;
    var isAvailable = await userItem.getUserItem(req.query.itemCode);
    if(isAvailable.status == "available")
      isAvailable = true;
    else {
      isAvailable = false;
    }
  }

  //output sanitization. cross checks with a hard coded list of items to ensure
  //output is correct
  //doesn't display page if output is seen to be wrong
  if(await itemDB.getItem(req.query.itemCode)){
    await itemDB.getItem(req.query.itemCode).then(docs => {
      console.log(docs);
      if(!(itemDB.gameTitles.includes(docs.itemName)) || !(itemDB.imageURLs.includes(docs.imageURL)) || !(itemDB.ratings.includes(docs.rating)) || !(itemDB.descriptions.includes(docs.description)) || !(itemDB.catalogCategories.includes(docs.category))){
        res.render(__dirname + '/../views/item', { game: docs, theUser: req.session.theUser, isAvailable: isAvailable});
      }
      else{
          res.send("There is some malicious information on the page. Please try again");
      }

      }).catch(err => {
        console.error(err);
        });
  }
  //if theres no item passed in or if the item code isn't found, this will make
  //the page render the categories page instead
    else{
        res.render(__dirname + '/../views/categories')
        console.log("else");
        console.log(req.query);
    }
});


app.get('/mySwaps', async function(req, res){

  var userStartedSwaps = new Array();
  var otherUserStartedSwaps = new Array();
  var youHave = new Array();
  var youWant = new Array();
  var theyWant = new Array();
  var theyHave = new Array();
  var youStatuses = new Array();
  var theyStatuses = new Array();
  var youHaveLinks = new Array();
  var youWantLinks = new Array();
  var theyWantLinks = new Array();
  var theyHaveLinks = new Array();
  var youOfferIDs = new Array();
  var theyOfferIDs = new Array();

  sesh = req.session;

  if(req.session.theUser){

    userStartedSwaps = await offerDB.getUserOwnedSwaps(req.session.theUser);
    for(var i = 0; i < userStartedSwaps.length; i++){
      if(userStartedSwaps[i].isSwapped == true){
        youHave[i] = await itemDB.getItem(userStartedSwaps[i].itemCodeOwn);
        youWant[i] = await itemDB.getItem(userStartedSwaps[i].itemCodeWant);
        youStatuses[i] = userStartedSwaps[i].isSwapped;
        youHaveLinks[i] = "/item?itemCode=" + youHave[i].itemCode;
        youWantLinks[i] = "/item?itemCode=" + youWant[i].itemCode;
        youOfferIDs[i] = userStartedSwaps[i].offerID;
      }
    }

    otherUserStartedSwaps = await offerDB.getUnownedSwaps(req.session.theUser);
    for(var i = 0; i < otherUserStartedSwaps.length; i++){
      if(otherUserStartedSwaps[i].isSwapped == false || otherUserStartedSwaps[i].isSwapped == "false"){
        theyHave[i] = await itemDB.getItem(otherUserStartedSwaps[i].itemCodeWant);
        theyWant[i] = await itemDB.getItem(otherUserStartedSwaps[i].itemCodeOwn);
        theyStatuses[i] = otherUserStartedSwaps[i].isSwapped;
        theyWantLinks[i] = "/item?itemCode=" + theyWant[i].itemCode;
        theyHaveLinks[i] = "/item?itemCode=" + theyHave[i].itemCode;
        theyOfferIDs[i] = otherUserStartedSwaps[i].offerID;
      }
    }

    res.render(__dirname + '/../views/mySwaps',
    {theUser: req.session.theUser, youHave: youHave, youWant: youWant,
    youStatuses: youStatuses, theyHave: theyHave, theyWant: theyWant,
    theyStatuses: theyStatuses, youHaveLinks: youHaveLinks, youWantLinks: youWantLinks,
    theyWantLinks: theyWantLinks, theyHaveLinks:theyHaveLinks,
    youOfferIDs : youOfferIDs, theyOfferIDs: theyOfferIDs});
  }
  else{
    res.redirect("/login");
  }






  //console.log(usersItems.userItems[0].itemName);
});

app.post('/mySwaps', urlencodedParser, async function(req, res){
  var link = new Array();

  if(req.body){
    console.log(req.body);

    if(req.body.update){
      var update = req.body.update;
      var item = await itemDB.getItem(update);

      if(item != null){
        var retrievedUserItem = await userItem.getUserItem(item);

        if(retrievedUserItem.status == "pending"){
          res.render(path.join(__dirname + '/../views/mySwaps'),
          { theUser: req.session.theUser, swapItem: retrievedUserItem})
        }
        if(retrievedUserItem.status == "available"){
          res.render(path.join(__dirname + '/../views/item'),
          { theUser: req.session.theUser, game: item });
        }

      }
      else{
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
      }
    }//update if



    if(req.body.accept || req.body.reject || req.body.withdraw){

      if(req.body.accept){
        var offer = await offerDB.getOffer(req.body.accept);
        userDB.swapItems(offer);
      }//accept if close
      if(req.body.reject){
        await offerDB.removeOffer(req.body.reject);
        res.redirect(req.originalUrl);
      }
      if(req.body.withdraw){
        await offerDB.removeOffer(req.body.withdraw);
        res.redirect(req.originalUrl);
      }
    }//if with the three

    if(req.body.delete){
      var item = await itemDB.getItem(req.body.delete);

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

    if(req.action.offer){
      var item = await itemDB.getItem(req.body.offer);

      if(item != null){
        var userItems = await userDB.getUserProfile(req.action.offer);

        if(userItems != null){

        }
        else{
          var errorMessage = 'Sorry, you do not have any available items for swapping. Please add more items to start swapping again!';
          res.render(path.join(__dirname + '/../views/item'), {
            theUser: req.session.theUser, game: item, message: errorMessage });
        }
      }


    }//offer if close

    if(req.action.signout){
      req.session.delete();
      res.render(path.join(__dirname + '/../views/index'));
    }




  }//closes if(req.body)
  else if(!req.body){
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

  }

});


//function to render the login page and handle its info
app.get('/login', async function(req, res, next){
  var link = new Array();
  var correctProfile;
  var profileItems = new Array();

//if the users already logged in, this will lead them to the myItems page
  if(req.session.theUser){

    correctProfile = await userProfile.getUserItems(req.session.theUser);
    correctProfile = correctProfile[0].userItems;
    console.log(correctProfile);

    //gets users items and makes a link for each item so the items can be clickable
    for (var i = 0; i < correctProfile.length; i++){
      profileItems[i] = await itemDB.getItem(correctProfile[i]);
      link[i] = "/item?itemCode=" + profileItems[i].itemCode;
      //console.log("link " + [i] + " = " + link[i]);
    }

    //output sanitization
    for(var i = 0; i < profileItems.length; i++){
      if(!(itemDB.gameTitles.includes(profileItems.itemName)) || !(itemDB.catalogCategories.includes(profileItems.catalogCategory)) || !(itemDB.ratings.includes(profileItems.rating)) ){
        //console.log(unownedItems[i].itemName);
        res.send("There is some malicious information on the page. Please try again");
      }
    }


    res.render(__dirname + '/../views/myItems',
    {theUser: req.session.theUser, currentProfile: profileItems, link: link});

  }//close if statement

  //if they aren't logged in this will take them to log in
  else if(!res.locals.theUser){
    res.render(__dirname + '/../views/login');
  }
});//close login app.get

//where the login credentials are handled.
//they go through input sanitization as well
app.post('/login', urlencodedParser, [
  check('email').isEmail()
], async function(req, res) {
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    return res.status(422).json({errors: errors.array()});
  }



  var link = {};
  var currentProfile;
  var profileItems = {};
  var loggedIn = false;
  module.exports.loggedIn = loggedIn;


  currentProfile = await userProfile.login(req.body.email, req.body.password);
  var unownedItems = await userProfile.unownedItems(currentProfile.userItems);

  //if the profile is found this will run the logic to  display the myItems page
  if(currentProfile){
    req.session.theUser = currentProfile.userID;
    res.locals.theUser = req.session.theUser;
    res.render(path.join(__dirname + '/../views/index'), {theUser: req.session.theUser});
  }
  else{
    var errorMessage = "This combination of email and password was not found in our dataase. Please try again or register.";
    res.render(path.join(__dirname + '/../views/login'), {errorMessage: errorMessage});
  }
});

//handler for displaying the sign up page
app.get('/signUp', function(req, res){
  res.render(__dirname + '/../views/signUp', {theUser: req.session.theUser});
});

//handles information passed in from the sign up Page
//input sanitization is done here
app.post('/signUp', urlencodedParser, [
  check('firstName').isAlpha(),
  check('lastName').isAlpha(),
  check('email').isEmail(),
  check('username').matches(/^[a-zA-Z0-9_]/, "i"),
  check('password').matches(/^[a-zA-Z0-9_]/, "i")
], async function(req,res){
    const errors = validationResult(req);
    if(!errors.isEmpty()){
      return res.status(422).json({errors: errors.array()});
    }


    //makes a call to the function that'll add this new user to the database
    var currentProfileID = await userDB.addUser(req.body.firstName, req.body.lastName, req.body.email,
    req.body.addy1, req.body.addy2, req.body.city, req.body.state, req.body.zip,
    req.body.country, req.body.username, req.body.password);


    req.session.theUser = currentProfileID;
    res.locals.theUser = req.session.theUser;

    res.render(path.join(__dirname + '/../views/index'));
});

//handler for displaying the item feedback page
app.get('/itemFeedback', async function(req, res){
  if(!req.body.itemCode){
    res.send("There has been an error. Please return to the homepage.")
  }
  else{
    var item = await itemDB.getItem(req.body.itemCode);
    res.render(path.join(__dirname + '/../views/itemFeedback'), {game: item, theUser: req.session.theUser});
  }
});

//handles the information passed in from the itemFeedback page
app.post('/itemFeedback', urlencodedParser, async function(req, res){
  var item = await itemDB.getItem(req.body.itemCode);
  var message = "Your feedback is appreciated!";

  //if a user leaves feedback it'll display a message for thanks
  //res.render(path.join(__dirname + '/../views/itemFeedback'), {game: item, message: message, theUser: req.session.theUser});
  res.redirect(req.originalUrl);
});

//handles informtion passed in from the item ppage
app.post('/item', urlencodedParser, async function(req, res){
  console.log(req.body);
  if(req.body.feedback){
    var item = await itemDB.getItem(req.body.feedback);
    var feedback = await feedbackDB.getItemFeedback(req.body.feedback);
    var rating = new Array();
    var users = new Array();
    var link = new Array();

    //gets all the item feedback to display on itemsfeedback page
    for(var i = 0; i < feedback.length; i++){
      users[i] = await userDB.getUserProfile(feedback[i].userID);
      rating[i] = feedback[i].rating;

      if(rating[i] == 0 || rating[i] == "0"){
        rating[i] = "☆☆☆☆☆";
      }
      if(rating[i] == 1 || rating[i] == "1"){
        rating[i] = "★☆☆☆☆";
      }
      if(rating[i] == 2 || rating[i] == "2"){
        rating[i] = "★★☆☆☆";
      }
      if(rating[i] == 3 || rating[i] == "3"){
        rating[i] = "★★★☆☆";
      }
      if(rating[i] == 4 || rating[i] == "4"){
        rating[i] = "★★★★☆";
      }
      if(rating[i] == 5 || rating[i] == "5"){
        rating[i] = "★★★★★";
      }
    }

    res.render(path.join(__dirname + '/../views/itemFeedback'), {game: item, theUser: req.session.theUser, users: users, feedback: rating});
  }
  if(req.body.swap){
    var item = await itemDB.getItem(req.body.swap);
    var profile = await userDB.getUserProfile(req.session.theUser);
    var userItems = new Array();

    for(var i = 0; i < profile.userItems.length; i++){
        userItems[i] = profile.userItems[i];
        userItems[i] = await itemDB.getItem(userItems[i]);
    }


    res.render(path.join(__dirname + '/../views/swap'), {theUser: req.session.theUser, game: item, userItems: userItems})
  }
  //adding a rating to the database
  if(req.body.itemCode && !req.body.game){
    var message = "Your feedback is appreciated!";

    if(req.session.theUser){
      await feedbackDB.addItemFeedback(req.body.itemCode, req.session.theUser, req.body.rating);
    }
    else{
      await feedbackDB.addItemFeedback(req.body.itemCode, "", req.body.rating);
    }

    res.render(path.join(__dirname + '/../views/itemFeedback'), {message: message, theUser: req.session.theUser});
  }
  if(req.body.userProfile){
    res.render(path.join(__dirname + '/../views/userFeedback'), {theUser: req.session.theUser})
  }
  if(req.body.game && req.body.itemCode){
    var userID2 = await userDB.findWhoOwns(req.body.game);
    var message = "Your swap transaction has begun";
    var game = await itemDB.getItem(req.body.itemCode);

    offerDB.addOffer(req.session.theUser, userID2, req.body.game, req.body.itemCode, false);
    res.render(path.join(__dirname + '/../views/item'), { message: message, theUser: req.session.theUser, game: game})
  }
});


app.get('/userFeedback', urlencodedParser, async function(req, res){
  var correctProfile;
  var feedback;
  var userItems = new Array();
  var link = new Array();
  var username = new Array();
  var rating = new Array();

  //gets the profile to be displayed
  if(req.query.userID){
    correctProfile = await userDB.getUserProfile(req.query.userID);
    feedback = await feedbackDB.getUserFeedback(correctProfile.userID);
  }
  else{
    res.render(path.join(__dirname + '/../views/PLACEHOLDER'), {theUser: req.sesion.theUser});
  }

  for (var i = 0; i < correctProfile.userItems.length; i++){
    userItems[i] = await itemDB.getItem(correctProfile.userItems[i]);
    link[i] = "/item?itemCode=" + userItems[i].itemCode;
  }

  for(var i = 0; i < feedback.length; i++){
    username[i] = await userDB.getUserProfile(feedback[i].userID1);
    rating[i] = feedback[i].rating;

    if(rating[i] == 0 || rating[i] == "0"){
      rating[i] = "☆☆☆☆☆";
    }
    if(rating[i] == 1 || rating[i] == "1"){
      rating[i] = "★☆☆☆☆";
    }
    if(rating[i] == 2 || rating[i] == "2"){
      rating[i] = "★★☆☆☆";
    }
    if(rating[i] == 3 || rating[i] == "3"){
      rating[i] = "★★★☆☆";
    }
    if(rating[i] == 4 || rating[i] == "4"){
      rating[i] = "★★★★☆";
    }
    if(rating[i] == 5 || rating[i] == "5"){
      rating[i] = "★★★★★";
    }
  }

  res.render(path.join(__dirname + '/../views/userFeedback'), {profile: correctProfile, userItems: userItems, link: link, username: username, rating: rating, theUser: req.session.theUser});
});

//handler for information passed from the user feedback page
app.post('/userFeedback', urlencodedParser, async function(req, res){

  if(!req.session.theUser){
    var message = "You must be logged in to rate a user";
    res.render(path.join(__dirname + '/../views/login'), {errorMessage: message});
  }
  else{
    var message = "Your feedback is appreciated!";

    var correctProfile;
    if(req.query.userID){
      correctProfile = await userDB.getUserProfile(req.query.userID);
      await feedbackDB.addUserFeedback(req.session.theUser, req.query.userID, req.body.rating);
    }
    else{
      res.render(path.join(__dirname + "/../views/PLACEHOLDER"));
    }

    var userItems = new Array();
    var link = new Array();
    var feedback = await feedbackDB.getUserFeedback(correctProfile.userID);
    var username = new Array();
    var rating = new Array();

    for (var i = 0; i < correctProfile.userItems.length; i++){
      userItems[i] = await itemDB.getItem(correctProfile.userItems[i]);
      link[i] = "/item?itemCode=" + userItems[i].itemCode;
    }

    for(var i = 0; i < feedback.length; i++){
      username[i] = await userDB.getUserProfile(feedback[i].userID1);
      console.log(username[i]);
      rating[i] = feedback[i].rating;

      if(rating[i] == 0 || rating[i] == "0"){
        rating[i] = "☆☆☆☆☆";
      }
      if(rating[i] == 1 || rating[i] == "1"){
        rating[i] = "★☆☆☆☆";
      }
      if(rating[i] == 2 || rating[i] == "2"){
        rating[i] = "★★☆☆☆";
      }
      if(rating[i] == 3 || rating[i] == "3"){
        rating[i] = "★★★☆☆";
      }
      if(rating[i] == 4 || rating[i] == "4"){
        rating[i] = "★★★★☆";
      }
      if(rating[i] == 5 || rating[i] == "5"){
        rating[i] = "★★★★★";
      }
    }

    res.render(path.join(__dirname + '/../views/userFeedback'), {message: message, profile: correctProfile, userItems: userItems, link: link, username: username, rating: rating, theUser: req.session.theUser});
  }
});

//function for displaing the all users page
app.get('/allUsers', async function(req, res){
  var allUsers = await userDB.getUsers();
  var link = new Array();

  for (var i = 0; i < allUsers.length; i++){
    link[i] = '/userFeedback?userID=' + allUsers[i].userID;
  }

  res.render(path.join(__dirname + "/../views/allUsers"), {users: allUsers, theUser: req.session.theUser, link: link});
});

//function for handling information passed from the allUsers page
app.post('/allUsers', urlencodedParser, async function(req, res){
  console.log(req.body.userID);
});

app.get('/allGames', async function(req, res){
  var allGames = await itemDB.getItems();
  var link = new Array();

  for(var i = 0; i < allGames.length; i++){
    link[i] = "/item?itemCode=" + allGames[i].itemCode;
  }
  res.render(path.join(__dirname + "/../views/allGames"), {theUser: theUser, games: allGames, link: link});
});

//this is in case I missed a function i labled with a placeholder so th app
//doesnt just crash if i left one accidentally or didn't know where a page needed to be lead
app.get('/PLACEHOLDER', function(req, res){
  res.send("I messed up and didn't fix a link or something. Oopsie");
});

app.get('*', function(req, res){
  res.send('Page not found');
});


app.listen(8080);
