import './_.jade';
import {
    Session
} from 'meteor/session'

Template.gaPhase1End.rendered = function() {

};

Template.gaPhase1End.onCreated(function() {
    this.experiment = new ReactiveVar(null);

    // This piece of code runs whenever there are changes to the session variable
    // we need to reload experiment variables into the template after currentExperimentId changes
    // currentExperimentId would change because of insert operation in previous steps
    let templateInstance = this;
    Tracker.autorun(function() {
        let expId = Session.get("currentExperimentId");
        Meteor.call("galileo.experiments.getExperimentInfo", expId, function(err, result) {
            if (err) {
                throw new Meteor.Error("Server Connection Error");
            } else {
                templateInstance.experiment.set(result);
            }
        });
    });
});

Template.gaPhase1End.helpers({
    hypothesis: function() {
        let exp = Template.instance().experiment.get();
        if (exp) {
            return exp.cause + ' ' + exp.relation + ' ' + exp.effect;
        } else {
            return "";
        }
    },

    sheetLink: function() {
        let exp = Template.instance().experiment.get();
        let url = "";
        if (exp) {
            url = "https://gutinstinct-ucsd.org/galileo/experiment/" + exp._id;
        }
        return url;
    },

    fbShareLink: function() {
        let exp = Template.instance().experiment.get();
        if (exp) {
            return "http://www.facebook.com/share.php?s=100&p[title]=My%20Experiment&p[summary]=sumsdfadfasdfasdfadfasdfasdfsdfasdf&p[url]=http%3A%2F%2Fgutinstinct.ucsd.edu%2Fgalileo%2Fexperiment%2F{{exp._id}}&p[images][0]=" + encodeURI("https://gutinstinct-ucsd.org/images/galileo-logo-white.png")
        }
    },

    id: function() {
        let exp = Template.instance().experiment
    }
});

Template.gaPhase1End.events({
    'show .card-frame': function() {
        let expId = Session.get('currentExperimentId');
        let inst = Template.instance();
        Meteor.call("galileo.experiments.getExperimentInfo", expId, function(err, exp) {
            if (err) {
                throw new Meteor.Error("Server Connection Error");
            } else {
                inst.experiment.set(exp);
            }
        });
    }
});