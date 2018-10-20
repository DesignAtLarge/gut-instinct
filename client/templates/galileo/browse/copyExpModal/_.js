import './_.jade';

Template.gaCopyExpModal.rendered = function() {};

Template.gaCopyExpModal.onCreated(function() {
    // Needed for Material tabs
    $(document).ready(function() {
        $('ul.tabs').tabs();
    });
    let inst = this;
    this.expId = new ReactiveVar();
    setInterval(function() {
        inst.expId.set($("#copy-exp-modal").data('expId'));
    }, 250);
});


Template.gaCopyExpModal.helpers({

});

Template.gaCopyExpModal.events({
    'click #copy-exp-btn': function() {
        let expId = Template.instance().expId.get();
        if (expId) {
            console.log("exp id is: " + expId);
            Meteor.call("galileo.experiments.copyExperimentByExpId", expId, Meteor.userId(), function(err, result) {

            })
        }
        Materialize.toast('Your answers have been saved!', 3000, 'toast rounded');
    }
});
