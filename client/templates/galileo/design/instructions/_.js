import './_.jade';
import Helper from '../helper';
import {
    MeasureType
} from "../../../../../imports/api/ga-models/constants";

Template.gaExperimentDesignInstructions.onCreated(function() {
    this.design = this.data.design;
    this.editableControlSteps = this.data.editableControlSteps;
    this.editableExperimentalSteps = this.data.editableExperimentalSteps;
    this.editableExperimentalPrepSteps = this.data.editableExperimentalPrepSteps;
    this.editableControlPrepSteps = this.data.editableControlPrepSteps;
    this.design_condition_experimental = this.data.design_condition_experimental;
    this.design_condition_control = this.data.design_condition_control;
});

Template.gaExperimentDesignInstructions.helpers({
    focusingControl: function() {
        if (Template.instance().data.focus) {
            return Template.instance().data.focus.get() === "condition_control";
        }
    },
    focusingExperimental: function() {
        if (Template.instance().data.focus) {
            return Template.instance().data.focus.get() === "condition_experimental";
        }
    },
    controlCondition: function() {
        let design_condition_control = Template.instance().design_condition_control.get();
        if (design_condition_control) {
            return design_condition_control.description
        }
    },
    experimentalCondition: function() {
        let design_condition_experimental = Template.instance().design_condition_experimental.get();
        if (design_condition_experimental) {
            return design_condition_experimental.description
        }
    },
    controlExperimentalCondition: function() {
        let design = Template.instance().design.get();
        if (design && design.condition && design.condition.control && design.condition.experimental) {
            return design.condition.control.description + " and " + design.condition.experimental.description;
        }
    },
    controlSteps: function() {
        let design_condition_control = Template.instance().design_condition_control.get();
        if (design_condition_control) {
            Template.instance().editableControlSteps.set(Helper.getEditableSteps(design_condition_control));
            return design_condition_control.steps
        }
    },
    editableControlSteps: function() {
        return Template.instance().editableControlSteps;
    },
    experimentalSteps: function() {
        let design_condition_experimental = Template.instance().design_condition_experimental.get();
        if (design_condition_experimental) {
            Template.instance().editableExperimentalSteps.set(Helper.getEditableSteps(design_condition_experimental));
            return design_condition_experimental.steps
        }
    },
    editableExperimentalSteps: function() {
        return Template.instance().editableExperimentalSteps;
    },
    editableExperimentalPrepSteps: function() {
        return Template.instance().editableExperimentalPrepSteps;
    },
    editableControlPrepSteps: function() {
        return Template.instance().editableControlPrepSteps;
    },
    experimentalPrepSteps: function() {
        if (Template.instance().data.design.get()) {
            Template.instance().design_condition_experimental.set(Template.instance().data.design.get().condition.experimental);
            let design_condition_experimental = Template.instance().design_condition_experimental.get();
            if (design_condition_experimental) {
                //todo: setting here for the case when we're editing experiment from summary in create flow, tracker autorun method doesn't set this correctly
                Template.instance().editableExperimentalPrepSteps.set(Helper.getEditablePrepSteps(design_condition_experimental));
                return design_condition_experimental.prep_steps;
            }
        }
    },
    controlPrepSteps: function() {
        if (Template.instance().data.design.get()) {
            Template.instance().design_condition_control.set(Template.instance().data.design.get().condition.control);
            let design_condition_control = Template.instance().design_condition_control.get();
            if (design_condition_control) {
                //todo: setting here for the case when we're editing experiment from summary in create flow, tracker autorun method doesn't set this correctly
                Template.instance().editableControlPrepSteps.set(Helper.getEditablePrepSteps(design_condition_control));
                return design_condition_control.prep_steps;
            }
        }
    }
});

Template.gaExperimentDesignInstructions.events({

    "click #control-condition-block": function() {
        Template.instance().data.focus.set("condition_control");
    },

    "click #experimental-condition-block": function() {
        Template.instance().data.focus.set("condition_experimental");
    },

    "click #edit-control": function() {
        Helper.toggleEditButton('control');
    },

    "click #accept-edit-control": function(event, instance) {
        Helper.toggleEditButton('control');

        let design = instance.design.get();

        design.condition.control.steps = Helper.getTextArrayFromEditableList(instance.editableControlSteps.get());
        design.condition.control.prep_steps = Helper.getTextArrayFromEditableList(instance.editableControlPrepSteps.get());
        design.condition.control.description = $("#control-text").val().trim();

        instance.design_condition_control.set(design.condition.control);
        //instance.design.set(design);

        Meteor.call("galileo.experiments.edit.updateConditionInstructions", design.exp_id, design);
    },

    "click #cancel-edit-control": function(event, instance) {
        Helper.toggleEditButton('control');

        let design = instance.design.get();
        let arr = Helper.getEditableSteps(design.condition.control);
        let controlPrepArr = Helper.getEditablePrepSteps(design.condition.control);
        instance.editableControlSteps.set(arr);
        instance.editableControlPrepSteps.set(controlPrepArr);
    },

    "click #edit-experimental": function() {
        Helper.toggleEditButton('experimental');
    },

    "click #accept-edit-experimental": function(event, instance) {
        Helper.toggleEditButton('experimental');

        let design = instance.design.get();

        design.condition.experimental.steps = Helper.getTextArrayFromEditableList(instance.editableExperimentalSteps.get());
        design.condition.experimental.prep_steps = Helper.getTextArrayFromEditableList(instance.editableExperimentalPrepSteps.get());
        design.condition.experimental.description = $("#experimental-text").val().trim();
        //instance.design.set(design);
        instance.design_condition_experimental.set(design.condition.experimental);

        Meteor.call("galileo.experiments.edit.updateConditionInstructions", design.exp_id, design);
    },

    "click #cancel-edit-experimental": function(event, instance) {
        Helper.toggleEditButton('experimental');

        let design = instance.design.get();
        let arr = Helper.getEditableSteps(design.condition.experimental);
        let expPrepArr = Helper.getEditablePrepSteps(design.condition.experimental);
        instance.editableExperimentalSteps.set(arr);
        instance.editableExperimentalPrepSteps.set(expPrepArr);
    }
});