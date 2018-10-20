import './_.jade';
import {
    MeasureType,
    ParticipationSlotStatus,
    PilotStatus
} from "../../../../../../imports/api/ga-models/constants";
import {
    TimeSpan,
    Time
} from "../../../../../../imports/api/ga-models/time";

Template.gaMeExperimentMyPilot.onCreated(function() {
    let inst = this;
    this.pilot = new ReactiveVar(undefined);
    this.exp = new ReactiveVar(undefined);
    this.isLoaded = new ReactiveVar(false);
    Meteor.call("galileo.pilot.getPilot", this.data.id, function(err, pilot) {
        inst.isLoaded.set(true);
        inst.pilot.set(pilot);
    });
    Meteor.call("galileo.experiments.getExperiment", this.data.id, function(err, exp) {
        inst.exp.set(exp);
    });
});

Template.gaMeExperimentMyPilot.helpers({
    isLoaded: function() {
        return Template.instance().isLoaded.get();
    },
    plusOne: function(num) {
        return num + 1;
    },
    steps: function() {
        let pilot = Template.instance().pilot.get();
        let exp = Template.instance().exp.get();
        if (exp && pilot) {
            return exp["design"]["condition"][pilot.group ? "experimental" : "control"]["steps"];
        }
    },
    startDate: function() {
        let pilot = Template.instance().pilot.get();
        if (pilot) {
            return formalDate(pilot.user_startDate_inGmt);
        }
    },
    endDate: function() {
        let pilot = Template.instance().pilot.get();
        if (pilot) {
            return formalDate(pilot.user_endDate_inGmt);
        }
    },
    isPiloting: function() {
        return Template.instance().isPiloting.get();
    },
    causeType: function() {
        let exp = Template.instance().exp.get();
        if (exp) {
            return exp.design.cause_measure.type;
        } else {
            return "";
        }
    },
    effectType: function() {
        let exp = Template.instance().exp.get();
        if (exp) {
            return exp.design.effect_measure.type;
        } else {
            return "";
        }
    },
    group: function() {
        let pilot = Template.instance().pilot.get();
        if (pilot) {
            switch (pilot.group) {
                case 0:
                    return "Control Group";
                case 1:
                    return "Experimental Group";
            }
        }
    },
    condition: function() {
        let exp = Template.instance().exp.get();
        let pilot = Template.instance().pilot.get();
        if (exp && pilot) {
            switch (pilot.group) {
                case 0:
                    return exp.design.condition.control.description;
                case 1:
                    return exp.design.condition.experimental.description;
            }
        }
    },
    slots: function() {
        let pilot = Template.instance().pilot.get();
        if (pilot) {
            let ts = new TimeSpan(pilot.user_startDate_inGmt, pilot.user_endDate_inGmt);
            let duration = Math.floor(ts.getDays());
            let slots = [];
            for (let j = 0; j < duration; j++) {
                slots[j] = {
                    date: date(new Time(pilot.user_startDate_inGmt).addDay(j).getDate()),
                    cause: pilotData(pilot, "cause", j),
                    effect: pilotData(pilot, "effect", j)
                }
            }
            initiateSelect();
            return slots;
        }
    },
    canGivePilotFeedeback: function() {
        let pilot = Template.instance().pilot.get();
        return (pilot && pilot.status === PilotStatus.ENDED);
    },
    feedbackPilotLink: function() {
        let exp = Template.instance().exp.get();
        if (exp) {
            return "/galileo/pilotFeedback/" + exp._id;
        }
    }
});

Template.gaMeExperimentMyPilot.events({
    "change select.pilot-data": function(event) {
        let $elem = $(event.currentTarget);
        updateData($elem);
    },
    "blur input.pilot-data": function(event) {
        let $elem = $(event.currentTarget);
        updateData($elem);
    }
});

function initiateSelect() {
    setTimeout(function() {
        $('select').material_select();
    }, 0);
}

function pilotData(pilot, type, day) {
    let exp = Template.instance().exp.get();
    if (exp) {
        let slot = pilot[type + "_data"][day];
        let status = slot["status"];

        switch (status) {
            case ParticipationSlotStatus.PREPARING:
                return "Not recorded yet";
            case ParticipationSlotStatus.SENT:
                return "Waiting for reply";
            case ParticipationSlotStatus.COMPLETE:
                return processReceivedData(exp, pilot, slot, type, day);
            case ParticipationSlotStatus.ERROR:
                return "Error";
        }
    }
}

function processReceivedData(exp, pilot, slot, type, day) {
    let measureType = exp["design"][type + "_measure"]["type"];
    let id = "pilot-" + pilot._id + "-" + day + "-" + type;
    let val = slot["value"];
    switch (measureType) {
        case MeasureType.ABS_PRES:
            return "<select class=\"pilot-data\" id=\"" + id + "\">" +
                "<option value=\"\" disabled" + (val ? "" : " selected") + ">Select an option</option>" +
                "<option value=\"true\"" + ((val !== undefined && val) ? " selected" : "") + ">Yes</option>" +
                "<option value=\"false\"" + ((val !== undefined && !val) ? " selected" : "") + ">No</option>" +
                "</select>";
        case MeasureType.RATING:
            return "<select class=\"pilot-data\" id=\"" + id + "\">" +
                "<option value=\"\" disabled" + (val ? "" : " selected") + ">Select an option</option>" +
                "<option value=\"1\"" + (val === 1 ? " selected" : "") + ">1</option>" +
                "<option value=\"2\"" + (val === 2 ? " selected" : "") + ">2</option>" +
                "<option value=\"3\"" + (val === 3 ? " selected" : "") + ">3</option>" +
                "<option value=\"4\"" + (val === 4 ? " selected" : "") + ">4</option>" +
                "<option value=\"5\"" + (val === 5 ? " selected" : "") + ">5</option>" +
                "</select>";
        case MeasureType.AMOUNT:
            if (!val) val = 0;
            return "<input class=\"pilot-data\" type=\"number\" id=\"" + id + "\" value=\"" + val + "\"/>";
        case MeasureType.RATE:
            if (!val) val = 0;
            return "<input class=\"pilot-data\" type=\"number\" id=\"" + id + "\" value=\"" + val + "\"/>";
        case MeasureType.FREQUENCY:
            if (!val) val = 0;
            return "<input class=\"pilot-data\" type=\"number\" id=\"" + id + "\" value=\"" + val + "\"/>";
    }
}

function updateData($elem) {
    let ls = $elem.attr("id").split("-");
    let id = ls[1];
    let day = ls[2];
    let type = ls[3];
    let val = $elem.val();
    if (val === "true") val = true;
    else if (val === "false") val = false;
    Meteor.call("galileo.pilot.updateData", id, type, day, val, function(err) {
        if (!err) {
            Materialize.toast("Data Updated successfully", 3000, "toast rounded");
        } else {
            Materialize.toast("Server Connection Error", 3000, "toast rounded");
        }
    });
}

function formalDate(dt) {
    return toMonth(dt.getMonth()) + ". " + dt.getDate() + ", " + dt.getFullYear();
}

function date(dt) {
    return pad(dt.getMonth() + 1) + "/" + dt.getDate() + "/" + dt.getFullYear();
}

function pad(num) {
    if (num < 10) {
        return "0" + num;
    } else {
        return num;
    }
}

function toMonth(month) {
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