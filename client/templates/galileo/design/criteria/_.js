import './_.jade';
import Helper from '../helper';
import {
    MeasureType
} from "../../../../../imports/api/ga-models/constants";

Template.gaExperimentDesignCriteria.onCreated(function() {
    this.design = this.data.design;
    this.editableInclusionCriteria = this.data.editableInclusionCriteria;
    this.editableExclusionCriteria = this.data.editableExclusionCriteria;
    this.design_criteria_inclusion = this.data.design_criteria_inclusion;
    this.design_criteria_exclusion = this.data.design_criteria_exclusion;
});

Template.gaExperimentDesignCriteria.helpers({
    focusingInclusion: function() {
        if (Template.instance().data.focus) {
            return Template.instance().data.focus.get() === "criteria_inclusion";
        }
    },
    focusingExclusion: function() {
        if (Template.instance().data.focus) {
            return Template.instance().data.focus.get() === "criteria_exclusion";
        }
    },
    hasInclusionCriteria: function() {
        let design_criteria_inclusion = Template.instance().design_criteria_inclusion.get();
        if (design_criteria_inclusion) return design_criteria_inclusion.length > 0;
    },
    hasExclusionCriteria: function() {
        let design_criteria_exclusion = Template.instance().design_criteria_exclusion.get();
        if (design_criteria_exclusion) return design_criteria_exclusion.length > 0;
    },
    inclusionCriteria: function() {
        let design_criteria_inclusion = Template.instance().design_criteria_inclusion.get();
        if (design_criteria_inclusion) {
            Template.instance().editableInclusionCriteria.set(Helper.getEditableInclusionList(design_criteria_inclusion));
            return design_criteria_inclusion;
        }
    },
    editableInclusionCriteria: function() {
        return Template.instance().editableInclusionCriteria;
    },
    exclusionCriteria: function() {
        let design_criteria_exclusion = Template.instance().design_criteria_exclusion.get();
        if (design_criteria_exclusion) {
            Template.instance().editableExclusionCriteria.set(Helper.getEditableExclusionList(design_criteria_exclusion));
            return design_criteria_exclusion;
        }
    },
    editableExclusionCriteria: function() {
        return Template.instance().editableExclusionCriteria;
    }
});

Template.gaExperimentDesignCriteria.events({

    "click #criteria-exclusion-block": function() {
        Template.instance().data.focus.set("criteria_exclusion");
    },

    "click #criteria-inclusion-block": function() {
        Template.instance().data.focus.set("criteria_inclusion");
    },


    "click #edit-exclusion": function() {
        Helper.toggleEditButton('exclusion');
    },

    "click #accept-edit-exclusion": function(event, instance) {
        Helper.toggleEditButton('exclusion');

        let design = instance.design.get();

        let ec = Helper.getTextArrayFromEditableList(instance.editableExclusionCriteria.get());
        design.criteria.exclusion = ec;

        instance.design_criteria_exclusion.set(ec);
        //instance.design.set(design);

        Meteor.call("galileo.experiments.edit.updateExclusionCriteria", design.exp_id, ec);
    },

    "click #cancel-edit-exclusion": function(event, instance) {
        Helper.toggleEditButton('exclusion');

        let design = instance.design.get();
        let arr = Helper.getEditableExclusionList(design);
        instance.editableExclusionCriteria.set(arr);
    },

    "click #edit-inclusion": function() {
        Helper.toggleEditButton('inclusion');
    },

    "click #accept-edit-inclusion": function(event, instance) {
        Helper.toggleEditButton('inclusion');

        let design = instance.design.get();

        let ec = Helper.getTextArrayFromEditableList(instance.editableInclusionCriteria.get());
        design.criteria.inclusion = ec;
        instance.design_criteria_inclusion.set(ec);
        //instance.design.set(design);

        Meteor.call("galileo.experiments.edit.updateInclusionCriteria", design.exp_id, ec);
    },

    "click #cancel-edit-inclusion": function(event, instance) {
        Helper.toggleEditButton('inclusion');

        let design = instance.design.get();
        let arr = Helper.getEditableInclusionList(design);
        instance.editableInclusionCriteria.set(arr);
    },
});