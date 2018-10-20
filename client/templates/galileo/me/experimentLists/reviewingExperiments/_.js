import './_.jade'

Template.gaMeReviewingExperiments.onCreated(function() {
    let inst = this;
    this.exps = new ReactiveArray();
    this.isLoaded = new ReactiveVar(false);
    Tracker.autorun(function() {
        Meteor.call("galileo.profile.getReviewingExperiments", function(err, result) {
            inst.exps.set(result);
            inst.isLoaded.set(true);
        });
    });
});

Template.gaMeReviewingExperiments.helpers({
    exps: function() {
        let exps = Template.instance().exps.get();
        if (exps) {
            return exps;
        } else {
            return [];
        }
    },
    isLoaded: function() {
        return Template.instance().isLoaded.get();
    }
});


Template.gaMeReviewingExperiments.events({
    'click .experiment': function(event) {
        let id = event.currentTarget.id;
        window.location.href = "/galileo/feedback/" + id
    }
});