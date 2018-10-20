import './_.jade';

Template.gaClarificationModal.rendered = function() {};

Template.gaClarificationModal.onCreated(function() {
    // Needed for Material tabs
    $(document).ready(function() {
        $('ul.tabs').tabs();
    });
    let inst = this;
    this.participation = new ReactiveVar();
    this.myPaticipateExp = new ReactiveVar(undefined);

    Meteor.call("galileo.experiments.getParticipatingExpByUser", Meteor.userId(), function(err, resultExp) {
        if (err) {
            throw err;
        }
        //console.log("my participating exp in meteor call: " + JSON.stringify(resultExp));
        if (resultExp) {
            inst.myPaticipateExp.set(resultExp);
            inst.participation.set(resultExp.pResult);
        }
    });
});


Template.gaClarificationModal.helpers({
    getClarifications: function() {
        let exp = Template.instance().myPaticipateExp.get();
        if (exp == undefined) {
            return;
        }
        let expClarification = exp.clarification;
        return expClarification;
    },
    getExpCreatorId: function() {
        let exp = Template.instance().myPaticipateExp.get();
        if (exp == undefined) {
            return;
        }
        return exp.user_id;
    },
});

Template.gaClarificationModal.events({
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
    'click #mypart-clarification-submit-btn': function(event) {
        // event.preventDefault();
        let expClarification = Template.instance().myPaticipateExp.get().clarification;
        //console.log("adding clarification expClarification: " + JSON.stringify(expClarification));
        let expCreatorId = $(event.target).attr("exp-creator-id");
        let index = expClarification.length;
        let content = $("#mypart-clarification-input").val().trim();
        let targetExpID = $("#viewPastData-myPart").attr("exp-id");

        // participant ask question so that the email receicer is exp creator
        let isCreator = true;
        // console.log("experiment creator id: " + expCreatorId);
        // console.log("adding clarification content: " + content);
        // console.log("adding clarification index: " + index);
        // console.log("adding clarification targetExpID: " + targetExpID);
        Meteor.call('galileo.experiments.addClarification', Meteor.userId(), targetExpID, content, index);
        Meteor.call('galileo.notification.sendClarificationNoticeEmail', expCreatorId, content, isCreator, targetExpID);
        Materialize.toast("Successfully Added Clarification", 3000, "toast rounded");
    }
});