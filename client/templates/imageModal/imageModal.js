import { Template } from 'meteor/templating';

import './imageModal.html';

Template.imageModal.rendered = function () {

};

Template.imageModal.onCreated(function () { });

Template.imageModal.helpers({});


Template.imageModal.events({
    "click #cancel": function () {
        $("#image-modal").modal('close');
    }
});