import './_.jade';
import Helper from '../helper';
import {
    MeasureType
} from "../../../../../imports/api/ga-models/constants";

Template.gaExperimentDesignHypothesis.onCreated(function() {
    this.design = this.data.design;
    this.suggestingHypothesis = new ReactiveVar(false);
    this.design_cause = this.data.design_cause;
    this.design_relation = this.data.design_relation;
    this.design_effect = this.data.design_effect;
    this.design_mechanism = this.data.design_mechanism;
    this.design_related_works = this.data.design_related_works;
});

Template.gaExperimentDesignHypothesis.helpers({
    focusing: function() {
        if (Template.instance().data.focus) {
            return Template.instance().data.focus.get() === "hypothesis";
        }
    },
    intuition: function() {
        let design = Template.instance().design.get();
        if (design) return design.intuition;
    },
    hypothesis: function() {
        let design_cause = Template.instance().design_cause.get();
        let design_relation = Template.instance().design_relation.get();
        let design_effect = Template.instance().design_effect.get();

        if (design_cause && design_relation && design_effect) {
            return design_cause + " " + design_relation + " " + design_effect;
        }
    },
    cause: function() {
        let design_cause = Template.instance().design_cause.get();
        if (design_cause) {
            return design_cause;
        }
    },
    relation: function() {
        let design_relation = Template.instance().design_relation.get();
        if (design_relation) return design_relation;
    },
    effect: function() {
        let design_effect = Template.instance().design_effect.get();
        if (design_effect) return design_effect;
    },
    mechanism: function() {
        let design_mechanism = Template.instance().design_mechanism.get();
        if (design_mechanism) return design_mechanism;
    },
    related_works: function() {
        let design_related_works = Template.instance().design_related_works.get();
        if (design_related_works) return design_related_works;
    },
    suggestingHypothesis: function() {
        return Template.instance().suggestingHypothesis.get();
    }
});

Template.gaExperimentDesignHypothesis.events({
    "click #hypothesis-section": function() {
        Template.instance().data.focus.set("hypothesis");
    },

    "click #edit-hypothesis": function() {
        Helper.toggleEditButton('mechanism');
        Helper.toggleEditButton('hypothesis');
        Helper.toggleEditButton('related-works')
    },

    "click #accept-edit-hypothesis": function(event, instance) {
        Helper.toggleEditButton('hypothesis');
        Helper.toggleEditButton('mechanism');
        Helper.toggleEditButton('related-works')

        let design = instance.design.get();

        design.cause = $("#cause-text").val().trim();
        design.relation = $("#relation-text").val().trim();
        design.effect = $("#effect-text").val().trim();
        design.mechanism = $("#mechanism-text").val().trim();
        design.related_works = $("#related-works-text").val().trim();

        instance.design_cause.set(design.cause);
        instance.design_relation.set(design.relation);
        instance.design_effect.set(design.effect);
        instance.design_mechanism.set(design.mechanism);
        instance.design_related_works.set(design.related_works)

        //instance.design.set(design);

        Meteor.call('galileo.experiments.edit.updateHypothesis', design.exp_id, design.cause, design.relation, design.effect, design.mechanism, design.related_works);
    },

    "click #cancel-edit-hypothesis": function(event, instance) {
        Helper.toggleEditButton('hypothesis');
        Helper.toggleEditButton('mechanism');
        Helper.toggleEditButton('related-works');

        let design = instance.design.get();
        $("#cause-text").text(design.cause);
        $("#relation-text").text(design.relation);
        $("#effect-text").text(design.effect);
        $("#mechanism-text").text(design.effect);
        $("#related-works-text").text(design.related_works);
    },

    "click #edit-suggest-hypothesis": function(event, instance) {
        Helper.toggleEditButton('suggest-hypothesis');
        Helper.toggleEditButton('hypothesis');

        instance.suggestingHypothesis.set(!instance.suggestingHypothesis.get());
    },

    "click #accept-edit-suggest-hypothesis": function(event, instance) {
        Helper.toggleEditButton('suggest-hypothesis');
        Helper.toggleEditButton('hypothesis');

        let design = instance.design.get();

        let cause = $("#cause-text").val().trim();
        let relation = $("#relation-text").val().trim();
        let effect = $("#effect-text").val().trim();

        Meteor.call('galileo.feedback.suggestions.add', design.exp_id, "hypothesis", cause, relation, effect);

        $("#detail-feedback-btn-hypothesis").trigger("update");
        instance.suggestingHypothesis.set(false);
    },

    "click #cancel-edit-suggest-hypothesis": function(event, instance) {
        Helper.toggleEditButton('suggest-hypothesis');
        Helper.toggleEditButton('hypothesis');

        let design = instance.design.get();
        $("#cause-text").text(design.cause);
        $("#relation-text").text(design.relation);
        $("#effect-text").text(design.effect);

        instance.suggestingHypothesis.set(false);
    },
});