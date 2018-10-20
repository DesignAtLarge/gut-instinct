import './_.jade';

import {
    Session
} from 'meteor/session'

Template.gaSummary.rendered = function() {
    //TODO: DELETE THIS FILE AND USAGE
};

Template.gaSummary.onCreated(function() {

});


Template.gaSummary.helpers({
    hypothesis: function() {
        var inst = Template.instance();
        var cause = inst.data.cause.get();
        var relation = inst.data.relation.get();
        var effect = inst.data.effect.get();
        return cause + " " + relation + " " + effect;
    },
    cause: function() {
        return Template.instance().data.cause.get();
    },
    relation: function() {
        return Template.instance().data.relation.get();
    },
    effect: function() {
        return Template.instance().data.effect.get();
    },
    causeMeasures: function() {
        let data = Template.instance().data;
        return getMeasuresDisplayText(data.causeMeasure.get());
    },
    effectMeasures: function() {
        let data = Template.instance().data;
        return getMeasuresDisplayText(data.effectMeasure.get());
    },
});

Template.gaSummary.events({
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

function getMeasuresDisplayText(measure) {
    return measure.type + ' (noted ' + measure.frequency + ' at ' + measure.time + ')';
}

function showLoading() {
    $(".loading").fadeIn();
}

function hideLoading() {
    $(".loading").fadeOut();
}