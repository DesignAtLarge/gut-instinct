import {
    Meteor
} from 'meteor/meteor';
import {
    Experiments
} from './experiments';
import {
    Time,
    TimeSpan
} from './time';
import {
    ExperimentStatus,
    NotificationType,
    ParticipationSlotStatus,
    ConditionGroup,
    PilotStatus,
} from "./constants";
import {
    ExperimentHelper
} from "./commonExperimentHelpers";

export const Pilots = new Mongo.Collection('ga_experiment_pilots');

Meteor.methods({

    /**
     * Get the pilot that the user is currently doing
     */
    'galileo.pilot.getCurrentPilot': function(userId) {
        return Pilots.findOne({
            "user_id": userId || Meteor.userId(),
            "status": PilotStatus.ONGOING
        });
    },

    /**
     * [description]
     * @param  {[type]} designId [description]
     * @return {[type]}          [description]
     */
    'galileo.pilot.getPilotsByVersion': function(designId) {
        return Pilots.find({
            "design_id": designId
        }).fetch();
    },
    'galileo.pilot.getPilotByVersionAndGroup': function(designId, group) {
        return Pilots.findOne({
            "design_id": designId,
            "group": group
        });
    },
    'galileo.pilot.isOpenForPilot': function(expId) {
        let exp = Meteor.call("galileo.experiments.getExperiment", expId);
        let designId = exp["curr_design_id"];
        if (exp.status === ExperimentStatus.OPEN_FOR_PILOT || exp.status === ExperimentStatus.PILOT_ONGOING) {
            let pilots = Meteor.call("galileo.pilot.getPilotsByVersion", designId);
            return pilots.length < 2;
        } else {
            return false;
        }
    },
    'galileo.pilot.hasControlPilot': function(expId) {
        let pilot = getPilotByExpAndGroup(expId, ConditionGroup.CONTROL);
        return pilot !== undefined;
    },
    'galileo.pilot.getCurrentControlPilot': function(expId) {
        return getPilotByExpAndGroup(expId, ConditionGroup.CONTROL);
    },
    'galileo.pilot.hasExperimentalPilot': function(expId) {
        let pilot = getPilotByExpAndGroup(expId, ConditionGroup.EXPERIMENTAL);
        return pilot !== undefined;
    },
    'galileo.pilot.getCurrentExperimentalPilot': function(expId) {
        return getPilotByExpAndGroup(expId, ConditionGroup.EXPERIMENTAL);
    },
    'galileo.pilot.canPilot': function(expId) {
        return canPilot(expId);
    },
    'galileo.pilot.startPilot': function(expId, group, duration, startDate) {

        // First Check if the user can pilot the experiment
        if (canPilot(expId)) {
            // Then check if the group input is valid
            if (group === ConditionGroup.CONTROL || group === ConditionGroup.EXPERIMENTAL) {

                // Get the experiment
                let exp = Meteor.call("galileo.experiments.getExperiment", expId);

                // Calculate pilot data time
                let user = Meteor.user();

                // Then generate the data slot and insert into database
                let pilot = ExperimentHelper.getPilotParticipationCommonObject(exp, user, PilotStatus.ONGOING, group, startDate, duration);
                pilot.design_id = exp.curr_design_id;
                Pilots.insert(pilot);

                //hook to add to pilot_user count
                Experiments.update({
                    "_id": expId
                }, {
                    $addToSet: {
                        "pilot_users": Meteor.userId()
                    }
                });

                // Set the experiment status to be piloting
                Meteor.call("galileo.experiments.setPiloting", expId);

                // Then send the notification message to the Pilot Participant
                let url = '/galileo/me/experiment/' + expId + '/my_pilot';
                let type = NotificationType.PILOT_STARTED_FOR_PARTICIPANT;
                ExperimentHelper.sendPilotOrExpWillBeginNotification(pilot, exp, duration, startDate, type, url, 'pilot');

                // Then send the notification message to the Creator
                let message = "[" + user.username + "] is now piloting your experiment [" + exp.design.cause + " " + exp.design.relation + " " + exp.design.effect + "]";
                url = "/galileo/me/experiment/" + expId + "?type=created";
                Meteor.call("galileo.experiments.sendEmail", expId, NotificationType.NEW_PILOT_PARTICIPANT, message, url);

                // Finally Return True indicating the user already piloting this exp
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    },
    'galileo.pilot.getUserPilots': function() {
        if (!Meteor.userId()) {
            throw new Meteor.Error("not-authorized");
        }
        return Pilots.find({
            "user_id": Meteor.userId()
        }, {
            sort: {
                user_endDate_inGmt: -1
            }
        }).fetch();
    },
    'galileo.pilot.getUserPilotExps': function() {
        if (!Meteor.userId()) {
            throw new Meteor.Error("not-authorized");
        }

        let expMap = {};

        Pilots.find({
            user_id: Meteor.userId()
        }, {
            fields: {
                _id: 1,
                exp_id: 1
            },
            sort: {
                user_endDate_inGmt: -1
            }
        }).map((pilot) => {
            if (!expMap[pilot.exp_id]) {
                expMap[pilot.exp_id] = Meteor.call("galileo.experiments.getExperiment", pilot.exp_id);
            }
        });

        return Object.values(expMap);
    },
    'galileo.pilot.getPilot': function(expId) {
        if (!Meteor.userId()) {
            throw new Meteor.Error("not-authorized");
        }
        return Pilots.findOne({
            "user_id": Meteor.userId(),
            "exp_id": expId
        });
    },
    'galileo.pilot.getPilotById': function(pilotId) {
        return Pilots.findOne({
            _id: pilotId
        });
    },

    // If current user is the exp creator, he/she can see all pilot reviews
    'galileo.pilot.canUserSeePilotFeedback': function(expId, pilotId) {
        if (Meteor.call("galileo.experiments.isCreator", expId)) {
            return Pilots.find({
                _id: pilotId,
                exp_id: expId
            }).count() > 0;
        } else {
            return null
        }
    },

    //the user has signed up to pilot this (PREPARING, ONGOING) -- pilot def not over
    'galileo.pilot.isPiloting': function(expId) {
        console.log("in isPiloting");
        return Pilots.find({
            "user_id": Meteor.userId(),
            "exp_id": expId,
            "status": {
                $lt: PilotStatus.ENDED
            }
        }, {
            fields: {
                _id: 1
            }
        }).count() > 0;
    },
    //the user has piloted this exp (ENDED)
    'galileo.pilot.hasPiloted': function(expId) {
        let pilots = Pilots.find({
            "user_id": Meteor.userId(),
            "exp_id": expId
        }, {
            fields: {
                status: 1
            }
        }).fetch();

        if (pilots && pilots.length > 0) {
            let pilot = pilots[0];
            if (pilot && pilot.status === PilotStatus.ENDED) {
                return pilot._id;
            }
        }
        return null;
    },
    //the user has relations to the pilot -- this  = isPiloting  + hasPiloted
    'galileo.pilot.isPilot': function(expId) {
        let pilotCount = Pilots.find({
            "user_id": Meteor.userId(),
            "exp_id": expId
        }, {
            fields: {
                _id: 1
            }
        }).count();
        return pilotCount !== 0;
    },
    'galileo.pilot.getOngoingPilot': function() {
        return Pilots.findOne({
            "user_id": Meteor.userId(),
            "status": {
                $lt: PilotStatus.ENDED
            }
        });
    },
    'galileo.pilot.hasOngoingPilot': function() {
        return Pilots.find({
            "user_id": Meteor.userId(),
            "status": {
                $lt: PilotStatus.ENDED
            }
        }, {
            fields: {
                _id: 1
            }
        }).count() > 0;
    },
    'galileo.pilot.updateData': function(id, type, day, value) {

        // Check if the user exists
        if (!Meteor.userId()) {
            throw new Meteor.Error("not-authorized");
        }

        // Check if the pilot exists and the user is piloting
        let pilot = Pilots.findOne({
            _id: id
        });
        if (!pilot || pilot.user_id !== Meteor.userId()) {
            throw new Meteor.Error("not-piloting");
        }

        // Config the set object
        let setobj = {};
        setobj[type + "_data." + day] = {
            "complete_time": new Date(),
            "status": ParticipationSlotStatus.COMPLETE,
            "value": value
        };
        Pilots.update(id, {
            $set: setobj
        });
    },
    'galileo.pilot.checkIfSinglePilotEnded': function() {
        let nowInGMT = Time.getNowInGmt();

        let endingPilotsMap = {};
        Pilots.find({
            "user_endDate_inGmt": {
                $lt: nowInGMT.getDate()
            },
            "status": PilotStatus.ONGOING
        }).map((pilot) => {
            Pilots.update({
                _id: pilot._id
            }, {
                $set: {
                    status: PilotStatus.ENDED
                }
            });

            if (endingPilotsMap[pilot.exp_id] === undefined) {
                endingPilotsMap[pilot.exp_id] = Meteor.call("galileo.experiments.getExperiment", pilot.exp_id);
            }

            //notify participant about pilot ending
            ExperimentHelper.sendPostPilotOrExpNotification(pilot.user_id, endingPilotsMap[pilot.exp_id], NotificationType.PILOT_COMPLETED_PARTICIPANT, 'pilot');
        });
    },
    'galileo.pilot.checkIfPilotsEndedPerExperiment': function() {
        Experiments.find({
            "status": ExperimentStatus.PILOT_ONGOING
        }).map((exp) => {
            let designId = exp.curr_design_id;
            let pilotCount = Pilots.find({
                "design_id": designId,
                "status": PilotStatus.ENDED
            }).count();
            if (pilotCount === 2) {
                Experiments.update({
                    _id: exp._id
                }, {
                    $set: {
                        "status": ExperimentStatus.PILOTED
                    }
                });

                // TODO: might need to move this email to once pilot participants leave their feedback on experiment
                // notify experiment owner about pilot end
                let message = "Citizen scientists have completed piloting your experiment";
                let url = "/galileo/me/experiment/" + exp._id + "/info";
                Meteor.call("galileo.experiments.sendEmail", exp._id, NotificationType.PILOT_COMPLETED_CREATOR, message, url, function(err) {
                    if (err) {
                        Materialize.toast(err, 3000, "toast rounded");
                    }
                });
            }
        });
    },
    'galileo.pilot.sendStartOfDayMessage': function() {
        console.log('~~~~~~~~~~~~~~sendStartOfDayMessage for pilot');

        let nowInGMT = Time.getNowInGmt();

        let ongoingPilots = Pilots.find({
            user_startDate_inGmt: {
                $lte: nowInGMT.getDate()
            },
            user_endDate_inGmt: {
                $gt: nowInGMT.getDate()
            },
            status: PilotStatus.ONGOING
        });

        ExperimentHelper.sendStartOfDayMessage(ongoingPilots, 'pilot');
    },
    'galileo.pilot.sendCauseEffectMessage': function() {
        let expMap = {};
        let userMap = {};
        let dayMap = {};

        let nowInGMT = Time.getNowInGmt();

        let nowHour = nowInGMT.getDate().getHours();

        // Process all cause sms
        // Query for causeHour < nowHour < causeHour + 1
        Pilots.find({
            status: PilotStatus.ONGOING,
            user_causeHour_inGmt: {
                $lte: nowHour,
                $gt: nowHour - 1
            }
        }).map((pilot) => {
            console.log('~~~~~~~~~processing cause text for ' + pilot._id);
            if (expMap[pilot.exp_id] === undefined) {
                expMap[pilot.exp_id] = Meteor.call("galileo.experiments.getExperiment", pilot.exp_id);
            }
            if (userMap[pilot.user_id] === undefined) {
                userMap[pilot.user_id] = Meteor.users.findOne(pilot.user_id);
            }
            if (dayMap[pilot.exp_id] === undefined) {
                dayMap[pilot.exp_id] = ExperimentHelper.getExperimentOrPilotDayNumber(pilot);
            }

            processMeasureSms(pilot, expMap[pilot.exp_id], userMap[pilot.user_id], "cause", dayMap[pilot.exp_id]);
        });

        // Process all effect sms
        // Query for effectHour < nowHour < effectHour + 1
        Pilots.find({
            status: PilotStatus.ONGOING,
            user_effectHour_inGmt: {
                $lte: nowHour,
                $gt: nowHour - 1
            }
        }).map((pilot) => {
            console.log('~~~~~~~~~processing effect text for ' + pilot._id);
            if (expMap[pilot.exp_id] === undefined) {
                expMap[pilot.exp_id] = Meteor.call("galileo.experiments.getExperiment", pilot.exp_id);
            }
            if (userMap[pilot.user_id] === undefined) {
                userMap[pilot.user_id] = Meteor.users.findOne(pilot.user_id);
            }
            if (dayMap[pilot.exp_id] === undefined) {
                dayMap[pilot.exp_id] = ExperimentHelper.getExperimentOrPilotDayNumber(pilot);
            }

            processMeasureSms(pilot, expMap[pilot.exp_id], userMap[pilot.user_id], "effect", dayMap[pilot.exp_id]);
        });


        // Pilots.find({
        //     user_startDate_inGmt: { $lte: now },
        //     user_endDate_inGmt: { $gt: now },
        //     status: PilotStatus.ONGOING
        // }).map((pilot) => {
        //
        //     let exp = expMap[pilot.exp_id];
        //     if(!exp) {
        //         exp = Meteor.call("galileo.experiments.getExperiment", pilot.exp_id);
        //         expMap[pilot.exp_id] = exp
        //     }
        //
        //     let user = expMap[pilot.user_id];
        //     if(!user) {
        //         user = Meteor.users.findOne(pilot.user_id);
        //         userMap[pilot.user_id] = user
        //     }
        //
        //     let day = ExperimentHelper.getExperimentOrPilotDayNumber(pilot);
        //
        //     // Check if we need to add a new data slot
        //     processNotification(pilot, exp, user, "cause", day);
        //     processNotification(pilot, exp, user, "effect", day);
        // });

    },
    'galileo.pilot.processMessageFromPilot': function(user, pilot, fromNumber, message) {
        if (user === null || user === undefined) {
            return "User Not Found";
        }

        if (pilot === null || pilot === undefined) {
            return "No Ongoing Pilot";
        }

        let exp = Meteor.call("galileo.experiments.getExperiment", pilot.exp_id);

        let nowInGMT = Time.getNowInGmt();

        if (nowInGMT.getDate() >= pilot.user_startDate_inGmt &&
            nowInGMT.getDate() < pilot.user_endDate_inGmt) {

            // Store the message to the database
            Pilots.update(pilot._id, {
                $push: {
                    "messages": {
                        "from": fromNumber,
                        "message": message,
                        "time": nowInGMT.getDate()
                    }
                }
            });

            let day = ExperimentHelper.getExperimentOrPilotDayNumber(pilot);

            // Check which slot to insert
            let measure = "";
            let type = "";
            try {
                type = ExperimentHelper.determineUpdateType(pilot, day);
                measure = exp["design"][type + "_measure"];
            } catch (typeErr) {
                console.error(typeErr);
                return "Oops, there's no available slot to add the data. Please wait for the text message reminder."
            }

            // Parse the message to get the value and update the database
            let value = "";
            try {
                value = ExperimentHelper.parseMessage(measure, message);
            } catch (parseErr) {

                // If error then reply error
                console.error(parseErr);
                updateError(pilot, type, day);
                return "Oops, the data provided by you is invalid. Maybe look at the instructions in the text you received?";
            }

            // Update data
            updateData(pilot, type, day, value);
            return "Great work! Your data has been successfully stored in your tracking sheet.";
        } else {
            return "No Ongoing Pilot.";
        }
    },
    "galileo.pilot.phoneNumIsPiloting": function(phone) {
        let user = Meteor.call("galileo.getUserByPhoneNumber", phone);
        if (user) {
            let pilot = Meteor.call("galileo.pilot.getCurrentPilot", user["_id"]);
            return (pilot !== undefined);
        } else {
            return false;
        }
    }
});

function getPilotByExpAndGroup(expId, group) {
    let exp = Meteor.call("galileo.experiments.getExperiment", expId);
    let designId = exp["curr_design_id"];
    return Pilots.findOne({
        "design_id": designId,
        "group": group
    });
}

function processMeasureSms(pilot, exp, user, type, day) {
    let data = pilot[type + "_data"];
    let design = exp["design"];

    console.log('~~~~~~~~~processMeasureSms ' + pilot._id + '  day = ' + day + '  type = ' + type);
    console.log(data);
    if (data[day]["status"] === ParticipationSlotStatus.PREPARING) {
        let setObj = {};
        setObj[type + "_data." + day + ".status"] = ParticipationSlotStatus.SENT;
        setObj[type + "_data." + day + ".start_time"] = new Date();
        Pilots.update(pilot._id, {
            $set: setObj
        });

        // Send notification message
        let reminderText = design[type + "_measure"]["reminderText"];
        ExperimentHelper.sendMeasureNotification(user, day, reminderText, 'pilot');
    }
}

// function processNotification(pilot, exp, user, type, day) {
//
//     // Find the notification time
//     let data = pilot[type + "_data"];
//     let design = exp["design"];
//
//     let notifyHour = design[type + "_measure"]["time"];
//
//     /* OLD LOGIC
//         let notifyTime = (new Time()).addHour(TIME_OFFSET).setToStartOfDay().addHour(-TIME_OFFSET);
//         notifyTime.addHour(notifyHour);
//         let notifyDate = notifyTime.getDate();
//     */
//
//     let nowInGMT = new Time();
//     // let nowInGMT = (new Time()).addHour(8); // localhost is giving PST, but prod server will give GMT, so for debugging uncomment this line and convert to GMT first
//
//     let timeZoneOffset = ExperimentHelper.getTimezoneOffset(user);
//     let nowInUserTimeZone = nowInGMT.addHour(timeZoneOffset);
//     let reminderTimeInUserTimeZone = nowInUserTimeZone.setToStartOfDay().addHour(notifyHour);
//     let reminderTimeInGMT = reminderTimeInUserTimeZone.addHour(-timeZoneOffset);
//
//     // Check 1. the slot is not yet created for today, and
//     //       2. the current time is greater than the notification time
//     // We use "new Date()" and not "nowInGMT" because nowInGMT and reminderTimeInGMT end up pointing to the same object
//     let condition1 = (data[day]["status"] === ParticipationSlotStatus.PREPARING);
//     let condition2 = (new Date()) > reminderTimeInGMT.getDate();
//
//     if (condition1 && condition2) {
//         // Push the slot to the database
//         let setobj = {};
//         setobj[type + "_data." + day + ".status"] = ParticipationSlotStatus.SENT;
//         setobj[type + "_data." + day + ".start_time"] = new Date();
//         Pilots.update(pilot._id, {
//             $set: setobj
//         });
//
//         // Send notification message
//         let reminderText = design[type + "_measure"]["reminderText"];
//         sendNotificationMessage(user.galileo.phone, day, reminderText);
//     }
// }


function updateError(pilot, type, day) {

    // First cache the array
    let arr = pilot[type + "_data"];

    // Check if the data is already completed;
    if (arr[day].status === ParticipationSlotStatus.COMPLETE) {

    } else {
        let setobj = {};
        setobj[type + "_data." + day] = {
            "error_time": new Date(),
            "status": ParticipationSlotStatus.ERROR
        };
        Pilots.update(pilot._id, {
            $set: setobj
        });
    }
}

function updateData(pilot, type, day, value) {

    // Then update the value
    let setobj = {};
    setobj[type + "_data." + day] = {
        "complete_time": new Date(),
        "status": ParticipationSlotStatus.COMPLETE,
        "value": value
    };
    Pilots.update(pilot._id, {
        $set: setobj
    });
}

function canPilot(expId) {

    let userId = Meteor.userId();
    // First check if the userId is null
    if (!userId) {
        // this probably should never happen, but whatever..
        throw new Meteor.Error("Are you logged in? Pls sign in to continue.");
    }

    // Then check the user exists
    let users = Meteor.users.find({
        _id: userId
    }, {
        fields: {
            "galileo.phone": 1
        },
        limit: 1
    }).fetch();

    if (!users || users.length === 0) {
        //this is a bug on our part -- maybe we deleted something on the db we shouldn't have
        throw new Meteor.Error("Oops, we cannot find your account in our database. Please email us at gutinstinct@ucsd.edu");
    }
    // If the user exists, then check if the phone number exists
    let user = users[0];

    if (!user.galileo || !user.galileo.remindByEmail && (!user.galileo.phone || user.galileo.phone === "")) {
        throw new Meteor.Error("missing-phone-number", "Please add a phone number in your profile page to begin");
    }

    // Check if the experiment exists
    let exp = Meteor.call("galileo.experiments.getExperiment", expId);
    if (!exp) {
        //this is a bug on our part -- maybe we deleted something on the db we shouldn't have
        throw new Meteor.Error("Oops, we cannot find this experiment in our database. Please email us at gutinstinct@ucsd.edu");
    }

    //exp ain't open homie
    else if (!Meteor.call("galileo.pilot.isOpenForPilot", expId)) {
        throw new Meteor.Error("Sorry, the creator of this experiment hasn't opened it for pilot right now");
    }

    //user created this experiment
    else if (Meteor.call("galileo.experiments.isCreator", expId)) {
        throw new Meteor.Error("You cannot join this experiment because you've created this experiment.");
    }

    //user is already in a pilot or participating of another experiment
    else if (Meteor.call("galileo.pilot.hasOngoingPilot")) {
        throw new Meteor.Error("You already have an ongoing pilot. You can pilot an experiment when you are NOT piloting or participating in any other experiment.");
    } else if (Meteor.call("galileo.run.hasOngoingParticipation")) {
        throw new Meteor.Error("You are already participating in an experiment. You can pilot an experiment when you are NOT piloting or participating in any other experiment.");
    }

    //user is reviewing this experiment
    else if (Meteor.call("galileo.feedback.isFeedbacking", expId, 'canPilot')) {
        throw new Meteor.Error("You are reviewing this experiment. You cannot review and pilot the same experiment.");
    }

    //user has piloted or is participating in this experiment
    else if (Meteor.call("galileo.pilot.hasPiloted", expId)) {
        throw new Meteor.Error("You have already piloted this experiment. You cannot pilot an exp more than once.");
    } else if (Meteor.call("galileo.run.isParticipant", expId)) {
        throw new Meteor.Error("You are already a participant for this experiment.You cannot pilot and participate in the same experiment. ");
    }

    return true;
}


// function generatePilotData(userId, expId, group, duration, startDate) {
//
//     // Get the experiment
//     let exp = Meteor.call("galileo.experiments.getExperiment", expId);
//
//     // Calculate pilot data time
//     let user = Meteor.users.findOne({_id: Meteor.userId()});
//     let timezoneOffset = ExperimentHelper.getTimezoneOffset(user);
//     let today = new Time(new Date()).addHour(timezoneOffset).setToStartOfDay().addHour(-timezoneOffset);
//     let start = new Time(today).addDay(startDate);
//     let end = (new Time(start)).addDay(duration);
//
//     // Generate data slot
//     let data = [];
//     let slotObj = {
//         "status": ParticipationSlotStatus.PREPARING
//     };
//     for (let i = 0; i < duration; i++) {
//         data.push(slotObj);
//     }
//
//     // Generate the pilot data
//     return {
//         "user_id": userId,
//         "exp_id": expId,
//         "design_id": exp["curr_design_id"],
//         "group": group,
//         "status": PilotStatus.ONGOING,
//         "create_date": new Date(),
//         "start_date": start.getDate(),
//         "end_date": end.getDate(),
//         "duration": duration,
//         "cause_data": data,
//         "effect_data": data
//     };
// }
