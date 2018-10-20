import './_.jade';

Template.gaLearnInviteModal.rendered = function() {};

Template.gaLearnInviteModal.onCreated(function() {
    // Needed for Material tabs
    $(document).ready(function() {
        $('ul.tabs').tabs();
    });
    let inst = this;
    this.expId = new ReactiveVar();
    this.myPaticipateExp = new ReactiveVar(undefined);
    if (this.data.expId) {
        this.expId.set(this.data.expId);
        console.log("exp id is: " + this.data.expId);
    }
});


Template.gaLearnInviteModal.helpers({
    expId: function() {
        return Template.instance().expId;
    }

});

Template.gaLearnInviteModal.events({
    'click #shareInfoBtn': function(event) {
        showModal("#share-info-modal");
    },
    'click #whyCareBtn': function(event) {
        showModal("#why-care-modal");
    },
    'click #compensatePplBtn': function(event) {
        showModal("#compensate-people-modal");
    },
});

function showModal(modalId) {
    let modal = $(modalId);
    modal.modal({
        dismissible: true,
        ready: function() {
            modal.trigger('show');
        },
        complete: function() {

        },
    });

    modal.modal('open');
}
