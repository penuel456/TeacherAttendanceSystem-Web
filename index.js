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

app.get("/getSchedule", function(req, res){
    db.collection('scheduleDB').get()
    .then((snapshot) => {
        var schedules = [];

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
        
        return res.send(JSON.stringify(schedules));
    })
    .catch((err) => {
        console.log('Error getting documents', err);
    });
});




