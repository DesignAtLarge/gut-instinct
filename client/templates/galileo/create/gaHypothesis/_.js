import './_.jade';
import {
    Session
} from 'meteor/session'

Template.gaHypothesis.rendered = function() {

};

Template.gaHypothesis.onCreated(function() {
    this.proceedClicked = new ReactiveVar(false);
});

Template.gaHypothesis.helpers({
    proceedClicked: function() {
        return Template.instance().proceedClicked.get();
    },
    hideProceed: function() {
        return Template.instance().proceedClicked.get() && Template.instance().data.intuition.get().trim() != "";
    },
    hideHypothesisForm: function() {
        return !Template.instance().proceedClicked.get() || Template.instance().data.intuition.get().trim() == "";
    },
    nextDisabled: function() {
        var inst = Template.instance();
        var c = inst.data.cause.get();
        var r = inst.data.relation.get();
        var e = inst.data.effect.get();
        return !c || !r || !e || c.trim() == "" || r.trim() == "" || e.trim() == "";
    },
    noIntuition: function() {
        var inst = Template.instance();
        var intuition = inst.data.intuition.get();
        return !intuition || intuition.trim() == "";
    },
    hasIntuition: function() {
        var inst = Template.instance();
        var intuition = inst.data.intuition.get();
        return intuition && intuition.trim() != "";
    },
    intuition: function() {
        return Template.instance().data.intuition.get();
    },
    cause: function() {
        return Template.instance().data.cause.get();
    },
    relation: function() {
        return Template.instance().data.relation.get();
    },
    effect: function() {
        return Template.instance().data.effect.get();
    }
});

Template.gaHypothesis.events({
    'show .card-frame': function() {

        // Cache the instance
        let inst = Template.instance();

        // First load intuition from data if exists
        let intuition = inst.data.intuition.get();
        if (intuition) {
            $("#hypothesis-intuition-input").val(intuition);
            $("#hypothesis-intuition-input").trigger("input");
            $("#hypothesis-intuition-btn").trigger("click");
        }
    },
    'click #hypothesis-badExamples-btn': function(event, instance) {
        $('#hypothesis-badExamples-div').removeClass('hide');
    },
    'input #hypothesis-intuition-input': function(event, instance) {
        instance.data.intuition.set($(event.target).val());
    },
    'input #hypothesis-input-cause': function(event, instance) {
        instance.data.cause.set($(event.target).val());
    },
    'input #hypothesis-input-reln': function(event, instance) {
        instance.data.relation.set($(event.target).val());
    },
    'input #hypothesis-input-effect': function(event, instance) {
        instance.data.effect.set($(event.target).val());
    },
    'click #hypothesis-intuition-btn': function(event, instance) {

        // Click the button
        instance.proceedClicked.set(true);

        // If there's no expId then create a new experiment
        if (!instance.data.expId.get()) {
            var intuition = instance.data.intuition.get().trim();
            Meteor.call("galileo.experiments.create", intuition, function(err, result) {
                if (!err) {

                    // Set design and experiment id
                    instance.data.designId.set(result.designId);
                    instance.data.expId.set(result.expId);

                    // Save experiment progress
                    Meteor.call("galileo.experiments.setDesignProgress", result.expId, instance.data.cardId);

                    // Update the URL so that if the user refresh they will go to the same step
                    window.history.pushState({}, "", "/galileo/create?expid=" + result.expId);
                }
            });
        }
    },
    'click .next-action': function(event, instance) {
        // Cache the design id
        let designId = instance.data.designId.get();

        // First get all the input data
        let intuition = instance.data.intuition.get().trim();
        let cause = instance.data.cause.get().trim();
        let relation = instance.data.relation.get().trim();
        let effect = instance.data.effect.get().trim();
        let mechanism = instance.data.mechanism.get().trim();
        // Then update the database
        Meteor.call("galileo.experiments.design.setIntuition", designId, intuition);
        Meteor.call("galileo.experiments.design.setHypothesis", designId, cause, relation, effect, mechanism);
    }
});