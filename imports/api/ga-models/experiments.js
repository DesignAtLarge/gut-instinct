import {
    ExperimentStatus,
    NotificationType,
    ParticipationStatus
} from './constants';
import {
    Meteor
} from 'meteor/meteor';
import {
    Pilots
} from './pilot';
import {
    Feedbacks
} from "./feedback";
import {
    Participations
} from "./run";
import {
    Time
} from "./time";
import {
    ExperimentHelper
} from "./commonExperimentHelpers";


export const Experiments = new Mongo.Collection('ga_experiments');
export const ExperimentDesigns = new Mongo.Collection('ga_experiment_designs');

Meteor.methods({
    //TODO: this is not the best place to put this email and notification handlers
    'galileo.experiments.sendEmail': function(expId, type, msg, url, arg_temp) {
        // get the things related to the experiments
        console.log('in send email type = ' + type + ' msg = ' + msg + ' url = ' + url);
        let exp = Meteor.call("galileo.experiments.getExperiment", expId);
        if (exp) {
            let creatorName = exp.username;

            if (creatorName) {
                let otherUser = Meteor.call('galileo.run.getParticipantMap', expId, Meteor.user());
                let expTitle = "Does " + exp.design.cause + " affect " + exp.design.effect + "?";

                let args = {
                    creatorName: creatorName,
                    expTitle: expTitle,
                    expId: expId,
                    otherUser: otherUser
                };

                if (arg_temp) {
                    args = Object.assign(args, arg_temp);
                }

                console.log('about to send new notification args = ');
                console.log(args);
                Meteor.call("galileo.notification.new", exp.user_id, msg, url, type, args); // send the email
            } else {
                return undefined;
            }
        } else {
            return undefined;
        }
    },

    "galileo.experiments.addDiscusionComment": function(expId, user, index, message) {
        let map = Meteor.call('galileo.run.getParticipantMap', expId, user);
        let num = parseInt(index);
        let exp = Meteor.call('galileo.experiments.getExperiment', expId)
        let discussion = exp.discussion;

        let comment = {
            "author_name": map,
            "author_id": user._id,
            "create_time": new Date().toString().split(' ').splice(0, 4).join(' '),
            "post": message
        }

        discussion[num]['responses'].push(comment);

        Experiments.update({
            _id: expId
        }, {
            $set: {
                discussion: discussion
            }
        })
    },

    "galileo.experiments.addDiscusionThread": function(expId, user, message) {
        let map = Meteor.call('galileo.run.getParticipantMap', expId, user);
        let exp = Meteor.call('galileo.experiments.getExperiment', expId)

        if (exp.discussion === undefined) {
            exp.discussion = [];
        }

        let discussion = exp.discussion;

        let index = discussion.length;

        let comment = {
            "author_name": map,
            "author_id": user._id,
            "create_time": new Date().toString().split(' ').splice(0, 4).join(' '),
            "post": message,
            "index": index,
            "responses": [],
        }

        discussion.push(comment);

        Experiments.update({
            _id: expId
        }, {
            $set: {
                discussion: discussion
            }
        })
    },

    'galileo.experiments.sendMorningNewEmail': function() {
        console.log('~~~~~~~~~~~~~~~~~sendMorningNewEmail for exp');
        let now = Time.getNowInGmt().getDate().getHours() - 7;
        let user = Meteor.users.find({
            "profile.is_admin": true,
            "profile.send_admin_email_time": {
                $exists: true
            }
        }, {
            "profile.send_admin_email_time": 1
        }).fetch();
        let sendTime = 9
        if (user && user !== undefined && user[0] && user[0].profile.send_admin_email_time) {
            sendTime = user[0].profile.send_admin_email_time
        }

        if (sendTime === now) {
            let nowInGMT = new Time(new Date())
            let yesterdayInGMT = new Time(new Date()).addDay(-1);

            let newUsers = Meteor.users.find({
                createdAt: {
                    $lte: nowInGMT.getDate(),
                    $gt: yesterdayInGMT.getDate()
                },
            }).fetch();

            let newExperiments = Experiments.find({
                create_date_time: {
                    $lte: nowInGMT.getDate(),
                    $gt: yesterdayInGMT.getDate()
                }
            }).fetch();

            let newExperiments1 = Experiments.find({
                create_date_time: {
                    $exists: false
                },
                status_change_date_time: {
                    $lte: nowInGMT.getDate(),
                    $gt: yesterdayInGMT.getDate()
                }
            }).fetch();

            newExperiments = newExperiments.concat(newExperiments1);
            newExperiments = Array.from(new Set(newExperiments));

            userList = [];
            //console.log(newUsers);

            for (let i = 0; i < newUsers.length; i++) {
                user = {
                    username: newUsers[i].username,
                    id: newUsers[i]._id,
                }

                if (newUsers[i].username && newUsers[i].username != "") {
                    user.username = newUsers[i].username;
                } else {
                    user.username = "No username set";
                }
                if (newUsers[i].emails) {
                    user.email = newUsers[i].emails[0].address;
                } else if (newUsers[i].services && newUsers[i].services.coursera) {
                    user.email = "No email, coursera log in";
                } else if (newUsers[i].services && newUsers[i].services.google && newUsers[i].services.google.email) {
                    user.email = newUsers[i].services.google.email;
                } else if (newUsers[i].services && newUsers[i].services.facebook && newUsers[i].services.facebook.email) {
                    user.email = newUsers[i].services.facebook.email;
                } else if (newUsers[i].services && newUsers[i].services.openhumans) {
                    user.email = "No email, openhumans log in";
                } else {
                    user.email = "No Email"
                }

                if (newUsers[i].galileo && newUsers[i].galileo.country) {
                    user.country = newUsers[i].galileo.country;
                } else {
                    user.country = "No country set";
                }

                if (newUsers[i].galileo && newUsers[i].galileo.city) {
                    user.city = newUsers[i].galileo.city;
                } else {
                    user.city = "No city set";
                }

                userList.push(user);
            }

            expList = [];

            for (let i = 0; i < newExperiments.length; i++) {
                exp_id = newExperiments[i]._id;

                exp = Meteor.call('galileo.experiments.getExperiment', exp_id);

                if (exp) {
                    expToAdd = {
                        creator: exp.username,
                        id: exp_id,
                    }

                    if (exp.design && exp.design.cause && exp.design.relation && exp.design.effect) {
                        expToAdd.title = exp.design.cause + " " + exp.design.relation + " " + exp.design.effect;
                    } else {
                        expToAdd.title = "No title set";
                    }

                    if (exp.mendel_ga_id) {
                        expToAdd.mendel = exp.mendel_ga_id;
                    } else {
                        expToAdd.mendel = "No mendel set";
                    }

                    expList.push(expToAdd);
                }
            }

            let type = NotificationType.NEW_EXPS_PARTICIPANTS;

            let args = {
                newExps: expList,
                numExps: expList.length,
                newUsers: userList,
                numUsers: userList.length,
                date: dateStr(yesterdayInGMT.getDate())
            };

            Meteor.call('galileo.console.emailNotify', "otoledan@ucsd.edu", type, args);
            Meteor.call('galileo.console.emailNotify', "d3gu@ucsd.edu", type, args);
            Meteor.call('galileo.console.emailNotify', "gutinstinct@ucsd.edu", type, args);
            Meteor.call('galileo.console.emailNotify', "srk@ucsd.edu", type, args);

            return true;
        }
    },
    'galileo.experiments.sendWeeklyNewsEmail': function(skipcheck, debug_target) {
        if (skipcheck === undefined) {
            skipcheck = "0"
        }

        let now = Time.getNowInGmt().getDate().getHours() - 7;
        let sendTime = 17

        if (sendTime === now || skipcheck == "1") {
            let nowInGMT = new Time(new Date())
            let lastSundayInGMT = new Time(new Date()).addDay(-7);

            let newExperiments = Experiments.find({
                create_date_time: {
                    $lte: nowInGMT.getDate(),
                    $gt: lastSundayInGMT.getDate()
                }
            }).fetch();

            newExperiments = Array.from(new Set(newExperiments));

            // Only send weekly news email when has newExperiments
            if (newExperiments.length >= 0) {
                expNeedRviewerList = [];
                expNeedJoinList = [];

                for (let i = 0; i < newExperiments.length; i++) {
                    exp_id = newExperiments[i]._id;
                    exp = Meteor.call('galileo.experiments.getExperiment', exp_id);
                    if (exp) {
                        expToAdd = {}

                        expToAdd.joinLink = "https://galileo-ucsd.org/galileo/join/consent/" + exp_id;
                        // Check exp title
                        if (exp.design && exp.design.cause && exp.design.relation && exp.design.effect) {
                            expToAdd.title = exp.design.cause + " " + exp.design.relation + " " + exp.design.effect;
                        } else {
                            expToAdd.title = "No title set";
                        }

                        // Check exp mendel code
                        if (exp.mendel_ga_id) {
                            expToAdd.mendel = exp.mendel_ga_id;
                        } else {
                            expToAdd.mendel = "No mendel set";
                        }

                        // Check exp status
                        if (exp.status >= 2 && exp.status <= 4) {
                            expToAdd.reviewLink = "https://galileo-ucsd.org/galileo/share/review/" + exp_id;
                            expNeedRviewerList.push(expToAdd);
                        } else if (exp.status >= 8 && exp.status <= 9) {
                            expNeedJoinList.push(expToAdd);
                        }
                    }
                }

                let type = NotificationType.NEW_EXPS_WEEKLY_UPDATE;
                let args = {
                    expsNeedReviewer: expNeedRviewerList,
                    expsNeedJoin: expNeedJoinList,
                    numExps: expNeedRviewerList.length + expNeedJoinList.length
                };

                let allUsers = Meteor.users.find({
                    emails: {
                        $exists: true
                    },
                }).fetch();

                if (debug_target != undefined) {
                    args.username = " 😂 Åland";
                    Meteor.call('galileo.console.emailNotify', debug_target, type, args);
                } else {
                    allUsers.forEach(function(user) {
                        if (user.emails[0].address && user.emails[0].address != "") {
                            if (user.username && user.username != "") {
                                args.username = " " + user.username;
                            } else {
                                args.username = "";
                            }
                            Meteor.call('galileo.console.emailNotify', user.emails[0].address, type, args);
                        }
                    })
                }
                return true;
            }
        }
    },
    'galileo.experiments.changeStatus': function(expId, newStatus) {
        Experiments.update({
            _id: expId
        }, {
            $set: {
                status: newStatus
            }
        })

        return true;
    },

    /**
     * User owned experiment getter
     */

    'galileo.experiments.getExperimentsByUser': function(targetUserID) {
        console.log("in server side galileo.experiments.getExperimentsByUser");
        return getExperimentsByUserHelper(targetUserID);
    },

    'galileo.experiments.getExperimentByExpId': function(exp_id) {
        let exp = Experiments.findOne({_id:exp_id});
        if (exp) {
            return exp;
        } else {
            console.log("Error: can't find the target experiment");
        }
    },
    /**
     * Overall experiment getter
     */
    'galileo.experiments.getExperiments': function(mendel) {
        if (!mendel) {
            let syncfunc = Meteor.wrapAsync(function(callback) {
                Experiments.rawCollection().aggregate([ // Raw Collection returns the original mongo db collection so that we can do aggregate on it
                    {
                        $match: { // First matching all the experiments that has status greater than merely created.
                            status: {
                                $gte: ExperimentStatus.DESIGNED
                            },
                            mendel_ga_id: {
                                $in: ["KOMBUCHA", "KEFIR", "AMERICANGUT", "DIET", "OPENHUMANS", "SOYLENT", "ATHLETES"]
                            }
                        }
                    },
                    {
                        $lookup: { // Then look up the current experiment design in the "ga_experiment_designs" collection and put it in the local field as "design"
                            from: "ga_experiment_designs",
                            localField: "curr_design_id",
                            foreignField: "_id",
                            as: "design"
                        }
                    },
                    {
                        $unwind: "$design" // Follow up stage after look up. Since there will be only one experiment design, unwind stage will simply unwind { design: [{ /* design */ }] } to { design: {/* design */} }
                    }
                ], callback);
            });
            return syncfunc();
        } else {
            let syncfunc = Meteor.wrapAsync(function(callback) {
                Experiments.rawCollection().aggregate([ // Raw Collection returns the original mongo db collection so that we can do aggregate on it
                    {
                        $match: { // First matching all the experiments that has status greater than merely created.
                            status: {
                                $gte: ExperimentStatus.DESIGNED
                            },
                            mendel_ga_id: {
                                $in: [mendel]
                            }
                        }
                    },
                    {
                        $lookup: { // Then look up the current experiment design in the "ga_experiment_designs" collection and put it in the local field as "design"
                            from: "ga_experiment_designs",
                            localField: "curr_design_id",
                            foreignField: "_id",
                            as: "design"
                        }
                    },
                    {
                        $unwind: "$design" // Follow up stage after look up. Since there will be only one experiment design, unwind stage will simply unwind { design: [{ /* design */ }] } to { design: {/* design */} }
                    }
                ], callback);
            });
            return syncfunc();
        }
    },
    'galileo.experiments.copyExperimentByExpId': function(expId, userId) {
        let user = Meteor.users.find({_id: userId}, { fields: {username: 1} }).fetch()[0];
        let exp = Experiments.findOne({_id:expId});
        let designId = "";
        if (exp) {
            let design = ExperimentDesigns.findOne({_id: exp.curr_design_id});
            let new_design_obj = {
                "create_date_time": new Date(),
                "username": user.username,
                "intuition": design.intuition,
                "cause": design.cause,
                "relation": design.relation,
                "effect": design.effect,
                "mechanism": design.mechanism,
                "related_works": design.related_works,
                "cause_measure": design.cause_measure,
                "effect_measure": design.effect_measure,
                "feedback_request": design.feedback_request,
                "criteria": design.criteria,
                "condition": design.condition,
                "timeStamp": {
                    "finishIntuition": undefined,
                    "finishMeasureCause": undefined,
                    "finishMeasureEffect": undefined,
                    "finishRemindTime": undefined,
                    "finishProvideSteps": undefined,
                    "finishProvideCriteria": undefined,
                    "finishDesign": undefined
                }
            };
            designId = ExperimentDesigns.insert(new_design_obj);
        }

        let new_exp_obj = {
            "user_id": userId,
            "username": user.username,
            "curr_design_id": designId,
            "versions": [{
                "create_date_time": new Date(),
                "design_id": designId
            }],
            "status": ExperimentStatus.CREATED,
            "status_change_date_time": new Date(),
            "design_progress": 7,
            "feedback_users": [],
            "pilot_users": [],
            "run_users": [],
            "waitlist_users": [],
            "flag_status": false,
            "flag_user": "",
            "flag_reason": "",
            "mendel_ga_id": exp.mendel_ga_id,
            "min_participant_count": 20,
            "clarification": [],
            "results": {
                title: "",
                graph: "",
                control: {
                    graph: ""
                },
                experimental: {
                    graph: ""
                }
            }
        };
        let exp_id = Experiments.insert(new_exp_obj);

        // Finally also update the original design
        ExperimentDesigns.update({
            _id: designId
        }, {
            $set: {
                "exp_id": exp_id,
            }
        });

        // Return design id to the user since the user will be modifying this
        return {
            "expId": exp_id,
            "designId": designId
        };
    },
    'galileo.experiments.getPilotingExperiments': function() {
        return Experiments.find({
            status: {
                $gte: ExperimentStatus.DESIGNED,
                $lte: ExperimentStatus.OPEN_FOR_PILOT
            }
        }, {
            fields: {
                "_id": 1
            }
        }).map((obj) => {
            return Meteor.call("galileo.experiments.getExperiment", obj._id);
        });
    },
    'galileo.experiments.getExperimentAmount': function() {
        return Experiments.find({
            status: {
                $gte: ExperimentStatus.DESIGNED
            }
        }).count();
    },
    'galileo.experiments.getStatus': function(expId) {
        let exp = Experiments.findOne({
            _id: expId
        });
        if (exp) {
            return exp.status;
        } else {
            return undefined;
        }
    },
    'galileo.experiments.setSentThankYou': function(expId) {
        Experiments.update({
            _id: expId
        }, {
            $set: {
                sent_thank_you: true
            }
        })
    },
    'galileo.experiments.requestDataAnalysis': function(expId) {
        let status = ExperimentStatus.ANALYSIS_REQUESTED;
        Experiments.update({
            _id: expId
        }, {
            $set: {
                "status": status
            }
        })
    },
    'galileo.experiments.getMulExperimentWithParticipantData': function(userId) {
        let exps = [],
            ongoingExps = [];
        exps = getExperimentsByUserHelper(userId);
        exps.forEach(function(element) {
            if (element.status === ExperimentStatus.PREPARING_TO_START || element.status === ExperimentStatus.STARTED) {
                ongoingExps.push(element);
            }
        });
        let result = [];
        ongoingExps.forEach(function(exp) {
            result.push(getExperimentWithParticipantDataHelper(exp._id));
        });
        return result;
    },
    'galileo.experiments.getExperimentsWithReviewData': function(userId) {
        let exps = [],
            underReviewExps = [];
        exps = getExperimentsByUserHelper(userId);
        exps.forEach(function(element) {
            if (element.status >= ExperimentStatus.OPEN_FOR_REVIEW &&
                element.status <= ExperimentStatus.REVIEWED) {
                underReviewExps.push(element);
            }
        });
        let result = [];
        underReviewExps.forEach(function(exp) {
            result.push(getExperimentWithCommentDataHelper(exp._id));
        });
        return result;
    },
    'galileo.experiments.getReadyToRunExperiment': function(userId) {
        let exps = [],
            readyToRunExps = [],
            result = undefined;
        exps = getExperimentsByUserHelper(userId);
        exps.forEach(function(element) {
            if (element.status == ExperimentStatus.READY_TO_RUN) {
                readyToRunExps.push(element);
            }
        });
        return readyToRunExps;
    },
    'galileo.experiments.getExperimentWithParticipantData': function(expId) {
        return getExperimentWithParticipantDataHelper(expId);
    },
    'galileo.experiments.getParticipatingExpUnderReviewing': function(userId) {
        let results = Participations.find({
            user_id: userId,
            status: {
                $gte: ParticipationStatus.PASSED_CRITERIA
            }
        }).fetch();

        // console.log("the result fot part: " + JSON.stringify(results));
        if (results) {
            var returnResult = undefined;
            results.forEach(function(result) {
                let exp = Experiments.findOne({
                    _id: result.exp_id
                });
                // console.log("the result fot part: " + JSON.stringify(exp));
                if (exp && exp.status >= 2 && exp.status <= 4 || exp.status === 8) {
                    let expDesign = ExperimentDesigns.findOne({
                        _id: exp.curr_design_id
                    });
                    if (expDesign) {
                        exp.design = expDesign;
                        let user = Meteor.users.find({
                            _id: exp.user_id
                        }, {
                            fields: {
                                username: 1
                            }
                        }).fetch()[0];

                        var pResult = Participations.findOne({
                            user_id: userId,
                            exp_id: exp._id
                        });
                        //console.log("pResult is: " + JSON.stringify(pResult));
                        exp.pResult = pResult;
                        returnResult = exp;
                    }
                }
            });

            return returnResult;
        } else {
            return undefined;
        }
    },
    'galileo.experiments.updateShareInfo': function(exp_id, first, second, third) {
        let exp = Experiments.findOne({_id:exp_id});
        let shareInfoObj = {
            "who are you": first,
            "what world would learn": second,
            "expected time": third
        };
        if (exp) {
            exp.shareInfo = shareInfoObj;
            Experiments.update({_id: exp._id}, {$set: exp});
        }
    },
    'galileo.experiments.getParticipatingExpByUser': function(userId) {
        let results = Participations.find({
            user_id: userId,
            status: {
                $gte: ParticipationStatus.PREPARING,
                $lt: ParticipationStatus.WAITLIST
            }
        }).fetch();

        // console.log("the result fot part: " + JSON.stringify(results));
        if (results) {
            var returnResult = undefined;
            results.forEach(function(result) {
                let exp = Experiments.findOne({
                    _id: result.exp_id
                });
                // console.log("the result fot part: " + JSON.stringify(exp));
                if (exp && exp.status >= 9 && exp.status <= 10) {
                    let expDesign = ExperimentDesigns.findOne({
                        _id: exp.curr_design_id
                    });
                    if (expDesign) {
                        exp.design = expDesign;
                        let user = Meteor.users.find({
                            _id: exp.user_id
                        }, {
                            fields: {
                                username: 1
                            }
                        }).fetch()[0];

                        if (exp.run_users.length > 0) {
                            var userDataTemp = Meteor.users.find({
                                _id: userId
                            }, {
                                fields: {
                                    'username': 1
                                }
                            }).fetch()[0];
                            userDataTemp.duration = exp.duration;
                            userDataTemp.all_cause_data = [];
                            userDataTemp.all_effect_data = [];

                            userDataTemp.all_cause_data = result.cause_data;
                            userDataTemp.all_effect_data = result.effect_data;
                            userDataTemp.status = result.status;
                            userDataTemp.group = result.group;


                            exp.participantInfoResults = userDataTemp;
                        }

                        var pResult = Participations.findOne({
                            user_id: userId,
                            exp_id: exp._id
                        });
                        //console.log("pResult is: " + JSON.stringify(pResult));
                        exp.pResult = pResult;
                        returnResult = exp;

                    }
                }
            });

            return returnResult;
        } else {
            return undefined;
        }
    },
    'galileo.experiments.getParticipatingExpByUserComplete': function(userId) {
        let results = Participations.find({
            user_id: userId,
            status: 5
        }).fetch();

        // console.log("the result fot part: " + JSON.stringify(results));
        if (results) {
            var returnResult = [];
            results.forEach(function(result) {
                let exp = Experiments.findOne({
                    _id: result.exp_id
                });
                // console.log("the result fot part: " + JSON.stringify(exp));
                if (exp && exp.status >= 11) {
                    let expDesign = ExperimentDesigns.findOne({
                        _id: exp.curr_design_id
                    });
                    if (expDesign) {
                        exp.design = expDesign;
                        let user = Meteor.users.find({
                            _id: exp.user_id
                        }, {
                            fields: {
                                username: 1
                            }
                        }).fetch()[0];

                        if (exp.run_users.length > 0) {
                            var userDataTemp = Meteor.users.find({
                                _id: userId
                            }, {
                                fields: {
                                    'username': 1
                                }
                            }).fetch()[0];
                            userDataTemp.duration = exp.duration;
                            userDataTemp.all_cause_data = [];
                            userDataTemp.all_effect_data = [];

                            userDataTemp.all_cause_data = result.cause_data;
                            userDataTemp.all_effect_data = result.effect_data;
                            userDataTemp.status = result.status;
                            userDataTemp.group = result.group;


                            exp.participantInfoResults = userDataTemp;
                        }

                        var pResult = Participations.findOne({
                            user_id: userId,
                            exp_id: exp._id
                        });
                        //console.log("pResult is: " + JSON.stringify(pResult));
                        exp.pResult = pResult;
                        returnResult.push(exp);

                    }
                }
            });
            return returnResult;
        } else {
            return undefined;
        }
    },
    'galileo.experiments.getParticipatingExpByUserExp': function(userId, expId) {
        let results = Participations.find({
            user_id: userId,
            exp_id: expId
        }).fetch();

        // console.log("the result fot part: " + JSON.stringify(results));
        if (results) {

            var returnResult = undefined;
            results.forEach(function(result) {
                let exp = Experiments.findOne({
                    _id: result.exp_id
                });
                // console.log("the result fot part: " + JSON.stringify(exp));
                if (exp && exp.status >= 9 && exp.status <= 13) {
                    let expDesign = ExperimentDesigns.findOne({
                        _id: exp.curr_design_id
                    });
                    if (expDesign) {
                        exp.design = expDesign;
                        let user = Meteor.users.find({
                            _id: exp.user_id
                        }, {
                            fields: {
                                username: 1
                            }
                        }).fetch()[0];

                        if (exp.run_users.length > 0) {
                            var userDataTemp = Meteor.users.find({
                                _id: userId
                            }, {
                                fields: {
                                    'username': 1
                                }
                            }).fetch()[0];
                            userDataTemp.duration = exp.duration;
                            userDataTemp.all_cause_data = [];
                            userDataTemp.all_effect_data = [];

                            userDataTemp.all_cause_data = result.cause_data;
                            userDataTemp.all_effect_data = result.effect_data;
                            userDataTemp.group = result.group;


                            exp.participantInfoResults = userDataTemp;
                        }

                        var pResult = Participations.findOne({
                            user_id: userId,
                            exp_id: exp._id
                        });
                        //console.log("pResult is: " + JSON.stringify(pResult));
                        exp.pResult = pResult;
                        returnResult = exp;

                    }
                }
            });

            return returnResult;
        } else {
            return undefined;
        }
    },
    'galileo.experiments.stopParticipating': function(userId, expId, content) {
        console.log("in galileo.experiments.stopParticipating~~~");
        let result = Participations.findOne({
            user_id: userId,
            exp_id: expId
        });
        let partMap = result.participantMap;
        result.stop_reason = content;
        result.status = ParticipationStatus.DROPPED;
        Participations.update({_id: result._id}, {$set: result});

        let exp = Experiments.find({_id: expId}, { fields: {run_users: 1} }).fetch()[0];
        let index = exp.run_users.indexOf(partMap);
        if (index > -1) {
            exp.run_users.splice(index, 1);
            console.log("removed " + userId + " from exp " + expId);
        }
        Experiments.update({_id: exp._id}, {$set: exp});
    },
    'galileo.experiments.addCauseData': function(userId, expId, currentDay, content) {
        let result = Participations.findOne({
            user_id: userId,
            exp_id: expId
        });

        result.cause_data[parseInt(currentDay)].status = 2;
        result.cause_data[parseInt(currentDay)].value = content;
        result.cause_data[parseInt(currentDay)].complete_time = new Date();
        result.cause_data[parseInt(currentDay)].start_time = result.cause_data[parseInt(currentDay)].start_time;
        result.cause_data[parseInt(currentDay)].compliance = result.cause_data[parseInt(currentDay)].compliance;

        Participations.update({
            _id: result._id
        }, {
            $set: result
        });
    },
    'galileo.experiments.addEffectData': function(userId, expId, currentDay, content) {
        let result = Participations.findOne({
            user_id: userId,
            exp_id: expId
        });

        result.effect_data[parseInt(currentDay)].status = 2;
        result.effect_data[parseInt(currentDay)].value = content;
        result.effect_data[parseInt(currentDay)].complete_time = new Date();
        result.effect_data[parseInt(currentDay)].start_time = result.effect_data[parseInt(currentDay)].start_time;
        result.effect_data[parseInt(currentDay)].compliance = result.effect_data[parseInt(currentDay)].compliance;

        Participations.update({
            _id: result._id
        }, {
            $set: result
        });
    },
    'galileo.experiments.addClarification': function(userId, expId, content, index) {
        let obj = {};
        let part = Participations.find({
            user_id: userId
        }, {
            fields: {
                participantMap: 1
            }
        }).fetch()[0];
        let exp = Experiments.find({
            _id: expId
        }, {
            fields: {
                user_id: 1,
                username: 1,
                clarification: 1
            }
        }).fetch()[0];

        if (userId !== exp.user_id) {
            obj["clarification." + index] = {
                "author_name": part.participantMap,
                "author_id": userId,
                "create_time": new Date().toString().split(' ').splice(0, 4).join(' '),
                "resolved": false,
                "question": content,
                "index": index
            };
            Experiments.update(expId, {
                $set: obj
            });
        } else if (userId === exp.user_id) {
            obj["clarification." + index] = {
                "author_name": exp.clarification[index].author_name,
                "author_id": exp.clarification[index].author_id,
                "create_time": exp.clarification[index].create_time,
                "resolved": true,
                "question": exp.clarification[index].question,
                "index": exp.clarification[index].index,
                "answer": content,
                "resolve_time": new Date().toString().split(' ').splice(0, 4).join(' '),
                "creator": exp.username
            };
            Experiments.update(expId, {
                $set: obj
            });
        }
    },
    'galileo.experiments.getExperimentsByDate': function(start, end) {
        let exps = Experiments.find({
            start_date_time: {
                $gte: start,
                $lt: end
            }
        }).fetch();

        for (let i = 0; i < exps.length; i++) {
            let expDesign = ExperimentDesigns.findOne({
                _id: exps[i].curr_design_id
            });
            exps[i].design = expDesign;
        }
        return exps;
    },
    'galileo.experiments.getExperimentsPreparingToStart': function() {
        let exps = Experiments.find({
            status: ExperimentStatus.PREPARING_TO_START
        }).fetch();

        for (let i = 0; i < exps.length; i++) {
            let expDesign = ExperimentDesigns.findOne({
                _id: exps[i].curr_design_id
            });
            exps[i].design = expDesign;

            let user = Meteor.users.find({
                _id: exps[i].user_id
            })

            exps[i].timezone = ExperimentHelper.getTimezoneOffset(user);
        }
        return exps;
    },
    'galileo.experiments.getExperiment': function(expId) {
        let exp = Experiments.findOne({
            _id: expId
        });
        if (exp) {
            let expDesign = ExperimentDesigns.findOne({
                _id: exp.curr_design_id
            });
            if (expDesign) {
                exp.design = expDesign;
                let user = Meteor.users.find({
                    _id: exp.user_id
                }, {
                    fields: {
                        username: 1
                    }
                }).fetch()[0];

                if (user && user.username) {
                    exp.username = user.username;
                }

                return exp;
            } else {
                return undefined;
            }
        } else {
            throw new Meteor.Error("Experiment does not exist");
            return undefined;
        }
    },
    'galileo.experiments.setMinParticipantCount': function(expId, newCount) {
        let exp = Experiments.findOne({
            _id: expId
        });
        if (exp) {
            Experiments.update(expId, {
                $set: {
                    min_participant_count: newCount
                }
            });
            return true;
        } else {
            return undefined;
        }
    },
    'galileo.experiments.getSingleMendelExpNum': function(mendel) {
        return Experiments.find({
            mendel_ga_id: mendel,
            status: {
                $gte: ExperimentStatus.DESIGNED
            }
        }).count();
    },
    'galileo.experiments.getMendelExpNum': function(mendelIdArray) {
        let res = {};

        mendelIdArray.map((id) => {
            res[id] = Meteor.call("galileo.experiments.getSingleMendelExpNum", id);
        });

        return res;
    },
    'galileo.experiments.getSingleMendelUserNum': function(mendel) {
        let sync_getDistinctUsers = Meteor.wrapAsync(function(callback) {
            Experiments.rawCollection().distinct("user_id", {
                mendel_ga_id: mendel,
                status: {
                    $gte: ExperimentStatus.DESIGNED
                }
            }, callback);
        });

        return sync_getDistinctUsers().length;
    },
    'galileo.experiments.getMendelUserNum': function(mendelIdArray) {
        let res = {};

        mendelIdArray.map((id) => {
            res[id] = Meteor.call("galileo.experiments.getSingleMendelUserNum", id);
        });

        return res;
    },
    'galileo.experiments.getExperimentStats': function(expId) {
        let res = {};
        res.reviewerCount = -1;
        res.pilotCount = -1;
        res.participantCount = -1;

        res.reviewerCount = Feedbacks.find({
            "exp_id": expId
        }).count();
        res.pilotCount = Pilots.find({
            "exp_id": expId
        }).count();
        res.participantCount = Participations.find({
            "exp_id": expId
        }).count();

        return res;
    },
    'galileo.experiments.getMeasures': function(expId) {
        let result = ExperimentDesigns.find({
            exp_id: expId
        }, {
            fields: {
                cause_measure: 1,
                effect_measure: 1
            }
        }).fetch();


        if (result && result.length > 0 && result[0]) {
            return result[0];
        } else {
            return Meteor.error("Experiment with id - " + expId + " not found");
        }
    },
    'galileo.experiments.getMendelId': function(expId) {
        let result = Experiments.find({
            _id: expId
        }, {
            fields: {
                mendel_ga_id: 1
            }
        }).fetch();

        if (result && result.length > 0 && result[0] && result[0].mendel_ga_id) {
            return result[0].mendel_ga_id;
        } else {
            return "";
        }
    },
    'galileo.experiments.getOpenHumansSources': function(expId) {
        let designId = Experiments.findOne({
            _id: expId
        })["curr_design_id"];
        let result = ExperimentDesigns.find({
            _id: designId
        }, {
            fields: {
                cause_measure: 1,
                effect_measure: 1,
                open_humans_client_id: 1
            },
        }).fetch();

        if (result && result.length > 0 && result[0]) {
            let res = result[0];
            let causeDataIds = res.cause_measure && res.cause_measure.ohDataSourceIds;
            let effectDataIds = res.effect_measure && res.effect_measure.ohDataSourceIds;
            let uniqueIds = [...new Set([...causeDataIds, ...effectDataIds])];
            uniqueIds.shift(); // this removes the 1st item from the array, which is 0, which is the default data source - Gut instinct sms
            return {
                dataSourceIds: uniqueIds,
                clientId: res.open_humans_client_id
            };
        } else {
            return Meteor.error("Experiment with id - " + expId + " not found");
        }
    },


    /**
     *   EXPERIMENT LOGIC HELPERS
     **/
    'galileo.experiments.hasExperiment': function(expId) {
        return Experiments.find({
            _id: expId
        }).count() === 1;
    },

    'galileo.experiments.reportAbuse': function(expId, reportReason) {
        let exp = Experiments.findOne({
            _id: expId
        });
        if (exp) {
            Experiments.update(expId, {
                $set: {
                    flag_status: true,
                    flag_user: Meteor.user().username,
                    flag_reason: reportReason
                }
            });
            return true;
        } else {
            return undefined;
        }
    },
    'galileo.experiments.unreportAbuse': function(expId) {
        let exp = Experiments.findOne({
            _id: expId
        });
        if (exp) {
            Experiments.update(expId, {
                $set: {
                    flag_status: false,
                    flag_user: ""
                }
            });
            return true;
        } else {
            return undefined;
        }
    },

    'galileo.experiments.getHypothesis': function(expId) {
        let exp = Experiments.findOne({
            _id: expId
        });
        if (exp) {
            let d = ExperimentDesigns.findOne({
                _id: exp.curr_design_id
            });
            if (d) {
                return d.cause + " " + d.relation + " " + d.effect;
            } else {
                return undefined;
            }
        }
    },
    'galileo.experiments.isCreator': function(expId) {
        let exp = Experiments.find({
            _id: expId
        }, {
            fields: {
                user_id: 1
            }
        }).fetch()[0];

        if (exp === null || exp === undefined) {
            return false;
        }
        return exp.user_id === Meteor.userId();
    },
    'galileo.experiments.isOpenForRun': function(expId) {
        let exp = Experiments.find({
            _id: expId
        }, {
            fields: {
                status: 1
            }
        }).fetch()[0];
        return exp.status < ExperimentStatus.STARTED;
    },
    'galileo.experiments.canRun': function(expId) {
        let exp = Experiments.findOne({
            _id: expId
        });
        switch (exp.status) {
            case ExperimentStatus.CREATED:
            case ExperimentStatus.OPEN_FOR_PILOT:
            case ExperimentStatus.PILOT_ONGOING:
            case ExperimentStatus.PREPARING_TO_START:
            case ExperimentStatus.STARTED:
            case ExperimentStatus.FINISHED:
                return false;
            default:
                return true;
        }
    },
    'galileo.experiments.hasEnded': function(expId) {
        let exp = Experiments.findOne({
            _id: expId
        });
        return (exp.status === ExperimentStatus.FINISHED);
    },
    'galileo.experiments.getCurrentUserRole': function(expId) {
        let role = {
            isCreator: false,
            isReviewer: false,
            isPilotUser: false,
            isParticipant: false,
            isFailedCriteria: false,
            isWaitlist: false
        };

        let exp = Experiments.find({
            _id: expId
        }, {
            fields: {
                user_id: 1,
                feedback_users: 1
            }
        }).fetch()[0];

        let curUserId = Meteor.userId();
        let currUser = Meteor.users.find({
            _id: curUserId
        }, {
            fields: {
                'galileo.feedback_experiments': 1
            }
        }).fetch()[0];
        let feedback_exps = currUser.galileo.feedback_experiments;

        if (exp === null || exp === undefined) {
            return role;
        }

        if (Meteor.call("galileo.run.isFailedCriteria", expId)) {
            role.isFailedCriteria = true;
        }

        if (exp.user_id === curUserId) {
            role.isCreator = true;
            return role;
        }

        feedback_exps.forEach(function(exp) {
            if (exp === expId) {
                role.isReviewer = true;
                return role;
            }
        });

        if (Meteor.call("galileo.pilot.isPilot", expId)) {
            role.isPilotUser = true;
            return role;
        }
        if (Meteor.call("galileo.run.isWaitlisting", expId)) {
            role.isWaitlist = true;
            return role;
        }

        if (Meteor.call("galileo.run.isParticipant", expId)) {
            role.isParticipant = true;
            return role;
        }

        return role;
    },


    /**
     * Experiment creation and logistics
     */
    'galileo.experiments.create': function(intuition, username, mendel) {

        // First create the design and then insert the design to database
        let design = generateDesignObject(intuition, username);
        let designId = ExperimentDesigns.insert(design);

        // Then generate the experiment and insert the experiment
        //let exp = generateExperimentObject(Meteor.userId(), "vineet2",designId, mendel);
        let exp = generateExperimentObject(Meteor.userId(), username, designId, mendel);
        let expId = Experiments.insert(exp);

        // Finally also update the original design
        ExperimentDesigns.update({
            _id: designId
        }, {
            $set: {
                "exp_id": expId,
            }
        });

        // Return design id to the user since the user will be modifying this
        return {
            "expId": expId,
            "designId": designId
        };
    },
    'galileo.experiments.getDesignProgress': function(expId) {
        return Experiments.findOne({
            _id: expId
        })["design_progress"];
    },
    'galileo.experiments.setDesignProgress': function(expId, progress) {
        Experiments.update({
            _id: expId
        }, {
            $set: {
                "design_progress": progress
            }
        });
    },
    'galileo.experiments.getShuffledCriteria': function(expId) {
        let designId = Experiments.findOne({
            _id: expId
        })["curr_design_id"];
        let design = ExperimentDesigns.findOne({
            _id: designId
        });
        let criteria = design.criteria;

        let arr = [];
        for (let i in criteria.inclusion) arr.push(criteria.inclusion[i]);
        for (let i in criteria.exclusion) arr.push(criteria.exclusion[i]);

        for (let i = 0; i < arr.length; i++) {
            let swapId = Math.floor(Math.random() * (arr.length - i)) + i;
            let temp = arr[swapId];
            arr[swapId] = arr[i];
            arr[i] = temp;
        }
        return arr;

    },
    'galileo.experiments.getUnshuffledInclusionCriteria': function(expId) {
        let designId = Experiments.findOne({
            _id: expId
        })["curr_design_id"];
        let design = ExperimentDesigns.findOne({
            _id: designId
        });
        let criteria = design.criteria;

        let arr = [];
        for (let i in criteria.inclusion) arr.push(criteria.inclusion[i]);

        /*for (let i = 0; i < arr.length; i++) {
            let swapId = Math.floor(Math.random() * (arr.length - i)) + i;
            let temp = arr[swapId];
            arr[swapId] = arr[i];
            arr[i] = temp;
        }*/
        return arr;

    },
    'galileo.experiments.getUnshuffledExclusionCriteria': function(expId) {
        let designId = Experiments.findOne({
            _id: expId
        })["curr_design_id"];
        let design = ExperimentDesigns.findOne({
            _id: designId
        });
        let criteria = design.criteria;

        let arr = [];
        for (let i in criteria.exclusion) arr.push(criteria.exclusion[i]);

        /*for (let i = 0; i < arr.length; i++) {
            let swapId = Math.floor(Math.random() * (arr.length - i)) + i;
            let temp = arr[swapId];
            arr[swapId] = arr[i];
            arr[i] = temp;
        }*/
        return arr;

    },
    'galileo.experiments.setDesignedOrOpenForReview': function(expId) {
        //If user has completed ethics training, mark the experiment open for review, else mark it designed
        Meteor.call("galileo.profile.hasFinishedEthics", function(err, finished) {
            if (err) {
                throw new Meteor.Error("err");
            } else {
                let status = ExperimentStatus.DESIGNED;
                if (finished) {
                    status = ExperimentStatus.OPEN_FOR_REVIEW;
                }
                Experiments.update({
                    _id: expId
                }, {
                    $set: {
                        "status": status,
                        "create_date_time": new Date(),
                        "status_change_date_time": new Date()
                    }
                });
            }
        });
    },

    'galileo.experiments.setDesigned': function(expId) {
        Experiments.update({
            _id: expId
        }, {
            $set: {
                "status": ExperimentStatus.DESIGNED,
                "create_date_time": new Date(),
                "status_change_date_time": new Date()
            }
        });
    },
    'galileo.experiments.setOpenForPilot': function(expId) {
        if (Meteor.call("galileo.experiments.isCreator", expId)) {
            Experiments.update({
                _id: expId
            }, {
                $set: {
                    "status": ExperimentStatus.OPEN_FOR_PILOT,
                    "status_change_date_time": new Date()
                }
            });
        } else {
            throw new Meteor.Error("you are not creator of the experiment");
        }
    },
    'galileo.experiments.setPiloting': function(expId) {
        Experiments.update({
            _id: expId
        }, {
            $set: {
                "status": ExperimentStatus.PILOT_ONGOING,
                "status_change_date_time": new Date()
            }
        });
    },



    /**
     * Experiment Versioning
     */
    'galileo.experiments.version.updateVersionIfNeeded': function(expId) {

        // First cache the experiment
        let exp = Experiments.findOne({
            _id: expId
        }, {
            fields: {
                curr_design_id: 1,
                versions: 1,
                status: 1
            }
        });

        if (!exp.status || exp.status < ExperimentStatus.DESIGNED) {
            //this means that the experiment is still being edited in create flow
            return exp.curr_design_id;
        }

        if (exp.versions.length > 1) {
            // this means that another version has been created
            // i.e. this isn't the first edit, just return the current design id
            return exp.curr_design_id;
        }

        // if version length is 1, this is a first time edit, new version needs to be created

        // Get the current design and modify it to new design
        let newDesign = ExperimentDesigns.findOne({
            _id: exp.curr_design_id
        });
        delete newDesign["_id"];
        delete newDesign["create_date_time"];
        newDesign["update_date_time"] = new Date();

        // Insert the new design (copy) and get the id
        let newDesignId = ExperimentDesigns.insert(newDesign);

        // Update the experiment info
        Experiments.update({
            _id: expId
        }, {
            $push: {
                "versions": {
                    "update_date_time": new Date(),
                    "design_id": newDesignId
                }
            },
            $set: {
                "curr_design_id": newDesignId
            }
        });

        // Return the new design id since the user will be modifying this
        return newDesignId;
    },

    'galileo.experiments.edit.updateHypothesis': function(expId, cause, relation, effect, mechanism, related_works) {
        let designId = Meteor.call('galileo.experiments.version.updateVersionIfNeeded', expId);
        let exp_design =
        Meteor.call('galileo.experiments.design.setHypothesis', designId, cause, relation, effect, mechanism, related_works);
    },

    'galileo.experiments.edit.updateCauseMeasure': function(expId, reminderTime, reminderText, type, unit) {
        let designId = Meteor.call('galileo.experiments.version.updateVersionIfNeeded', expId);

        ExperimentDesigns.update({
            _id: designId
        }, {
            $set: {
                "update_date_time": new Date(),
                "cause_measure.time": reminderTime,
                "cause_measure.reminderText": reminderText,
                "cause_measure.type": type,
                "cause_measure.unit": unit
            }
        });
    },

    'galileo.experiments.edit.updateEffectMeasure': function(expId, reminderTime, reminderText, type, unit, minRating, maxRating) {
        let designId = Meteor.call('galileo.experiments.version.updateVersionIfNeeded', expId);


        ExperimentDesigns.update({
            _id: designId
        }, {
            $set: {
                "update_date_time": new Date(),
                "effect_measure.time": reminderTime,
                "effect_measure.reminderText": reminderText,
                "effect_measure.type": type,
                "effect_measure.unit": unit,
                "effect_measure.minRating": minRating,
                "effect_measure.maxRating": maxRating
            }
        });
    },

    'galileo.experiments.edit.updateOpenHumansDataSources': function(expId, causeOhIds, effectOhIds) {
        let designId = Meteor.call('galileo.experiments.version.updateVersionIfNeeded', expId);

        ExperimentDesigns.update({
            _id: designId
        }, {
            $set: {
                "update_date_time": new Date(),
                "cause_measure.ohDataSourceIds": causeOhIds,
                "effect_measure.ohDataSourceIds": effectOhIds
            }
        });
    },

    'galileo.experiments.edit.updateExclusionCriteria': function(expId, ec) {
        let designId = Meteor.call('galileo.experiments.version.updateVersionIfNeeded', expId);
        Meteor.call('galileo.experiments.design.setExclusionCriteria', designId, ec);
    },

    'galileo.experiments.edit.updateInclusionCriteria': function(expId, ic) {
        let designId = Meteor.call('galileo.experiments.version.updateVersionIfNeeded', expId);
        Meteor.call('galileo.experiments.design.setInclusionCriteria', designId, ic);
    },

    'galileo.experiments.edit.updateConditionInstructions': function(expId, design) {
        let designId = Meteor.call('galileo.experiments.version.updateVersionIfNeeded', expId);
        let controlDesc = design.condition.control.description;
        let controlSteps = design.condition.control.steps;
        let controlPrepSteps = design.condition.control.prep_steps;
        let expDesc = design.condition.experimental.description;
        let expSteps = design.condition.experimental.steps;
        let expPrepSteps = design.condition.experimental.prep_steps;
        Meteor.call('galileo.experiments.design.setConditionInstructions', designId, controlDesc, controlSteps, expDesc, expSteps, expPrepSteps, controlPrepSteps);
    },

    'galileo.experiments.checkIncompleteExp': function() {
        console.log('~~~~~~~~~~~~~~~~~checkIncompleteExp');

        let userMap = {};

        let nowInGMT = Time.getNowInGmt();
        let nowMinus3Days = (new Time(nowInGMT)).addDay(-3);
        let nowMinus4Days = (new Time(nowInGMT)).addDay(-4);
        console.log('nowMinus4Days = ' + nowMinus4Days.getDate());
        console.log('nowMinus3Days = ' + nowMinus3Days.getDate());

        // exp created date + 4 days > now >= exp created date + 3 days
        // =>  now - 3 days >= exp created date > now - 4 days
        Experiments.find({
            status: ExperimentStatus.CREATED,
            status_change_date_time: {
                $gt: nowMinus4Days.getDate(),
                $lte: nowMinus3Days.getDate()
            }
        }).map((exp) => {
            if (userMap[exp.user_id] === undefined) {

                console.log('sending email to ' + exp.username);

                // This is to notify a user ONLY ONCE
                userMap[exp.user_id] = exp.user_id;

                let design = ExperimentDesigns.find({
                    _id: exp.curr_design_id
                }).fetch()[0];
                let expTitle = "Does " + design.cause + " affect " + design.effect + "?";
                let args = {
                    creatorName: exp.username,
                    expTitle: expTitle,
                    design_progress: exp.design_progress,
                    cause: design.cause
                };
                let message = "You have partially designed experiments waiting for completion";
                let url = "/galileo/me/unfinished_experiments";

                Meteor.call("galileo.notification.new", exp.user_id, message, url, NotificationType.INCOMPLETE_EXP_3DAYS, args);
            }
        });
    },






    /**
     * ********************************************************
     * Experiment Design Setter and Getter
     * ********************************************************
     */

    'galileo.experiments.getFeedbackUsers': function(expId) {
        let exp = Experiments.find({
            _id: expId
        }, {
            fields: {
                feedback_users: 1
            }
        }).fetch();
        let reviewers = [];
        if (exp && exp.length > 0) {
            let result = exp[0].feedback_users;
            result.forEach(function(element) {
                let user = Meteor.users.find({
                    _id: element
                }, {
                    fields: {
                        username: 1
                    }
                }).fetch()[0];
                reviewers.push(user.username);
            })
        }
        return reviewers;
    },
    'galileo.experiments.design.get': function(designId) {
        return ExperimentDesigns.findOne({
            _id: designId
        });
    },
    'galileo.experiments.design.setTimeStamp': function(designId, type) {
        if (type === "finishIntuition") {
            ExperimentDesigns.update({
                _id: designId
            }, {
                $set: {
                    "timeStamp.finishIntuition": new Date()
                }
            });
        } else if (type === "finishMeasureCause") {
            ExperimentDesigns.update({
                _id: designId
            }, {
                $set: {
                    "timeStamp.finishMeasureCause": new Date()
                }
            });
        } else if (type === "finishMeasureEffect") {
            ExperimentDesigns.update({
                _id: designId
            }, {
                $set: {
                    "timeStamp.finishMeasureEffect": new Date()
                }
            });
        } else if (type === "finishRemindTime") {
            ExperimentDesigns.update({
                _id: designId
            }, {
                $set: {
                    "timeStamp.finishRemindTime": new Date()
                }
            });
        } else if (type === "finishProvideSteps") {
            ExperimentDesigns.update({
                _id: designId
            }, {
                $set: {
                    "timeStamp.finishProvideSteps": new Date()
                }
            });
        } else if (type === "finishProvideCriteria") {
            ExperimentDesigns.update({
                _id: designId
            }, {
                $set: {
                    "timeStamp.finishProvideCriteria": new Date()
                }
            });
        } else if (type === "finishDesign") {
            ExperimentDesigns.update({
                _id: designId
            }, {
                $set: {
                    "timeStamp.finishDesign": new Date()
                }
            });
        }

    },
    'galileo.experiments.design.setIntuition': function(designId, intuition) {
        ExperimentDesigns.update({
            _id: designId
        }, {
            $set: {
                "intuition": intuition
            }
        });
    },
    'galileo.experiments.design.setHypothesis': function(designId, cause, relation, effect, mechanism = null, related_works = null) {
        let data = {
            "update_date_time": new Date(),
            "cause": cause,
            "relation": relation,
            "effect": effect,
        };

        if (mechanism != null) {
            data.mechanism = mechanism;
        }

        if (related_works != null) {
            data.related_works = related_works;
        }

        ExperimentDesigns.update({
            _id: designId
        }, {
            $set: data
        });
    },
    'galileo.experiments.design.setCause': function(designId, cause) {
        ExperimentDesigns.update({
            _id: designId
        }, {
            $set: {
                "cause": cause
            }
        });
    },
    'galileo.experiments.design.setRelation': function(designId, relation) {
        ExperimentDesigns.update({
            _id: designId
        }, {
            $set: {
                "relation": relation
            }
        });
    },
    'galileo.experiments.design.setEffect': function(designId, effect) {
        ExperimentDesigns.update({
            _id: designId
        }, {
            $set: {
                "effect": effect
            }
        });
    },
    'galileo.experiments.design.setFeedbackRequest': function(designId, feedbackRequest) {
        ExperimentDesigns.update({
            _id: designId
        }, {
            $set: {
                "update_date_time": new Date(),
                "feedback_request": feedbackRequest
            }
        });
    },
    'galileo.experiments.design.setFollowupMessage': function(designId, followupMessageCause, followupMessageEffect) {
        ExperimentDesigns.update({
            _id: designId
        }, {
            $set: {
                "followup_message_cause": followupMessageCause,
                "followup_message_effect": followupMessageEffect,
            }
        });
    },
    'galileo.experiments.design.setMechanism': function(designId, mechanism) {
        ExperimentDesigns.update({
            _id: designId
        }, {
            $set: {
                "mechanism": mechanism
            }
        });
    },
    'galileo.experiments.design.setVariableIdentified': function(designId) {
        ExperimentDesigns.update({
            _id: designId
        }, {
            $set: {
                "variables_identified": true
            }
        });
    },
    'galileo.experiments.design.setCauseMeasure': function(designId, causeMeasure) {
        ExperimentDesigns.update({
            _id: designId
        }, {
            $set: {
                "cause_measure": causeMeasure
            }
        });
    },
    'galileo.experiments.design.setEffectMeasure': function(designId, effectMeasure) {
        ExperimentDesigns.update({
            _id: designId
        }, {
            $set: {
                "effect_measure": effectMeasure
            }
        });
    },
    'galileo.experiments.design.setInclusionCriteria': function(designId, inclusionCriteria) {
        let ic = [];
        inclusionCriteria.forEach(function(elt) {
            if (elt.substring(0, 3).toLowerCase() === 'you') {
                let length = elt.length + 1;
                let validString = elt.substring(3, length);
                ic.push(validString);
            } else {
                ic.push(elt);
            }
        });
        ExperimentDesigns.update({
            _id: designId
        }, {
            $set: {
                "update_date_time": new Date(),
                "criteria.inclusion": ic
            }
        });
    },
    'galileo.experiments.design.setExclusionCriteria': function(designId, exclusionCriteria) {
        let ec = [];
        exclusionCriteria.forEach(function(elt) {
            if (elt.substring(0, 3).toLowerCase() === 'you') {
                let length = elt.length + 1;
                let validString = elt.substring(3, length);
                ec.push(validString);
            } else {
                ec.push(elt);
            }
        });
        ExperimentDesigns.update({
            _id: designId
        }, {
            $set: {
                "update_date_time": new Date(),
                "criteria.exclusion": ec
            }
        });
    },
    'galileo.experiments.design.setConditionInstructions': function(designId, control, controlGroupInstructions, experimental, expGroupInstructions, expGroupPrepInstructions, controlGroupPrepInstructions) {
        ExperimentDesigns.update({
            _id: designId
        }, {
            $set: {
                "update_date_time": new Date(),
                "condition": {
                    "control": {
                        "description": control,
                        "steps": controlGroupInstructions,
                        "prep_steps": controlGroupPrepInstructions,
                    },
                    "experimental": {
                        "description": experimental,
                        "steps": expGroupInstructions,
                        "prep_steps": expGroupPrepInstructions,
                    }
                }
            }
        });
    },
    'galileo.experiments.analysis.printSingleCause': function(post_data) {
        let result = HTTP.call("post", getAPIURL(Meteor.settings.analysisScriptAPI, "printSingleCause"), {
            data: post_data
        });

        let filecontent = JSON.parse(result.content)["content"];
        console.log(filecontent)
        return filecontent;
    },
    'galileo.experiments.analysis.printGreaterEffect': function(post_data) {
        let result = HTTP.call("post", getAPIURL(Meteor.settings.analysisScriptAPI, "printGreaterEffect"), {
            data: post_data
        });

        let filecontent = JSON.parse(result.content)["content"];
        let results = filecontent.split("$$$");
        results[1] = Meteor.settings.analysisImageURL + results[1]
        return "" + results[0] + "$$$" + results[1];
    },
});

function getAPIURL(base, action) {
    return base + action;
}

function generateExperimentObject(userId, userName, designId, mendel) {
    return {
        "user_id": userId,
        "username": userName,
        "curr_design_id": designId,
        "versions": [{
            "create_date_time": new Date(),
            "design_id": designId
        }],
        "status": ExperimentStatus.CREATED,
        "status_change_date_time": new Date(),
        "design_progress": 0,
        "feedback_users": [],
        "pilot_users": [],
        "run_users": [],
        "waitlist_users": [],
        "flag_status": false,
        "flag_user": "",
        "flag_reason": "",
        "mendel_ga_id": mendel,
        "min_participant_count": 20,
        "clarification": [],
        "results": {
            title: "",
            graph: "",
            control: {
                graph: ""
            },
            experimental: {
                graph: ""
            }
        }
    };
}

function generateDesignObject(intuition, username) {
    return {
        "create_date_time": new Date(),
        "username": username,
        "intuition": intuition,
        "cause": undefined,
        "relation": undefined,
        "effect": undefined,
        "mechanism": undefined,
        "related_works": undefined,
        "cause_measure": {
            "type": undefined,
            "frequency": undefined,
            "time": undefined
        },
        "effect_measure": {
            "type": undefined,
            "frequency": undefined,
            "time": undefined
        },
        "feedback_request": undefined,
        "criteria": {
            "inclusion": [],
            "exclusion": []
        },
        "condition": {
            "control": {
                "description": undefined,
                "steps": []
            },
            "experimental": {
                "description": undefined,
                "steps": []
            }
        },
        "timeStamp": {
            "finishIntuition": undefined,
            "finishMeasureCause": undefined,
            "finishMeasureEffect": undefined,
            "finishRemindTime": undefined,
            "finishProvideSteps": undefined,
            "finishProvideCriteria": undefined,
            "finishDesign": undefined
        }
    };
}

function getExperimentWithParticipantDataHelper(expId) {
    let expParticipantsData = Participations.find({
        exp_id: expId
    }).fetch();
    let exp = Experiments.findOne({
        _id: expId
    });
    if (exp) {
        let expDesign = ExperimentDesigns.findOne({
            _id: exp.curr_design_id
        });
        if (expDesign) {
            exp.design = expDesign;
            let user = Meteor.users.find({
                _id: exp.user_id
            }, {
                fields: {
                    username: 1
                }
            }).fetch()[0];

            if (exp.run_users.length > 0) {
                let participantInfoResults = [];
                exp.run_users.forEach(function(currentUser) {
                    let user_id = Meteor.call('galileo.run.getParticipantMapToUser', expId, currentUser);
                    var userDataTemp = Meteor.users.find({
                        _id: user_id
                    }, {
                        fields: {
                            'username': 1,
                            'galileo.city': 1,
                            'galileo.country': 1,
                            'galileo.phone': 1,
                            'galileo.timezone': 1
                        }
                    }).fetch()[0];
                    if (userDataTemp.galileo.country == "USA") {
                        userDataTemp.flag = "flag-icon-us";
                    } else if (userDataTemp.galileo.country == "CHN") {
                        userDataTemp.flag = "flag-icon-cn";
                    } else if (userDataTemp.galileo.country == "MNE") {
                        userDataTemp.flag = "flag-icon-me";
                    } else if (userDataTemp.galileo.country == "BRA") {
                        userDataTemp.flag = "flag-icon-br";
                    } else if (userDataTemp.galileo.country == "NZL") {
                        userDataTemp.flag = "flag-icon-nz";
                    } else if (userDataTemp.galileo.country == "CAN") {
                        userDataTemp.flag = "flag-icon-ca";
                    } else if (userDataTemp.galileo.country == "GBR") {
                        userDataTemp.flag = "flag-icon-gb";
                    } else if (userDataTemp.galileo.country == "IND") {
                        userDataTemp.flag = "flag-icon-in";
                    } else if (userDataTemp.galileo.country == "EGY") {
                        userDataTemp.flag = "flag-icon-eg";
                    } else if (userDataTemp.galileo.country == "AUS") {
                        userDataTemp.flag = "flag-icon-au";
                    } else if (userDataTemp.galileo.country == "ESP") {
                        userDataTemp.flag = "flag-icon-es";
                    } else if (userDataTemp.galileo.country == "NLD") {
                        userDataTemp.flag = "flag-icon-nl";
                    } else if (userDataTemp.galileo.country == "DNK") {
                        userDataTemp.flag = "flag-icon-dk";
                    } else if (userDataTemp.galileo.country == "ITA") {
                        userDataTemp.flag = "flag-icon-it";
                    } else {
                        userDataTemp.flag = "flag-icon-aw";
                    }
                    userDataTemp.duration = exp.duration;
                    userDataTemp.all_cause_data = [];
                    userDataTemp.all_effect_data = [];
                    userDataTemp.participantMap = currentUser;
                    userDataTemp.user_start_date = "";

                    expParticipantsData.forEach(function(currentRecord) {
                        if (currentRecord.user_id === user_id) {
                            userDataTemp.all_cause_data = currentRecord.cause_data;
                            userDataTemp.all_effect_data = currentRecord.effect_data;
                            userDataTemp.user_start_date = currentRecord.user_startDate_inGmt;
                            userDataTemp.group = currentRecord.group;
                        }
                    })

                    participantInfoResults.push(userDataTemp);
                });
                exp.participantInfoResults = participantInfoResults;
            }

            if (user && user.username) {
                exp.username = user.username;
            }

            return exp;
        } else {
            return undefined
        }
    } else {
        return undefined;
    }
}


function getExperimentWithCommentDataHelper(expId) {
    let expFeedbacksData = Feedbacks.find({
        exp_id: expId
    }).fetch();
    let exp = Experiments.findOne({
        _id: expId
    });
    if (exp) {
        let expDesign = ExperimentDesigns.findOne({
            _id: exp.curr_design_id
        });
        if (expDesign) {
            exp.design = expDesign;
            // let user = Meteor.users.find({_id:exp.user_id},{
            //     fields:{
            //         username:1
            //     }
            // }).fetch()[0];
            exp.expFeedbacksData = expFeedbacksData;
        }

        return exp;
    } else {
        return undefined;
    }
}

function getExperimentsByUserHelper(targetUserID) {
    //console.log("in helper function getExperimentsByUserHelper");
    if (!targetUserID) {
        return null;
    } else {
        let syncfunc = Meteor.wrapAsync(function(callback) {
            Experiments.rawCollection().aggregate([ // Raw Collection returns the original mongo db collection so that we can do aggregate on it
                {
                    $match: { // First matching all the experiments that has status greater than merely created.
                        user_id: targetUserID
                    }
                },
                {
                    $lookup: { // Then look up the current experiment design in the "ga_experiment_designs" collection and put it in the local field as "design"
                        from: "ga_experiment_designs",
                        localField: "curr_design_id",
                        foreignField: "_id",
                        as: "design"
                    }
                },
                {
                    $unwind: "$design" // Follow up stage after look up. Since there will be only one experiment design, unwind stage will simply unwind { design: [{ /* design */ }] } to { design: {/* design */} }
                }
            ], callback);
        });
        return syncfunc();
    }
}

function updateExperiment(userId, content) {
    let obj = {};
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

    console.log("pushed!!!!");
}

function dateStr(date) {
    return dayWeekStr(date.getDay()) + ", " + monthStr(date.getMonth()) + ". " + date.getDate() + ", " + date.getFullYear();
}

function monthStr(month) {
    switch (month) {
        case 0:
            return "Jan";
        case 1:
            return "Feb";
        case 2:
            return "Mar";
        case 3:
            return "Apr";
        case 4:
            return "May";
        case 5:
            return "Jun";
        case 6:
            return "Jul";
        case 7:
            return "Aug";
        case 8:
            return "Sep";
        case 9:
            return "Oct";
        case 10:
            return "Nov";
        case 11:
            return "Dec";
    }
}

function dayWeekStr(month) {
    switch (month) {
        case 0:
            return "Sunday";
        case 1:
            return "Monday";
        case 2:
            return "Tuesday";
        case 3:
            return "Wednesday";
        case 4:
            return "Thursday";
        case 5:
            return "Friday";
        case 6:
            return "Saturday";
    }
}
