import './_.jade';

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