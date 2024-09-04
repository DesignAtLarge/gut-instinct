import './_.html';
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import { ReactiveVar } from 'meteor/reactive-var';

Template.gaMeExperimentDesign.onCreated(function() {

    // Initiate self
    var self = this;

    // Load Experiment Versions
    this.exp = new ReactiveVar();
    this.designId = new ReactiveVar();
    Meteor.call("galileo.experiments.getExperiment", this.data.id, function(err, exp) {
        self.exp.set(exp);
        self.designId.set(exp["curr_design_id"]);
    });
});

Template.gaMeExperimentDesign.helpers({
    versions: function() {

    },
    designId: function() {
        return Template.instance().designId;
    }
});

Template.gaMeExperimentDesign.events({

});