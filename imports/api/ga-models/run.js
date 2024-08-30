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
    ErrorMessage,
    ExperimentStatus,
    NotificationType,
    ParticipationStatus,
    ParticipationSlotStatus
} from "./constants";
import {
    ExperimentHelper
} from "./commonExperimentHelpers";

export const Participations = new Mongo.Collection('ga_experiment_participations');

Meteor.methods({
    'galileo.run.canParticipate': function(expId) {

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
                "galileo.phone": 1,
                "galileo.remindByEmail": 1
            },
            limit: 1
        }).fetch();

        if (!users || users.length === 0) {
            //this is a bug on our part -- maybe we deleted something on the db we shouldn't have
            throw new Meteor.Error("Oops, we cannot find your account in our database. Please email us at gutinstinct@ucsd.edu");
        }

        let user = users[0];

        // Check if the experiment exists
        let exp = Meteor.call("galileo.experiments.getExperiment", expId);
        if (!exp) {
            throw new Meteor.Error("Oops, we cannot find this experiment in our database. Please email us at gutinstinct@ucsd.edu");
        }

        let status = Meteor.call('galileo.experiments.getStatus', expId);

        if (status === ExperimentStatus.STARTED) {
            throw new Meteor.Error(ErrorMessage.EXP_START, "Sorry, the experiment has already begun. You may add yourself to the waitlist for the experiment")
        } else if (status === ExperimentStatus.FINISHED) {
            throw new Meteor.Error(ErrorMessage.EXP_END, "Sorry, the experiment has ended. You may add yourself to the waitlist for the experiment")
        }

        //user created this experiment
        if (Meteor.call("galileo.experiments.isCreator", expId)) {
            throw new Meteor.Error("You cannot join this experiment because you've created this experiment.");
        }

        //user is already in a pilot or participating of another experiment
        if (Meteor.call("galileo.pilot.hasOngoingPilot")) {
            throw new Meteor.Error("You already have an ongoing pilot. You can participate in an experiment when you are NOT piloting or participating in any other experiment.");
        }

        if (Meteor.call("galileo.run.hasOngoingParticipation", user._id)) {
            throw new Meteor.Error("You are already participating in an experiment. You can participate in an experiment when you are NOT piloting or participating in any other experiment.");
        }

        //user is reviewing this experiment
        if (Meteor.call("galileo.feedback.isFeedbacking", expId, '/canParticipate')) {
            throw new Meteor.Error(ErrorMessage.IS_REVIEWER_CANNOT_JOIN);
        }

        //not needed because mother check (hasOngoingPilot) done before any pilot
        //user is piloting or is participating in this experiment
        //if (Meteor.call("galileo.pilot.isPilot", expId)) {
        //  throw new Meteor.Error("You are a pilot user for the experiment");
        //}

        // taken care of in hasOngoingParticipation
        //vineet - i think this check needs to be done to check participating in the same exp
        //if (Meteor.call("galileo.run.isParticipant", expId)) {
        //throw new Meteor.Error("You are already a participant for this experiment.You cannot pilot and participate in the same experiment. ");
        //}

        //user has piloted this experiment
        if (Meteor.call("galileo.pilot.hasPiloted", expId)) {
            throw new Meteor.Error("You have already piloted this experiment. You cannot participate in an experiment you have already piloted.");
        }

        //failed the criteria to join
        if (Meteor.call("galileo.run.hasFailedCriteria", expId)) {
            throw new Meteor.Error("You do not meet the criteria to participate in this experiment");
        }

        if (!user.galileo || (!user.galileo.remindByEmail && (!user.galileo.phone || user.galileo.phone === ""))) {
            throw new Meteor.Error(ErrorMessage.MISSING_PHONE, "Please add a phone number in your profile page to begin");
        }

        return true;
    },
    'galileo.run.addToWaitlist': function(expId) {
        Experiments.update({
            "_id": expId
        }, {
            $addToSet: {
                "waitlist_users": Meteor.userId()
            }
        });
        let exp = Meteor.call("galileo.experiments.getExperiment", expId);
        let participationObj = ExperimentHelper.getPilotParticipationCommonObject(exp, Meteor.user(), ParticipationStatus.WAITLIST, -1, null, null, null, null, null);
        Participations.insert(participationObj);
    },
    'galileo.run.isWaitlisting': function(expId) {
        return Participations.find({
            "user_id": Meteor.userId(),
            "exp_id": expId,
            "status": {
                $eq: ParticipationStatus.WAITLIST
            }
        }).count() > 0;
    },
    'galileo.run.isParticipating': function(expId) {
        return Participations.find({
            "user_id": Meteor.userId(),
            "exp_id": expId,
            "status": {
                $gte: ParticipationStatus.PASSED_CRITERIA,
                $lt: ParticipationStatus.FINISHED
            }
        }).count() > 0;
    },
    'galileo.run.hasParticipated': function(expId) {
        return Participations.find({
            "user_id": Meteor.userId(),
            "exp_id": expId,
            "status": ParticipationStatus.FINISHED
        }).count() > 0;
    },
    'galileo.run.getParticipantStatus': function(expId) {
        if (Meteor.call("galileo.experiments.hasEnded", expId)) {
            return ParticipationStatus.FINISHED;
        }

        let participant = Participations.find({
            "user_id": Meteor.userId(),
            "exp_id": expId
        }).fetch()[0];

        if (participant && participant.status) {
            return participant.status;
        } else {
            return null;
        }
    },
    'galileo.run.isParticipant': function(expId) {
        return Participations.find({
            "user_id": Meteor.userId(),
            "exp_id": expId,
            "status": {
                $gte: ParticipationStatus.CONSENTED
            }
        }).count() > 0;
    },
    'galileo.run.isFailedCriteria': function(expId) {
        return Participations.find({
            "user_id": Meteor.userId(),
            "exp_id": expId,
            "status": ParticipationStatus.FAILED_CRITERIA
        }).count() > 0;
    },
    'galileo.run.getOngoingParticipation': function(userId) {
        return Participations.find({
            "user_id": userId || Meteor.userId(),
            "status": {
                $gte: ParticipationStatus.PASSED_CRITERIA,
                $lt: ParticipationStatus.FINISHED
            }
        }, {
            limit: 1,
            sort: {
                "join_date_time": -1
            }
        }).fetch()[0];
    },
    'galileo.run.hasOngoingParticipation': function(userId) {
        let count = Participations.find({
            "user_id": userId || Meteor.userId(),
            "status": {
                $gte: ParticipationStatus.PASSED_CRITERIA,
                $lt: ParticipationStatus.FINISHED
            }
        }).count();

        return (count > 0);
    },

    'galileo.run.submitCriteria': function(expId, selection) {
        let exp = Meteor.call("galileo.experiments.getExperiment", expId);
        let design = exp.design;
        let ic = design.criteria.inclusion,
            ec = design.criteria.exclusion;
        let failedExclusion = [];
        let failedInclusion = [];

        for (let i in selection) {
            for (let j in ec) {
                if (selection[i] === ec[j]) {
                    failedExclusion.push(ec[j])
                }
            }
        }
        for (let i in ic) {
            let inSelection = false;
            for (let j in selection) {
                if (ic[i] === selection[j]) {
                    inSelection = true;
                }
            }
            if (!inSelection) {
                failedInclusion.push(ic[i])
            }
        }

        if (failedExclusion.length !== 0 || failedInclusion.length !== 0) {
            Meteor.call("galileo.run.failedCriteria", exp, failedExclusion, failedInclusion);
            return false;
        }
        Meteor.call("galileo.run.passedCriteria", exp);

        return true;
    },
    'galileo.run.getFailedCriteriaList': function(expId) {
        //todo simplify this
        let part = Participations.find({
            "user_id": Meteor.userId(),
            "exp_id": expId,
        });
        let p = part.fetch()[0];
        return [p.failedInclusion, p.failedExclusion];
    },
    'galileo.run.hasFailedCriteria': function(expId) {
        //todo simplify this
        let part = Participations.find({
            "user_id": Meteor.userId(),
            "exp_id": expId
        });
        return part.count() > 0 ? part.fetch()[0].status === ParticipationStatus.FAILED_CRITERIA : false;
    },
    'galileo.run.failedCriteria': function(exp, failedExclusion, failedInclusion) {
        let participationObj = ExperimentHelper.getPilotParticipationCommonObject(exp, Meteor.user(), ParticipationStatus.FAILED_CRITERIA, -1, null, null, failedExclusion, failedInclusion, null);
        Participations.insert(participationObj);
    },
    'galileo.run.passedCriteria': function(exp) {
        let participationObj = ExperimentHelper.getPilotParticipationCommonObject(exp, Meteor.user(), ParticipationStatus.PASSED_CRITERIA_HASNT_AGREED, -1, exp.start_date_time, exp.duration, null, null, -1);
        participationObj.join_date_time = new Date();
        Participations.insert(participationObj);

        return true;
    },

    'galileo.run.addToExp': function(exp) {
        let participantList = Participations.find({
            group: -1,
            participantIndex: -1,
            exp_id: exp._id,
            user_id: Meteor.userId(),
            status: ParticipationStatus.PASSED_CRITERIA_HASNT_AGREED
        }).fetch();

        console.log(participantList);

        if (participantList.length > 0) {
            let participantStatus = ParticipationStatus.PASSED_CRITERIA;

            if (exp.status === ExperimentStatus.PREPARING_TO_START) {
                // The experiment is in "preparing mode"
                // So the new participants that join now, will also need to be set in preparing mode
                participantStatus = ParticipationStatus.PREPARING;
            }

            let group = getNextGroup(exp._id);
            let participantIndex = getPaticipantIndex(exp._id, group);
            let participantMapping = generateUserMap(group, participantIndex);

            Participations.update({
                user_id: Meteor.userId(),
                status: ParticipationStatus.PASSED_CRITERIA_HASNT_AGREED,
                exp_id: exp._id,
            }, {
                $set: {
                    status: participantStatus,
                    group: group,
                    participantIndex: participantIndex,
                    participantMap: participantMapping
                }
            });

            Participations.remove({
                user_id: Meteor.userId(),
                status: ParticipationStatus.PASSED_CRITERIA_HASNT_AGREED
            });

            participantList = Participations.find({
                exp_id: exp._id,
                user_id: Meteor.userId(),
                status: {
                    $gte: ParticipationStatus.PASSED_CRITERIA,
                    $lte: ParticipationStatus.PREPARING
                }
            }).fetch();

            let participationObj = participantList[0];

            let message = "[" + participationObj.participantMap + "] just joined your experiment [" + exp.design.cause + " " + exp.design.relation + " " + exp.design.effect + "]";
            let url = "/galileo/me/dashboard";

            let current_count = exp.run_users.length + 1;
            let part_left = exp.min_participant_count - current_count;

            let args = {};
            if (part_left > 0) {
                args = {
                    current_count: current_count,
                    part_left: part_left,
                    show_num_left: "true"
                }
            } else {
                args = {
                    current_count: current_count,
                    part_left: part_left,
                    show_num_left: "false"
                }
            }

            Meteor.call("galileo.experiments.sendEmail", exp._id, NotificationType.NEW_RUN_PARTICIPANT, message, url, args, function(err) {
                if (err) {
                    Materialize.toast(err, 3000, "toast rounded");
                }
            });

            if (exp.status === ExperimentStatus.PREPARING_TO_START) {
                // This email is sent to participants when creator of experiment clicks on "Start experiment" button
                // Since this kind of participant joined AFTER the creator clicked that button, we need to send them this email here
                // TODO
                // ExperimentHelper.sendPilotOrExpWillBeginNotification(participationObj, exp, exp.duration, date, type, url, 'experiment');
            }

            Experiments.update({
                "_id": exp._id
            }, {
                $addToSet: {
                    "run_users": participationObj.participantMap
                }
            });

            return true;
        } else {
            return false;
        }
    },

    'galileo.run.runExperiment': function(expId, duration, date) {
        console.log('~~~~~~~~~~~~~~~~~runExperiment');

        if (!Meteor.call("galileo.experiments.hasExperiment", expId)) {
            throw new Meteor.Error("Experiment Not Found");
        }
        if (!Meteor.call("galileo.experiments.isCreator", expId)) {
            throw new Meteor.Error("You are not the creator of this experiment");
        }
        if (!Meteor.call("galileo.experiments.canRun", expId)) {
            throw new Meteor.Error("You cannot run this experiment right now because the Experiment state is not STARTED");
        }


        let exp = Meteor.call("galileo.experiments.getExperiment", expId);
        if (!exp) {
            return;
        }
        let type = NotificationType.RUN_STARTED_FOR_PARTICIPANT;

        // all participants that had joined previously, their status will become "preparing"
        Participations.find({
            exp_id: expId,
            status: ParticipationStatus.PASSED_CRITERIA
        }, {
            fields: {
                user_id: 1,
                group: 1
            }
        }).map((participant) => {
            let user = Meteor.users.findOne(participant.user_id, {
                fields: {
                    "galileo.timezone": 1,
                    "galileo.isDst": 1
                }
            });
            let timezone = ExperimentHelper.getTimezoneOffset(user);
            let updateObj = ExperimentHelper.getStartDateBasedExpParams(date, duration, timezone);
            updateObj.status = ParticipationStatus.PREPARING;
            Participations.update({
                _id: participant._id
            }, {
                $set: updateObj
            });

            let url = "/galileo/me/dashboard/" + expId + "/" + participant.user_id;

            ExperimentHelper.sendPilotOrExpWillBeginNotification(participant, exp, duration, date, type, url, 'experiment');
        });


        Experiments.update({
            _id: expId
        }, {
            $set: {
                "status": ExperimentStatus.PREPARING_TO_START,
                "start_date_time": date, //todo: maybe experiment start_date_time should be removed
                "duration": duration //todo: maybe experiment duration should be removed
            }
        });

        exp = Meteor.call("galileo.experiments.getExperiment", expId);

        ExperimentHelper.sendDayBeforeExpStartCreator(exp, "experiment", 1);

        return true;
    },

    'galileo.run.sendStartOfDayMessage': function() {
        console.log('~~~~~~~~~~~~~~~~~sendStartOfDayMessage for exp');

        let nowInGMT = Time.getNowInGmt();
        let nowHour = nowInGMT.getDate().getHours();

        console.log('measure time should be >' + (nowHour - 1) + ' and <=' + nowHour);

        let tempParticipation = Participations.find({
            status: ParticipationStatus.STARTED,
            user_DailyHour_inGmt: {
                $exists : false
            }
        })

        if (tempParticipation.count() != 0) {
            let parts = tempParticipation.fetch();

            for (i = 0; i < parts.length; i++) {
                let user_id = parts[i].user_id;

                let user = Meteor.users.find({_id: user_id}, {timezone: 1, isDst: 1}).fetch()[0];

                let timezoneOffset = 0;
                if (user.galileo != undefined && user.galileo.timezone != undefined && user.galileo.timezone != undefined) {
                    if (user.galileo.isDst == "0" || user.galileo.isDst == "1") {
                        timezoneOffset = user.galileo.timezone + parseInt(user.galileo.isDst);
                    }
                    else {
                        timezoneOffset = user.galileo.timezone;
                    }
                }
                else {
                    timezoneOffset = -7;
                }

                let dailyHourInGmt = 6 - timezoneOffset;

                Participations.update(
                {
                    _id : parts[i]._id
                }, {
                    $set: {
                        user_DailyHour_inGmt : dailyHourInGmt
                    }
                })
            }
        }

        let ongoingParticipations = Participations.find({
            status: ParticipationStatus.STARTED,
            user_DailyHour_inGmt: {
                $lte: nowHour,
                $gt: nowHour - 1
            }
        })

        /*
        let nowInGMT = Time.getNowInGmt();

        let ongoingParticipations = Participations.find({
            user_startDate_inGmt: {
                $lte: nowInGMT.getDate()
            },
            user_endDate_inGmt: {
                $gt: nowInGMT.getDate()
            },
            status: ParticipationStatus.STARTED
        });
        */
        ExperimentHelper.sendStartOfDayMessage(ongoingParticipations, 'experiment');

    },

    'galileo.run.check1DayBeforeExpStart': function() {
        console.log('~~~~~~~~~~~~~~~~~check1DayBeforeExpStart');

        let expMap = {};
        let userMap = {};

        let nowInGMT = Time.getNowInGmt();

        // This query finds experiment with: (startDate - 1 day) < now < (startDate - 1 day + 1 hr)
        let nowPlus1Day = (new Time(nowInGMT)).addHour(24);
        let nowPlus1DayMinus1Hour = (new Time(nowInGMT)).addHour(23);

        console.log('nowPlus1Day = ' + nowPlus1Day.getDate());
        console.log('nowPlus1DayMinus1Hour = ' + nowPlus1DayMinus1Hour.getDate());
        Participations.find({
            status: ParticipationStatus.PREPARING,
            user_startDate_inGmt: {
                $lte: nowPlus1Day.getDate(),
                $gt: nowPlus1DayMinus1Hour.getDate()
            }
        }).map((participant) => {
            if (userMap[participant.user_id] === undefined) {
                userMap[participant.user_id] = Meteor.users.find({
                    _id: participant.user_id
                }, {
                    fields: {
                        "galileo.phone": 1,
                        "galileo.timezone": 1
                    }
                }).fetch()[0];
            }

            if (expMap[participant.exp_id] === undefined) {
                expMap[participant.exp_id] = Meteor.call("galileo.experiments.getExperiment", participant.exp_id);
            }

            ExperimentHelper.sendDayBeforeExpStartNotification(participant, expMap[participant.exp_id], userMap[participant.exp_id], 'experiment', 1);
        });

        let exps = Meteor.call('galileo.experiments.getExperimentsPreparingToStart');

        for (let i = 0; i < exps.length; i++) {
            let timeSpan = new TimeSpan(nowPlus1DayMinus1Hour, nowPlus1Day);
            let start_date = new Time(new Date(exps[i].start_date_time))
            let sevenAmCreator = start_date.addHour(exps[i].timezone + 7);

            if (timeSpan.within(sevenAmCreator.getDate())) {
                ExperimentHelper.sendDayBeforeExpStartCreator(exps[i], "experiment", 1);
            }
        }
    },

    'galileo.run.check2DayBeforeExpStart': function() {
        console.log('~~~~~~~~~~~~~~~~~check2DayBeforeExpStart');

        let expMap = {};
        let userMap = {};

        let nowInGMT = Time.getNowInGmt();

        // This query finds experiment with: (startDate - 2 days) < now < (startDate - 2 days + 1 hr)
        let nowPlus2Days = (new Time(nowInGMT)).addHour(48);
        let nowPlus2DayMinus1Hour = (new Time(nowInGMT)).addHour(47);

        console.log('nowPlus2Days = ' + nowPlus2Days.getDate());
        console.log('nowPlus2DayMinus1Hour = ' + nowPlus2DayMinus1Hour.getDate());
        Participations.find({
            status: ParticipationStatus.PREPARING,
            user_startDate_inGmt: {
                $lte: nowPlus2Days.getDate(),
                $gt: nowPlus2DayMinus1Hour.getDate()
            }
        }).map((participant) => {
            if (userMap[participant.user_id] === undefined) {
                userMap[participant.user_id] = Meteor.users.find({
                    _id: participant.user_id
                }, {
                    fields: {
                        "galileo.phone": 1,
                        "galileo.timezone": 1
                    }
                }).fetch()[0];
            }

            if (expMap[participant.exp_id] === undefined) {
                expMap[participant.exp_id] = Meteor.call("galileo.experiments.getExperiment", participant.exp_id);
            }

            ExperimentHelper.sendDayBeforeExpStartNotification(participant, expMap[participant.exp_id], userMap[participant.exp_id], 'experiment', 2);
        });
    },

    'galileo.run.getParticipantMap': function(expId, user) {
        if (user === null || user === undefined) {
            return "";
        }
        let part = Participations.find({
            "exp_id": expId,
            "user_id": user._id
        }, {
            fields: {
                participantMap: 1
            },
            sort: {
                join_date_time: -1
            }
        }).fetch();

        if (part.length > 0) {
            return part[0].participantMap;
        } else {
            return user.username;
        }
    },

    'galileo.run.getParticipantMapToUser': function(expId, participant) {
        let part = Participations.find({
            "exp_id": expId,
            "participantMap": participant
        }, {
            fields: {
                user_id: 1
            },
            sort: {
                join_date_time: -1
            }
        }).fetch();

        if (part.length > 0) {
            return part[0].user_id;
        } else {
            return participant;
        }
    },

    'galileo.run.checkExperimentStart': function() {
        console.log('~~~~~~~~~~~~~~~~~checkExperimentStart');

        let startingExperimentIdMap = {};

        let nowInGMT = Time.getNowInGmt();

        Participations.find({
            status: ParticipationStatus.PREPARING,
            user_startDate_inGmt: {
                $lte: nowInGMT.getDate()
            }
        }, {
            fields: {
                _id: 1,
                exp_id: 1
            }
        }).map((participant) => {
            // todo: replace with a query that gives unique experiment ids in return
            console.log(participant._id);
            startingExperimentIdMap[participant.exp_id] = 1;
        });

        // let preparingParticipants = Participations.find({"status":ParticipationStatus.PREPARING});
        // let startingUserIdMap = {};
        // preparingParticipants.map(function(participant) {
        //     let user = Meteor.users.findOne({
        //         _id: participant.user_id
        //     });
        //
        //     console.log('check exp start for ' + user.username);
        //
        //     let nowInGMT = new Time();
        //     // let nowInGMT = (new Time()).addHour(-TIME_OFFSET); // localhost is giving PST, but prod server will give GMT, so for debugging uncomment this line and convert to GMT first
        //     console.log('now in gmt');
        //     console.log(nowInGMT);
        //
        //     let timezoneOffset = ExperimentHelper.getTimezoneOffset(user);
        //     console.log('timezoneOffset ' + timezoneOffset);
        //     let nowInUserTime = nowInGMT.addHour(timezoneOffset);
        //     console.log('now in user time');
        //     console.log(nowInUserTime);
        //
        //     console.log('participant start time');
        //     console.log(participant.start_date_time);
        //
        //     if(nowInUserTime.getDate() > participant.start_date_time) {
        //         console.log('begin experiment for participant', user.username);
        //         startingExperimentIdMap[participant.exp_id] = 1;
        //         startingUserIdMap[participant.user_id] = 1;
        //     }
        // });
        //
        let startingExperiments = Object.keys(startingExperimentIdMap);
        if (startingExperiments.length === 0) {
            console.log('returning');
            return;
        }

        // the statuses of all experiments with ids in "startingExperiments" array are updated
        Experiments.update({
            _id: {
                $in: startingExperiments
            }
        }, {
            $set: {
                status: ExperimentStatus.STARTED
            }
        }, {
            multi: true
        });

        // the statuses of all Participants with exp_ids in "startingExperiments" array are updated
        Participations.update({
            exp_id: {
                $in: startingExperiments
            },
            status: ParticipationStatus.PREPARING
        }, {
            $set: {
                status: ParticipationStatus.STARTED
            }
        }, {
            multi: true
        });
    },

    'galileo.run.checkHalfwayThroughExp': function() {
        console.log('~~~~~~~~~~~~~~~~ checkHalfwayThroughExp');
        console.log(new Date());

        let nowInGMT = Time.getNowInGmt();
        console.log(nowInGMT);

        // start date + 4 days < now < start date + 5 days
        // => now - 5 days < start date < now - 4 days
        let nowMinus5Days = (new Time(nowInGMT)).addDay(-5);
        let nowMinus4Days = (new Time(nowInGMT)).addDay(-4);

        console.log('nowMinus5Days = ' + nowMinus5Days.getDate());
        console.log('nowMinus4Days = ' + nowMinus4Days.getDate());

        let expMap = {};
        Participations.find({
            status: ParticipationStatus.STARTED,
            user_startDate_inGmt: {
                $gte: nowMinus5Days.getDate(),
                $lte: nowMinus4Days.getDate()
            }
        }, {
            fields: {
                _id: 1,
                exp_id: 1,
                user_id: 1,
                cause_data: 1,
                effect_data: 1
            }
        }).map((participant) => {
            console.log(participant._id);
            if (expMap[participant.exp_id] === undefined) {
                expMap[participant.exp_id] = Meteor.call("galileo.experiments.getExperiment", participant.exp_id);
            }
            let exp = expMap[participant.exp_id];
            let expTitle = "Does " + exp.design.cause + " affect " + exp.design.effect + "?";
            let url = "/galileo/me/dashboard/" + participant.exp_id + "/" + participant.user_id;
            let args = {
                otherUser: participant.username,
                expTitle: expTitle,
                pilotOrExp: "experiment"

            };
            let responses = 0;
            for (let i = 0; i < 7; i++) {
                if (participant.cause_data && participant.cause_data[i] && participant.cause_data[i].status >= 2) {
                    responses = responses + 1;
                }
                if (participant.effect_data && participant.effect_data[i] && participant.effect_data[i].status >= 2) {
                    responses = responses + 1;
                }
            }

            if (responses >= 4) {
                Meteor.call("galileo.notification.new", participant.user_id, "", url, NotificationType.RUN_HALFWAY_PARTICIPANT_MORE_THAN_50, args);
            } else {
                Meteor.call("galileo.notification.new", participant.user_id, "", url, NotificationType.RUN_HALFWAY_PARTICIPANT_LESS_THAN_50, args);
            }
        });

        let exps = Meteor.call('galileo.experiments.getExperimentsByDate', nowMinus5Days.getDate(), nowMinus4Days.getDate());
        console.log(exps);

        for (let i = 0; i < exps.length; i++) {
            let expTitle = "Does " + exps[i].design.cause + " affect " + exps[i].design.effect + "?";
            let url_creator = "/galileo/me/dashboard/"
            let args_creator = {
                otherUser: exps[i].username,
                expTitle: expTitle,
                pilotOrExp: "experiment"
            }
            Meteor.call("galileo.notification.new", exps[i].user_id, "", url_creator, NotificationType.RUN_CREATOR_HALFWAY, args_creator);
        }
    },

    'galileo.run.checkExperimentEnd': function() {
        // todo: unify with pilot after testing
        console.log('~~~~~~~~~~ ending experiment');

        let nowInGMT = Time.getNowInGmt();

        let endingExperimentsMap = {};
        Participations.find({
            user_endDate_inGmt: {
                $lt: nowInGMT.getDate()
            },
            status: ParticipationStatus.STARTED
        }, {
            fields: {
                _id: 1,
                user_id: 1,
                exp_id: 1
            }
        }).map((part) => {
            try {
                Participations.update({
                    _id: part._id
                }, {
                    $set: {
                        status: ParticipationStatus.FINISHED
                    }
                });

                console.log('ending exp for participation id = ' + part._id);

                if (endingExperimentsMap[part.exp_id] === undefined) {
                    endingExperimentsMap[part.exp_id] = Meteor.call("galileo.experiments.getExperiment", part.exp_id);
                }

                //notify participant about experiment ending ending
                ExperimentHelper.sendPostPilotOrExpNotification(part.user_id, endingExperimentsMap[part.exp_id], NotificationType.RUN_COMPLETED_PARTICIPANT, 'experiment');
            } catch (e) {
                console.error('Exception in processing end experiment');
                console.error(e);
            }
        });


        let endingExperiments = Object.keys(endingExperimentsMap);
        console.log('~~~~~~~~~~ ending experiment ids = ');
        console.log(endingExperiments);
        if (endingExperiments.length === 0) {
            return;
        }

        endingExperiments.map(function(expId) {
            console.log('~~~~~~~~~~ mapping on ended experiments');
            let exp = endingExperimentsMap[expId];

            let totalParticipantsForExp = exp.run_users.length;
            let totalParticipationsEnded = Participations.find({
                "exp_id": expId,
                status: ParticipationStatus.FINISHED
            }, {
                fields: {
                    _id: 1
                }
            }).count();

            console.log('totalParticipantsForExp = ' + totalParticipantsForExp + '  totalParticipationsEnded = ' + totalParticipationsEnded);
            if (totalParticipantsForExp === totalParticipationsEnded) {
                // all participants status have finished
                Experiments.update({
                    _id: expId
                }, {
                    $set: {
                        "status": ExperimentStatus.FINISHED
                    }
                }, {
                    multi: true
                });

                let args = {
                    pilotOrExp: "experiment"
                };

                // notify experiment owner about experiment end
                let message = "Congratulations! Your experiment has ended!";
                let url = "/galileo/me/dashboard";
                Meteor.call("galileo.experiments.sendEmail", expId, NotificationType.RUN_COMPLETED_CREATOR, message, url, args, function(err) {
                    if (err) {
                        Materialize.toast(err, 3000, "toast rounded");
                    }
                });
            }
        });
    },

    // User
    'galileo.run.getParticipation': function(expId) {
        return Participations.findOne({
            "exp_id": expId,
            "user_id": Meteor.userId()
        });
    },

    'galileo.run.setParticipationByExpID': function(expId, causeData, effectData) {
        Participations.update({
            "exp_id": expId,
            "user_id": Meteor.userId()
        }, {
            $set: {
                "cause_data": causeData,
                "effect_data": effectData
            }
        });
    },

    'galileo.run.getCurrentParticipationForUser': function(userId) {
        // we assume one single user can only start one exp at a given time
        // we return that Participations object
        return Participations.findOne({
            "user_id": userId,
            "status": ParticipationStatus.STARTED
        });
    },

    'galileo.run.sendCauseEffectMessage': function() {
        let expMap = {};
        let userMap = {};
        let dayMap = {};

        console.log('~~~~~~~~~~~~~sendCauseEffectMessage');
        let nowInGMT = Time.getNowInGmt();

        let nowHour = nowInGMT.getDate().getHours();

        console.log('measure time should be >' + (nowHour - 1) + ' and <=' + nowHour);

        // Query for causeHour <= nowHour < causeHour + 1
        Participations.find({
            status: ParticipationStatus.STARTED,
            user_causeHour_inGmt: {
                $lte: nowHour,
                $gt: nowHour - 1
            }
        }).map((participant) => {
            try {
                console.log(participant._id);
                if (expMap[participant.exp_id] === undefined) {
                    expMap[participant.exp_id] = Meteor.call("galileo.experiments.getExperiment", participant.exp_id);
                }
                if (userMap[participant.user_id] === undefined) {
                    userMap[participant.user_id] = Meteor.users.findOne(participant.user_id);
                }
                if (dayMap[participant.exp_id] === undefined) {
                    dayMap[participant.exp_id] = ExperimentHelper.getExperimentOrPilotDayNumber(participant);
                }

                processMeasureSms(participant, expMap[participant.exp_id], userMap[participant.user_id], "cause", dayMap[participant.exp_id]);
            } catch (e) {
                console.error('Exception in processing cause notification');
                console.error(e);
            }
        });

        // Query for effectHour < nowHour < effectHour + 1
        Participations.find({
            status: ParticipationStatus.STARTED,
            user_effectHour_inGmt: {
                $lte: nowHour,
                $gt: nowHour - 1
            }
        }).map((participant) => {
            try {
                if (expMap[participant.exp_id] === undefined) {
                    expMap[participant.exp_id] = Meteor.call("galileo.experiments.getExperiment", participant.exp_id);
                }
                if (userMap[participant.user_id] === undefined) {
                    userMap[participant.user_id] = Meteor.users.findOne(participant.user_id);
                }
                if (dayMap[participant.exp_id] === undefined) {
                    dayMap[participant.exp_id] = ExperimentHelper.getExperimentOrPilotDayNumber(participant);
                }

                processMeasureSms(participant, expMap[participant.exp_id], userMap[participant.user_id], "effect", dayMap[participant.exp_id]);
            } catch (e) {
                console.error('Exception in processing effect notification');
                console.error(e);
            }
        });
    },


    'galileo.run.sendInterventionMessage': function() {
        let expMap = {};
        let userMap = {};
        let dayMap = {};

        console.log('~~~~~~~~~~~~~sendCauseEffectMessage');
        let nowInGMT = Time.getNowInGmt();

        let nowHour = nowInGMT.getDate().getHours();

        console.log('measure time should be >' + (nowHour - 1) + ' and <=' + nowHour);

        // Query for causeHour <= nowHour < causeHour + 1
        Participations.find({
            status: ParticipationStatus.STARTED,
            user_interventionHour_inGmt: {
                $exists: true,
                $lte: nowHour,
                $gt: nowHour - 1
            }
        }).map((participant) => {
            try {
                console.log(participant._id);
                if (expMap[participant.exp_id] === undefined) {
                    expMap[participant.exp_id] = Meteor.call("galileo.experiments.getExperiment", participant.exp_id);
                }
                if (userMap[participant.user_id] === undefined) {
                    userMap[participant.user_id] = Meteor.users.findOne(participant.user_id);
                }
                if (dayMap[participant.exp_id] === undefined) {
                    dayMap[participant.exp_id] = ExperimentHelper.getExperimentOrPilotDayNumber(participant);
                }

                processInterventionSms(participant, expMap[participant.exp_id], userMap[participant.user_id], "intervention", dayMap[participant.exp_id]);
            } catch (e) {
                console.error('Exception in processing cause notification');
                console.error(e);
            }
        });
    },


    // this function will be triggered when we get new inbound message from twilio
    'galileo.run.processMessageFromParticipation': function(user, participation, fromNumber, message) {
        if (user === null || user === undefined) {
            return "User Not Found";
        }

        if (participation === null || participation === undefined) {
            return "No Ongoing Experiment";
        }

        console.log('~~~~~~~~~~~processMessageFromParticipation');
        let exp = Meteor.call("galileo.experiments.getExperiment", participation["exp_id"]);

        let nowInGMT = Time.getNowInGmt();

        if (nowInGMT.getDate() >= participation.user_startDate_inGmt &&
            nowInGMT.getDate() < participation.user_endDate_inGmt) {
            console.log('updating participation messages');
            // Store the message to the database
            Participations.update(participation._id, {
                $push: {
                    "messages": {
                        "from": fromNumber,
                        "message": message,
                        "time": nowInGMT.getDate()
                    }
                }
            });

            // get current experiment day to insert data
            let day = ExperimentHelper.getExperimentOrPilotDayNumber(participation);
            console.log('~~~~~~~~~~~day = ' + day);

            // check which slot to insert
            try {

                let type = ExperimentHelper.determineUpdateType(participation, day);
                console.log('~~~~~~~~~~~determined type =');
                console.log(type);

                console.log('~~~~~~~~~~~exp =');
                console.log(exp);

                let measure;
                let reply_string;
                if (type.indexOf("detail") >= 0) {
                    measure = "detail_string";
                    reply_string = "Thank you for providing detailed information.";
                } else {
                    if (type === "cause" && exp.design && exp.design.followup_message_cause && exp.design.followup_message_cause.length > 0) {
                        reply_string = exp.design.followup_message_cause;
                    } else if (type === "effect" && exp.design && exp.design.followup_message_effect && exp.design.followup_message_effect.length > 0) {
                        reply_string = exp.design.followup_message_effect;
                    } else {
                        reply_string = "Your data has been successfully stored. Add more details about your activity in the past day to improve the quality of your results. Did you do something unique? Tell us more...";
                    }
                    measure = exp["design"][type + "_measure"];
                }

                console.log('~~~~~~~~~~~measure =');
                console.log(measure);

                // Parse the message to get the value and update the database
                try {
                    let value;
                    // we only parse if it not a detail string
                    if (measure != "detail_string") {
                        value = ExperimentHelper.parseMessage(measure, message);
                    } else {
                        value = message;
                    }

                    updateData(participation, type, day, value);

                    console.log('~~~~~~~~~~~parseMessage =');
                    console.log(value);
                    console.log('returning Nice! The data is successfully stored in your tracking sheet');


                    return reply_string;
                } catch (parseErr) {

                    // If error then reply error
                    updateError(participation, type, day, parseErr);
                    console.log('returning Sorry, the data you provided is invalid');
                    console.log(parseErr);
                    return "Sorry, the data you provided is invalid.";
                }
            } catch (e) {
                console.log('Sorry, there\'s no available slot to add the data. Please wait for the text message reminder');
                return "Sorry, there's no available slot to add the data. Please wait for the text message reminder."
            }
        } else {
            console.log('No Ongoing Experiment');
            return "No Ongoing Experiment.";
        }
    },
    "galileo.run.phoneNumIsParticipating": function(phone) {
        let user = Meteor.call("galileo.getUserByPhoneNumber", phone);
        if (user) {
            return Meteor.call("galileo.run.hasOngoingParticipation", user["_id"]);

        } else {
            return false;
        }
    },
    "galileo.run.updateData": function(id, type, day, val) {
        let part = Participations.findOne({
            _id: id
        });
        updateData(part, type, day, val);
    },
    "galileo.run.updateDataUserId": function(userId, type, day, val, expId) {
        let part = Participations.findOne({
            user_id: userId,
            exp_id: expId,
            status: {
                $gte: ParticipationStatus.STARTED
            }
        });

        let type_new = type + "_detail";
        updateData(part, type_new, day, val);

        return true;
    }
});



function processInterventionSms(part, exp, user, type, day) {
    let data = part["intervention_data"];
    if (data === undefined) {
        data = [{
                status: 0,
                compliance: 0
            },
            {
                status: 0,
                compliance: 0
            },
            {
                status: 0,
                compliance: 0
            },
            {
                status: 0,
                compliance: 0
            },
            {
                status: 0,
                compliance: 0
            },
            {
                status: 0,
                compliance: 0
            },
            {
                status: 0,
                compliance: 0
            }
        ]

        Participations.update(part._id, {
            $set: {
                intervention_data: data
            }
        });
    }
    let design = exp["design"];
    if (data[day]["status"] === ParticipationSlotStatus.PREPARING) {
        // Send notification message
        let reminderText = design["intervention_measure"]["reminderText"];
        ExperimentHelper.sendMeasureNotification(user, day, reminderText, 'experiment', exp._id, type, day);

        // Push the slot to the database
        let setobj = {};
        setobj["intervention_data." + day + ".status"] = ParticipationSlotStatus.SENT;
        setobj["intervention_data." + day + ".start_time"] = new Date();
        Participations.update(part._id, {
            $set: setobj
        });


    }
}

function processMeasureSms(part, exp, user, type, day) {
    let data = part[type + "_data"];
    let design = exp["design"];
    if (data[day]["status"] === ParticipationSlotStatus.PREPARING) {
        // Send notification message
        let reminderText = design[type + "_measure"]["reminderText"];
        ExperimentHelper.sendMeasureNotification(user, day, reminderText, 'experiment', exp._id, type, day);

        // Push the slot to the database
        let setobj = {};
        setobj[type + "_data." + day + ".status"] = ParticipationSlotStatus.SENT;
        setobj[type + "_data." + day + ".start_time"] = new Date();
        Participations.update(part._id, {
            $set: setobj
        });


    }
}


function updateError(part, type, day, error) {

    // First cache the array
    let arr = part[type + "_data"];

    // Check if the data is already completed;
    if (arr[day].status === ParticipationSlotStatus.COMPLETE) {

    } else {
        let setobj = {};
        setobj[type + "_data." + day] = {
            "error_time": new Date(),
            "status": ParticipationSlotStatus.ERROR,
            "error": error
        };

        //todo: unify with pilot, figure out how to pass collection as argument
        Participations.update(part._id, {
            $set: setobj
        });
    }
}

/**
 *
 * @param part: experiment participation object
 * @param type: type to perform data update
 * @param day: which day in experiment
 * @param value: value to update
 */

function updateData(part, type, day, value) {

    // Check if the user exists
    // if (!Meteor.userId()) {
    //     throw new Meteor.Error("not-authorized");
    // }


    // if (!part || part.user_id !== Meteor.userId()) {
    //     throw new Meteor.Error("not-participating");
    // }

    // First get the day to update
    // var day = 0;
    // for (var i = 0; i < part[type + "_data"].length; i++) {
    //     if (part[type + "_data"][i]["status"] === ParticipationSlotStatus.PREPARING) {
    //         day = i;
    //         break;
    //     }
    // }

    // Then update the value
    let obj = {};

    // update followup details
    if (type.indexOf("detail") >= 0) {
        type = type.replace("_detail", "");

        let currentLog = Participations.findOne(part._id);

        console.log("in updateData with type: " + type);
        obj[type + "_data." + day] = {
            "start_time": currentLog[type + "_data"][parseInt(day)]["start_time"],
            "compliance": currentLog[type + "_data"][parseInt(day)]["compliance"],
            "followup_time": new Date(),
            "status": ParticipationSlotStatus.FOLLOW_COMPLETE,
            "detail": value,
            "value": currentLog[type + "_data"][parseInt(day)]["value"],
            "complete_time": currentLog[type + "_data"][parseInt(day)]["complete_time"]
        };

        console.log("in updateData with obj: " + value);

        Participations.update(part._id, {
            $set: obj
        });
    }
    // update with data
    else {
        let currentLog = Participations.findOne(part._id);
        obj[type + "_data." + day] = {
            "start_time": currentLog[type + "_data"][parseInt(day)]["start_time"],
            "compliance": currentLog[type + "_data"][parseInt(day)]["compliance"],
            "complete_time": new Date(),
            "status": ParticipationSlotStatus.COMPLETE,
            "value": value
        };

        // todo: unify with pilot, figure out how to pass collection as argument
        Participations.update(part._id, {
            $set: obj
        });
    }
}

/**
 * If there's no one joined the given experiment, then random choose between 0
 * and 1. Else, then based on the previous one. If the previous one has 0 then
 * return 1, else it should return 0.
 */
function getNextGroup(expId) {
    let par = Participations.find({
        "exp_id": expId,
        group: {
            $gte: 0,
            $lte: 1
        }
    }, {
        fields: {
            group: 1
        },
        sort: {
            join_date_time: -1
        }
    }).fetch();

    if (par) {
        if (par.length % 2 === 0) {
            return Math.floor(Math.random() * 2);
        } else {
            return par[par.length - 1].group === 0 ? 1 : 0;
        }
    } else {
        return Math.floor(Math.random() * 2);
    }
}

function getPaticipantIndex(expId, groupCond) {
    let part = Participations.find({
        "exp_id": expId,
        "group": groupCond,
    }, {
        fields: {
            participantIndex: 1
        },
        sort: {
            join_date_time: -1
        }
    }).fetch();

    if (part.length > 0) {
        return tempInd = part[0].participantIndex + 1;
    } else {
        return 1;
    }
}

function generateUserMap(group, index) {
    let cOrE = "cont"

    if (group == 1) {
        cOrE = "exp"
    }

    if (index < 10) {
        return cOrE + "0" + index;
    }

    if (index >= 10) {
        return cOrE + index;
    }
}
