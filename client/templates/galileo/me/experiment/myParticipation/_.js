import "./_.jade";
import {
    MeasureType,
    ParticipationSlotStatus
} from "../../../../../../imports/api/ga-models/constants";
import {
    TimeSpan,
    Time
} from "../../../../../../imports/api/ga-models/time";

Template.gaMeExperimentMyParticipation.onCreated(function() {
    let inst = this;
    this.exp = new ReactiveVar(undefined);
    this.participation = new ReactiveVar(undefined);
    Meteor.call("galileo.experiments.getExperiment", this.data.id, function(err, exp) {
        inst.exp.set(exp);
    });
    Meteor.call("galileo.run.getParticipation", this.data.id, function(err, participation) {
        inst.participation.set(participation);
    });
});

Template.gaMeExperimentMyParticipation.helpers({
    isBristol: function () {
        let user_exp = Template.instance().exp.get();
        if (user_exp == undefined) {
            return false
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
        let participation = Template.instance().participation.get();
        let participantGroup = participation.group;

        let expDesign = Template.instance().exp.get().design;

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
    section: function() {
        return Template.instance().data.section;
    },
    expId: function() {
        return Template.instance().data.id;
    },
    hasStartDate: function() {
        let exp = Template.instance().exp.get();
        if (exp) {
            return exp.start_date_time !== undefined;
        }
    },
    getStartDate: function() {
        let participation = Template.instance().participation.get();
        if (participation) {
            let startTime = dateStr(new Time(participation.user_startDate_inGmt).getDate())
            return startTime;
        }
    },
    causeType: function() {
        let exp = Template.instance().exp.get();
        if (exp) {
            return exp.design.cause_measure.type;
        }
    },
    effectType: function() {
        let exp = Template.instance().exp.get();
        if (exp) {
            return exp.design.effect_measure.type;
        }
    },
    steps: function() {
        let part = Template.instance().participation.get();
        if (part) {
            let cond = part.group ? "experimental" : "control";
            let exp = Template.instance().exp.get();
            if (exp) {
                return exp["design"]["condition"][cond]["steps"];
            }
        }
    },
    prepSteps: function() {
        let part = Template.instance().participation.get();
        if (part) {
            let cond = part.group ? "experimental" : "control";
            let exp = Template.instance().exp.get();
            if (exp) {
                return exp["design"]["condition"][cond]["prep_steps"];
            }
        }
    },
    // slots: function () {
    //     let participation = Template.instance().participation.get();
    //     let exp = Template.instance().exp.get();
    //     if (participation && participation.cause_data && exp) {
    //         let ts = new TimeSpan(participation.user_startDate_inGmt, participation.user_endDate_inGmt);
    //         let duration = Math.floor(ts.getDays());
    //         let slots = [];
    //         for (let j = 0; j < duration; j++) {
    //             slots[j] = {
    //                 date: dateStr(new Time(participation.user_startDate_inGmt).addDay(j).getDate()),
    //                 cause: participationData(participation, "cause", j),
    //                 effect: participationData(participation, "effect", j)
    //             }
    //         }
    //         initiateSelect();
    //         console.log(slots);
    //         return slots;
    //     }
    // },
    slots: function() {
        let participation = Template.instance().participation.get();
        let exp = Template.instance().exp.get();
        if (exp == undefined) {
            return;
        }
        let temp = exp.start_date_time;
        let startDay = temp.toString().split(" ")[2];
        var d = new Date().toISOString();
        let index = parseInt(d.split('-')[2].split('T')[0]) - parseInt(startDay);
        if (participation && participation.cause_data && exp) {
            let ts = new TimeSpan(participation.user_startDate_inGmt, participation.user_endDate_inGmt);
            let duration = Math.floor(ts.getDays());
            let slots = [];
            for (let j = 0; j < duration; j++) {
                let cause_rid = Math.floor(Math.random() * 1000000) + Math.floor(Math.random() * 1000000) + 1;
                let effect_rid = Math.floor(Math.random() * 1000000) + Math.floor(Math.random() * 1000000) + 1;
                let cause_data = participationData(participation, "cause", j);
                let effect_data = participationData(participation, "effect", j);
                if (j <= parseInt(index)) {
                    if (participation["cause_data"][j].value === undefined) {
                        cause_data = "Not recorded yet";
                    }
                    if (participation["effect_data"][j].value === undefined) {
                        effect_data = "Not recorded yet";
                    }
                    slots[j] = {
                        date: dateStr(new Time(participation.user_startDate_inGmt).addDay(j).getDate()),
                        cause: cause_data,
                        effect: effect_data,
                        cause_rid: cause_rid,
                        effect_rid: effect_rid,
                        index: j,
                        editable: true
                    }
                } else {
                    slots[j] = {
                        date: dateStr(new Time(participation.user_startDate_inGmt).addDay(j).getDate()),
                        cause: cause_data,
                        effect: effect_data,
                        cause_rid: cause_rid,
                        effect_rid: effect_rid,
                        index: j,
                        editable: false
                    }
                }
            }
            initiateSelect();
            // console.log("Slots with rid: " + JSON.stringify(slots));
            return slots;
        }
    },
});

Template.gaMeExperimentMyParticipation.events({
    // "change select.participation-data": function (event) {
    //     let $elem = $(event.currentTarget);
    //     updateData($elem);
    // },
    // "blur input.participation-data": function (event) {
    //     let $elem = $(event.currentTarget);
    //     updateData($elem);
    // },
    'click #bristol': function() {
        $("#image-modal").modal('open')
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
            let userId = Meteor.userId();
            Meteor.call('galileo.experiments.addCauseData', Meteor.userId(), expId, optionIndex, causeData);
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
            let userId = Meteor.userId();
            Meteor.call('galileo.experiments.addEffectData', Meteor.userId(), expId, optionIndex, effectData);
            $("#submitEffectBtn-" + textareaRID).hide();
            //$("#editEffectData-" + textareaRID).prop('disabled', true);
            Materialize.toast("Great! You have submitted the effect data.", 3000, "toast rounded");

            $('#followup-modal-' + expId).data('isCause', false);
            $('#followup-modal-' + expId).data('day', optionIndex);
            $("#followup-modal-"+ expId).modal('open');

        } else {
            Materialize.toast("Please provide more data before submit", 3000, "toast rounded");
        }
    },
});

function participationData(participation, type, day) {
    let exp = Template.instance().exp.get();
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

// function processReceivedData(exp, participation, slot, type, day) {
//     let measureType = exp["design"][type + "_measure"]["type"];
//     let id = "participation-" + participation._id + "-" + day + "-" + type;
//     let val = slot["value"];
//     switch (measureType) {
//         case MeasureType.ABS_PRES:
//             return "<select class=\"participation-data\" id=\"" + id + "\">" +
//                 "<option value=\"\" disabled" + (val ? "" : " selected") + ">Select an option</option>" +
//                 "<option value=\"true\"" + ((val !== undefined && val) ? " selected" : "") + ">Yes</option>" +
//                 "<option value=\"false\"" + ((val !== undefined && !val) ? " selected" : "") + ">No</option>" +
//                 "</select>";
//         case MeasureType.RATING:
//             return "<select class=\"participation-data\" id=\"" + id + "\">" +
//                 "<option value=\"\" disabled" + (val ? "" : " selected") + ">Select an option</option>" +
//                 "<option value=\"1\"" + (val === 1 ? " selected" : "") + ">1</option>" +
//                 "<option value=\"2\"" + (val === 2 ? " selected" : "") + ">2</option>" +
//                 "<option value=\"3\"" + (val === 3 ? " selected" : "") + ">3</option>" +
//                 "<option value=\"4\"" + (val === 4 ? " selected" : "") + ">4</option>" +
//                 "<option value=\"5\"" + (val === 5 ? " selected" : "") + ">5</option>" +
//                 "</select>";
//         case MeasureType.AMOUNT:
//             if (!val) val = 0;
//             return "<input class=\"participation-data\" type=\"number\" id=\"" + id + "\" value=\"" + val + "\"/>";
//         case MeasureType.RATE:
//             if (!val) val = 0;
//             return "<input class=\"participation-data\" type=\"number\" id=\"" + id + "\" value=\"" + val + "\"/>";
//         case MeasureType.FREQUENCY:
//             if (!val) val = 0;
//             return "<input class=\"participation-data\" type=\"number\" id=\"" + id + "\" value=\"" + val + "\"/>";
//     }
// }

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

// function updateData($elem) {
//     let ls = $elem.attr("id").split("-");
//     let id = ls[1];
//     let day = ls[2];
//     let type = ls[3];
//     let val = $elem.val();
//     if (val === "true") val = true;
//     else if (val === "false") val = false;
//     Meteor.call("galileo.run.updateData", id, type, day, val, function (err) {
//         if (!err) {
//             Materialize.toast("Data Updated successfully", 3000, "toast rounded");
//         }
//         else {
//             Materialize.toast("Server Connection Error", 3000, "toast rounded");
//         }
//     });
// }

function getValue(data) {
    return data.status < 2 ? "Not Recorded" : data.status < 3 ? String(data.value) : "Error";
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
