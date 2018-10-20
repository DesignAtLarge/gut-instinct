import './_.jade'

Template.gaMePilotExperiments.onCreated(function() {
    let inst = this;
    this.exps = new ReactiveArray();
    this.isLoaded = new ReactiveVar(false);
    Tracker.autorun(function() {
        Meteor.call("galileo.profile.getPilotingExperiments", function(err, result) {
            inst.exps.set(result);
            inst.isLoaded.set(true);
        });
    });
});

Template.gaMePilotExperiments.helpers({
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


Template.gaMePilotExperiments.events({
    'click .experiment': function(event) {
        let id = event.currentTarget.id;
        window.location.href = "/galileo/me/experiment/" + id + "/my_pilot"
    }
});