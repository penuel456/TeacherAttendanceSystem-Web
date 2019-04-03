const path = require('path');
const admin = require('firebase-admin');
const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();
const app = express();
const port = 3000;

var serviceAccount = require('./service-key.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

var db = admin.firestore();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({
    extended: false
}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.listen(port, () => console.log(`Listening on port ${port}`))

app.get("/", function (req, res) {
    res.render("index");
});

app.get("/roomAssignment", function (req, res) {
    res.render("roomAssignments");
});

// GETTING SCHEDULE ON REFRESH BUTTON
app.get("/getSchedule", function (req, res) {
    db.collection('scheduleDB').get()
        .then((snapshot) => {
            var schedules = [];
            var users = [];

            if (snapshot.exists) {
                console.log("Error: No such schedule document.");
            } else {
                snapshot.forEach((doc) => {
                    var scheduleSnapshot = {
                        courseID: doc.data().courseID,
                        courseCode: doc.data().courseCode,
                        groupNumber: doc.data().groupNumber,
                        teacherId: doc.data().teacherId,
                        userID: doc.data().userID
                    }

                    schedules.push(scheduleSnapshot);
                });
            }

            db.collection('userDB').get()
                .then((snapshot) => {
                    if (snapshot.exists) {
                        console.log("Error: No such user document.")
                    } else {
                        snapshot.forEach((doc) => {
                            console.log("Type: ", doc.data().type);
                            console.log("UserID: ", doc.data().userID);
                            for (var i = 0; i < schedules.length; i++) {
                                if (schedules[i] != undefined) {
                                    if (doc.data().type == "student" && schedules[i].userID == doc.data().userID) {
                                        delete schedules[i];
                                    } else if (doc.data().type == "teacher" && schedules[i].userID == doc.data().userID) {
                                        schedules[i].teacherId = doc.data().name;
                                    } else if (schedules[i].teacherId == null) {
                                        schedules[i].teacherId = "None";
                                    }
                                }
                            }
                        });
                    }

                    var result = arrayRemove(schedules, undefined);

                    return res.send(JSON.stringify(result));
                })
                .catch((err) => {
                    console.log("Error getting documents", err);
                });
            /*
            if(schedules.length > 0){
                db.collection('userDB').where()
            }
            */

        })
        .catch((err) => {
            console.log('Error getting documents', err);
        });
});

function arrayRemove(arr, value) {

    return arr.filter(function (ele) {
        return ele != value;
    });

}
