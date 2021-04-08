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
const patientCollection = require('./pSchema');
const testCollection = require('./tSchema');
const connectionString = "mongodb+srv://comit:comit@cluster0.ulggk.mongodb.net/cma?retryWrites=true&w=majority";
mongoose.connect(connectionString, { useNewUrlParser: true, useUnifiedTopology: true });

mongoose.connection.on("error", function (error) {
    console.log(error);
});

mongoose.connection.on("open", function () {
    console.log("Connected to MongoDB database.");
});

//sessions middleware
const session = require('express-session');
app.use(session({ secret: 'super secret', resave: false, saveUninitialized: true }));


////////////GET//////////////////
//basic home page
app.get('/', (req, res) => {
    res.render('home');
});

//create account page
app.get('/create_account', (req, res) => {
    res.render('create_account')
});

//end session buffer when logging out
app.get('/end_session', (req, res) => {
    req.session.user = null;
    if (req.session.user) {
        console.log('logged in');
    } else {
        console.log('not authorized');
    }
    res.redirect('/');
});

//error page for unauthorized access
app.get('/error', (req, res) => {
    res.render('error');
});
////////////////AUTHORIZED ACCESS REQUIRED//////////

//dashboard
app.get('/user/dashboard', (req, res) => {
    //logged in check
    if (req.session.user) {
        let uData = req.session.user;
        //load nav w user info        
        let date = new Date;
        date = date.toDateString();
        let fname = 'New'
        let lname = 'User'
        //query fname and last name from collection w/ email
        if (uData[0].fname) fname = uData[0].fname
        if (uData[0].lname) lname = uData[0].lname

        //dasboard data
        testCollection.find({ uID: uData[0]._id }, function (err, result) {
            if (!err) {
                console.log(JSON.stringify(result, null, 2))
                res.render('user/dashboard',
                    {
                        fname: fname,
                        lname: lname,
                        date: date,
                        page: 'Dashboard',
                        tests: JSON.stringify(result, null, 2)
                    }
                );
            } else {
                console.log('test', err)
            }
        });
    } else {
        res.redirect('/error');
    }
});

//user account page
app.get('/user/account', (req, res) => {
    //logged in check
    if (req.session.user) {
        //load nav w user info        
        let date = new Date;
        date = date.toDateString();
        //placeholders
        let fname = 'New'
        let lname = 'User'
        //get email from session
        let uData = req.session.user
        //get user info from db
        userCollection.find({ email: uData[0].email }, function (err, result) {
            console.log(result)
            //update names if available
            if (result[0].fname) fname = result[0].fname
            if (result[0].lname) lname = result[0].lname
            res.render('user/account',
                {
                    fname: fname,
                    lname: lname,
                    date: date,
                    page: 'User Account',
                    data: result
                }
            );
        });

    } else {
        res.redirect('/error');
    }
    console.log('rendered');
});

//Register Patients
app.get('/user/register', (req, res) => {
    //logged in check
    if (req.session.user) {
        let uData = req.session.user;
        //load nav w user info        
        let date = new Date;
        date = date.toDateString();
        let fname = 'New'
        let lname = 'User'
        //query fname and last name from session
        if (uData[0].fname) fname = uData[0].fname
        if (uData[0].lname) lname = uData[0].lname
        res.render('user/register',
            {
                fname: fname,
                lname: lname,
                date: date,
                page: 'Register Patient'
            }
        );
    } else {
        res.redirect('/error');
    }
});

//patient directory
app.get('/user/patient_directory', (req, res) => {
    //logged in check
    if (req.session.user) {
        let uData = req.session.user;
        //load nav w user info        
        let date = new Date;
        date = date.toDateString();
        let fname = 'New'
        let lname = 'User'
        if (uData[0].fname) fname = uData[0].fname
        if (uData[0].lname) lname = uData[0].lname
        console.log('uData', uData);
        //get patient data
        patientCollection.find({ uID: uData[0]._id }, function (err, result) {
            console.log('find patients result', result)
            //get test data
            testCollection.find({ uID: uData[0]._id }, function (err2, result2) {

                res.render('user/patient_directory',
                    {
                        fname: fname,
                        lname: lname,
                        date: date,
                        page: 'Patient Directory',
                        data: result,
                        tData: result2
                    }
                );
            });

        });
    } else {
        res.redirect('/error');
    }
});

//edit patient profiles
app.get('/user/edit_profile', (req, res) => {
    //logged in check
    if (req.session.user) {
        let uData = req.session.user;
        //load nav w user info        
        let date = new Date;
        date = date.toDateString();
        let fname = 'New'
        let lname = 'User'
        if (uData[0].fname) fname = uData[0].fname
        if (uData[0].lname) lname = uData[0].lname
        console.log('uData', uData);
        //get patient data
        patientCollection.find({ uID: uData[0]._id }, function (err, pResult) {
            console.log('find patients result', pResult)

            //get test data with patient _id
            res.render('user/edit_profile',
                {
                    fname: fname,
                    lname: lname,
                    date: date,
                    page: 'Edit Profiles',
                    pData: pResult
                    //tData: tResult
                }
            );
        });
    } else {
        res.redirect('/error');
    }
});

//test starting page
app.get('/user/test_start', (req, res) => {
    //logged in check
    if (req.session.user) {
        let uData = req.session.user;
        //load nav w user info        
        let date = new Date;
        date = date.toDateString();
        let fname = 'New'
        let lname = 'User'
        if (uData[0].fname) fname = uData[0].fname
        if (uData[0].lname) lname = uData[0].lname
        console.log('uData', uData);
        //get all user's patient's IDs
        patientCollection.find({ uID: uData[0]._id }, '_id fname lname', function (err, pResult) {
            console.log('all IDs result', pResult)
            // patient _id
            res.render('user/test_start',
                {
                    fname: fname,
                    lname: lname,
                    date: date,
                    page: 'Begin Testing',
                    pData: pResult
                }
            );
        });
    } else {
        res.redirect('/error');
    }
});

//get into test_end via exit
app.get('/test/test_end', (req, res) => {
    //logged in check
    if (req.session.user) {
        res.render('test/test_end',
            {
                page: 'End of Test'
            }
        );

    } else {
        res.redirect('/error');
    }
});

///GET methods into test pages not allowed//////
app.get('/test/mfm_q', (req, res) => {
    res.redirect('/error');
});
//digit span
app.get('/test/digit_span', (req, res) => {
    res.redirect('/error');
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
    if (req.header('Referer') == `http://localhost:${port}/create_account`) {
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
                        }, function (err, result) {
                            userCollection.find({ email: user.email }, function (err, result) {
                                console.log(result)
                                let fname = result[0].fname
                                let lname = result[0].lname
                                //save query result (array) to session.user
                                req.session.user = result;
                                //logged in check
                                if (req.session.user) {
                                    console.log('signed up and logged in');
                                } else {
                                    console.log('not authorized');
                                }
                                testCollection.find({ uID: req.session.user[0]._id }, function (err2, result2) {
                                    if (!err2) {
                                        console.log(JSON.stringify(result2, null, 2))
                                        res.render('user/dashboard',
                                            {
                                                fname: fname,
                                                lname: lname,
                                                date: date,
                                                page: 'Dashboard',
                                                tests: JSON.stringify(result2, null, 2)
                                            }
                                        );
                                    } else {
                                        console.log('test', err2)
                                    }
                                });
                            });
                        });
                }
            });
    } else {
        userCollection.exists({ email: user.email, pass: user.pass })
            .then(function (exists) {
                //user email + pass in document
                if (exists) {
                    console.log('the email + pass combo exists:', exists);
                    //load nav w user info
                    let fname = 'New'
                    let lname = 'User'
                    //query fname and last naem from collection w/ enteed email
                    //save session info
                    //then render dash
                    userCollection.find({ email: user.email }, function (err, result) {
                        if (result[0].fname) fname = result[0].fname
                        if (result[0].lname) lname = result[0].lname
                        //save query result (array) to session.user
                        req.session.user = result;
                        //logged in check
                        if (req.session.user) {
                            console.log('logged in');
                        } else {
                            console.log('not authorized');
                        }
                        testCollection.find({ uID: req.session.user[0]._id }, function (err2, result2) {
                            if (!err2) {
                                console.log(JSON.stringify(result2, null, 2))
                                res.render('user/dashboard',
                                    {
                                        fname: fname,
                                        lname: lname,
                                        date: date,
                                        page: 'Dashboard',
                                        tests: JSON.stringify(result2, null, 2)
                                    }
                                );
                            } else {
                                console.log('test', err2)
                            }
                        });

                    });
                    //user email + pass combo not in document
                } else {
                    console.log(user.email);
                    res.redirect('/');
                }
            });
    }
});

//Editing user account
app.post('/user/account', urlencodedParser, (req, res) => {
    //add user info to db
    const user = req.body
    const oldData = req.session.user //array
    console.log('post sent:', req.body)
    //update db first
    userCollection.updateOne({ email: oldData[0].email }, user, function (err, result) {
        //get date
        let date = new Date;
        date = date.toDateString();
        //get upated db info
        userCollection.find({ email: user.email }, function (err, result) {
            console.log(result)
            //update names
            fname = result[0].fname
            lname = result[0].lname
            //update session
            req.session.user = result;
            res.render('user/account',
                {
                    fname: fname,
                    lname: lname,
                    date: date,
                    page: 'User Account',
                    data: result
                }
            );
        });
    });
});

//Registering a patient
app.post('/user/register', urlencodedParser, (req, res) => {
    const patient = req.body
    console.log('OG post sent:', req.body)
    //get user id
    let uData = req.session.user
    //add id to patient obj
    patient.uID = uData[0]._id
    console.log('updated patient:', patient)

    //get date
    let date = new Date;
    date = date.toDateString();

    patientCollection.create(patient, function (err, result) {
        if (err) return console.log('error', err);
        else return console.log('works');
    });
    res.render('user/register',
        {
            fname: uData[0].fname,
            lname: uData[0].lname,
            date: date,
            page: 'Register Patient'
        }
    );
});

////dont need this
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

//delete/update patient
app.post('/user/edit_profile', urlencodedParser, (req, res) => {
    let uData = req.session.user;
    //load nav w user info        
    let date = new Date;
    date = date.toDateString();
    let fname = 'New'
    let lname = 'User'
    if (uData[0].fname) fname = uData[0].fname
    if (uData[0].lname) lname = uData[0].lname

    //DELETE POST
    let delID = req.body.deletedPatient
    console.log(delID)
    if (delID) {
        patientCollection.deleteOne({ _id: delID }, function (err) {
            if (!err) console.log(delID, 'deleted patient')
        });
        //delete patients tests
        testCollection.deleteMany({ pID: delID }, function (err) {
            if (!err) console.log(delID, 'tests deleted')
        });
    } else {
        let upID = req.body.updatedPatient
        let patient = req.body
        console.log('updated patients id', upID, req.body)
        patientCollection.updateOne({ _id: upID }, patient, function (err, result) {
            if (!err) console.log(upID, 'updated')
        });
    }
    //then find and render
    //get new patient data
    patientCollection.find({ uID: uData[0]._id }, function (err, pResult) {
        console.log('find patients result', pResult)
        //get test data with patient _id

        res.render('user/edit_profile',
            {
                fname: fname,
                lname: lname,
                date: date,
                page: 'Edit Profiles',
                pData: pResult
                //tData: tResult
            }
        );


    });
});

//post into mfm q
app.post('/test/mfm_q', urlencodedParser, (req, res) => {
    const test = req.body
    console.log('patient # and the test taken', req.body)
    //get user id
    let uData = req.session.user
    //create test record in db
    testCollection.create({ pID: test.pID, uID: uData[0]._id, test: test.test, complete: test.complete }, function (err, result) {
        if (err) {
            return console.log('error');
        } else {
            console.log('created db record', result);

            console.log('found records id:', result._id)
            res.render('test/mfm_q',
                {
                    testID: result._id,
                    page: 'Questionnaire'
                }
            );
        }
    });

});

//post into digit span
app.post('/test/digit_span', urlencodedParser, (req, res) => {
    const test = req.body
    console.log('test # and answers to qs', req.body)
    let testAns = [test.mfmq1, test.mfmq2, test.mfmq3]
    console.log(testAns)
    //update db 
    testCollection.updateOne({ _id: test.id }, { MFM_ans: testAns }, function (err, result) {
        console.log('updated results:', result)
        res.render('test/digit_span',
            {
                page: 'Digit Span',
                testID: test.id
            }
        );
    });

});

//post into end test upon completion of test
app.post('/test/test_end', urlencodedParser, (req, res) => {
    const test = req.body
    //need to change completed to true
    //split data and add to db as necessary
    console.log(test)
    let MCans = [test.mc1]
    console.log('MCans', MCans)
    //convert to array and then map as int
    let TESTans = test.TEST_ans.split(',').map(x => +x);
    console.log('TESTans', TESTans)
    testCollection.updateOne({ _id: test.id },
        {
            complete: test.complete,
            MC_ans: MCans,
            TEST_ans: TESTans,
            longDS: test.longDS,
            lastDS: test.lastDS,
            time: test.time,
            date: test.start
        }, function (err, result) {
            if (!err) {
                res.render('test/test_end',
                    {
                        page: 'Testing Completed'
                    }
                );
            } else {
                console.log(err)
            }
            console.log('updated results:', result)

        });

});

//post into test_start from test_end via password 
app.post('/user/test_start', urlencodedParser, (req, res) => {
    let input = req.body.password
    console.log('their input', input)
    let password = req.session.user[0].pass;
    console.log('the password', password)
    if (password === input) {
        let uData = req.session.user;
        //load nav w user info        
        let date = new Date;
        date = date.toDateString();
        let fname = 'New'
        let lname = 'User'
        if (uData[0].fname) fname = uData[0].fname
        if (uData[0].lname) lname = uData[0].lname
        console.log('uData', uData);
        //get all user's patient's IDs
        patientCollection.find({ uID: uData[0]._id }, '_id fname lname', function (err, pResult) {
            console.log('all IDs result', pResult)
            // patient _id
            res.render('user/test_start',
                {
                    fname: fname,
                    lname: lname,
                    date: date,
                    page: 'Begin Testing',
                    pData: pResult
                }
            );
        });
    } else {
        res.redirect('/test/test_end');
    }

});

app.listen(port, () => {
    console.log(`listening on port ${port}`);
});
