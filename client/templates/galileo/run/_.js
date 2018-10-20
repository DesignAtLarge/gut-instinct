import './_.jade';

Template.gaRun.onRendered(function() {
    $('select').material_select();

    $('.datepicker').pickadate({
        selectMonths: true, // Creates a dropdown to control month
        selectYears: 15, // Creates a dropdown of 15 years to control year,
        today: '',
        clear: 'Clear',
        close: 'Ok',
        min: new Date((new Date()).getTime() + 24 * 60 * 60 * 1000),
        //min: new Date(),
        closeOnSelect: false // Close upon selecting a date,
    });
});

Template.gaRun.onCreated(function() {
    this.exp = new ReactiveVar(null);
    this.visitedSteps = new ReactiveArray();
    this.step = new ReactiveVar(1);
    this.duration = new ReactiveVar();
    this.durationDisabled = new ReactiveVar(true);
    this.date = new ReactiveVar();
    this.dateDisabled = new ReactiveVar(true);
    this.notifyingParticipants = new ReactiveVar(false);
    Meteor.call("galileo.experiments.getExperiment", this.data.id, function(err, exp) {
        self.exp.set(exp);
    });
});

Template.gaRun.helpers({
    expId: function() {
        return Template.instance().data.id;
    },
    isCurrentStep: function(num) {
        return Template.instance().step.get() === num;
    },
    visited: function(num) {
        return Template.instance().visitedSteps.get()[num] !== undefined;
    },
    durationDisabled: function() {
        return Template.instance().durationDisabled.get();
    },
    dateDisabled: function() {
        return Template.instance().dateDisabled.get();
    },
    startDate: function() {
        return formatDate(Template.instance().date.get());
    },
    endDate: function() {
        let start = Template.instance().date.get().getTime();
        let duration = Template.instance().duration.get();
        let end = new Date(start + (duration - 1) * 24 * 60 * 60 * 1000);
        return formatDate(end);
    },
    notifyingParticipants: function() {
        return Template.instance().notifyingParticipants.get();
    }
});

Template.gaRun.events({
    "click .pilot-step-number": function(event, instance) {
        let inst = Template.instance();
        let visitedSteps = inst.visitedSteps.get();
        let num = parseInt($(event.currentTarget).text());
        if (visitedSteps[num] === true) {
            inst.step.set(num);
        }
    },
    "click .prev-step": function(event, instance) {
        let inst = Template.instance();
        let step = inst.step.get();
        inst.step.set(step - 1);

        let visitedSteps = inst.visitedSteps.get();
        visitedSteps[step - 1] = true;
        inst.visitedSteps.set(visitedSteps);
    },
    "click .next-step": function(event, instance) {
        let inst = Template.instance();
        let step = inst.step.get();
        inst.step.set(step + 1);

        let visitedSteps = inst.visitedSteps.get();
        visitedSteps[step + 1] = true;
        inst.visitedSteps.set(visitedSteps);
    },
    "change #duration-select": function(event, instance) {
        let inst = Template.instance();
        let length = parseInt($(event.currentTarget).val());
        inst.duration.set(length);
        inst.durationDisabled.set(false);
    },
    "change #start-date-input": function(event, instance) {
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
    "click #date-choice-submit": function(event, instance) {
        let inst = Template.instance();
        let expId = inst.data.id;
        let duration = inst.duration.get();
        let date = inst.date.get();

        // TODO: Break into 2 calls, one for run, other for notify
        instance.notifyingParticipants.set(true);
        Meteor.call("galileo.run.runExperiment", expId, duration, date, function(err, success) {
            instance.notifyingParticipants.set(false);
            if (err || !success) {
                Materialize.toast(err, 3000, "rounded toast");
            } else {
                inst.step.set(inst.step.get() + 1);
                window.location.href = "/galileo/me/experiment/" + expId;
            }
        });
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