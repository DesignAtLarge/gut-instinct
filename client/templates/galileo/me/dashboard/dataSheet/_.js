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

Template.gaMeDataSheet.rendered = function() {
    setTimeout(function() {
        $('select').material_select();
    }, 0);
};

Template.gaMeDataSheet.rendered = (function() {
    $(document).ready(function() {
        $('.modal').modal();
    });

    $(document).ready(function() {
        $('.modal').modal();

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

Template.gaMeDataSheet.onCreated(function() {

    let inst = this;
    // all exp data
    this.isLoading = new ReactiveVar(true);
    this.participation = new ReactiveVar();
    this.myParticipateExp = new ReactiveVar(undefined);
    this.exp = new ReactiveVar(undefined);

    Meteor.call("galileo.experiments.getParticipatingExpByUserExp", inst.data.user_id, inst.data.exp_id, function(err, resultExp) {
        if (err) {
            throw err;
        }
        // console.log("my participating exp in meteor call: " + JSON.stringify(resultExp));
        if (resultExp) {
            inst.myParticipateExp.set(resultExp);
            inst.participation.set(resultExp.pResult);
        }

        inst.isLoading.set(false)
    });
});

Template.gaMeDataSheet.helpers({
    // Helper functions for the participanting experiment of current user
    noData: function(cause_effect) {
        if (cause_effect === "Not recorded yet") {
            return true;
        } else {
            return false;
        }
    },
    loaded: function() {
        let inst = Template.instance();
        return !inst.isLoading.get();
    },
    showExp: function() {
        let inst = Template.instance();
        return inst.myParticipateExp.get() && inst.participation.get();
    },
    getExpId: function() {
        let exp = Template.instance().myParticipateExp.get();
        if (exp == undefined) {
            return;
        }
        return exp._id;
    },
    getCause: function() {
        return Template.instance().myParticipateExp.get() && Template.instance().myParticipateExp.get().design.cause;
    },
    getEffect: function() {
        return Template.instance().myParticipateExp.get() && Template.instance().myParticipateExp.get().design.effect;
    },
    getCauseUnit: function() {
        return "Cause: " + Template.instance().myParticipateExp.get().design.cause_measure.unit + "?";
    },
    getEffectUnit: function() {
        return "Effect: " + Template.instance().myParticipateExp.get().design.effect_measure.unit + "?";
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
    userId: function() {
        return Template.instance().data.user_id;
    }
});



Template.gaMeDataSheet.events({
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
            let userId = inst.data.user_id;
            Meteor.call('galileo.experiments.addCauseData', userId, expId, optionIndex, causeData);
            $("#submitCauseBtn-" + textareaRID).hide();
            //$("#editCauseData-" + textareaRID).prop('disabled', true);
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
            let userId = inst.data.user_id;
            Meteor.call('galileo.experiments.addEffectData', userId, expId, optionIndex, effectData);
            $("#submitEffectBtn-" + textareaRID).hide();
            //$("#editEffectData-" + textareaRID).prop('disabled', true);
            Materialize.toast("Great! You have submitted the effect data.", 3000, "toast rounded");

            $('#followup-modal-' + expId).data('isCause', false);
            $('#followup-modal-' + expId).data('day', optionIndex);
            $("#followup-modal-"+ expId).modal('open');            

        } else {
            Materialize.toast("Please provide more data before submit", 3000, "toast rounded");
        }
    }
});


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