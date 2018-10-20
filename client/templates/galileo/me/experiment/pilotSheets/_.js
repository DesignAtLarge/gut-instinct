import './_.jade';
import {
    Time
} from "../../../../../../imports/api/ga-models/time";

Template.gaMeExperimentPilotSheets.onCreated(function() {
    let self = this;
    self.exp = new ReactiveVar();
    self.versions = new ReactiveArray();
    Meteor.call("galileo.experiments.getExperiment", this.data.id, function(err, exp) {
        self.exp.set(exp);
        self.versions.set(exp.versions);
    });
});

Template.gaMeExperimentPilotSheets.helpers({
    versions: function() {
        return Template.instance().versions.get().map((version, i) => {
            return {
                designId: version.design_id,
                create_date_time: version.create_date_time,
                index: i
            }
        });
    }
});

Template.gaMeExperimentPilotSheetVersion.onCreated(function() {

});

Template.gaMeExperimentPilotSheetVersion.helpers({
    index: () => Template.instance().data.index + 1
});

Template.gaMeExperimentPilotSheet.onCreated(function() {
    let self = this;
    self.pilot = new ReactiveVar(undefined);
    Meteor.call("galileo.pilot.getPilotByVersionAndGroup", self.data.designId, self.data.group, function(err, pilot) {
        if (!err && pilot) {
            self.pilot.set(pilot);
        }
    });
});

Template.gaMeExperimentPilotSheet.helpers({
    isControlGroup: function() {
        return Template.instance().data.group === 0;
    },
    hasPilot: function() {
        return Template.instance().pilot.get() !== undefined;
    },
    dateTime: function() {
        let pilot = Template.instance().pilot.get();
        if (pilot) {
            return ": " + dateStr(pilot.user_startDate_inGmt) + " - " + dateStr(pilot.user_endDate_inGmt);
        }
    },
    days: function() {
        let pilot = Template.instance().pilot.get();
        if (pilot) {
            return pilot.cause_data.map((cd, i) => {
                let ed = pilot.effect_data[i];
                return {
                    date: dateStr(new Time(pilot.user_startDate_inGmt).addDay(i).getDate()),
                    cause: getValue(cd),
                    effect: getValue(ed)
                };
            });
        }
    }
});

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