import './_.jade';

Template.gaCountParticipantModal.rendered = function() {};

Template.gaCountParticipantModal.onCreated(function() {
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


Template.gaCountParticipantModal.helpers({
    expId: function() {
        return Template.instance().expId;
    }
});

Template.gaCountParticipantModal.events({
    'input .input_calculate': function(event) {
        if ($('#input_item_1').val() != "" && $('#input_item_2').val() != "" && $('#input_item_3').val() != "") {
            $('#calculate-sample-btn').removeClass("disabled");
        } else {
            $('#calculate-sample-btn').addClass("disabled");
        }
    },
    'click #calculate-sample-btn': function(event) {
        let input_1 = parseInt($('#input_item_1').val());
        let input_2 = parseInt($('#input_item_2').val());
        let input_3 = parseInt($('#input_item_3').val());

        let sample_count = input_1 * 10 + input_2 * 10 + input_3;
        console.log("updating exp " + this.expId)
        Meteor.call("galileo.experiments.setMinParticipantCount", this.expId, sample_count, function(err, result) {
            alert("Your participants count has updated to " + sample_count);
            document.location.reload();
        })
    }
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
