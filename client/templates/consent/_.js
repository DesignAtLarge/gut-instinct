import './_.html';
import { Template } from 'meteor/templating';
import { redirect } from '../../../imports/api/ga-routes.js';


Template.consent.rendered = function() {
    console.log("Template.consent.rendered");
    if (Meteor.user()) {
        console.log(Meteor.user().profile);
    }
}
Template.consent.events({
    "click #logout": function () {
        redirect("/galileo/logout");
    },
    'submit form': function(event) {
        event.preventDefault();

        Meteor.users.update(Meteor.userId(), {
            $set: {
                'profile.consent_agreed': true,
                'profile.toured.consent': true
            }
        });

        // sessionStorage.setItem("novice", true);
        sessionStorage.setItem('state', '0');

        if (window.location.pathname === '/galileo/consent') {
            // Router.go('/galileo/landing');
            redirect('/galileo/username');
        } else {
            //Router.go('/intro');
            //Vineet editing to hardcode Galileo rather than giving an intro
            redirect('/galileo/username');
        }
    }
});