import './_.html';
import { Template } from 'meteor/templating';

Template.imageModal.rendered = function() {
    $(document).ready(function() {
        $('.modal').modal();
    });
};

Template.imageModal.onCreated(function() {});

Template.imageModal.helpers({});


Template.imageModal.events({
    "click #cancel": function() {
        $("#image-modal").modal('close');
    }
});