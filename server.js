const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const port = 3000;

//access static content
app.use(express.static('public'));
//set pug template
app.set('view engine', 'pug');


//connect to mongodb with mongoose 
const mongoose = require('mongoose');
//get schemas
const userCollection = require('./uSchema');
const connectionString = "mongodb+srv://comit:comit@cluster0.ulggk.mongodb.net/cma?retryWrites=true&w=majority";
mongoose.connect(connectionString, { useNewUrlParser: true, useUnifiedTopology: true });

mongoose.connection.on("error", function (error) {
    console.log(error);
});

mongoose.connection.on("open", function () {
    console.log("Connected to MongoDB database.");
});



/*additional middleware
    session tracking for different users
*/



//------------------------------------------------------
////////////ERROR HANDLING/////////
//accessing anything w/o login/signup

/*function handleError(err){

}|*/

////////////GET//////////////////
//basic home page
app.get('/', (req, res) => {
    res.render('home');
});

//create account page
app.get('/create_account', (req, res) => {
    res.render('create_account')
});

app.get('/create_account/:id', (req, res) => {
    if (req.params.id == 1) {
        res.render('create_account',
            {
                warning: "An account with this email already exists"
            }
        );
    } else {

    }
});
//dashboard
app.get('/user/dashboard', (req, res) => {
    //check user logged in by checking that they came in from any url except home?
    ////
    ///

    //get date
    let date = new Date;
    date = date.toDateString();
    //Get user data from th database
    res.render('user/dashboard',
        {
            date: date,
            page: 'Dashboard'
        }
    );
});

//user account page
app.get('/user/account', (req, res) => {
    //check user logged in
    ////
    ///

    //get date
    let date = new Date;
    date = date.toDateString();

    //Get user data from th database
    res.render('user/account',
        {
            date: date,
            page: 'User Account'
        }
    );
});

//Register Patients
app.get('/user/register', (req, res) => {
    //check user logged in
    ////
    ///

    //get date
    let date = new Date;
    date = date.toDateString();

    //Get user data from th database
    res.render('user/register',
        {
            date: date,
            page: 'Register Patients'
        }
    );
});

//patient directory
app.get('/user/patient_directory', (req, res) => {
    //check user logged in
    ////
    ///

    //get date
    let date = new Date;
    date = date.toDateString();

    //Get user data from th database
    res.render('user/patient_directory',
        {
            date: date,
            page: 'Patient Directory'
        }
    );
});

//edit profiles
app.get('/user/edit_profile', (req, res) => {
    //check user logged in
    ////
    ///

    //get date
    let date = new Date;
    date = date.toDateString();

    //Get user data from th database
    res.render('user/edit_profile',
        {
            date: date,
            page: 'Edit Profiles'
        }
    );
});


/////////POST//////////////////
//after logging in and creating an account
app.post('/user/dashboard', urlencodedParser, (req, res) => {
    //get req body for form content
    const user = req.body;

    //get date
    let date = new Date;
    date = date.toDateString();

    //check if post request is coming from login or create_account page
    if (req.header('Referer') == 'http://localhost:3000/create_account') {
        //create account
        //exists() returns a pending promise which is fulfilled to either return true or false
        userCollection.exists({ email: user.email })
            .then(function (exists) {
                //user email in document
                if (exists) {
                    console.log('the email exists:', exists);
                    res.redirect('/create_account');
                    //user email not in document
                } else {
                    //create a document in userCollection
                    userCollection.create(
                        {
                            fname: user.fname,
                            lname: user.lname,
                            email: user.email,
                            pass: user.pass
                        });
                    //load dashboard
                    res.render('user/dashboard',
                        {
                            fname: user.fname,
                            lname: user.lname,
                            date: date,
                            page: 'Dashboard'
                        }
                    );
                }
            });
    } else {
        userCollection.exists({ email: user.email, pass: user.pass })
            .then(function (exists) {
                //user email + pass in document
                if (exists) {
                    console.log('the email + pass combo exists:', exists);
                    //load dashboard w user info
                    let fname = 'New'
                    let lname = 'User'
                    //query fname and last naem from collection w/ enteed email
                    userCollection.find({ email: user.email }, 'fname lname', function (err, result) {
                        if(result[0].fname) fname = result[0].fname
                        if(result[0].lname) lname = result[0].lname
                        res.render('user/dashboard',
                            {
                                fname: fname,
                                lname: lname,
                                date: date,
                                page: 'Dashboard'
                            }
                        );
                    });
                    //user email + pass combo not in document
                } else {
                    res.redirect('/');
                }
            });
    }
});

//Editing user account
app.post('/user/account', urlencodedParser, (req, res) => {
    //check user exists in database, then
    ////
    ////

    const user = req.body;

    //get date
    let date = new Date;
    date = date.toDateString();

    //some of these will be subtituted with SQL queries based on the current session
    res.render('user/account',
        {
            email: user.email,
            password: user.password,
            first_name: user.fName,
            last_name: user.lName,
            date: date,
            page: 'User Account'
        }

    );
});

//Registering a patient
app.post('/user/register', urlencodedParser, (req, res) => {
    //check user exists in database, then
    ////
    ////

    const user = req.body;

    //get date
    let date = new Date;
    date = date.toDateString();

    //some of these will be subtituted with SQL queries based on the current session
    res.render('user/register',
        {
            email: user.email,
            password: user.password,
            first_name: user.fName,
            last_name: user.lName,
            date: date,
            page: 'Register New Patient'
        }
    );
});

//Searching Directory
app.post('/user/patient_directory', urlencodedParser, (req, res) => {
    //check user exists in database, then
    ////
    ////

    const user = req.body;

    //get date
    let date = new Date;
    date = date.toDateString();

    //some of these will be subtituted with SQL queries based on the current session
    res.render('user/patient_directory',
        {
            email: user.email,
            password: user.password,
            first_name: user.fName,
            last_name: user.lName,
            date: date,
            page: 'Patient Directory'
        }
    );
});

//Searching to delete
app.post('/user/edit_profile', urlencodedParser, (req, res) => {
    //check user exists in database, then
    ////
    ////

    const user = req.body;

    //get date
    let date = new Date;
    date = date.toDateString();

    //some of these will be subtituted with SQL queries based on the current session
    res.render('user/edit_profile',
        {
            email: user.email,
            password: user.password,
            first_name: user.fName,
            last_name: user.lName,
            date: date,
            page: 'Register New Patient'
        }
    );
});

/*
//make sure certain pages (ie.games or game session loader or game end page etc. are not accessible 
without first having posted something), should throw an error and redirect to
the appropriate static error page

//also anything requiring a login should not be accessible without logging in first
*/
//^^^^^^^^ for all this that means you can only post into those pages
//create gets that throws an error for the games and an unuthorized warning for the other pages

/*
WILL REFRESH THE PAGE LIKE AN AUTOMTAIC UPDATE
app.get('/delete/:id', (req, res) => {
    const productIndex = products.findIndex(p => p.id == req.params.id)
    products.splice(productIndex, 1);
    res.redirect('/'); ///////AJAX LIKE!!
})*/

app.listen(port, () => {
    console.log(`listening on port ${port}`);
});