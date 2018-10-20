import './_.jade';
import {
    ExperimentStatus
} from '/imports/api/ga-models/constants';
//import {Participations} from '/imports/api/ga-models/run';


const STATUS_TYPE_DONE = 0;
const STATUS_TYPE_ONGOING = 1;

let stepList = [
    "Design",
    "Review",
    "Pilot",
    "Run",
    "Result"
];

let statusList = [{
        step: 0,
        text: "Experiment Incomplete",
        type: STATUS_TYPE_DONE
    },
    {
        step: 0,
        text: "Design Completed",
        type: STATUS_TYPE_DONE
    },
    {
        step: 1,
        text: "Waiting for Experiment Review",
        type: STATUS_TYPE_ONGOING
    },
    {
        step: 1,
        text: "Experiment Review Ongoing",
        type: STATUS_TYPE_ONGOING
    },
    {
        step: 1,
        text: "Experiment Reviewed",
        type: STATUS_TYPE_DONE
    },
    {
        step: 2,
        text: "Waiting for Pilot users",
        type: STATUS_TYPE_ONGOING
    },
    {
        step: 2,
        text: "Pilot in progress",
        type: STATUS_TYPE_ONGOING
    },
    {
        step: 2,
        text: "Pilot Complete",
        type: STATUS_TYPE_DONE
    },
    {
        step: 3,
        text: "Preparing to begin experiment",
        type: STATUS_TYPE_ONGOING
    },
    {
        step: 3,
        text: "Experiment will begin soon",
        type: STATUS_TYPE_ONGOING
    },
    {
        step: 3,
        text: "Experiment in Progress",
        type: STATUS_TYPE_ONGOING
    },
    {
        step: 3,
        text: "Experiment Completed",
        type: STATUS_TYPE_DONE
    },
    {
        step: 4,
        text: "Under Analysis",
        type: STATUS_TYPE_ONGOING
    },
    {
        step: 4,
        text: "Results Ready",
        type: STATUS_TYPE_DONE
    }
];

Template.gaMeExperimentInfo.rendered = (function() {
    $(document).ready(function() {
        $('.modal').modal();
    });
});

Template.gaMeExperimentInfo.onCreated(function() {

    let inst = this;
    inst.exp = new ReactiveVar(undefined);
    inst.statusList = new ReactiveArray(statusList);
    inst.reviewedPilots = new ReactiveVar(null);
    inst.isLoading = new ReactiveVar(true);
    inst.showPilot = new ReactiveVar(false);
    inst.minParticipantCount = new ReactiveVar(undefined);
    inst.currentParticipantCount = new ReactiveVar(undefined);
    inst.data = new ReactiveVar(undefined);

    let currentURL = window.location.href.split('/');
    let targetID = currentURL[currentURL.length - 2];

    Meteor.call("galileo.experiments.getExperimentWithParticipantData", targetID, function(err, exp) {
        inst.isLoading.set(false);
        if (err) {
            throw new Meteor.Error("Error:" + err);
        }
        inst.exp.set(exp);
        inst.minParticipantCount.set(inst.exp.get().min_participant_count);
        inst.currentParticipantCount.set(inst.exp.get().run_users.length);
        $("title").html("Galileo | Does " + exp.design.cause + " affect " + exp.design.effect);

        if (exp.status === ExperimentStatus.PILOT_ONGOING ||
            exp.status === ExperimentStatus.PILOTED) {
            Meteor.call("galileo.pilotFeedback.getPilotIdsWithReview", targetID, function(err, result) {
                if (err) {
                    throw new Meteor.Error("Error:" + err);
                }
                inst.reviewedPilots.set(result);
            });
        }
    });

    inst.ethicsCompleted = new ReactiveVar(true);
    Meteor.call("galileo.profile.hasFinishedEthics", function(err, finished) {
        if (err) {
            throw new Meteor.Error("Error:" + err);
        }
        inst.ethicsCompleted.set(finished);
    });
});

Template.gaMeExperimentInfo.helpers({
    exp: function() {
        let exp = Template.instance().exp;
        if (exp !== undefined) {
            return exp;
        }
    },
    causeMessage: function() {
        let exp = Template.instance().exp.get();
        if (exp) {
            return exp.design.cause_measure.reminderText;
        }
    },
    effectMessage: function() {
        let exp = Template.instance().exp.get();
        if (exp) {
            return exp.design.effect_measure.reminderText;
        }
    },
    causeTime: function() {
        let exp = Template.instance().exp.get();
        if (exp) {
            return exp.design.cause_measure.time + ":00";
        }
    },
    effectTime: function() {
        let exp = Template.instance().exp.get();
        if (exp) {
            return exp.design.effect_measure.time + ":00";;
        }
    },
    title: function() {
        let exp = Template.instance().exp.get();
        if (exp === undefined) {
            return;
        }
        let cause = exp.design.cause;
        let effect = exp.design.effect;
        return ("Does " + cause + " affects " + effect + "?");
    },
    getExpTitle: function() {
        let exp = Template.instance().exp.get();
        if (exp === undefined) {
            return;
        }
        let cause = exp.design.cause;
        let effect = exp.design.effect;
        return encodeURI("how " + cause + " affects " + effect);
    },
    getCause: function() {
        let exp = Template.instance().exp.get();
        if (exp) {
            return exp.design.cause;
        }
    },
    getEffect: function() {
        let exp = Template.instance().exp.get();
        if (exp) {
            return exp.design.effect;
        }
    },
    getExpTitleReg: function() {
        let exp = Template.instance().exp.get();
        if (exp === undefined) {
            return;
        }
        let cause = exp.design.cause;
        let effect = exp.design.effect;
        return "how " + cause + " affects " + effect;
    },
    getCauseCompleteByDay: function(currentDay, currentUser) {
        let exp = Template.instance().exp.get();
        let pResults = exp.participantInfoResults;
        let answer = "No";
        pResults.forEach(function(record) {
            if (record.username === currentUser) {
                if (record.all_cause_data[parseInt(currentDay) - 1].status === 2 || record.all_cause_data[parseInt(currentDay) - 1].status === 3) {
                    answer = "Yes";
                } else {
                    answer = "No";
                }
            }
        });
        return answer;
    },
    getEffectCompleteByDay: function(currentDay, currentUser) {
        let exp = Template.instance().exp.get();
        let pResults = exp.participantInfoResults;
        let answer = "No";
        pResults.forEach(function(record) {
            if (record.username === currentUser) {
                // console.log("rendering cuase complete ------ " + record.all_cause_data[parseInt(currentDay)-1].status);
                if (record.all_effect_data[parseInt(currentDay) - 1].status === 2 || record.all_effect_data[parseInt(currentDay) - 1].status === 3) {
                    answer = "Yes";
                } else {
                    answer = "No";
                }
            }
        });
        return answer;
    },
    getCauseComplianceByDay: function(currentDay, currentUser) {
        let exp = Template.instance().exp.get();
        let pResults = exp.participantInfoResults;
        let answer = "0";
        pResults.forEach(function(record) {
            if (record.username === currentUser && record.all_cause_data[currentDay - 1].compliance === "1") {
                answer = "1";
            }
        });
        return answer;
    },
    getEffectComplianceByDay: function(currentDay, currentUser) {
        let exp = Template.instance().exp.get();
        let pResults = exp.participantInfoResults;
        let answer = "0";
        pResults.forEach(function(record) {
            if (record.username === currentUser && record.all_effect_data[currentDay - 1].compliance === "1") {
                answer = "1";
            }
        });
        return answer;
    },
    getCauseTimeDiffByDayColor: function(currentDay, currentUser) {
        let exp = Template.instance().exp.get();
        let pResults = exp.participantInfoResults;
        let answer = "-";
        pResults.forEach(function(record) {
            if (record.username === currentUser && record.all_cause_data[currentDay - 1].status >= 2) {
                answer = timeDiffColor(record.all_cause_data[currentDay - 1].complete_time, record.all_cause_data[currentDay - 1].start_time);
            }
        });
        return answer;
    },
    getCauseTimeDiffByDay: function(currentDay, currentUser) {
        let exp = Template.instance().exp.get();
        let pResults = exp.participantInfoResults;
        let answer = "-";
        pResults.forEach(function(record) {
            if (record.username === currentUser && record.all_cause_data[currentDay - 1].status >= 2) {
                answer = timeDiff(record.all_cause_data[currentDay - 1].complete_time, record.all_cause_data[currentDay - 1].start_time);
            }
        });
        return answer;
    },
    getEffectTimeDiffByDayColor: function(currentDay, currentUser) {
        let exp = Template.instance().exp.get();
        let pResults = exp.participantInfoResults;
        let answer = "-";
        pResults.forEach(function(record) {
            if (record.username === currentUser && record.all_effect_data[currentDay - 1].status >= 2) {
                answer = timeDiffColor(record.all_effect_data[currentDay - 1].complete_time, record.all_effect_data[currentDay - 1].start_time);
            }
        });
        return answer;
    },
    getEffectTimeDiffByDay: function(currentDay, currentUser) {
        let exp = Template.instance().exp.get();
        let pResults = exp.participantInfoResults;
        let answer = "-";
        pResults.forEach(function(record) {
            if (record.username === currentUser && record.all_effect_data[currentDay - 1].status >= 2) {
                answer = timeDiff(record.all_effect_data[currentDay - 1].complete_time, record.all_effect_data[currentDay - 1].start_time);
            }
        });
        return answer;
    },
    hasCauseValueByDay: function(currentDay, currentUser) {
        let exp = Template.instance().exp.get();
        let pResults = exp.participantInfoResults;
        let answer = false;
        pResults.forEach(function(record) {
            if (record.username === currentUser) {
                if (record.all_cause_data[parseInt(currentDay) - 1].status > 1) {
                    answer = true;
                } else {
                    answer = false;
                }
            }
        });
        return answer;
    },
    hasEffectValueByDay: function(currentDay, currentUser) {
        let exp = Template.instance().exp.get();
        let pResults = exp.participantInfoResults;
        let answer = false;
        pResults.forEach(function(record) {
            if (record.username === currentUser) {
                if (record.all_effect_data[parseInt(currentDay) - 1].status > 1) {
                    answer = true;
                } else {
                    answer = false;
                }
            }
        });
        return answer;
    },
    notRespondCause: function(currentDay, currentUser) {
        let exp = Template.instance().exp.get();
        let pResults = exp.participantInfoResults;
        let answer = "";
        let toReturn = false;
        pResults.forEach(function(record) {
            if (record.username === currentUser) {
                if (record.all_cause_data[parseInt(currentDay) - 1].status == 1) {
                    toReturn = true;
                } else {
                    toReturn = false;
                }
            }
        });

        return toReturn;
    },
    notRespondEffect: function(currentDay, currentUser) {
        let exp = Template.instance().exp.get();
        let pResults = exp.participantInfoResults;
        let answer = "";
        let toReturn = false;
        pResults.forEach(function(record) {
            if (record.username === currentUser) {
                if (record.all_effect_data[parseInt(currentDay) - 1].status == 1) {
                    toReturn = true;
                } else {
                    toReturn = false;
                }
            }
        });
        return toReturn;
    },
    getCauseValueByDay: function(currentDay, currentUser) {
        let exp = Template.instance().exp.get();
        let pResults = exp.participantInfoResults;
        let answer = "";
        pResults.forEach(function(record) {
            if (record.username === currentUser) {
                if (record.all_cause_data[parseInt(currentDay) - 1].status > 1 && record.all_cause_data[parseInt(currentDay) - 1].status < 4) {
                    answer = record.all_cause_data[parseInt(currentDay) - 1].value;
                } else if (record.all_cause_data[parseInt(currentDay) - 1].status == 4) {
                    answer = "Invalid Input";
                } else {
                    answer = "";
                }
            }
        });
        return "" + answer;
    },
    getEffectValueByDay: function(currentDay, currentUser) {
        let exp = Template.instance().exp.get();
        let pResults = exp.participantInfoResults;
        let answer = "";
        pResults.forEach(function(record) {
            if (record.username === currentUser) {
                if (record.all_effect_data[parseInt(currentDay) - 1].status > 1 && record.all_effect_data[parseInt(currentDay) - 1].status < 4) {
                    answer = record.all_effect_data[parseInt(currentDay) - 1].value;
                } else if (record.all_effect_data[parseInt(currentDay) - 1].status == 4) {
                    answer = "Invalid Input";
                } else {
                    answer = "";
                }
            }
        });
        return "" + answer;
    },
    hasCauseFollowupByDay: function(currentDay, currentUser) {
        let exp = Template.instance().exp.get();
        let pResults = exp.participantInfoResults;
        let answer = false;
        pResults.forEach(function(record) {
            if (record.username === currentUser) {
                if (record.all_cause_data[parseInt(currentDay) - 1].status === 3) {
                    answer = true;
                } else {
                    answer = false;
                }
            }
        });
        return answer;
    },
    hasEffectFollowupByDay: function(currentDay, currentUser) {
        let exp = Template.instance().exp.get();
        let pResults = exp.participantInfoResults;
        let answer = false;
        pResults.forEach(function(record) {
            if (record.username === currentUser) {
                if (record.all_effect_data[parseInt(currentDay) - 1].status === 3) {
                    answer = true;
                } else {
                    answer = false;
                }
            }
        });
        // console.log("effect followup: " + answer);
        return answer;
    },
    getCauseFollowupByDay: function(currentDay, currentUser) {
        let exp = Template.instance().exp.get();
        let pResults = exp.participantInfoResults;
        let answer = "";
        pResults.forEach(function(record) {
            if (record.username === currentUser) {
                if (record.all_cause_data[parseInt(currentDay) - 1].status === 3) {
                    answer = record.all_cause_data[parseInt(currentDay) - 1].detail;
                } else {
                    answer = "";
                }
            }
        });
        return answer;
    },
    getEffectFollowupByDay: function(currentDay, currentUser) {
        let exp = Template.instance().exp.get();
        let pResults = exp.participantInfoResults;
        let answer = "";
        pResults.forEach(function(record) {
            if (record.username === currentUser) {
                if (record.all_effect_data[parseInt(currentDay) - 1].status === 3) {
                    answer = record.all_effect_data[parseInt(currentDay) - 1].detail;
                } else {
                    answer = "";
                }
            }
        });
        return answer;
    },
    getDays: function() {
        let exp = Template.instance().exp.get();

        let expLength = parseInt(exp.duration);

        var i;
        var expDays = [];
        for (i = 1; i <= expLength; i++) {
            expDays.push(i);
        }

        return expDays;
    },
    isLoading: function() {
        return Template.instance().isLoading.get();
    },
    showPilot: function() {
        return Template.instance().showPilot.get();
    },
    expId: function() {
        let currentURL = window.location.href.split('/');
        let targetID = currentURL[currentURL.length - 2];
        return targetID;
    },
    isCreator: function() {
        let exp = Template.instance().exp.get();
        if (exp) {
            // console.log("result: " + JSON.stringify(exp));
            return exp.user_id === Meteor.userId() || Meteor.user().profile.is_admin;
        }
    },
    notCreator: function() {
        let exp = Template.instance().exp.get();
        if (exp) {
            return exp.user_id !== Meteor.userId();
        }
    },
    statusList: function() {
        let exp = Template.instance().exp.get();
        if (exp) {

            let currStep = -1,
                list = [];
            for (let i = 0; i < statusList.length; i++) {

                // If moved on to next step
                if (statusList[i].step !== currStep) {

                    // Increment the step and Push the new item to the list
                    currStep++;
                    if (!Template.instance().showPilot.get() && stepList[currStep] === "Pilot") {

                    } else {
                        list.push({
                            notFirst: currStep !== 0,
                            notLast: currStep !== stepList.length - 1,
                            label: stepList[currStep]
                        });
                    }
                }

                // Update the object based on status
                let obj = list[list.length - 1];
                if (i <= exp.status) {
                    obj.completed = true;
                }
                if (i === exp.status) {
                    obj.isCurr = true;
                    if (i === 10) {
                        obj.label = statusList[i].text + " (" + (1 + Math.floor((new Date() - exp.start_date_time) / ((1000 * 60 * 60 * 24)))) + "/7 Days Completed)";
                    } else {
                        obj.label = statusList[i].text;
                    }
                    obj.ongoing = statusList[i].type === STATUS_TYPE_ONGOING;
                }
            }
            return list;
        }
    },
    statusIsCreated: function() {
        let exp = Template.instance().exp.get();
        if (exp) return exp.status === ExperimentStatus.CREATED;
    },
    statusIsDesigned: function() {
        let exp = Template.instance().exp.get();
        if (exp) return exp.status === ExperimentStatus.DESIGNED;
    },
    isCreationIncomplete: function() {
        // return false;
        return (getIsEthicsIncomplete() || getIsCriteriaMissing());
    },
    isCriteriaMissing: function() {
        return getIsCriteriaMissing();
    },
    isEthicsIncomplete: function() {
        return getIsEthicsIncomplete();
    },
    statusIsOpenForReview: function() {
        // return true;
        let exp = Template.instance().exp.get();
        if (exp) return exp.status === ExperimentStatus.OPEN_FOR_REVIEW;
    },
    statusIsReviewOngoing: function() {
        let exp = Template.instance().exp.get();
        if (exp) return exp.status === ExperimentStatus.REVIEW_ONGOING;
    },
    statusIsReviewed: function() {
        let exp = Template.instance().exp.get();
        if (exp) return exp.status === ExperimentStatus.REVIEWED;
    },
    statusIsOpenForPilot: function() {
        let exp = Template.instance().exp.get();
        if (exp) return exp.status === ExperimentStatus.OPEN_FOR_PILOT;
    },
    statusIsPilotOngoing: function() {
        let exp = Template.instance().exp.get();
        if (exp) return exp.status === ExperimentStatus.PILOT_ONGOING;
    },
    statusIsPilotComplete: function() {
        let exp = Template.instance().exp.get();
        if (exp) return exp.status === ExperimentStatus.PILOTED;
    },
    reviewedPilots: function() {
        return Template.instance().reviewedPilots.get();
    },
    statusIsReadyToRun: function() {
        let exp = Template.instance().exp.get();
        if (exp) return exp.status === ExperimentStatus.READY_TO_RUN;
    },
    statusIsPreparingToStart: function() {
        let exp = Template.instance().exp.get();
        if (exp) return exp.status === ExperimentStatus.PREPARING_TO_START;
    },
    statusIsStarted: function() {
        let exp = Template.instance().exp.get();
        if (exp) return exp.status === ExperimentStatus.STARTED;
    },
    statusIsFinished: function() {
        let exp = Template.instance().exp.get();
        if (exp) return exp.status === ExperimentStatus.FINISHED;
    },
    statusRequestAnalysis: function() {
        let exp = Template.instance().exp.get();
        if (exp) return exp.status === ExperimentStatus.ANALYSIS_REQUESTED;
    },
    statusAnalysisFinished: function() {
        let exp = Template.instance().exp.get();
        if (exp) {
            let res = exp.status === ExperimentStatus.ANALYSIS_FINISHED;
            console.log("in ana finish " + res);
            return res;
        }
    },
    getAnalysis: function() {
        return Template.instance().exp.get();
    },
    isControlGroup: function() {
        let exp = Template.instance().exp.get();
        let pResults = exp.participantInfoResults;
    },
    username: function() {
        let exp = Template.instance().exp.get();
        if (exp) return exp.username;
    },
    createDate: function() {
        let exp = Template.instance().exp.get();
        if (exp) return exp.create_date_time;
    },
    version: function() {
        let exp = Template.instance().exp.get();
        if (exp) return "Ver. " + exp.versions.length;
    },
    statusStr: function() {
        let exp = Template.instance().exp.get();
        if (exp) return statusList[exp.status];
    },
    feedbackUserAmount: function() {
        let exp = Template.instance().exp.get();
        if (exp) return exp.feedback_users.length;
    },
    pilotAmount: function() {
        return 2;
    },
    startDateTime: function() {
        let exp = Template.instance().exp.get();
        if (exp) return formatDate(exp.start_date_time);
    },
    endDate: function() {
        let exp = Template.instance().exp.get();
        if (exp) {
            let start = exp.start_date_time.getTime();
            let duration = exp.duration;
            let end = new Date(start + (duration - 1) * 24 * 60 * 60 * 1000);
            return formatDate(end);
        }
    },
    getInviteReviewerLink: function() {
        return getReviewInviteLink();
    },
    getInviteReviewerLinkHTML: function() {
        return getReviewLinkHTML();
    },
    getReviewerIframeUrl: function() {
        let url = getReviewInviteLink();
        return getIFrameInviteLink(url);
    },
    // getReviewerIframeUrlPartial: function() {
    //     let url = getReviewInviteLink().substring(0, 30);
    //     return url + "...   ";
    // },
    getInvitePilotLink: function() {
        return getPilotInviteLink();
    },
    getPilotIframeUrl: function() {
        let url = getPilotInviteLink();
        return getIFrameInviteLink(url);
    },
    getParticipantInviteLink: function() {
        return getParticipantInviteLink(Template.instance());
    },
    getProtocol: function() {
        return location.protocol;
    },
    getHost: function() {
        return location.host;
    },

    getPath: function() {
        return location.pathname.split('/')[1];
    },
    currentParticipantCount: function() {
        let exp = Template.instance().exp.get();
        if (exp) {
            return exp.run_users.length;
        }
    },
    canStartExp: function() {
        let inst = Template.instance();
        return (inst.minParticipantCount.get() - inst.currentParticipantCount.get()) > 0;
    },
    neededParticipantCount: function() {
        let inst = Template.instance();
        return inst.minParticipantCount.get() - inst.currentParticipantCount.get();
    },

    // return true if experiment has not started running
    experimentRunStageGuard: function() {
        let exp = Template.instance().exp.get();
        if (exp.status === ExperimentStatus.STARTED) {
            return false; // false to pass the guard
        } else {
            return true; // true to raise an issue
        }
    },

    // return true if experiment does not has any people joined
    experimentParticipantsGuard: function() {
        let exp = Template.instance().exp.get();
        if (exp.run_users.length > 0) {
            return false; // false to pass the guard
        } else {
            return true; // true to raise an issue
        }
    },

    getCauseReminderTime: function() {
        let exp = Template.instance().exp.get();
        return exp.design.cause_measure.time;
    },

    getEffectReminderTime: function() {
        let exp = Template.instance().exp.get();
        return exp.design.effect_measure.time;
    },

    getExperimentParticipants: function() {
        let exp = Template.instance().exp.get();

        // TODO: display content based on role
        if (exp.user_id !== Meteor.userId()) {
            // user is not author
            var returnResults = [];
            exp.participantInfoResults.forEach(function(result) {
                if (result.username === Meteor.user().username) {
                    returnResults.push(result);
                }
            });
            return returnResults;
        }
    },

    getExperimentParticipantsControl: function() {
        let exp = Template.instance().exp.get();
        // user is exp author
        var controlResults = [];
        exp.participantInfoResults.forEach(function(result) {
            if (result.participantMap.charAt(0) === 'c') {
                controlResults.push(result);
            }
        });

        return controlResults;

    },

    getExperimentParticipantsExperimental: function() {
        let exp = Template.instance().exp.get();
        // user is exp author
        var experimentalResults = [];
        exp.participantInfoResults.forEach(function(result) {
            if (result.participantMap.charAt(0) === 'e') {
                experimentalResults.push(result);
            }
        });

        return experimentalResults;
    },



    hasParticipantReplied: function() {
        let userId = Meteor.userId();
        let exp = Template.instance().exp.get();
    },

    hasNewClarification: function() {
        let exp = Template.instance().exp.get();
        if (exp == undefined) {
            return;
        }
        let clarification = exp.clarification;
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

});

function getReviewInviteLink() {
    let exp = Template.instance().exp.get();
    if (exp === undefined) {
        return;
    }
    let getUrl = window.location;
    let baseUrl = getUrl.protocol + "//" + getUrl.host + "/" + getUrl.pathname.split('/')[1];
    return baseUrl + "/share/review/" + exp._id;
}

function getReviewLinkHTML() {
    return encodeURI(getReviewInviteLink());
}

function getPilotInviteLink() {
    let exp = Template.instance().exp.get();
    let getUrl = window.location;
    let baseUrl = getUrl.protocol + "//" + getUrl.host + "/" + getUrl.pathname.split('/')[1];
    return baseUrl + "/share/pilot/" + exp._id;
}


function getParticipantInviteLink(instance) {
    let exp = instance.data;
    if (exp) {
        let getUrl = window.location;
        let baseUrl = getUrl.protocol + "//" + getUrl.host + "/" + getUrl.pathname.split('/')[1];
        return baseUrl + "/share/join/" + exp.id;
    }
}

function getIFrameInviteLink(url) {
    let iframeUrl = url.replace(/\//g, '%2F');
    iframeUrl = iframeUrl.replace(/:/g, '%3A');
    return iframeUrl;
}

function getIsCriteriaMissing() {
    // return false;
    let exp = Template.instance().exp.get();
    let criteria = exp.design.criteria;
    if (criteria) {
        if (criteria.inclusion && criteria.inclusion.length > 0 &&
            criteria.exclusion && criteria.exclusion.length > 0) {
            return false;
        }
    }
    return true;
}

function getIsEthicsIncomplete() {
    // return false;
    return !Template.instance().ethicsCompleted.get();
}

function getParticipant(user_id) {


    let pa = Meteor.users.find(user_id, {
        fields: {
            "galileo.city": 1,
            "username": 1
        }
    });
    pa.forEach(function(element) {});
    // console.log(pa);
    return pa;
}

Template.gaMeExperimentInfo.events({
    'click .clarificationCreatorModal': function(event, instance) {
        $('#creator-clarification-modal').modal('open');
    },
    "click #cause_msg": function() {
        $("#cause-modal").modal('open');
    },
    "click #effect_msg": function() {
        $("#effect-modal").modal('open');
    },
    "click #completedInfo": function(event, instance) {
        $("#information-modal-title").text("Completed Explanation")

        let text = "If the participant has replied to the message, then ";
        text = text + "their \"Completed\" status will be marked as \"Yes\", otherwise it will be marked as \"No.\""

        $("#information-modal-text").text(text);
        $("#information-modal").modal('open');
    },
    "click #adheranceInfo": function(event, instance) {
        $("#information-modal-title").text("Adherance Explanation")

        let text = "If the participant has followed the control steps or experimental steps";
        text = text + " depending upon their assigned group, then their \"Adherance\"";
        text = text + " status will be marked as \"1\", otherwise it will be marked as \"0.\"";

        $("#information-modal-text").text(text);
        $("#information-modal").modal('open');
    },
    "click #timeDiffInfo": function(event, instance) {
        $("#information-modal-title").text("Time Difference Explanation")

        let text = "This is the amount of time between when the participant received their "
        text = text + "message and when they responded.\n\n"
        text = text + "If the time difference is green, then the participant responded in less than one hour.\n";
        text = text + "If the time difference is orange, then the participant responded between one to three hours later.\n";
        text = text + "If the time difference is red, then the participant took more than 3 hours to respond.\n";

        $("#information-modal-text").text(text);
        $("#information-modal").modal('open');
    },
    "click #valueInfo": function(event, instance) {
        $("#information-modal-title").text("Value Explanation")

        let text = "If there is a value below, the participant has sent in "
        text = text + "a response to the daily message.\n\n"
        text = text + "If a message icon appears, next to the value, click the message icon to view the followup message.\n\n";
        text = text + "Followup messages allow participants to provide more detailed information about ";
        text = text + "their daily submissions and their compliance with the experiment steps."
        text = text + "\n\nIf a black dash appears below then the notification to submit data has not been sent."
        text = text + "\nIf a red dash appears below then the notification to submit data has been sent."

        $("#information-modal-text").text(text);
        $("#information-modal").modal('open');
    },
    "click #followupInfo": function(event, instance) {
        $("#information-modal-title").text("Followup Explanation")

        let text = "If a message icon appears, this means that the participant has sent in ";
        text = text + "a followup message. Followup messages allow participants to provide more detailed information about ";
        text = text + "their daily submissions and their compliance with the experiment steps.\n\nClick the message icon to view the followup message";

        $("#information-modal-text").text(text);
        $("#information-modal").modal('open');
    },
    "click .followup": function(event, instance) {
        console.log(event)
        console.log(instance)
        alert("Hel")
    },
    "click #start-pilot": function() {
        let inst = Template.instance();
        let expId = getID();
        Meteor.call("galileo.experiments.setOpenForPilot", expId, function(err, result) {
            if (!err) {
                window.location.reload();
            }
        });
    },

    "click #skip-pilot-and-run": function() {
        let inst = Template.instance();
        let expId = getID();
        //if (!inst.showPilot.get()) {
        $("#correctness-modal").modal('open');

        /*Meteor.call('galileo.experiments.changeStatus', expId, ExperimentStatus.READY_TO_RUN, function(err, result) {
            if (!err) {
                let exp = inst.exp.get();
                exp.status = ExperimentStatus.READY_TO_RUN;
                inst.exp.set(exp);
            } else {
                console.log(err);
            }
        })
        */
        //window.location.href = "/galileo/run/" + expId;
        //}
        // else if (confirm("Do you really want to skip the pilot")) {
        //     window.location.href = "/galileo/run/" + expId;
        // }
    },
    "click .expandCauseFollowup": function(event) {
        let targetFollowupContent = $(event.target).attr("followup");
        let targetFollowupUser = $(event.target).attr("user");

        $("#followup-modal-content").html(targetFollowupContent);
        $("#followup-modal-title").html("Here is detailed followup provided by " + targetFollowupUser + ": ");
        $('#followup-modal').modal('open');
        //console.log("targetFollowup " + targetFollowup);
    },
    "click .expandValueMessage": function(event) {
        let targetMessageContent = $(event.target).attr("textMessage");
        let targetMessageUser = $(event.target).attr("user");

        $("#value-modal-content").html(targetMessageContent);
        $("#value-modal-title").html("Here is a detailed message provided by " + targetMessageUser + ": ");
        $('#value-modal').modal('open');
        //console.log("targetFollowup " + targetFollowup);
    },
    "click #addCriteriaBtn": function() {
        let inst = Template.instance();
        let expId = getID();

        window.location.href = '/galileo/addcriteria?expid=' + expId;
    },
    "click #copyInviteReviewLinkBtn": function() {
        copyToClipboard("#inviteReviewLink");
        Materialize.toast('Copied!', 2000);
    },
    "click #reviewerUrl": function() {
        $("#copyInviteReviewLinkBtn").click();
    },
    "click #copyInviteJoinLinkBtn": function() {
        copyToClipboard("#inviteJoinLink");
        Materialize.toast('Copied!', 2000);
    },
    "click #copyInvitePilotLinkBtn": function() {
        copyToClipboard("#invitePilotLink");
        Materialize.toast('Copied!', 2000);
    },

    "click #hide-show-rows": function() {
        var currentWord = $("#hide-show-rows").text();
        if (currentWord === "HIDE USER INFO") {
            // user want to show more info
            $(".hidableCol").hide();
            $("#hide-first-cell").attr("colspan", "2");
            $("#hide-show-rows").html("SHOW USER INFO");
            $("#hide-second-cell").attr("colspan", "2");
        } else {
            // user want to show less info
            $(".hidableCol").show();
            $("#hide-first-cell").attr("colspan", "4");
            $("#hide-show-rows").html("HIDE USER INFO");
            $("#hide-second-cell").attr("colspan", "4");
        }
    },

    "click #hide-show-details": function() {
        var currentWord = $("#hide-show-details").text();
        if (currentWord === "LESS DETAILS") {
            // user want to show more info
            $(".hideableData").addClass('hide');
            $(".hide-cause").attr("colspan", "1");
            $(".hide-effect").attr("colspan", "1");
            $(".hideableDay").attr("colspan", "2");
            $("#hide-show-details").text("MORE DETAILS");
        } else {
            // user want to show less info
            $(".hideableData").removeClass('hide');
            $(".hide-cause").attr("colspan", "3");
            $(".hide-effect").attr("colspan", "2");
            $(".hideableDay").attr("colspan", "5");
            $("#hide-show-details").text("LESS DETAILS");
        }
    },

    "click #helpReviewBtn": function(event) {
        $('.helpcard').show();
    },

    'click .helpclose': function(event) {
        let cardId = event.target;
        $(cardId).closest('.card').removeClass("active").slideToggle(200);
    },
    "click #openEmailTemplateBtn": function() {
        let modal = $('#share-email-modal');
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
    "click #openEmailInviteJoinBtn": function() {
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
    "click #facebook-share-icon-btn": function(event) {
        let modal = $('#share-social-modal');
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
    "click #requestAnalysisOnInfo": function(event) {
        let exp = Template.instance().exp.get();
        if (exp === undefined) {
            return;
        }
        let expId = exp._id;
        Meteor.call('galileo.notification.sendDataAnalysisRequest', expId);
        $(event.target).prop('disabled', true);
        Materialize.toast("You have submitted the request of data analysis.", 3000, "toast rounded");
        window.location.href = "/galileo/me/experiment/" + expId + "/info";
    }
});

function formatDate(date) {
    let monthNames = [
        "January", "February", "March", "April", "May", "June", "July",
        "August", "September", "October", "November", "December"
    ];
    let day = date.getDate();
    let monthIndex = date.getMonth();
    let year = date.getFullYear();
    return day + ' ' + monthNames[monthIndex] + ', ' + year;
}

function copyToClipboard(element) {
    let $temp = $("<input>");
    $("body").append($temp);
    $temp.val($(element).val()).select();
    document.execCommand("copy");
    $temp.remove();
}

function timeDiffColor(day1, day2) {
    let time = Math.abs(day2 - day1);
    time = time / (1000 * 60 * 60);

    if (time <= 1) {
        return "green"
    } else if (time > 1 && time <= 3) {
        return "#FFA700";
    } else {
        return "red";
    }
}

function timeDiff(day1, day2) {
    let time = Math.abs(day2 - day1);
    let final = "";
    if (Math.floor(time / (1000 * 60 * 60 * 24)) > 0) {
        final = Math.floor(time / (1000 * 60 * 60 * 24)) + " day";
    } else if (Math.floor(time / (1000 * 60 * 60)) > 0) {
        final = Math.floor(time / (1000 * 60 * 60)) + " hour";
    } else if (Math.floor(time / (1000 * 60)) > 0) {
        final = Math.floor(time / (1000 * 60)) + " minute";
    } else if (Math.floor(time / (1000)) > 0) {
        final = Math.floor(time / (1000)) + " second";
    } else if (Math.floor(time / 1000) === 0) {
        final = time + " ms";
    } else {
        return "-";
    }

    if (parseInt(final) !== 1) {
        return final + "s";
    }
    return final;
}

function getID() {
    let currentURL = window.location.href.split('/');
    let targetID = currentURL[currentURL.length - 2];
    return targetID;
}