import './_.jade';

Template.gaClarificationCreatorModal.rendered = function() {};

Template.gaClarificationCreatorModal.onCreated(function() {
    // Needed for Material tabs
    $(document).ready(function() {
        $('ul.tabs').tabs();
    });
    let inst = this;
    this.myOngoingExp = new ReactiveVar(undefined);

    Meteor.call("galileo.experiments.getMulExperimentWithParticipantData", Meteor.userId(), function(err, allMyOngoingExperiments) {
        //console.log("get result from getMulExperimentWithParticipantData" + JSON.stringify(allMyOngoingExperiments));
        inst.myOngoingExp.set(allMyOngoingExperiments);
    });
});


Template.gaClarificationCreatorModal.helpers({
    getOngoingClarifications: function() {
        let exp = Template.instance().myOngoingExp.get();
        if (exp == undefined || exp[0] == undefined) {
            return;
        }
        let clarification = exp[0].clarification;
        //console.log("clarifications are: " + JSON.stringify(clarification));
        return clarification;
    },
});

Template.gaClarificationCreatorModal.events({
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
    'click .addBtn': function(event) {
        // event.preventDefault();
        let index = $(event.target).attr("index");
        let contentId = "#creator-clarification-input-" + index;
        let content = $(contentId).val().trim();
        let targetExpID = $(event.target).attr("exp-id");
        let isCreator = false;
        let exp = Template.instance().myOngoingExp.get();
        if (exp == undefined || exp[0] == undefined) {
            return;
        }
        let expClarification = exp[0].clarification;
        let author_id = exp[0].clarification[index].author_id;
        Meteor.call('galileo.experiments.addClarification', Meteor.userId(), targetExpID, content, index);
        Meteor.call('galileo.notification.sendClarificationNoticeEmail', author_id, content, isCreator, targetExpID);
        Materialize.toast("Successfully Add Clarification", 3000, "toast rounded");
    }
});