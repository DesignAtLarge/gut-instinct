import './_.html';
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import { ReactiveVar } from 'meteor/reactive-var';


Template.gaReminderStatsModal.rendered = function() {};

Template.gaReminderStatsModal.onCreated(function() {
    // Needed for Material tabs
    $(document).ready(function() {
        $('ul.tabs').tabs();
    });
});


Template.gaReminderStatsModal.helpers({});

Template.gaReminderStatsModal.events({
    'click .send-reminder-btn': function() {
        let modal = $('#send-reminder-modal');
        modal.modal({
            dismissible: true,
            ready: function() {
                modal.trigger('show');
            },
            complete: function() {

            },
        });

        modal.modal('open');

    },
});