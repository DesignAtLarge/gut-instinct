import './_.jade';

Template.gaPilot.rendered = function() {
    $('select').material_select();

    $('.datepicker').pickadate({
        selectMonths: true, // Creates a dropdown to control month
        selectYears: 15, // Creates a dropdown of 15 years to control year,
        today: 'Today',
        clear: 'Clear',
        close: 'Ok',
        //min: new Date((new Date()).getTime() + 24 * 60 * 60 * 1000),
        min: new Date(),
        closeOnSelect: false // Close upon selecting a date,
    });
};

Template.gaPilot.onCreated(function() {
    let self = this;
    this.exp = new ReactiveVar(null);
    this.visitedSteps = new ReactiveArray();
    this.step = new ReactiveVar(1);
    this.group = new ReactiveVar(null);
    this.groupDisabled = new ReactiveVar(true);
    this.duration = new ReactiveVar(null);
    this.durationDisabled = new ReactiveVar(true);
    this.controlAvailable = new ReactiveVar(false);
    this.experimentalAvailable = new ReactiveVar(false);
    this.dateDisabled = new ReactiveVar(true);
    this.date = new ReactiveVar();
    this.notifyingPilots = new ReactiveVar(true);

    Meteor.call("galileo.experiments.getExperiment", this.data.id, function(err, exp) {
        self.exp.set(exp);
    });
    Meteor.call("galileo.pilot.hasControlPilot", this.data.id, function(err, has) {
        if (!err) {
            self.controlAvailable.set(!has);
        }
    });

    Meteor.call("galileo.pilot.hasExperimentalPilot", this.data.id, function(err, has) {
        if (!err) {
            self.experimentalAvailable.set(!has);
        }
    });
});

Template.gaPilot.helpers({
    groupDisabled: function() {
        return Template.instance().groupDisabled.get();
    },
    durationDisabled: function() {
        return Template.instance().durationDisabled.get();
    },
    dateDisabled: function() {
        return Template.instance().dateDisabled.get();
    },
    id: function() {
        return Template.instance().data.id;
    },
    hypothesis: function() {
        let inst = Template.instance();
        let exp = inst.exp.get();
        if (exp) {
            return exp.design.cause + " " + exp.design.relation + " " + exp.design.effect;
        } else {
            return "";
        }
    },
    controlCondition: function() {
        let inst = Template.instance();
        let exp = inst.exp.get();
        if (exp) {
            return exp.design.condition.control.description;
        } else {
            return "";
        }
    },
    experimentalCondition: function() {
        let inst = Template.instance();
        let exp = inst.exp.get();
        if (exp) {
            return exp.design.condition.experimental.description;
        } else {
            return "";
        }
    },
    controlSteps: function() {
        let inst = Template.instance();
        let exp = inst.exp.get();
        if (exp) {
            return exp.design.condition.control.steps.map((str, i) => {
                return {
                    index: i + 1,
                    step: str
                }
            });
        } else {
            return [];
        }
    },
    experimentalSteps: function() {
        let inst = Template.instance();
        let exp = inst.exp.get();
        if (exp) {
            return exp.design.condition.experimental.steps.map((str, i) => {
                return {
                    index: i + 1,
                    step: str
                }
            });
        } else {
            return [];
        }
    },
    controlAvailable: function() {
        return Template.instance().controlAvailable.get();
    },
    experimentalAvailable: function() {
        return Template.instance().experimentalAvailable.get();
    },
    isCurrentStep: function(num) {
        return Template.instance().step.get() === num;
    },
    visited: function(num) {
        return Template.instance().visitedSteps.get()[num] !== undefined;
    },
    startDate: function() {
        return formatDate(Template.instance().date.get());
    },
    endDate: function() {
        let start = Template.instance().date.get().getTime();
        let duration = Template.instance().duration.get();
        let end = new Date(start + duration * 24 * 60 * 60 * 1000);
        return formatDate(end);
    },
    notifyingPilots: function() {
        return Template.instance().notifyingPilots.get();
    }
});

Template.gaPilot.events({
    "click .pilot-step-number": function(event) {
        let inst = Template.instance();
        let visitedSteps = inst.visitedSteps.get();
        let num = parseInt($(event.currentTarget).text());
        if (visitedSteps[num] === true) {
            inst.step.set(num);
        }
    },
    "click .prev-step": function() {
        let inst = Template.instance();
        let step = inst.step.get();
        inst.step.set(step - 1);

        let visitedSteps = inst.visitedSteps.get();
        visitedSteps[step - 1] = true;
        inst.visitedSteps.set(visitedSteps);
    },
    "click .next-step": function() {
        let inst = Template.instance();
        let step = inst.step.get();
        inst.step.set(step + 1);

        let visitedSteps = inst.visitedSteps.get();
        visitedSteps[step + 1] = true;
        inst.visitedSteps.set(visitedSteps);
    },
    "click .pilot-group-choice": function(event, instance) {
        let elem = $(event.currentTarget);
        if (!elem.hasClass("disabled") && !elem.hasClass("active")) {
            instance.groupDisabled.set(false);
            elem.addClass("active").siblings().removeClass("active");
        }
    },
    "click #group-choice-submit": function() {
        let inst = Template.instance();
        let group = parseInt($(".pilot-group-choice.active").attr("data-value"));
        inst.group.set(group);
    },
    "change #duration-select": function(event) {
        let inst = Template.instance();
        let length = parseInt($(event.currentTarget).val());
        inst.duration.set(length);
        inst.durationDisabled.set(false);
    },
    "change #start-date-input": function(event) {
        let inst = Template.instance();
        let date = Date.parse($(event.currentTarget).val());
        if (date) {
            inst.date.set(new Date(date));
            inst.dateDisabled.set(false);
        } else {
            inst.date.set(undefined);
            inst.dateDisabled.set(true);
        }
    },
    "click #date-choice-submit": function() {
        let inst = Template.instance();
        let expId = inst.data.id;
        let duration = inst.duration.get();
        let group = parseInt($(".pilot-group-choice.active").attr("data-value"));
        let date = inst.date.get();
        startPilot(inst, expId, group, duration, date);
    }
});

function startPilot(inst, expId, group, duration, startDate) {
    $("#start-pilot-mask").fadeIn(200);
    Meteor.call("galileo.pilot.startPilot", expId, group, duration, startDate, function(err, success) {
        $("#start-pilot-mask").fadeOut(200);
        if (err) {
            Materialize.toast(err, 4000, "toast rounded");
            inst.step.set(inst.step.get() + 1);
        } else {
            if (success) {
                inst.step.set(inst.step.get() + 1);
            } else {
                alert("You have failed joining the experiment");
            }
        }
    });
}

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