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

//app.use(express.json());
app.use(express.urlencoded({
    extended: false
}));
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'views/js')));
app.use(express.static(path.join(__dirname, 'public')));

app.listen(port, () => console.log(`Listening on port ${port}`))

app.get("/", function (req, res) {
    res.render("index");
});

app.get("/roomAssignment", function (req, res) {
    res.render("roomAssignments");
});

app.get("/status", function (req, res) {
    res.render("status");
});

app.get("/addSchedule", function (req, res) {
    res.render("addSchedule");
});

function getDate(date) {
    var days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"];

    return days[date.getDay()] + ", " + months[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear();
}

function get12HourTime(time) {
    var hour = time.getHours();
    var minutes = time.getMinutes();

    if (minutes < 10) {
        minutes = "0" + time.getMinutes();
    }

    if (hour >= 12) {
        if (hour != 12) {
            hour -= 12;
        }
        var timeString = hour + ":" + minutes + " PM";
    } else {
        var timeString = hour + ":" + minutes + " AM";
    }

    return timeString;
}

function filterRoomSearch(checkData) {
    if (checkData.searchQuery.length != 0) {
        switch (checkData.filter) {
            case "courseCodeCheck":
                console.log("Room CourseCode is true");
                return db.collection("roomAssignment")
                    .orderBy("courseCode")
                    .startAt(checkData.searchQuery.toUpperCase())
                    .endAt(checkData.searchQuery.toUpperCase() + "\uf8ff")
            case "groupNumberCheck":
                console.log("Room GroupNumber is true");
                return db.collection("roomAssignment")
                    .where("groupNumber", "==", parseInt(checkData.searchQuery))
            case "dayCheck":
                console.log("Room Day is true");
                return db.collection("roomAssignment")
                    .where("dayAssigned", "==", checkData.searchQuery.toUpperCase())
            case "roomCheck":
                console.log("Room Number is true");
                return db.collection("roomAssignment")
                    .orderBy("roomNumber")
                    .startAt(checkData.searchQuery.toUpperCase())
                    .endAt(checkData.searchQuery.toUpperCase() + "\uf8ff")
        }
    } else {
        return db.collection("roomAssignment")
            .orderBy("courseCode")
    }
}

function filterScheduleSearch(checkData) {
    if (checkData.searchQuery.length != 0) {
        if (checkData.filter == "courseCodeCheck") {
            console.log("CourseCode is true");
            return db.collection("scheduleDB")
                .orderBy("courseCode")
                .startAt(checkData.searchQuery)
                .endAt(checkData.searchQuery + "\uf8ff")
        } else if (checkData.filter == "groupNumberCheck") {
            console.log("GroupNumber is true");
            return db.collection("scheduleDB")
                .where("groupNumber", "==", parseInt(checkData.searchQuery))
        }
    } else {
        return db.collection("scheduleDB")
            .orderBy("courseCode")
    }

}

function filterStatusSearch(start, end) {
    return db.collection("status")
    .where("date", "<=", start)
    .where("date", ">=", end)
}

app.get("/getStatus", function (req, res) {
    var checkData = req.query;
    var start, end;

    if (checkData.monthLabel != "All") {
        start = new Date(checkData.year + "-" + checkData.monthInt + "-01");
        end = new Date(checkData.lastYear + "-" + checkData.monthInt + "-01");
    }else {
        start = new Date(checkData.year + "-12");
        end = new Date(checkData.lastYear + "-01");
    }
        
    var query = filterStatusSearch(start, end);

    query
        .where("roomID", "==", parseInt(req.query.roomID))
        .get()
        .then((snapshot) => {
            var status = [];

            snapshot.forEach((doc) => {
                var date = getDate(doc.data().date.toDate());
                console.log(date);

                var statusSnapshot = {
                    date: date,
                    status: doc.data().status,
                    remarks: doc.data().remarks,
                    roomID: doc.data().roomID,
                    statusID: doc.data().statusID
                }

                status.push(statusSnapshot);
            });

            return res.send(JSON.stringify(status));
        })
        .catch((exception) => {
            console.log("Error: ", exception);
        })
});

app.get("/getRoomAssignmentsOnStatus", function (req, res) {
    var checkData = req.query;
    console.log(checkData);

    db.collection("roomAssignment")
        .where("groupNumber", "==", parseInt(checkData.groupNumber))
        .where("courseCode", "==", checkData.courseCode)
        .get()
        .then((snapshot) => {
            var roomAssignments = [];

            snapshot.forEach((doc) => {
                var startString = get12HourTime(doc.data().startTime.toDate());
                var endString = get12HourTime(doc.data().endTime.toDate());

                console.log("Start: ", startString);
                console.log(doc.data().roomID + " End: " + endString);

                var roomSnapshot = {
                    roomID: doc.data().roomID,
                    courseCode: doc.data().courseCode,
                    groupNumber: doc.data().groupNumber,
                    roomNumber: doc.data().roomNumber,
                    startTime: startString,
                    endTime: endString,
                    dayAssigned: doc.data().dayAssigned
                }

                roomAssignments.push(roomSnapshot);
            });

            return res.send(JSON.stringify(roomAssignments));
        })
        .catch((err) => {
            console.log("Error: ", err);
        })

    return "None";
});

// GETTING ROOM ASSIGNMENTS ON REFRESH BUTTON
app.get("/getRoomAssignments", function (req, res) {
    var checkData = req.query;
    console.log(checkData);

    var query = filterRoomSearch(checkData);

    query
        .limit(50)
        .get()
        .then((snapshot) => {
            var roomAssignments = [];

            if (snapshot.exists) {
                console.log("Error: No such schedule document.");
            } else {
                snapshot.forEach((doc) => {
                    var startString = get12HourTime(doc.data().startTime.toDate());
                    var endString = get12HourTime(doc.data().endTime.toDate());

                    //console.log("Start: ", startString);
                    //console.log(doc.data().roomID + " End: " + endString);

                    var roomSnapshot = {
                        roomID: doc.data().roomID,
                        courseCode: doc.data().courseCode,
                        groupNumber: doc.data().groupNumber,
                        roomNumber: doc.data().roomNumber,
                        startTime: startString,
                        endTime: endString,
                        dayAssigned: doc.data().dayAssigned
                    }

                    roomAssignments.push(roomSnapshot);
                });

                return res.send(JSON.stringify(roomAssignments));
            }
        })
        .catch((err) => {
            console.log("Error: ", err);
        });

});

// GETTING SCHEDULE ON REFRESH BUTTON
app.get("/getSchedule", function (req, res) {
    var checkData = req.query;
    console.log(checkData);
    var query = filterScheduleSearch(checkData);
    query
        .limit(50)
        .get()
        .then((snapshot) => {
            var schedules = [];

            if (snapshot.exists) {
                console.log("Error: No such schedule document.");
            } else {
                snapshot.forEach((doc) => {
                    var scheduleSnapshot = {
                        courseID: doc.data().courseID,
                        courseCode: doc.data().courseCode,
                        groupNumber: doc.data().groupNumber,
                        department: doc.data().department,
                        courseName: doc.data().courseName,
                        teacherId: doc.data().teacherId,
                        userID: doc.data().userID
                    };

                    schedules.push(scheduleSnapshot);
                });
            }

            db.collection('userDB').get()
                .then((snapshot) => {
                    if (snapshot.exists) {
                        console.log("Error: No such user document.")
                    } else {
                        snapshot.forEach((doc) => {
                            for (var i = 0; i < schedules.length; i++) {
                                if (schedules[i] != undefined) {
                                    // STUDENT'S OWN SCHEDULE IS REMOVED SINCE WE'RE ONLY GETTING THE TEACHER'S SCHEDULES
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
        })
        .catch((err) => {
            console.log('Error getting documents', err);
        });
});

app.get("/setSchedule", function (req, res) {
    console.log("Start submitting.");
    var sendData = req.query;
    console.log(sendData);
    
    db.collection('scheduleDB').doc(sendData.courseID).set(sendData);
    
});




function arrayRemove(arr, value) {
    return arr.filter(function (ele) {
        return ele != value;
    });
}
