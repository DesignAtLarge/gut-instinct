import './_.jade';

import {
    Accounts
} from 'meteor/accounts-base';

Template.reset_password.rendered = function() {

};

Template.reset_password.onCreated(function() {

});


Template.reset_password.helpers({

});


Template.reset_password.events({
    'click #reset-pass': function(event) {
        event.preventDefault();
        const token = Template.instance().data.token;
        const newPassword = $("#new_password").val();
        const confirmPassword = $("#confirm_password").val();

        if (newPassword != confirmPassword) {
            $("#pass_check").show();
            return;
        }

        $("#pass_check").hide();

        Accounts.resetPassword(token, newPassword, function(err) {
            if (err) {
                console.log(err);
                $("#link_check").show();
                return;
            }
            window.location.replace('/');
        })
    }
});