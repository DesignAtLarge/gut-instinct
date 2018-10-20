import './_.jade';
import {
    ExperimentStatus
} from '/imports/api/ga-models/constants';

Template.gaInformationModal.rendered = function() {
    setTimeout(function() {
        $('select').material_select();
    }, 0);
};

Template.gaInformationModal.onCreated(function() {
    let inst = this;
});


Template.gaInformationModal.helpers({});

Template.gaInformationModal.events({});