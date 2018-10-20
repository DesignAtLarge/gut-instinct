import './_.jade'

Template.gaMeUnfinishedExperiments.onCreated(function() {
    let inst = this;
    this.exps = new ReactiveVar(null);
    this.isLoaded = new ReactiveVar(false);
    Tracker.autorun(function() {
        Meteor.call("galileo.profile.getUnfinishedExperiments", function(err, result) {
            inst.exps.set(result);
            inst.isLoaded.set(true);
        });
    })
});

Template.gaMeUnfinishedExperiments.helpers({
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


Template.gaMeUnfinishedExperiments.events({
    'click .experiment': function(event) {
        let id = event.currentTarget.id;
        window.location.href = "/galileo/createdemo?expid=" + id
    }
});