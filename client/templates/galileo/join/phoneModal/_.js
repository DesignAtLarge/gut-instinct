import './_.jade';
import {
    ExperimentStatus
} from "../../../../../imports/api/ga-models/constants";


Template.phoneModal.rendered = function() {
    $(document).ready(function() {
        $('.modal').modal();
    });
};

Template.phoneModal.onCreated(function() {

    let inst = this;
    this.isLoading = new ReactiveVar(true);
    this.experiment = new ReactiveVar(undefined);
    this.missingPhone = new ReactiveVar(true);
    this.incompleteUsername = new ReactiveVar(false);
    this.incompleteEmail = new ReactiveVar(false);
    if (Template.instance().data.incompleteEmail) {
        inst.incompleteEmail.set(Template.instance().data.incompleteEmail)
    }
    if (Template.instance().data.incompleteUsername) {
        inst.incompleteUsername.set(Template.instance().data.incompleteUsername)
    }
    Meteor.call("galileo.experiments.getExperiment", Template.instance().data.id, function(err, experiment) {
        inst.isLoading.set(false);
        if (err) {
            throw err;
        }
        inst.experiment.set(experiment);
    });
});

Template.phoneModal.helpers({
    isLoading: function() {
        return Template.instance().isLoading.get();
    },
    experimentTitle: function() {
        let exp = Template.instance().experiment.get();
        if (exp) {
            return "Does " + exp.design.cause + " affect " + exp.design.effect + "?";
        }
    },
    isEnded: function() {
        let exp = Template.instance().experiment.get();
        if (exp) {
            return exp.status === ExperimentStatus.FINISHED;
        }
    },
    isRunning: function() {
        let exp = Template.instance().experiment.get();
        if (exp) {
            return exp.status === ExperimentStatus.STARTED;
        }
    },
    expId: function() {
        let exp = Template.instance().experiment.get();
        if (exp) {
            return exp._id;
        }
    },
});


Template.phoneModal.events({
    'keyup #add-phone-modal-input': function(event) {
        if ($(event.target).val().length > 0) {
            $('#addphone').show();
        } else {
            $('#addphone').hide();
        }
    },
    'click #addphone': function() {
        let inst = Template.instance();
        let missingEmail = Template.instance().incompleteEmail.get();
        let missingUsername = Template.instance().incompleteUsername.get();
        let phone = $("#add-phone-modal-input").val().trim();
        if (phone.length > 0 && !missingUsername && !missingEmail) {
            Meteor.call("galileo.profile.setPhone", phone, function(error) {
                let msg = "Phone Number Saved!";
                if (error) {
                    msg = error.error;
                } else {
                    $("#add-phone-modal").data('goToJoin', true)
                    $('#add-phone-modal').modal('close');
                }
                $('#addphone').hide();
                inst.missingPhone.set(false);
                Materialize.toast(msg, 5000, 'toast rounded');
            });
        } else {
            Meteor.call("galileo.profile.setPhone", phone, function(error) {
                let msg = "Phone Number Saved!";
                if (error) {
                    msg = error.error;
                }
                $('#addphone').hide();
                inst.missingPhone.set(false);
                Materialize.toast(msg, 5000, 'toast rounded');
            });
        }
    },
    'click #emailReminder': function() {
        Meteor.call("galileo.profile.setEmailReminder", true, function(error) {
            let msg = "All set to receive email reminders!";
            if (error) {
                msg = error.error;
            } else {
                $("#add-phone-modal").data('goToJoin', true)
                $('#add-phone-modal').modal('close');
            }
            Materialize.toast(msg, 5000, 'toast rounded');
        });
    },
    'click #cancel': function() {
        $('#add-phone-modal').modal('close');
    },
    'keyup #usernameText': function(event) {
        if ($(event.target).val().length > 0) {
            $('#addusername').show();
        } else {
            $('#addusername').hide();
        }
    },
    'click #addusername': function() {
        let inst = Template.instance();
        let missingEmail = Template.instance().incompleteEmail.get();
        let missingPhone = Template.instance().missingPhone.get();
        let username = $("#usernameText").val().trim();
        if (username.length > 0 && !missingPhone && !missingEmail) {
            // Update user_email obj
            Meteor.call('profile.getEmail', function(err, email) {
                Meteor.call('profile.insertFullProfile', username, email, "");
            })
            Meteor.call('galileo.profile.setUsername', username, function(error) {
                let msg = "Username Saved!";
                if (error) {
                    msg = error.error;
                } else {
                    $("#add-phone-modal").data('goToJoin', true)
                    $('#add-phone-modal').modal('close');
                }
                $('#addusername').hide();
                inst.incompleteUsername.set(false);
                Materialize.toast(msg, 5000, 'toast rounded');
            });
        } else {
            Meteor.call('galileo.profile.setUsername', username, function(error) {
                let msg = "Username Saved!";
                if (error) {
                    msg = error.error;
                }
                $('#addusername').hide();
                inst.incompleteUsername.set(false);
                Materialize.toast(msg, 5000, 'toast rounded');
            });
        }
    },
    'keyup #userEmailText': function(event) {
        if ($(event.target).val().length > 0) {
            $('#addemail').show();
        } else {
            $('#addemail').hide();
        }
    },
    'click #addemail': function() {
        let inst = Template.instance();
        let missingUsername = Template.instance().incompleteUsername.get();
        let missingPhone = Template.instance().missingPhone.get();
        let email = $("#userEmailText").val().trim();
        if (email.length > 0 && !missingPhone && !missingUsername) {
            // Update user_email obj
            Meteor.call('profile.getUsername', function(err, username) {
                Meteor.call('profile.insertFullProfile', username, email, "");
            });

            Meteor.call('galileo.profile.setEmail', email, function(error) {
                let msg = "Email Saved!";
                if (error) {
                    msg = error.error;
                } else {
                    $("#add-phone-modal").data('goToJoin', true)
                    $('#add-phone-modal').modal('close');
                }
                $('#addemail').hide();

                inst.incompleteEmail.set(false);
                Materialize.toast(msg, 5000, 'toast rounded');
            });
        } else {
            Meteor.call('galileo.profile.setEmail', email, function(error) {
                let msg = "Email Saved!";
                if (error) {
                    msg = error.error;
                }
                $('#addemail').hide();
                inst.incompleteEmail.set(false);
                Materialize.toast(msg, 5000, 'toast rounded');
            });
        }
    },
});

function handleIsEnded(instance) {
    let exp = instance.experiment.get();
    if (exp) {
        return exp.status == ExperimentStatus.FINISHED;
    }
}

function handleIsRunning(instance) {
    let exp = instance.experiment.get();
    if (exp) {
        return exp.status == ExperimentStatus.STARTED;
    }
}
