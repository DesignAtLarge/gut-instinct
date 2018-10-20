import {
    ConditionGroup,
    MeasureType,
    NotificationType,
    ParticipationSlotStatus,
    PilotStatus
} from "./constants";
import {
    Time,
    TimeSpan
} from "./time";
import Twilio from "../twilio";
import {
    Meteor
} from "meteor/meteor";


// TODO: handle this better
// offset with daylight savings time afforded for
const TIME_OFFSET = -7;

export const ExperimentHelper = {
    getTimezoneOffset: function(user) {
        if (user && user.galileo && user.galileo.timezone) {
            let userSetTimezone = parseInt(user.galileo.timezone);
            console.log('userSetTimezone = ' + userSetTimezone);
            if (isNaN(userSetTimezone)) {
                console.log('returning default 1  TIME_OFFSET');
                return TIME_OFFSET;
            } else {
                let isDst = parseInt(user.galileo.isDst);
                console.log('isDst = ' + isDst);
                if (isDst) {
                    console.log('returning with dst');
                    return userSetTimezone + isDst;
                } else {
                    console.log('returning without dst');
                    return userSetTimezone;
                }
            }
        }
        console.log('returning default 2  TIME_OFFSET');
        return TIME_OFFSET;
    },

    getPilotParticipationCommonObject: function(exp, user, status, conditionGroup, startDate, duration, failedExclusion, failedInclusion, participantIndex) {

        let timeZoneOffset = this.getTimezoneOffset(user);
        let userCauseTimeInGmt = (exp.design.cause_measure.time - timeZoneOffset) % 24;
        let userEffectTimeInGmt = (exp.design.effect_measure.time - timeZoneOffset) % 24;
        let userDailyHourInGmt = 0;

        if (exp.design.daily_notify_time) {
            userDailyHourInGmt = (exp.design.daily_notify_time - timeZoneOffset) % 24;
        }
        else {
            userDailyHourInGmt = (6 - timeZoneOffset) % 24;
        }

        let obj = this.getStartDateBasedExpParams(startDate, duration, timeZoneOffset);

        let participantMapping = "";

        obj.username = user.username;
        obj.exp_id = exp._id;
        obj.user_id = user._id;
        obj.status = status;
        obj.group = conditionGroup;
        obj.participantIndex = participantIndex;
        obj.participantMap = participantMapping;
        obj.user_causeHour_inGmt = userCauseTimeInGmt;
        obj.user_effectHour_inGmt = userEffectTimeInGmt;
        obj.user_DailyHour_inGmt = userDailyHourInGmt;
        obj.failedExclusion = failedExclusion;
        obj.failedInclusion = failedInclusion;

        // different fields for participation
        // "join_date_time": new Date(),
        // "group": getNextGroup(exp._id),

        // different fields for Pilot
        // "design_id": exp["curr_design_id"],
        // "status": PilotStatus.ONGOING,

        return obj;
    },

    getStartDateBasedExpParams: function(startDate, duration, timeZoneOffset) {
        let endDate = undefined;
        let cause_data = undefined;
        let effect_data = undefined;

        if (duration) {
            cause_data = generateDataArray(duration);
            effect_data = generateDataArray(duration);
            if (startDate) {
                // for a user in PST:
                // Start date = 11th Feb midnight in PST which is = 11th Feb 8:00 am in GMT
                // Start date = 14th Feb midnight in PST which is = 14th Feb 8:00 am in GMT
                startDate = (new Time(startDate)).setToStartOfDay().addHour(-timeZoneOffset).getDate();
                endDate = (new Time(startDate)).addDay(duration).getDate();

                console.log(startDate);
                console.log(endDate);
            }
        }
        return {
            "user_startDate_inGmt": startDate,
            "user_endDate_inGmt": endDate,
            "duration": duration,
            "cause_data": cause_data,
            "effect_data": effect_data
        }
    },

    getExperimentOrPilotDayNumber: function(expOrPilot) {
        let nowInGMT = Time.getNowInGmt();

        let ts = new TimeSpan(expOrPilot.user_startDate_inGmt, nowInGMT);
        return Math.floor(ts.getDays());
    },

    sendPilotOrExpWillBeginNotification: function(participant, exp, duration, startDate, type, url, pilotOrExp) {
        let participantDetails = Meteor.users.findOne(participant.user_id, {
            fields: {
                "galileo.timezone": 1,
                "galileo.phone": 1,
                "username": 1
            }
        });

        if (!exp || !participantDetails || !participantDetails.galileo) {
            return;
        }

        let creatorName = exp.username;
        let cause_time = transcribeTime(exp.design.cause_measure.time);
        let effect_time = transcribeTime(exp.design.effect_measure.time);


        let message = "Hello from " + creatorName + "! The " + pilotOrExp + " you signed up for will begin on " + startDate.toDateString() + " and last for " + duration + " days. " +
            "Please check your messages at " + cause_time + " and " + effect_time + " to record the experiment data.";

        //send sms
        if (participantDetails.galileo.phone) {
            Twilio.sendSMS(participantDetails.galileo.phone, message);
        }

        let group = "control";
        if (participant.group === ConditionGroup.EXPERIMENTAL) {
            group = "experimental";
        }

        let groupInfo = exp.design["condition"][group];
        let steps = groupInfo["steps"];
        let prepSteps = groupInfo["prep_steps"];

        let expTitle = "Does " + exp.design.cause + " affect " + exp.design.effect + "?";
        let args = {
            creatorName: creatorName,
            otherUser: participantDetails.username,
            expTitle: expTitle,
            expId: exp._id,
            duration: duration,
            startDate: startDate.toDateString(),
            pilotOrExp: pilotOrExp,
            prepSteps: prepSteps,
            steps: steps,
            cause_time: cause_time,
            effect_time: effect_time
        };

        //send email
        Meteor.call("galileo.notification.new", participant.user_id, message, url, type, args); // send the email
    },

    sendDayBeforeExpStartCreator: function(exp, pilotOrExp, daysBefore) {
        let expTitle = "Does " + exp.design.cause + " affect " + exp.design.effect + "?";
        let url = "/galileo/me/dashboard";

        let daysBeforeText = 'tomorrow';
        if (daysBefore === 2) {
            daysBeforeText = 'in 2 days'
        }


        let args = {
            otherUser: exp.username,
            expTitle: expTitle,
            startDate: exp.start_date_time.toDateString(),
            duration: exp.duration,
            pilotOrExp: pilotOrExp,
            daysBeforeText: daysBeforeText,
        };

        Meteor.call("galileo.notification.new", exp.user_id, null, "/galileo/me/dashboard", NotificationType.RUN_BEFORE_STARTED_CREATOR, args); // send the email
    },

    sendDayBeforeExpStartNotification: function(participant, exp, user, pilotOrExp, daysBefore) {
        let expTitle = "Does " + exp.design.cause + " affect " + exp.design.effect + "?";
        let url = "/galileo/me/dashboard";

        let steps = exp.design.condition.control.steps;
        let prepSteps = exp.design.condition.control.prep_steps;
        if (participant.group === ConditionGroup.EXPERIMENTAL) {
            steps = exp.design.condition.experimental.steps;
            prepSteps = exp.design.condition.experimental.prep_steps;
        }

        let daysBeforeText = 'tomorrow';
        if (daysBefore === 2) {
            daysBeforeText = 'in 2 days'
        }


        let args = {
            otherUser: participant.username,
            expTitle: expTitle,
            startDate: exp.start_date_time.toDateString(),
            duration: exp.duration,
            steps: steps,
            prepSteps: prepSteps,
            pilotOrExp: pilotOrExp,
            daysBeforeText: daysBeforeText,
            dashboardURL: "/galileo/me/dashboard"
        };

        let message = "Hello " + participant.username + "! The " + pilotOrExp + " you've signed up for will begin " + daysBeforeText + "!";

        console.log('about to send new notification args = ');
        console.log(args);

        Meteor.call("galileo.notification.new", participant.user_id, message, url, NotificationType.RUN_1DAY_BEFORE, args); // send the email



        if (user.galileo.phone) {
            console.log('sending sms to   ' + user.galileo.phone + '   ' + user._id);

            if (steps !== null && steps !== undefined) {
                let stepStr = getStepsString(steps);

                message += " Here are the instructions:\n" + stepStr;
                message += "\n Please remember to follow the above instructions starting tomorrow:\n" + stepStr;
            }
            Twilio.sendSMS(user.galileo.phone, message);
        }
    },


    sendStartOfDayMessage: function(ongoingPilotOrExpCursor, pilotOrExpText) {
        const notifyTime = 6; // Hard Coded 5:00 am
        let expMap = {};
        ongoingPilotOrExpCursor.map((pilotOrExp) => {

            let group = "control";
            if (pilotOrExp["group"] === ConditionGroup.EXPERIMENTAL) {
                group = "experimental";
            }
            let user = Meteor.users.find({
                _id: pilotOrExp.user_id
            }, {
                fields: {
                    "username": 1,
                    "galileo.phone": 1,
                    "galileo.remindByEmail": 1
                }
            }).fetch()[0];

            let exp = Meteor.call("galileo.experiments.getExperiment", pilotOrExp.exp_id);

            if (user.galileo && (user.galileo.phone || user.galileo.remindByEmail)) {

                let nowInGMT = Time.getNowInGmt();

                let ts = new TimeSpan(pilotOrExp.user_startDate_inGmt, nowInGMT);
                let hourDiff = (ts.getHours() % 24);
                let day = Math.floor(ts.getDays());
                console.log('day = ' + day);
                console.log('hourDiff = ' + hourDiff);
                
                if (!expMap[pilotOrExp.exp_id]) {
                    expMap[pilotOrExp.exp_id] = Meteor.call("galileo.experiments.getExperiment", pilotOrExp.exp_id);
                }

                let exp = expMap[pilotOrExp.exp_id];
                let groupInfo = exp.design["condition"][group];
                let steps = groupInfo["steps"];

                this.sendStartOfDayEmailOrSms(user, day, steps, pilotOrExpText, exp);
        }
        });
    },


    sendStartOfDayEmailOrSms: function(user, day, steps, pilotOrExp, exp) {
        if (!user || !user.galileo) {
            return;
        }

        if (steps === null || steps === undefined) {
            return;
        }
        let cause_time = transcribeTime(exp.design.cause_measure.time);
        let effect_time = transcribeTime(exp.design.effect_measure.time);

        if (user.galileo.remindByEmail) {
            let args = {
                username: user.username,
                day: (day + 1),
                steps: steps,
                pilotOrExp: pilotOrExp,
                cause_time: cause_time,
                effect_time: effect_time
            };

            //send email
            console.log('sending start of day email to ' + user.username);
            Meteor.call("galileo.notification.new", user._id, null, null, NotificationType.START_DAY_MESSAGE, args);
        } else if (user.galileo.phone) {
            console.log('sending start of day sms to ' + user.username);
            //let message = "[EXPERIMENT STEPS MAY HAVE CHANGED]\n";
            let message = "Welcome to your " + pilotOrExp + "'s day " + (day + 1) + "! Please check your messages at " + cause_time + " and " + effect_time + " to record the experiment data.";
            let stepStr = getStepsString(steps);
            if (stepStr.length === 1) {
                message += " Please remember to follow these instruction: \n" + stepStr;
            } else if (stepStr.length > 1) {
                message += " Please remember to follow these instructions: \n" + stepStr;
            }
            Twilio.sendSMS(user.galileo.phone, message);
        }
    },

    sendMeasureNotification: function(user, day, reminderText, pilotOrExp, expId, causeOrEffect, dayNum) {
        if (!user || !user.galileo) {
            return;
        }

        let greeting = "[" + pilotOrExp.toUpperCase() + " DAY " + (day + 1) + "]";
        let message = greeting + " " + reminderText;

        if (user.galileo.remindByEmail) {
            let url = "/galileo/me/dashboard/" + expId + "/" + user._id;
            let args = {
                username: user.username,
                greeting: greeting,
                reminderText: reminderText,
                type: causeOrEffect,
                day: (dayNum + 1)
            };

            //send email
            console.log('sending email to ' + user.username);
            let type = NotificationType.MEASURE_DATA;
            Meteor.call("galileo.notification.new", user._id, message, url, type, args);
        } else if (user.galileo.phone) {
            console.log('sending notification to ' + user.galileo.phone);
            Twilio.sendSMS(user.galileo.phone, message);
        }
    },

    sendPostPilotOrExpNotification: function(participantUserId, exp, type, pilotOrExp) {
        let participantDetails = Meteor.users.findOne(participantUserId, {
            fields: {
                "galileo.phone": 1,
                "username": 1
            }
        });

        if (!exp || !participantDetails || !participantDetails.galileo) {
            return;
        }

        console.log('~~~~~~~~~~ sending end experiment notif for ' + participantDetails.username);

        let message = "Congratulations! You have successfully completed your " + pilotOrExp + "!";
        if (pilotOrExp === 'pilot') {
            message += " Please log in to Galileo to give feedback about your Pilot experience.";
        } else {
            message += " Please wait while Galileo analyzes your data.";
        }

        if (participantDetails.galileo.phone) {
            Twilio.sendSMS(participantDetails.galileo.phone, message);
        }

        let expTitle = "Does " + exp.design.cause + " affect " + exp.design.effect + "?";
        let args = {
            username: participantDetails.username,
            expTitle: expTitle,
            expId: exp._id,
            pilotOrExp: pilotOrExp
        };

        //send email
        let url = "/galileo/me/dashboard"
        Meteor.call("galileo.notification.new", participantUserId, message, url, type, args);
    },

    determineUpdateType: function(pilotOrExp, day) {
        console.log('~~~~~~~~~~~~~~~~~ determineUpdateType, day = ' + day);
        console.log(pilotOrExp);
        let causeSlot = pilotOrExp["cause_data"][day];
        let effectSlot = pilotOrExp["effect_data"][day];
        if (causeSlot["status"] === ParticipationSlotStatus.SENT && effectSlot["status"] === ParticipationSlotStatus.SENT) {
            let causeMsgSentTime = causeSlot["start_time"];
            let effectMsgSentTime = effectSlot["start_time"];
            if (!causeMsgSentTime || !effectMsgSentTime) {
                throw new Error("missing message sent time");
            }
            return causeMsgSentTime > effectMsgSentTime ? "cause" : "effect";
        } else if (causeSlot["status"] === ParticipationSlotStatus.SENT) {
            return "cause";
        } else if (causeSlot["status"] === ParticipationSlotStatus.COMPLETE && effectSlot["status"] !== ParticipationSlotStatus.SENT) {
            return "cause_detail";
        } else if (effectSlot["status"] === ParticipationSlotStatus.SENT) {
            return "effect";
        } else if (effectSlot["status"] === ParticipationSlotStatus.COMPLETE) {
            return "effect_detail";
        } else {
            console.log("in dtermineUpdateType... No data slot available");
            throw new Error("No data slot available");
        }
    },

    parseMessage: function(measure, message) {
        let type = measure.type;
        let unit = measure.unit;
        switch (type) {
            case MeasureType.ABS_PRES:
                if (message.trim().toLowerCase() === "yes") {
                    return true;
                } else if (message.trim().toLowerCase() === "no") {
                    return false;
                } else {
                    throw new Meteor.Error("Invalid Input");
                }

            case MeasureType.AMOUNT:
                let amount = parseFloat(message);
                if (amount !== undefined) {
                    return amount;
                } else {
                    throw new Meteor.Error("Invalid Input");
                }

            case MeasureType.RATING:
                let rating = parseInt(message);
                if (rating !== undefined) {
                    if (rating >= 1 && rating <= 5) {
                        return rating;
                    } else {
                        throw new Meteor.Error("Invalid Input");
                    }
                } else {
                    throw new Meteor.Error("Invalid Input");
                }

            case MeasureType.RATE: //Rate = Speed
                let rate = parseFloat(message);
                if (rate !== undefined) {
                    if (unit) {
                        return rate;
                    } else {
                        // no unit defined for speed, so measuring on a scale of 1-5
                        if (rate >= 1 && rate <= 5) {
                            return rate;
                        } else {
                            throw new Meteor.Error("Invalid Input");
                        }
                    }
                } else {
                    throw new Meteor.Error("Invalid Input");
                }

            case MeasureType.FREQUENCY:
                let freq = parseInt(message);
                if (freq !== undefined) {
                    return freq;
                } else {
                    throw new Meteor.Error("Invalid Input");
                }

            case MeasureType.BRISTOL:
                let bristol = parseInt(message);
                if (bristol !== undefined && message.length == 1) {
                    if (bristol >= 0 && bristol <= 7) {
                        return bristol;
                    } else if (message.length > 0) {
                        return message;
                    } else {
                        throw new Meteor.Error("Invalid Input");
                    }
                } else {
                    throw new Meteor.Error("Invalid Input");
                }

            default:
                throw new Meteor.Error("Invalid Type");
        }
    }
};

function transcribeTime(t) {
    return (t == 12) ? "12:00 noon" : t > 12 ? ((t - 12) + ":00 pm") : (t + ":00 am");
}

function generateDataArray(duration) {
    let arr = [];
    for (let i = 0; i < duration; i++) {
        arr.push({
            "status": ParticipationSlotStatus.PREPARING,
            "compliance": ""
        });
    }
    return arr;
}


function getStepsString(steps) {
    let stepStr = "";
    for (let i = 0; i < steps.length; i++) {
        stepStr += (i + 1) + ". " + steps[i] + "\n";
    }
    return stepStr;
}