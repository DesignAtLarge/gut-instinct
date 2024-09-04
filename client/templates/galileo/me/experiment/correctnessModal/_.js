import './_.jade';
import {
    ExperimentStatus
} from '/imports/api/ga-models/constants';

Template.gaCorrectnessModal.rendered = function() {
    setTimeout(function() {
        $('select').material_select();
    }, 0);
};

Template.gaCorrectnessModal.onCreated(function() {
    let inst = this;
});


Template.gaCorrectnessModal.helpers({});

Template.gaCorrectnessModal.events({
    "click #invite-btn": function(event, instance) {
        console.log(instance);
        let inst = instance;
        Meteor.call('galileo.experiments.changeStatus', inst.data.exp.get()._id, ExperimentStatus.READY_TO_RUN, function(err, result) {
            if (!err) {
                let exp = inst.data.exp;
                exp.status = ExperimentStatus.READY_TO_RUN;
                inst.data.exp.set(exp);
                $("#correctness-modal").modal('close');
            } else {
                console.log(err);
            }
        })
    }
});