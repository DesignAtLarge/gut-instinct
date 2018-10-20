import './_.jade';

Template.consent.events({
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
            Router.go('/galileo/username');
        } else {
            //Router.go('/intro');
            //Vineet editing to hardcode Galileo rather than giving an intro
            Router.go('/galileo/username');
        }
    }
});