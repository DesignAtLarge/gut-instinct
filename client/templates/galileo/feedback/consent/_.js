import './_.jade';

Template.gaFeedbackConsent.onCreated(function() {
    this.isLoading = new ReactiveVar(true);
    this.experiment = new ReactiveVar(undefined);

    let inst = this;
    Meteor.call("galileo.experiments.getExperiment", Template.instance().data.id, function(err, experiment) {
        inst.isLoading.set(false);
        if (err) {
            throw err;
        }
        inst.experiment.set(experiment);
        $("title").html("Galileo | Does " + experiment.design.cause + " affect " + experiment.design.effect + "?");
    });
});

Template.gaFeedbackConsent.helpers({
    isLoading: function() {
        return Template.instance().isLoading.get();
    },
    experimentTitle: function() {
        let exp = Template.instance().experiment.get();
        if (exp) {
            return "Does " + exp.design.cause + " affect " + exp.design.effect + "?";
        }
    }
});

Template.gaFeedbackConsent.events({
    "click #join-feedback": function(event) {

        let id = Template.instance().data.id;

        if (Meteor.userId()) {
            resetMendelId();
            Meteor.call('galileo.feedback.joinAsReviewer', id, function(err) {
                if (err) {
                    Materialize.toast(err, 4000, "toast rounded");
                } else {
                    window.location.href = "/galileo/feedback/" + id;
                }
            });
        } else {
            window.location.href = "/galileo/feedback/" + id;
        }
    },

});


function resetMendelId() {
    let exp = Template.instance().experiment.get();
    let expMendel = exp.mendel_ga_id;
    let currentUserMendel = localStorage.getItem("mendelcode_ga");

    if (expMendel && !currentUserMendel) {
        console.log("setting mendel to " + expMendel);
        localStorage.setItem("mendelcode_ga", expMendel);
    }
}