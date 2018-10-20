import './_.jade';
import {
    ExperimentStatus
} from "../../../../../../imports/api/ga-models/constants";


Template.gaSendThankNoteModal.rendered = function() {
    setTimeout(function() {
        $('select').material_select();
    }, 0);
};

Template.gaSendThankNoteModal.onCreated(function() {
    let inst = this;

    this.cause = new ReactiveVar();
    this.effect = new ReactiveVar();

    setInterval(function() {
        inst.cause.set($("#send-thank-note-modal").data('cause'));
        inst.effect.set($("#send-thank-note-modal").data('effect'));
    }, 250);


});


Template.gaSendThankNoteModal.helpers({
    username: function() {
        return Meteor.user().username;
    },
    title: function() {
        let cause = Template.instance().cause.get();
        let effect = Template.instance().effect.get();
        return "Does " + cause + " affect " + effect + "?"
    }
});

Template.gaSendThankNoteModal.events({
    "click #edit-thank": function() {
        toggleEditButton('thank');
        makeEditable();
    },

    "click #accept-edit-thank": function(event, instance) {
        toggleEditButton('thank');
        makeUneditable();
    },

    "click #cancel-edit-thank": function(event, instance) {
        toggleEditButton('thank');
        makeUneditable();
    },

    "click #sendThank": function(event) {
        let exp_id = $('#send-thank-note-modal').data('exp_id');
        console.log("exp id is: " + exp_id);
        let args = $('#thank-text-box').html();
        let bottom_text = $('#name-box').html();
        Meteor.call('galileo.notification.sendThankYouEmail', exp_id, args, bottom_text);
        $(event.target).prop('disabled', true);
        Materialize.toast("You have sent a thank you note to all participants.", 3000, "toast rounded");
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
    let $reminderTextbox = $('#thank-text-box');
    let $nameTextbox = $('#name-box');
    $reminderTextbox.attr('contenteditable', 'true');
    $reminderTextbox.focus();
    $reminderTextbox.addClass('reminder-editable');
    $nameTextbox.attr('contenteditable', 'true');
    $nameTextbox.addClass('reminder-editable');
}

function makeUneditable() {
    let $reminderTextbox = $('#thank-text-box');
    let $nameTextbox = $('#name-box');
    $reminderTextbox.attr('contenteditable', 'false');
    $reminderTextbox.removeClass('reminder-editable');
    $nameTextbox.attr('contenteditable', 'false');
    $nameTextbox.removeClass('reminder-editable');
}
