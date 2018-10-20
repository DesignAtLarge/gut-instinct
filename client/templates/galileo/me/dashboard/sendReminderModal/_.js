import './_.jade';
import {
    OpenHumansDataList
} from "../../../../../../imports/api/ga-models/constants";


Template.gaSendReminderModal.rendered = function() {
    setTimeout(function() {
        $('select').material_select();
    }, 0);
};

Template.gaSendReminderModal.onCreated(function() {
    let inst = this;

    this.myOngoingExp = new ReactiveArray();
    this.reminderListToday = new ReactiveArray();
    this.hasDataListToday = new ReactiveArray();
    this.reminderListYesterday = new ReactiveArray();
    this.hasDataListYesterday = new ReactiveArray();
    this.allPartList = new ReactiveArray();
    this.isLoaded = new ReactiveVar(false);
    this.userId = new ReactiveVar();

    Meteor.call('galileo.profile.isAdmin', function(err, res) {
        if (window.location.pathname.split("/")[4] !== undefined && window.location.pathname.split("/")[4].length > 0 && res) {
            inst.userId.set(window.location.pathname.split("/")[4]);
        } else {
            inst.userId.set(Meteor.userId());
        }

        Meteor.call("galileo.experiments.getMulExperimentWithParticipantData", inst.userId.get(), function(err, allMyOngoingExperiments) {
            //console.log("get result from getMulExperimentWithParticipantData" + JSON.stringify(allMyOngoingExperiments));
            inst.isLoaded.set(true);
            if (err) {
                throw err;
            }
            inst.myOngoingExp.set(allMyOngoingExperiments);

            let participants = [];
            allMyOngoingExperiments.forEach(function(element) {
                participants = element.participantInfoResults;
                inst.allPartList.set(participants);
            });

            console.log(participants);

            let currentDay = inst.data.day;

            let interval = setInterval(function() {
                if (currentDay == undefined) {
                    currentDay = inst.data.day;
                }
                else {
                    clearInterval(interval);

                    let partReply = [];
                    for (let i = 0; i < participants.length; i++) {
                        //let hasCause = participants[i].all_cause_data[currentDay-1].status;
                        if (participants[i].all_cause_data[currentDay - 1] != undefined && (participants[i].all_cause_data[currentDay - 1].status >= 2 || participants[i].all_effect_data[currentDay - 1].status >= 2)) {
                            partReply.push(participants[i]._id);
                        }
                    }

                    let partReplyYesterday = []
                    for (let i = 0; i < participants.length; i++) {
                        //let hasCause = participants[i].all_cause_data[currentDay-1].status;
                        if (participants[i].all_cause_data[currentDay - 2] != undefined && (participants[i].all_cause_data[currentDay - 2].status >= 2 || participants[i].all_effect_data[currentDay - 2].status >= 2)) {
                            partReplyYesterday.push(participants[i]._id);
                        }
                    }
                    inst.hasDataListToday.set(partReply);
                    inst.hasDataListYesterday.set(partReplyYesterday);
                }
            }, 100);
        });
    });
});


Template.gaSendReminderModal.helpers({
    username: function() {
        let user = Meteor.users.find({
            "_id": Template.instance().userId.get()
        }).fetch();
        if (user.length > 0 && user[0] && user[0].username) {
            return user[0].username
        }
    },
    url: function() {
        let url = "/galileo/me/dashboard";
        let fullURL = Meteor.absoluteUrl();
        fullURL = fullURL.substring(0, fullURL.length - 1);
        // let baseurl = "http://localhost:3000";
        // let user_exp = Template.instance().myOngoingExp.get();
        // let expId = "";
        // user_exp.forEach(function (element) {
        //     expId = element._id;
        // });
        return fullURL + url;
    },
    reminderEmail: function() {
        return true;
    },
    openHumans: function() {
        let user_exp = Template.instance().myOngoingExp.get();
        if (user_exp == undefined || user_exp[0] == undefined) {
            return;
        }
        return user_exp[0].mendel_ga_id === "OPENHUMANS"
    },
    getSources: function() {
        let user_exp = Template.instance().myOngoingExp.get();
        if (user_exp == undefined || user_exp[0] == undefined) {
            return;
        }
        if (user_exp[0].mendel_ga_id === "OPENHUMANS") {
            let sources = "";
            let cause_sources = user_exp[0].design.cause_measure.ohDataSourceIds;
            cause_sources.forEach(function(c) {
                // console.log("cause measure from: " + c);
                if (c === 0) {} else {
                    console.log("id title is: " + OpenHumansDataList[c].title);
                    sources += OpenHumansDataList[c].title + " or "
                }
            });
            let n = sources.length - 4;
            sources = sources.substring(0, n);
            return sources;
        }
        return;
    },
    getCurrentDay: function() {
        let user_exp = Template.instance().myOngoingExp.get();
        let temp = "";
        user_exp.forEach(function(element) {
            temp = element.start_date_time;
        });
        // TODO consider month
        let startDay = temp.toString().split(" ")[2];
        var d = new Date().toISOString();
        var n = parseInt(d.split('-')[2].split('T')[0]);
        return n - parseInt(startDay) + 1;
    },
    getTotalDay: function() {
        let user_exp = Template.instance().myOngoingExp.get();
        let duration = "";
        user_exp.forEach(function(element) {
            duration = element.duration;
        });
        return duration;
    },
    whoNotReplied: function(currentDay) {
        let exp = Template.instance().myOngoingExp.get();
        let participants = [];
        exp.forEach(function(element) {
            participants = element.participantInfoResults;
        });
        let partNotReply = [];
        let userIdList = [];
        for (let i = 0; i < participants.length; i++) {
            //let hasCause = participants[i].all_cause_data[currentDay-1].status;
            if (participants[i].all_cause_data[currentDay - 1] != undefined && (participants[i].all_cause_data[currentDay - 1].status == 1 || participants[i].all_effect_data[currentDay - 1].status == 1)) {
                partNotReply.push(participants[i].participantMap);
                userIdList.push(participants[i]._id);
            }
        }

        let partNotReplyYesterday = [];
        let userIdListYesterday = [];
        for (let i = 0; i < participants.length; i++) {
            //let hasCause = participants[i].all_cause_data[currentDay-1].status;
            if (participants[i].all_cause_data[currentDay - 2] != undefined && (participants[i].all_cause_data[currentDay - 2].status == 1 || participants[i].all_effect_data[currentDay - 2].status == 1)) {
                partNotReplyYesterday.push(participants[i].participantMap);
                userIdListYesterday.push(participants[i]._id);
            }
        }

        Template.instance().reminderListToday.set(userIdList);
        Template.instance().reminderListYesterday.set(userIdListYesterday)
        return;
    },
});

Template.gaSendReminderModal.events({
    "click #edit-reminder": function() {
        toggleEditButton('reminder');
        makeEditable();
    },

    "click #accept-edit-reminder": function(event, instance) {
        toggleEditButton('reminder');
        makeUneditable();
    },

    "click #cancel-edit-reminder": function(event, instance) {
        toggleEditButton('reminder');
        makeUneditable();
    },

    "click #sendReminder": function(event) {
        let sendTo = localStorage.getItem("sendTo");
        let exp = Template.instance().myOngoingExp.get();
        let exp_id = exp[0]._id;
        let args = $('#reminder-text-box').html();
        if (sendTo === "missingDataYesterday") {
            let userList = Template.instance().reminderListYesterday.get();
            userList.forEach(function(user_id) {
                Meteor.call('galileo.notification.sendRemindParticipantEmail', user_id, args);
            });
            Materialize.toast("Has sent emails to participants who have missing data", 3000, "toast rounded");
        } else if (sendTo === "hasDataYesterday") {
            let userList = Template.instance().hasDataListYesterday.get();
            userList.forEach(function(user_id) {
                Meteor.call('galileo.notification.sendRemindParticipantEmail', user_id, args);
            });
            Materialize.toast("Has sent emails to participants who have provided data", 3000, "toast rounded");
        } else if (sendTo === "missingDataToday") {
            let userList = Template.instance().reminderListToday.get();
            userList.forEach(function(user_id) {
                Meteor.call('galileo.notification.sendRemindParticipantEmail', user_id, args);
            });
            Materialize.toast("Has sent emails to participants who have missing data", 3000, "toast rounded");
        } else if (sendTo === "hasDataToday") {
            let userList = Template.instance().hasDataListToday.get();
            userList.forEach(function(user_id) {
                Meteor.call('galileo.notification.sendRemindParticipantEmail', user_id, args);
            });
            Materialize.toast("Has sent emails to participants who have provided data", 3000, "toast rounded");
        } else {
            let userList = Template.instance().allPartList.get();
            userList.forEach(function(user) {
                user_id = user._id
                Meteor.call('galileo.notification.sendRemindParticipantEmail', user_id, args);
            });
            Materialize.toast("Has sent emails to all experiment participants", 3000, "toast rounded");
        }
    },
});

function toggleEditButton(id) {
    $('#' + id + '-div').toggleClass('hide');
    $('#' + id + '-editable').toggleClass('hide');

    $('#accept-edit-' + id).toggleClass('hide');
    $('#cancel-edit-' + id).toggleClass('hide');
    $('#edit-' + id).toggleClass('hide');
}

function makeEditable() {
    let $reminderTextbox = $('#reminder-text-box');
    $reminderTextbox.attr('contenteditable', 'true');
    $reminderTextbox.focus();
    $reminderTextbox.addClass('reminder-editable');
}

function makeUneditable() {
    let $reminderTextbox = $('#reminder-text-box');
    $reminderTextbox.attr('contenteditable', 'false');
    $reminderTextbox.removeClass('reminder-editable');
}
