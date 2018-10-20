import './_.jade';
import {
    MeasureType,
    ParticipationSlotStatus
} from "../../../../../../imports/api/ga-models/constants";
import {
    ExperimentStatus
} from "../../../../../../imports/api/ga-models/constants";
import {
    TimeSpan,
    Time
} from "../../../../../../imports/api/ga-models/time";

Template.gaMeDashboard.rendered = function() {
    setTimeout(function() {
        $('select').material_select();
    }, 0);
};

Template.gaMeDashboard.rendered = (function() {
    $(document).ready(function() {
        $('.modal').modal();

        let x = Array.from($(".materialize-textarea.textarea-cause"));
        setInterval(function() {

            let x = Array.from($(".materialize-textarea.textarea-cause"));
            if (x !== undefined && x.length > 0) {
                for (let i = 0; i < x.length; i++) {
                    if (x[i].value == "Not open yet") {
                        $("#" + (x[i].id)).prop('disabled', true)
                    }
                }

                x = Array.from($(".materialize-textarea.textarea-effect"));

                for (let i = 0; i < x.length; i++) {
                    if (x[i].value == "Not open yet") {
                        $("#" + (x[i].id)).prop('disabled', true)
                    }
                }
            }
        }, 250);
    });
});

Template.gaMeDashboard.onCreated(function() {

    let inst = this;
    this.finishedTouring = new ReactiveVar(false);
    this.notifyFinish = new ReactiveVar(false);

    // all exp data
    this.allMyExperiments = new ReactiveArray();
    this.myOngoingExp = new ReactiveArray();
    this.participation = new ReactiveVar();
    this.myUnderReviewExp = new ReactiveArray();
    this.myReadyToRunExp = new ReactiveArray();
    this.myIncompeleteExp = new ReactiveArray();
    this.myCompletedExp = new ReactiveArray();
    this.myParticipateExp = new ReactiveVar(undefined);
    this.participateExpUnderReview = new ReactiveVar(undefined);
    this.exp = new ReactiveVar(undefined);
    this.isLoaded = new ReactiveVar(false);
    this.currUser = new ReactiveVar();
    this.userId = new ReactiveVar();
    this.myCompleteParticipatingExps = new ReactiveArray();

    Meteor.call('galileo.profile.isAdmin', function(err, res) {
        if (window.location.pathname.split("/")[4] !== undefined && window.location.pathname.split("/")[4].length > 0 && res) {
            inst.userId.set(window.location.pathname.split("/")[4]);
        } else {
            inst.userId.set(Meteor.userId());
        }

        Meteor.call("galileo.experiments.getParticipatingExpByUserComplete", inst.userId.get(), function(err, myCompleteParticipatingExps) {
            inst.myCompleteParticipatingExps.set(myCompleteParticipatingExps);
        })

        // passing false as mendel id to fetch all experiment
        Meteor.call("galileo.experiments.getExperimentsByUser", inst.userId.get(), function(err, allMyExperiments) {
            //console.log("get result from getExperimentsByUser");
            inst.isLoaded.set(true);
            if (err) {
                throw err;
            }
            inst.allMyExperiments.set(allMyExperiments);

            let myOngoingExp = [],
                myUnderReviewExp = [],
                myIncompeleteExp = [],
                myCompletedExp = [];
            let myOngoingExpCounter = 0,
                myUnderReviewExpCounter = 0,
                myIncompeleteExpCounter = 0,
                myCompletedExpCounter = 0;

            allMyExperiments.forEach(function(exp_item) {
                if (exp_item.status === ExperimentStatus.CREATED) {
                    myIncompeleteExp.push(exp_item)
                } else if (exp_item.status == ExperimentStatus.FINISHED || exp_item.status == ExperimentStatus.ANALYSIS_REQUESTED ||
                    exp_item.status == ExperimentStatus.ANALYSIS_FINISHED) {
                    myCompletedExp.push(exp_item);
                }
            });

            inst.myIncompeleteExp.set(myIncompeleteExp);
            inst.myCompletedExp.set(myCompletedExp);
            $("title").html("Galileo | Dashboard");
        });

        Meteor.call("galileo.experiments.getMulExperimentWithParticipantData", inst.userId.get(), function(err, allMyOngoingExperiments) {
            //console.log("get result from getMulExperimentWithParticipantData" + JSON.stringify(allMyOngoingExperiments));
            inst.myOngoingExp.set(allMyOngoingExperiments);
        });

        Meteor.call("galileo.experiments.getExperimentsWithReviewData", inst.userId.get(), function(err, allMyUnderReviewExperiments) {
            // console.log("result from getMulExperimentWithReviewData " + JSON.stringify(allMyUnderReviewExperiments));
            if (err) {
                throw err;
            }
            inst.myUnderReviewExp.set(allMyUnderReviewExperiments);
        });

        Meteor.call("galileo.profile.getProfile", inst.userId.get(), function(err, result) {
            inst.currUser.set(result);
        })

        Meteor.call("galileo.experiments.getReadyToRunExperiment", inst.userId.get(), function(err, result) {
            // console.log("result from getReadyToRunExperiment " + JSON.stringify(result));
            if (err) {
                throw err;
            }
            inst.myReadyToRunExp.set(result);
        });

        Meteor.call("galileo.experiments.getParticipatingExpByUser", inst.userId.get(), function(err, resultExp) {
            if (err) {
                throw err;
            }
            // console.log("my participating exp in meteor call: " + JSON.stringify(resultExp));
            if (resultExp) {
                inst.myParticipateExp.set(resultExp);
                inst.participation.set(resultExp.pResult);
            }
        });

        Meteor.call("galileo.experiments.getParticipatingExpUnderReviewing", inst.userId.get(), function(err, resultExp) {
            if (err) {
                throw err;
            }
            // console.log("my participating exp in meteor call: " + JSON.stringify(resultExp));
            if (resultExp) {
                inst.participateExpUnderReview.set(resultExp);
            }
        });
        Meteor.call("galileo.tour.finishedTouring", function(err, finished) {
            if (finished) {

                inst.finishedTouring.set(true);

                Meteor.call("galileo.tour.hasNotifiedFinish", function(err, has) {
                    if (!has) {
                        inst.notifyFinish.set(true);
                        Meteor.call("galileo.tour.notifyFinish");
                    }
                });
            } else {
                inst.finishedTouring.set(false);
            }
        });
    });
});

Template.gaMeDashboard.helpers({
    isBristol: function () {
        let user_exp = Template.instance().myParticipateExp.get();
        if (user_exp == undefined) {
            user_exp = Template.instance().participateExpUnderReview.get();
            if (user_exp == undefined) {
                return false
            }
        }
        let expDesign = user_exp.design;
        if (expDesign.effect_measure.type === "Bristol") {
            return true;
        }
        else {
            return false;
        }
    },
    relatedStep: function() {
        let user_exp = Template.instance().myParticipateExp.get();
        if (user_exp == undefined) {
            user_exp = Template.instance().participateExpUnderReview.get();
            if (user_exp == undefined) {
                return "Measurement Scale (Bristol Stool) for steps"
            }
        }

        expDesign = user_exp.design
        let participantGroup = user_exp.pResult.group;

        let steps = [];
        if (participantGroup === 1) {
            expDesign.condition.experimental.steps.forEach(function(element) {
                steps.push(element.charAt(0).toUpperCase() + element.slice(1));
            });
        } else if (participantGroup === 0) {
            expDesign.condition.control.steps.forEach(function(element) {
                steps.push(element.charAt(0).toUpperCase() + element.slice(1));
            });
        }

        let num = -1;

        for (i = 0; i < steps.length; i++) {
            if (steps[i].includes("scale")) {
                num = i + 1;
            }
        }

        if (num != -1) {
            return "Measurement Scale (Bristol Stool) for step " + num;
        }
        else {
            return "Measurement Scale (Bristol Stool) for steps";
        }
    },
    userId: function() {
        return Template.instance().userId.get();
    },
    hasCompleteParticipationExps: function() {
        let list = Template.instance().myCompleteParticipatingExps.get();
        if (list) {
            return list.length > 0;
        }
    },
    myCompleteParticipatingExps: function() {
        return Template.instance().myCompleteParticipatingExps.get();
    },
    noData: function(cause_effect) {
        if (cause_effect === "Not recorded yet") {
            return true;
        } else {
            return false;
        }
    },
    isLoaded: function() {
        return Template.instance().isLoaded.get();
    },
    notifyFinish: function() {
        return Template.instance().notifyFinish.get();
    },
    finishedTouring: function() {
        return Template.instance().finishedTouring.get();
    },
    // helpers for dashboard exp status display
    hasOngoingExp: function() {
        let user_exp = Template.instance().myOngoingExp.get();
        return (user_exp && user_exp.length > 0);
    },
    myOngoingExp: function() {
        let user_exp = Template.instance().myOngoingExp.get();
        return (user_exp && user_exp.length > 0 && user_exp[0]);
    },
    hasUnderReviewExp: function() {
        let user_exp = Template.instance().myUnderReviewExp.get();
        return (user_exp && user_exp.length > 0);
    },
    hasReadyToRunExp: function() {
        let user_exp = Template.instance().myReadyToRunExp.get();
        return user_exp;
    },
    getReadyToRunExp: function() {
        let user_exp = Template.instance().myReadyToRunExp.get();
        let return_exp = [];
        user_exp.forEach(function(exp) {
            exp["joinLink"] = getJoinLink(exp._id);
            return_exp.push(exp);
        });
        return return_exp;
    },
    getCurrentNumPart: function(id) {
        let user_exp = Template.instance().myReadyToRunExp.get();
        let num = 0;
        if (user_exp == undefined) {
            return;
        }
        user_exp.forEach(function(exp) {
            if (exp._id === id) {
                num = exp.run_users.length;
            }
        });
        return num;
    },
    getNeededPart: function(id) {
        let user_exp = Template.instance().myReadyToRunExp.get();
        let result = 0;
        if (user_exp == undefined) {
            return;
        }
        user_exp.forEach(function(exp) {
            if (exp._id === id) {
                if (exp.min_participant_count === exp.run_users.length) {
                    return result;
                }
                result = exp.min_participant_count - exp.run_users.length;
            }
        });
        return result;
    },
    getInviteJoinUrl: function(id) {
        return getJoinLink(id);
    },
    isEnoughParticipants: function(id) {
        let user_exp = Template.instance().myReadyToRunExp.get();
        let result = undefined;
        if (user_exp == undefined) {
            return;
        }
        user_exp.forEach(function(exp) {
            if (exp._id === id) {
                if (exp.min_participant_count <= exp.run_users.length) {
                    result = true;
                } else {
                    result = false;
                }
            }
        });
        return result;
    },
    isOneJoin: function(id) {
        let user_exp = Template.instance().myReadyToRunExp.get();
        let result = undefined;
        if (user_exp == undefined) {
            return;
        }
        user_exp.forEach(function(exp) {
            if (exp._id === id) {
                if (exp.run_users.length === 0 || exp.run_users.length === 1) {
                    result = true;
                } else {
                    result = false;
                }
            }
        });
        return result;
    },
    isOneNeed: function(id) {
        let user_exp = Template.instance().myReadyToRunExp.get();
        let result = undefined;
        if (user_exp == undefined) {
            return;
        }
        user_exp.forEach(function(exp) {
            if (exp._id === id) {
                if (exp.min_participant_count - exp.run_users.length === 1) {
                    result = true;
                } else {
                    result = false;
                }
            }
        });
        return result;
    },
    hasIncompeleteExp: function() {
        let user_exp = Template.instance().myIncompeleteExp.get();
        return (user_exp && user_exp.length > 0);
    },
    hasCompeletedExp: function() {
        let user_exp = Template.instance().myCompletedExp.get();
        return (user_exp && user_exp.length > 0);
    },
    myCompletedExpShort: function() {
        let user_exp = Template.instance().myCompletedExp.get();
        let arr = [];
        for (var i = 0; i < 100 && i < user_exp.length; i++) {
            arr.push(user_exp[i]);
        }
        return arr;
    },
    myCompletedExp: function() {
        let user_exp = Template.instance().myCompletedExp.get();
        // console.log(user_exp)
        return user_exp;
    },
    numCompletedExp: function() {
        let user_exp = Template.instance().myCompletedExp.get();
        return user_exp.length;
    },
    waitToAnalysis: function(id) {
        let user_exp = Template.instance().myCompletedExp.get();
        if (user_exp == undefined) {
            return;
        }
        let result = false;
        user_exp.forEach(function(element) {
            if (element._id === id && element.status === 11) {
                result = true;
            }
        });
        return result;
    },
    hasRequestDataAnalysis: function(id) {
        let user_exp = Template.instance().myCompletedExp.get();
        if (user_exp == undefined) {
            return;
        }
        let result = false;
        user_exp.forEach(function(element) {
            if (element._id === id && element.status === 12) {
                result = true;
            }
        });
        return result;
    },
    analysisFinished: function(id) {
        let user_exp = Template.instance().myCompletedExp.get();
        if (user_exp == undefined) {
            return;
        }
        let result = false;
        user_exp.forEach(function(element) {
            if (element._id === id && element.status === 13) {
                result = true;
            }
        });
        return result;
    },
    isPreparingToStartExp: function() {
        let user_exp = Template.instance().myOngoingExp.get();
        if (user_exp == undefined || user_exp[0] == undefined) {
            return;
        }
        return user_exp[0].status === ExperimentStatus.PREPARING_TO_START;
    },
    getStartDate: function() {
        let user_exp = Template.instance().myOngoingExp.get();
        if (user_exp == undefined || user_exp[0] == undefined) {
            return;
        }
        let start = user_exp[0].start_date_time.toString().split(" ").splice(0, 4).join('-');
        return start;
    },
    totalOngoingExp: function() {
        let user_exp = Template.instance().myOngoingExp.get();
        return user_exp.length;
    },
    getOngoingExperimentCurrentDay: function() {
        let user_exp = Template.instance().myOngoingExp.get();
        let currUser = Template.instance().currUser.get();

        if (currUser && user_exp && user_exp[0]) {
            let timeZoneOffset = currUser.timezone + parseInt(currUser.isDst);
            let nowInGMT = new Time(new Date()).addHour(timeZoneOffset);

            let ts = new TimeSpan(user_exp[0].start_date_time, nowInGMT);
            return Math.floor(ts.getDays()) + 1;
        }
    },
    getOngoingExperimentTotalDay: function() {
        let user_exp = Template.instance().myOngoingExp.get();
        let duration = user_exp[0].duration;
        return duration;
    },
    ongoingExpCause: function() {
        let user_exp = Template.instance().myOngoingExp.get();
        let cause = [];
        user_exp.forEach(function(element) {
            cause.push(element.design.cause);
        });
        return cause;
    },
    ongoingExpEffect: function() {
        let user_exp = Template.instance().myOngoingExp.get();
        let effect = [];
        user_exp.forEach(function(element) {
            effect.push(element.design.effect);
        });
        return effect;
    },
    ongoingExpId: function() {
        let user_exp = Template.instance().myOngoingExp.get();
        if (user_exp == undefined || user_exp[0] == undefined) {
            return;
        }

        localStorage.setItem("galileo_ongoingexp_id", user_exp[0]._id);
        return user_exp[0]._id;
    },
    ongoingExpInfo: function() {
        let user_exp = Template.instance().myOngoingExp.get();
        let exps = [];
        user_exp.forEach(function(element) {
            exps.push(element);
        });
        return exps;
    },
    ongoingExpTitle: function() {
        let user_exp = Template.instance().myOngoingExp.get();
        if (user_exp == undefined || user_exp[0] == undefined) {
            return;
        }
        return "Does " + user_exp[0].design.cause + " " + "affect" + " " + user_exp[0].design.effect + " ?";
    },
    totalParticipants: function() {
        let user_exp = Template.instance().myOngoingExp.get();
        return user_exp[0].run_users.length;
    },
    allParticipantsReceivedCauseReminder: function(currentDay) {
        let exp = Template.instance().myOngoingExp.get();
        let participants = exp[0].participantInfoResults;
        let count = 0;
        for (let i = 0; i < participants.length; i++) {
            if (participants[i].all_cause_data[currentDay - 1].status != 0) {
                count++;
            }
        }
        if (count === participants.length) {
            return true;
        } else {
            return false;
        }
    },
    allParticipantsReceivedEffectReminder: function(currentDay) {
        let exp = Template.instance().myOngoingExp.get();
        let participants = exp[0].participantInfoResults;
        let count = 0;
        for (let i = 0; i < participants.length; i++) {
            if (participants[i].all_effect_data[currentDay - 1].status != 0) {
                count++;
            }
        }
        if (count === participants.length) {
            return true;
        } else {
            return false;
        }
    },
    participantsNotReceivedCauseReminder: function (currentDay) {
        let exp = Template.instance().myOngoingExp.get();
        let participants = exp[0].participantInfoResults;
        let count = 0;
        for (let i = 0; i < participants.length; i++) {
            if (participants[i].all_cause_data[currentDay - 1].status === 0) {
                count++;
            }
        }
        return count;
    },
    receivedAndRepliedCause: function (currentDay) {
        let exp = Template.instance().myOngoingExp.get();
        let participants = exp[0].participantInfoResults;
        let count = 0;
        for (let i = 0; i < participants.length; i++) {
            if (participants[i].all_cause_data[currentDay - 1].status === 1 && participants[i].all_cause_data[currentDay - 1].value === undefined) {
                count++;
            }
        }
        return count == 0;
    },
    receivedCauseReminder: function (currentDay) {
        let exp = Template.instance().myOngoingExp.get();
        let participants = exp[0].participantInfoResults;
        let count = 0;
        for (let i = 0; i < participants.length; i++) {
            if (participants[i].all_cause_data[currentDay - 1].status === 0) {
                count++;
            }
        }
        return participants.length - count;
    },
    receivedButNotRepliedCause: function (currentDay) {
        let exp = Template.instance().myOngoingExp.get();
        let participants = exp[0].participantInfoResults;
        let count = 0;
        for (let i = 0; i < participants.length; i++) {
            if (participants[i].all_cause_data[currentDay - 1].status === 1 && participants[i].all_cause_data[currentDay - 1].value === undefined) {
                count++;
            }
        }
        return count;
    },
    participantsNotReceivedEffectReminder: function (currentDay) {
        let exp = Template.instance().myOngoingExp.get();
        let participants = exp[0].participantInfoResults;
        let count = 0;
        for (let i = 0; i < participants.length; i++) {
            if (participants[i].all_effect_data[currentDay - 1].status === 0) {
                count++;
            }
        }
        return count;
    },
    receivedAndRepliedEffect: function (currentDay) {
        let exp = Template.instance().myOngoingExp.get();
        let participants = exp[0].participantInfoResults;
        let count = 0;
        for (let i = 0; i < participants.length; i++) {
            if (participants[i].all_effect_data[currentDay - 1].status === 1 && participants[i].all_effect_data[currentDay - 1].value === undefined) {
                count++;
            }
        }
        return count === 0;
    },
    receivedEffectReminder: function (currentDay) {
        let exp = Template.instance().myOngoingExp.get();
        let participants = exp[0].participantInfoResults;
        let count = 0;
        for (let i = 0; i < participants.length; i++) {
            if (participants[i].all_effect_data[currentDay - 1].status === 0) {
                count++;
            }
        }
        return participants.length - count;
    },
    receivedButNotRepliedEffect: function (currentDay) {
        let exp = Template.instance().myOngoingExp.get();
        let participants = exp[0].participantInfoResults;
        let count = 0;
        for (let i = 0; i < participants.length; i++) {
            if (participants[i].all_effect_data[currentDay - 1].status === 1 && participants[i].all_effect_data[currentDay - 1].value === undefined) {
                count++;
            }
        }
        return count;
    },
    allParticipantsReceivedEitherReminder: function (currentDay) {
        let exp = Template.instance().myOngoingExp.get();
        let participants = exp[0].participantInfoResults;
        let cause_count = 0;
        let effect_count = 0;
        for (let i = 0; i < participants.length; i++) {
            if (participants[i].all_cause_data[currentDay - 1].status != 0) {
                cause_count++;
            }
            if (participants[i].all_effect_data[currentDay - 1].status != 0) {
                effect_count++;
            }
        }
        if (cause_count === participants.length || effect_count === participants.length) {
            return true;
        } else {
            return false;
        }
    },
    allParticipantsRepliedCause: function(currentDay) {
        let exp = Template.instance().myOngoingExp.get();
        let participants = exp[0].participantInfoResults;
        let partNotReply = [];
        for (let i = 0; i < participants.length; i++) {
            let hasCause = participants[i].all_cause_data[currentDay - 1].status;
            if (hasCause === 0 || !participants[i].all_cause_data[currentDay - 1].value) {
                partNotReply.push(hasCause);
            }
        }
        return partNotReply.length === 0;
    },
    allParticipantsRepliedEffect: function(currentDay) {
        let exp = Template.instance().myOngoingExp.get();
        let participants = exp[0].participantInfoResults;
        let partNotReply = [];
        for (let i = 0; i < participants.length; i++) {
            let hasEffect = participants[i].all_effect_data[currentDay - 1].status;
            if (hasEffect === 0 || !participants[i].all_effect_data[currentDay - 1].value) {
                partNotReply.push(hasEffect);
            }
        }
        return partNotReply.length === 0;
    },
    participantsNotRepliedCause: function(currentDay) {
        let exp = Template.instance().myOngoingExp.get();
        let participants = exp[0].participantInfoResults;
        let partNotReply = [];
        for (let i = 0; i < participants.length; i++) {
            let hasCause = participants[i].all_cause_data[currentDay - 1].status;
            if (hasCause == 1) {
                partNotReply.push(hasCause);
            }
        }
        return partNotReply.length;
    },
    participantsNotRepliedEffect: function(currentDay) {
        let exp = Template.instance().myOngoingExp.get();
        let participants = exp[0].participantInfoResults;
        let partNotReply = [];
        for (let i = 0; i < participants.length; i++) {
            let hasEffect = participants[i].all_effect_data[currentDay - 1].status;
            if (hasEffect == 1) {
                partNotReply.push(hasEffect);
            }
        }
        return partNotReply.length;
    },
    isOneRepliedCause: function (currentDay) {
        let exp = Template.instance().myOngoingExp.get();
        let participants = exp[0].participantInfoResults;
        let count = 0;
        for (let i = 0; i < participants.length; i++) {
            if (participants[i].all_cause_data[currentDay - 1].status === 0) {
                count++;
            }
        }
        let data = participants.length - count;
        if (data == 1 || data == 0) {
            return true;
        }
        else {
            return false;
        }
    },
    isOneRepliedEffect: function (currentDay) {
        let exp = Template.instance().myOngoingExp.get();
        let participants = exp[0].participantInfoResults;
        let count = 0;
        for (let i = 0; i < participants.length; i++) {
            if (participants[i].all_effect_data[currentDay - 1].status === 0) {
                count++;
            }
        }
        let data = participants.length - count;
        if (data == 1 || data == 0) {
            return true;
        }
        else {
            return false;
        }
    },
    getAllPercentage: function(currentDay) {
        let exp = Template.instance().myOngoingExp.get();
        if (exp == undefined || exp[0] == undefined) {
            return;
        }
        let participants = exp[0].participantInfoResults;
        let partReceived = [];
        let partReply = [];
        for (let i = 0; i < participants.length; i++) {
            let hasCause = participants[i].all_cause_data[currentDay - 1].status;
            if (hasCause >= 2) {
                partReply.push(hasCause);
                partReceived.push(hasCause);
            } else if (hasCause == 1) {
                partReceived.push(hasCause);
            }
            let hasEffect = participants[i].all_effect_data[currentDay - 1].status;
            if (hasEffect >= 2) {
                partReply.push(hasEffect);
                partReceived.push(hasEffect);
            } else if (hasEffect == 1) {
                partReceived.push(hasEffect);
            }
        }
        let percentage = Math.round((partReply.length / partReceived.length) * 100);
        return percentage;
    },
    notAllReplied: function(currentDay) {
        let exp = Template.instance().myOngoingExp.get();
        if (exp == undefined || exp[0] == undefined) {
            return;
        }
        let count = 0;
        let participants = exp[0].participantInfoResults;
        for (let i = 0; i < participants.length; i++) {
            if (participants[i].all_cause_data[currentDay - 1].status == 1 && participants[i].all_cause_data[currentDay - 1].value == undefined) {
                count++;
            } else if (participants[i].all_effect_data[currentDay - 1].status == 1 && participants[i].all_effect_data[currentDay - 1].value == undefined) {
                count++;
            }
        }
        return count != 0;
    },
    hasNewClarification: function() {
        let exp = Template.instance().myOngoingExp.get();
        if (exp == undefined || exp[0] == undefined) {
            return;
        }
        let clarification = exp[0].clarification;
        let result = [];
        //console.log("clarifications are: " + JSON.stringify(clarification));
        clarification.forEach(function(c) {
            if (c.resolved === false) {
                result.push(c);
            }
        })
        console.log(result)
        return result.length > 0;
    },
    totalIncompletedExp: function() {
        let user_exp = Template.instance().myIncompeleteExp.get();
        return user_exp.length;
    },
    onlyOneIncompletedExp: function() {
        let user_exp = Template.instance().myIncompeleteExp.get();
        if (user_exp.length === 0 || user_exp.length === 1) {
            return true;
        } else {
            return false;
        }
    },
    incompleteExpInfo: function() {
        let user_exp = Template.instance().myIncompeleteExp.get();
        let exps = [];
        user_exp.forEach(function(element) {
            exps.push(element);
        });
        return exps;
    },
    totalUnderReviewExp: function() {
        let user_exp = Template.instance().myUnderReviewExp.get();
        return user_exp.length;
    },
    onlyOneUnderReviewExp: function() {
        let user_exp = Template.instance().myUnderReviewExp.get();
        if (user_exp.length === 0 || user_exp.length === 1) {
            return true;
        } else {
            return false;
        }
    },
    isThreeUnderReviewExps: function() {
        let user_exp = Template.instance().myUnderReviewExp.get();
        return user_exp.length >= 3;
    },
    getUnderReviewExp: function() {
        let user_exp = Template.instance().myUnderReviewExp.get();
        let result = [];
        if (user_exp == undefined) {
            return;
        }
        if (user_exp.length >= 3) {
            user_exp.forEach(function(e) {
                result.push(e);
                if (result.length === 3) {
                    return result;
                }
            })

        }
        return user_exp;
    },
    hasReviewComment: function() {
        let user_exp = Template.instance().myUnderReviewExp.get();
        return user_exp[0].length > 0;
    },
    listOfReviewComments: function(exp_id) {
        let exps = Template.instance().myUnderReviewExp.get();

        let index = 0;
        for (i = 0; i < exps.length; i++) {
            if (exp_id === exps[i]._id) {
                index = i;
            }
        }

        user_exp = exps[index];

        let length = user_exp.expFeedbacksData.length;
        let twoReview = [];
        let review1 = {};

        review1.content = user_exp.expFeedbacksData[0].content;
        review1.username = user_exp.expFeedbacksData[0].username;
        twoReview.push(review1);
        if (length >= 2) {
            let review2 = {};

            review2.content = user_exp.expFeedbacksData[length - 1].content;
            review2.username = user_exp.expFeedbacksData[length - 1].username;

            twoReview.push(review2);
        }
        return twoReview;
    },

    // Helper functions for the participanting experiment of current user
    hasParticipatingExp: function() {
        return Template.instance().myParticipateExp.get() || Template.instance().participateExpUnderReview.get();
    },
    hasStarted: function() {
        let exp = Template.instance().myParticipateExp.get();
        if (exp == undefined) {
            return;
        }
        console.log("current exp is " + exp._id + " status: " + exp.status);
        return exp.status === ExperimentStatus.STARTED || exp.status === ExperimentStatus.FINISHED;
    },
    getStart: function() {
        let exp = Template.instance().myParticipateExp.get();
        if (exp == undefined) {
            return;
        }
        let start = exp.start_date_time.toString().split(" ").splice(0, 4).join('-');
        return start;
    },
    notStart: function() {
        let exp = Template.instance().myParticipateExp.get();
        if (exp == undefined) {
            return;
        }
        return exp.status === ExperimentStatus.PREPARING_TO_START;
    },
    requestedAnalysis: function(exp) {
        if (exp == undefined) {
            return;
        }
        return exp.status === ExperimentStatus.ANALYSIS_REQUESTED;
    },
    getAnalysis: function(exp) {
        if (exp == undefined) {
            return;
        }
        return exp.status === ExperimentStatus.ANALYSIS_FINISHED;
    },
    getExpAnalysis: function() {
        return Template.instance().myParticipateExp.get();
    },
    isControl: function() {
        let part = Template.instance().participation.get();
        let result = false;
        if (part === undefined) {
            return;
        }
        if (part.group === 0) {
            result = true;
        }
        return result;
    },
    getExpTitleForParticipantCompleted: function(user_exp) {
        if (user_exp == undefined) {
            return;
        }
        let expDesign = user_exp.design;
        let title = "Does " + expDesign.cause + " affect " + expDesign.effect + " ?";
        return title;
    },
    getExpTitleForParticipant: function() {
        let user_exp = Template.instance().myParticipateExp.get();
        if (user_exp == undefined) {
            return;
        }
        let expDesign = user_exp.design;
        let title = "Does " + expDesign.cause + " affect " + expDesign.effect + " ?";
        return title;
    },
    getExpId: function() {
        let exp = Template.instance().myParticipateExp.get();
        if (exp == undefined) {
            return;
        }
        return exp._id;
    },
    oneStepPart: function(exp) {
        let expDesign = exp.design;
        let participantGroup = exp.participantInfoResults.group;
        let steps = [];
        if (participantGroup === 1) {
            expDesign.condition.experimental.steps.forEach(function(element) {
                steps.push(element);
            });
        } else if (participantGroup === 0) {
            expDesign.condition.control.steps.forEach(function(element) {
                steps.push(element);
            });
        }
        return steps.length === 1;
    },
    oneStep: function() {
        let expDesign = Template.instance().myParticipateExp.get().design;
        let participantGroup = Template.instance().myParticipateExp.get().participantInfoResults.group;
        let steps = [];
        if (participantGroup === 1) {
            expDesign.condition.experimental.steps.forEach(function(element) {
                steps.push(element);
            });
        } else if (participantGroup === 0) {
            expDesign.condition.control.steps.forEach(function(element) {
                steps.push(element);
            });
        }
        return steps.length === 1;
    },
    getStepsPart: function(exp) {
        let expDesign = exp.design;
        let participantGroup = exp.participantInfoResults.group;
        let steps = [];
        if (participantGroup === 1) {
            expDesign.condition.experimental.steps.forEach(function(element) {
                steps.push(element.charAt(0).toUpperCase() + element.slice(1));
            });
        } else if (participantGroup === 0) {
            expDesign.condition.control.steps.forEach(function(element) {
                steps.push(element.charAt(0).toUpperCase() + element.slice(1));
            });
        }
        return steps;
    },
    getSteps: function() {
        let expDesign = Template.instance().myParticipateExp.get().design;
        let participantGroup = Template.instance().myParticipateExp.get().participantInfoResults.group;
        let steps = [];
        if (participantGroup === 1) {
            expDesign.condition.experimental.steps.forEach(function(element) {
                steps.push(element.charAt(0).toUpperCase() + element.slice(1));
            });
        } else if (participantGroup === 0) {
            expDesign.condition.control.steps.forEach(function(element) {
                steps.push(element.charAt(0).toUpperCase() + element.slice(1));
            });
        }
        return steps;
    },
    getCauseTime: function() {
        let expDesign = Template.instance().myParticipateExp.get();
        if (expDesign) {
            expDesign = expDesign.design;
            return expDesign.cause_measure.time + ":00";
        }
    },
    getEffectTime: function() {
        let expDesign = Template.instance().myParticipateExp.get();
        if (expDesign) {
            expDesign = expDesign.design;
            return expDesign.effect_measure.time + ":00";
        }
    },
    getMeasurement: function() {
        let expDesign = Template.instance().myParticipateExp.get().design;
        let measure = [];

        let cause_measure = expDesign.cause_measure;
        cause_measure.measure = expDesign.cause;
        cause_measure.cOrE = "Cause";

        let effect_measure = expDesign.effect_measure;
        effect_measure.measure = expDesign.effect;
        effect_measure.cOrE = "Effect"

        measure.push(cause_measure);
        measure.push(effect_measure);
        return measure;
    },
    getMeasurementPart: function(exp) {
        let expDesign = exp.design;
        let measure = [];

        let cause_measure = expDesign.cause_measure;
        cause_measure.measure = expDesign.cause;
        cause_measure.cOrE = "Cause";

        let effect_measure = expDesign.effect_measure;
        effect_measure.measure = expDesign.effect;
        effect_measure.cOrE = "Effect"

        measure.push(cause_measure);
        measure.push(effect_measure);
        return measure;
    },
    getCurrentDayForParticipant: function() {
        let user_exp = Template.instance().participation.get();

        let nowInGMT = Time.getNowInGmt();

        let ts = new TimeSpan(user_exp.user_startDate_inGmt, nowInGMT);
        return Math.floor(ts.getDays()) + 1;
    },
    getCause: function() {
        let cause = "";
        if (Template.instance().myParticipateExp.get()) {
            let string = Template.instance().myParticipateExp.get().design.cause;
            cause = string.charAt(0).toUpperCase() + string.slice(1)
        }
        return cause;
    },
    getEffect: function() {
        let effect = "";
        if (Template.instance().myParticipateExp.get()) {
            let string = Template.instance().myParticipateExp.get().design.effect;
            effect = string.charAt(0).toUpperCase() + string.slice(1);
        }
        return effect;
    },
    getCauseUnit: function() {
        let cause = "";
        if (Template.instance().myParticipateExp.get()) {
            let string = Template.instance().myParticipateExp.get().design.cause;
            cause = string.charAt(0).toUpperCase() + string.slice(1);
        }
        return cause + " (" + Template.instance().myParticipateExp.get().design.cause_measure.type + ")";
    },
    getEffectUnit: function() {
        let effect = "";
        if (Template.instance().myParticipateExp.get()) {
            let string = Template.instance().myParticipateExp.get().design.effect;
            effect = string.charAt(0).toUpperCase() + string.slice(1);
        }
        return effect + " (" + Template.instance().myParticipateExp.get().design.effect_measure.type + ")";
    },
    getDate: function() {
        return dateStr(new Date())
    },
    hasCauseOfToday: function(currentDay) {
        let user_exp = Template.instance().myParticipateExp.get();
        let participantCauseData = user_exp.participantInfoResults.all_cause_data;
        return participantCauseData[currentDay - 1].value;
    },
    hasEffectOfToday: function(currentDay) {
        let user_exp = Template.instance().myParticipateExp.get();
        let participantEffectData = user_exp.participantInfoResults.all_effect_data;
        return participantEffectData[currentDay - 1].value;
    },
    disableCause: function(currentDay) {
        let user_exp = Template.instance().myParticipateExp.get();
        if (user_exp === undefined) {
            return;
        }

        let participantCauseData = user_exp.participantInfoResults.all_cause_data;

        // Check if the time to remind cause and effect
        let date = new Date();
        let currentTime = date.getHours();
        let causeReminderTime = user_exp.design.cause_measure.time;
        if (causeReminderTime > currentTime && !participantCauseData[currentDay - 1].value) {
            return true;
        }

        return false;
    },
    disableEffect: function(currentDay) {
        let user_exp = Template.instance().myParticipateExp.get();
        if (user_exp === undefined) {
            return;
        }
        console.log(currentDay)
        console.log(user_exp.participantInfoResults.all_effect_data[currentDay - 1]);
        let participantEffectData = user_exp.participantInfoResults.all_effect_data;

        // Check if the time to remind cause and effect
        let date = new Date();
        let currentTime = date.getHours();
        let effectReminderTime = user_exp.design.effect_measure.time;
        if (effectReminderTime > currentTime && !participantEffectData[currentDay - 1].value) {
            return true;
        }

        return false;
    },
    getNumOfUnrecordedData: function(currentDay) {
        let user_exp = Template.instance().myParticipateExp.get();
        if (user_exp === undefined) {
            return;
        }

        let participantCauseData = user_exp.participantInfoResults.all_cause_data;
        let participantEffectData = user_exp.participantInfoResults.all_effect_data;

        // Check if the time to remind cause and effect
        let date = new Date();
        let currentTime = date.getHours();
        let causeReminderTime = user_exp.design.cause_measure.time;
        let effectReminderTime = user_exp.design.effect_measure.time;
        if (causeReminderTime <= currentTime && !participantCauseData[currentDay - 1].value) {
            return true;
        } else if (effectReminderTime <= currentTime && !participantEffectData[currentDay - 1].value) {
            return true;
        }

        return false;
    },
    causeType: function() {
        let exp = Template.instance().myParticipateExp.get();
        if (exp) {
            return exp.design.cause_measure.type;
        }
    },
    effectType: function() {
        let exp = Template.instance().myParticipateExp.get();
        if (exp) {
            return exp.design.effect_measure.type;
        }
    },
    isRunning: function() {
        let exp = Template.instance().myParticipateExp.get();
        if (exp == undefined) {
            return;
        }
        let status = exp.participantInfoResults.status;
        return status === 4;
    },
    isCompleted: function() {
        let exp = Template.instance().myParticipateExp.get();
        if (exp == undefined) {
            return;
        }
        let status = exp.participantInfoResults.status;
        return status === 5;
    },
    isCompletedPart: function(exp) {
        if (exp == undefined) {
            return;
        }
        let status = exp.status;
        return status === 11;
    },
    isMissingPastData: function(currentDay) {
        let exp = Template.instance().myParticipateExp.get();
        if (exp == undefined) {
            return;
        }
        let participantCauseData = exp.participantInfoResults.all_cause_data;
        let participantEffectData = exp.participantInfoResults.all_effect_data;
        for (let i = 0; i < currentDay - 1; i++) {
            if (!participantCauseData[i].value || !participantEffectData[i].value) {
                return true;
            }
        }
        return false;
    },
    slots: function() {
        let participation = Template.instance().participation.get();
        let nowInGMT = Time.getNowInGmt();
        if (participation == undefined) {
            return;
        }
        let ts = new TimeSpan(participation.user_startDate_inGmt, nowInGMT);
        let index = Math.floor(ts.getDays());


        let exp = Template.instance().myParticipateExp.get();
        if (exp == undefined) {
            return;
        }
        let temp = exp.start_date_time;
        let startDay = temp.toString().split(" ")[2];
        var d = new Date().toISOString();
        if (participation && participation.cause_data && exp) {
            let ts = new TimeSpan(participation.user_startDate_inGmt, participation.user_endDate_inGmt);
            let duration = Math.floor(ts.getDays());
            let slots = [];
            for (let j = 0; j < duration; j++) {
                let cause_rid = Math.floor(Math.random() * 1000000) + Math.floor(Math.random() * 1000000) + 1;
                let effect_rid = Math.floor(Math.random() * 1000000) + Math.floor(Math.random() * 1000000) + 1;
                let cause_data = participationData(participation, "cause", j);
                let effect_data = participationData(participation, "effect", j);

                // Check if the time to remind cause and effect
                let date = new Date();
                let currentTime = date.getHours();
                let causeReminderTime = exp.design.cause_measure.time;
                let effectReminderTime = exp.design.effect_measure.time;


                if (j <= index) {
                    let today_class = "";
                    if (j === index) {
                        today_class = "today-submit-data";
                    }
                    if (participation["cause_data"][j].value === undefined && today_class != "today-submit-data") {
                        cause_data = "Not recorded yet";
                    }
                    if (participation["effect_data"][j].value === undefined && today_class != "today-submit-data") {
                        effect_data = "Not recorded yet";
                    }
                    if (causeReminderTime <= currentTime && participation["cause_data"][j].value === undefined && today_class == "today-submit-data") {
                        cause_data = "Not recorded yet";
                    }
                    if (effectReminderTime <= currentTime && participation["effect_data"][j].value === undefined && today_class == "today-submit-data") {
                        effect_data = "Not recorded yet";
                    }

                    slots[j] = {
                        date: dateStr(new Time(participation.user_startDate_inGmt).addDay(j).getDate()),
                        cause: cause_data,
                        effect: effect_data,
                        cause_rid: cause_rid,
                        effect_rid: effect_rid,
                        index: j,
                        editable: true,
                        today: today_class
                    }
                } else {
                    slots[j] = {
                        date: dateStr(new Time(participation.user_startDate_inGmt).addDay(j).getDate()),
                        cause: cause_data,
                        effect: effect_data,
                        cause_rid: cause_rid,
                        effect_rid: effect_rid,
                        index: j,
                        editable: false,
                        today: ""
                    }
                }
            }
            initiateSelect();
            //console.log("Slots with rid: " + JSON.stringify(slots));
            return slots;
        }
    },
    isUnderReview: function() {
        let exp = Template.instance().participateExpUnderReview.get();
        if (exp === undefined) {
            return;
        }
        return exp.status !== 8;
    },
    hasExpUnderReview: function() {
        let exp = Template.instance().participateExpUnderReview.get();
        return exp;
    },
    steps: function() {
        let exp = Template.instance().participateExpUnderReview.get();
        if (exp) {
            let cond = exp.pResult.group ? "experimental" : "control";
            return exp["design"]["condition"][cond]["steps"];
        }
    },
    prepSteps: function() {
        let exp = Template.instance().participateExpUnderReview.get();
        if (exp) {
            let cond = exp.pResult.group ? "experimental" : "control";
            return exp["design"]["condition"][cond]["prep_steps"];
        }
    },
});



Template.gaMeDashboard.events({
    'click #stopParticipating': function() {
         showModal('#stop-participating-modal');
    },
    'click #bristol': function() {
        $("#image-modal").modal('open')
    },
    'click #discuss-myPart': function(event, instance) {
        let exp_id = event.target.attributes["expid"].value;
        let title = event.target.attributes["title"].value;

        $("#discussion-modal").attr('exp_id', exp_id);
        $("#title-discussion").text(title);

        $("#discussion-modal").modal('open');
    },
    'click .discuss-myCreate': function(event, instance) {
        let exp_id = event.target.attributes["expid"].value;
        let title = event.target.attributes["title"].value;

        $("#discussion-modal").attr('exp_id', exp_id);
        $("#title-discussion").text(title);

        $("#discussion-modal").modal('open');
    },
    'click .clarificationModal': function(event, instance) {
        showModal('#clarification-modal');
    },

    'click .clarificationCreatorModal': function(event, instance) {
        showModal('#creator-clarification-modal');
    },

    'click .view-details-btn': function() {
        showReminderStatsModal();
    },

    'click .send-cause-reminder-btn': function() {
        showSendReminderModal();
    },

    'click .send-effect-reminder-btn': function() {
        showSendReminderModal();
    },

    'click .send-thank-you': function(event) {
        let expId = event.target.dataset['id'];
        let cause = $(event.target).attr("cause");
        let effect = $(event.target).attr("effect");
        let modal = $('#send-thank-note-modal');
        modal.data('exp_id', expId);
        modal.data('cause', cause);
        modal.data('effect', effect);
        modal.modal({
            dismissible: true,
            ready: function() {
                modal.trigger('show');
            },
            complete: function() {

            },
        });
        modal.modal('open');
    },
    'click .request-analysis': function(event) {
        console.log("clicked button");
        let expId = $(event.target).attr("data-id");
        let modal = $('#request-analysis-modal');
        modal.data('exp_id', expId);
        var exp_title = $("#request-data-exp-title").html();
        $("#request-text-box").html("I want to request the data analysis for my experiment: <b>" + exp_title + "</b><br/><br/>");
        modal.modal({
            dismissible: true,
            ready: function() {
                modal.trigger('show');
            },
            complete: function() {

            },
        });
        modal.modal('open');
        // Meteor.call('galileo.notification.sendDataAnalysisRequest', expId);
        // $(event.target).prop('disabled', true);
        // Materialize.toast("You have submitted the request of data analysis.", 3000, "toast rounded");
    },
    'click .dismiss': function(event, instance) {
        let expId = event.target.dataset['id'];
        exps = Template.instance().myCompletedExp.get();
        let inst = Template.instance();

        Meteor.call('galileo.experiments.setSentThankYou', expId, function(err, result) {
            if (!err) {
                let index = 0;
                experiments = [];
                for (var i = 0; i < exps.length; i++) {
                    if (expId != exps[i]._id) {
                        experiments.push(exps[i])
                    }
                }
                inst.myCompletedExp.set(experiments);
            }
        });
    },
    'click #continueBtn': function(event) {
        let expId = $(event.target).attr("exp-id");
        let newURL = "/galileo/createdemo?expid=" + expId;
        window.open(newURL, "_blank");
    },
    'click .viewPastData': function(event) {
        // let expId = $(event.target).attr("exp-id");
        // $("#edit-data-modal-title").html("Participation Tracking Sheet for " + expId);
        $('#edit-data-modal').modal('open');
        // let newURL = "/galileo/me/experiment/" + expId + "/my_participation";
        // window.open(newURL, "_blank");
    },
    'click .viewPastDataPart': function(event) {
        let expId = $(event.target).attr("exp-id");
        $('#edit-data-modal-part-' + expId).modal('open');
    },
    'keyup #cause-data': function(event) {
        if ($(event.target).val().length > 0) {
            $("#causeBtn").show();
        } else {
            $("#causeBtn").hide();
        }
    },
    'keyup #effect-data': function(event) {
        if ($(event.target).val().length > 0) {
            $("#effectBtn").show();
        } else {
            $("#effectBtn").hide();
        }
    },
    'click #causeBtn': function(event) {
        let user_exp = Template.instance().myParticipateExp.get();
        let temp = user_exp.start_date_time;
        let startDay = temp.toString().split(" ")[2];
        var d = new Date().toISOString();
        let currentDay = $(event.target).attr("index") - 1;
        let causeData = $("#cause-data").val().trim();
        let expId = $(event.target).attr("exp-id");
        if (causeData.length > 0) {
            let userId = Template.instance().userId.get();
            Meteor.call('galileo.experiments.addCauseData', Template.instance().userId.get(), expId, currentDay, causeData);
            $(event.target).hide();
            $("#cause-data").prop('disabled');

            let rid = $("#edit-data-modal").children('div.modal-content').children('div.section-body').children('table.sheet-table').children()[currentDay + 1].children[2].children[0].attributes.rid.value;
            $("#editCauseData-" + rid).val(causeData)
            //$("#editCauseData-" + rid).prop('disabled', true);

            user_exp.participantInfoResults.all_cause_data[currentDay].value = causeData;
            Template.instance().myParticipateExp.set(user_exp);
            Materialize.toast("Great! You have submitted the cause data.", 3000, "toast rounded");

            $('#followup-modal-' + expId).data('isCause', true);
            $('#followup-modal-' + expId).data('day', currentDay);
            $("#followup-modal-"+ expId).modal('open');
        }
    },
    'click #effectBtn': function(event) {
        let user_exp = Template.instance().myParticipateExp.get();
        let temp = user_exp.start_date_time;
        let startDay = temp.toString().split(" ")[2];
        var d = new Date().toISOString();
        let currentDay = $(event.target).attr("index") - 1;
        let effectData = $("#effect-data").val().trim();
        let expId = $(event.target).attr("exp-id");
        if (effectData.length > 0) {
            let userId = Template.instance().userId.get();
            Meteor.call('galileo.experiments.addEffectData', Template.instance().userId.get(), expId, currentDay, effectData);
            $(event.target).hide();
            $("#effect-data").prop('disabled');

            let rid = $("#edit-data-modal").children('div.modal-content').children('div.section-body').children('table.sheet-table').children()[currentDay + 1].children[4].children[0].attributes.rid.value;
            $("#editEffectData-" + rid).val(effectData)
            //$("#editEffectData-" + rid).prop('disabled', true);

            user_exp.participantInfoResults.all_effect_data[currentDay].value = effectData;
            Template.instance().myParticipateExp.set(user_exp);

            Materialize.toast("Great! You have submitted the effect data.", 3000, "toast rounded");

            $('#followup-modal-' + expId).data('isCause', false);
            $('#followup-modal-' + expId).data('day', currentDay);
            $("#followup-modal-"+ expId).modal('open');
        }
    },
    "keyup .textarea-cause": function(event) {
        let textareaRID = $(event.target).attr("rid");
        if ($(event.target).val().length > 0) {
            $("#submitCauseBtn-" + textareaRID).show();
        } else {
            $("#submitCauseBtn-" + textareaRID).hide();
        }
    },
    "keyup .textarea-effect": function(event) {
        let textareaRID = $(event.target).attr("rid");
        if ($(event.target).val().length > 0) {
            $("#submitEffectBtn-" + textareaRID).show();
        } else {
            $("#submitEffectBtn-" + textareaRID).hide();
        }
    },
    "click .saveCauseChange": function(event) {
        let textareaRID = $(event.target).attr("rid");
        let optionIndex = $(event.target).attr("index");
        let expId = $(event.target).attr("exp-id");
        let feedbackContentID = "#editCauseData-" + textareaRID;
        let causeData = $(feedbackContentID).val().trim();
        let inst = Template.instance();

        if (causeData.length > 0) {
            let userId = Template.instance().userId.get();
            Meteor.call('galileo.experiments.addCauseData', Template.instance().userId.get(), expId, optionIndex, causeData);
            $("#submitCauseBtn-" + textareaRID).hide();
            //$("#editCauseData-" + textareaRID).prop('disabled', true);
            if ($("#submitCauseBtn-" + textareaRID).parent().hasClass("today-submit-data")) {
                $("#cause-data").val(causeData);
            }

            let user_exp = Template.instance().myParticipateExp.get();
            user_exp.participantInfoResults.all_cause_data[optionIndex].value = causeData;
            Template.instance().myParticipateExp.set(user_exp);
            Materialize.toast("Great! You have submitted the cause data.", 3000, "toast rounded");

            $('#followup-modal-' + expId).data('isCause', true);
            $('#followup-modal-' + expId).data('day', optionIndex);
            $("#followup-modal-"+ expId).modal('open');

        } else {
            Materialize.toast("Please provide more data before submit", 3000, "toast rounded");
        }
    },
    "click .saveEffectChange": function(event) {
        let textareaRID = $(event.target).attr("rid");
        let optionIndex = $(event.target).attr("index");
        let expId = $(event.target).attr("exp-id");
        let feedbackContentID = "#editEffectData-" + textareaRID;
        let effectData = $(feedbackContentID).val().trim();
        let inst = Template.instance();

        if (effectData.length > 0) {
            let userId = Template.instance().userId.get();
            Meteor.call('galileo.experiments.addEffectData', Template.instance().userId.get(), expId, optionIndex, effectData);
            $("#submitEffectBtn-" + textareaRID).hide();
            //$("#editEffectData-" + textareaRID).prop('disabled', true);
            if ($("#submitEffectBtn-" + textareaRID).parent().hasClass("today-submit-data")) {
                $("#effect-data").val(effectData);
            }

            let user_exp = Template.instance().myParticipateExp.get();
            user_exp.participantInfoResults.all_effect_data[optionIndex].value = effectData;
            Template.instance().myParticipateExp.set(user_exp);

            Materialize.toast("Great! You have submitted the effect data.", 3000, "toast rounded");

            $('#followup-modal-' + expId).data('isCause', false);
            $('#followup-modal-' + expId).data('day', optionIndex);
            $("#followup-modal-"+ expId).modal('open');

        } else {
            Materialize.toast("Please provide more data before submit", 3000, "toast rounded");
        }
    },
    "click #powerAnalysis": function() {
        showModal('#count-participant-modal');
    },
    "click #learnInvite": function() {
        showModal('#learn-invite-modal');
    },
    "click #copyJoinLinkBtn": function(event) {
        copyToClipboard("#inviteJoinLink");
        Materialize.toast('Copied!', 2000);
    },
    "click #joinUrl": function(event) {
        copyToClipboard("#inviteJoinLink");
        Materialize.toast('Copied!', 2000);
    },
    "click .review-datasheet": function() {
        let expId = $(event.target).attr("data-id");
        let newURL = "/galileo/me/experiment/" + expId + "/info";
        window.open(newURL, "_blank");
    },
    // "click #debug_python_button": function() {
    //     HTTP.post(getAPIURL("printHelloWorld"), {}, function(error, response) {
    //         if (error) {
    //             console.log("Error in calling server to return the output file name");
    //         } else {
    //             let filecontent = JSON.parse(response.content)["content"];
    //             console.log(filecontent);
    //             $("#debug_python_result").show();
    //             $("#debug_python_placeholder").html(filecontent);
    //         }
    //     });
    // },
    "click .debug_python_button": function(event) {
        let id = $(event.target).attr("exp-id");
        let post_data = {
            "exp_id": id
        }
        Meteor.call("galileo.experiments.analysis.printGreaterEffect", post_data, function(error, result) {
            results = result.split("$$$")
            $("#debug_python_result_" + id).show();
            $("#debug_python_placeholder_" + id).html(results[0]);
            $("#debug_python_placeholder_img_" + id).attr("src", results[1]);
        });

    },
    "click #openEmailTemplateBtn": function() {
        $("#share-email-join-modal").css("height", "auto");
        let modal = $('#share-email-join-modal');
        modal.modal({
            dismissible: true,
            ready: function() {
                modal.trigger('show');
            },
            complete: function() {

            },
        });

        modal.modal('open');
    },
});


function showReminderStatsModal() {
    showModal('#reminder-stats-modal');
}

function showSendReminderModal() {
    showModal('#send-reminder-modal');
}

function showModal(modalId) {
    let modal = $(modalId);
    modal.modal({
        dismissible: true,
        ready: function() {
            modal.trigger('show');
        },
        complete: function() {

        },
    });

    modal.modal('open');
}


function dateStr(date) {
    return monthStr(date.getMonth()) + ". " + date.getDate() + ", " + date.getFullYear();
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

function participationData(participation, type, day) {
    let exp = Template.instance().myParticipateExp.get();
    if (exp) {
        let slot = participation[type + "_data"][day];
        let status = slot["status"];
        switch (status) {
            case ParticipationSlotStatus.PREPARING:
                return "Not open yet";
            case ParticipationSlotStatus.SENT:
                return "Not recorded yet";
            case ParticipationSlotStatus.COMPLETE:
                return processReceivedData(exp, participation, slot, type, day);
            case ParticipationSlotStatus.FOLLOW_COMPLETE:
                return processReceivedData(exp, participation, slot, type, day);
            case ParticipationSlotStatus.ERROR:
                return "Error";
        }
    }
}

function processReceivedData(exp, participation, slot, type, day) {
    let id = "participation-" + participation._id + "-" + day + "-" + type;
    let val = slot["value"];
    return val;
}

function initiateSelect() {
    setTimeout(function() {
        $('select').material_select();
    }, 0);
}

function getJoinLink(id) {
    let getUrl = window.location;
    let baseUrl = getUrl.protocol + "//" + getUrl.host + "/" + getUrl.pathname.split('/')[1];
    return baseUrl + "/share/join/" + id;
}

function copyToClipboard(element) {
    let $temp = $("<input>");
    $("body").append($temp);
    $temp.val($(element).val()).select();
    document.execCommand("copy");
    $temp.remove();
}
