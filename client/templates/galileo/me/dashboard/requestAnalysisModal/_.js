import './_.jade';
import {
    ExperimentStatus
} from "../../../../../../imports/api/ga-models/constants";


Template.gaRequestAnalysisModal.rendered = function() {
    setTimeout(function() {
        $('select').material_select();
    }, 0);
};

Template.gaRequestAnalysisModal.onCreated(function() {

});


Template.gaRequestAnalysisModal.helpers({
    username: function() {
        return Meteor.user().username;
    },
});

Template.gaRequestAnalysisModal.events({
    "click #edit-request": function() {
        toggleEditButton('request');
        makeEditable();
    },

    "click #accept-edit-request": function(event, instance) {
        toggleEditButton('request');
        makeUneditable();
    },

    "click #cancel-edit-request": function(event, instance) {
        toggleEditButton('request');
        makeUneditable();
    },

    "click #sendRequest": function(event) {
        let exp_id = $('#request-analysis-modal').data('exp_id');
        let args = $('#request-text-box').html();
        Meteor.call('galileo.notification.sendDataAnalysisRequest', exp_id, args);
        $(event.target).prop('disabled', true);
        Materialize.toast("You have submitted the request of data analysis.", 3000, "toast rounded");
        location.reload();
    }
});

function toggleEditButton(id) {
    $('#' + id + '-div').toggleClass('hide');
    $('#' + id + '-editable').toggleClass('hide');

    $('#accept-edit-' + id).toggleClass('hide');
    $('#cancel-edit-' + id).toggleClass('hide');
    $('#edit-' + id).toggleClass('hide');
}

function makeEditable() {
    let $reminderTextbox = $('#request-text-box');
    $reminderTextbox.attr('contenteditable', 'true');
    $reminderTextbox.focus();
    $reminderTextbox.addClass('reminder-editable');
}

function makeUneditable() {
    let $reminderTextbox = $('#request-text-box');
    $reminderTextbox.attr('contenteditable', 'false');
    $reminderTextbox.removeClass('reminder-editable');
}