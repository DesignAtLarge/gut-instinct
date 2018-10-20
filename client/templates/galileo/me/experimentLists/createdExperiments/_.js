import './_.jade'

Template.gaMeCreatedExperiments.onCreated(function() {
    let inst = this;
    this.exps = new ReactiveVar(null);
    this.isLoaded = new ReactiveVar(false);
    Tracker.autorun(function() {
        Meteor.call("galileo.profile.getCreatedExperiments", function(err, result) {
            inst.exps.set(result);
            inst.isLoaded.set(true);
        });
    })
});

Template.gaMeCreatedExperiments.helpers({
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


Template.gaMeCreatedExperiments.events({
    'click .experiment': function(event) {
        let id = event.currentTarget.id;
        window.location.href = "/galileo/me/experiment/" + id;
    }
});