import './_.jade';

Template.gaHome.onCreated(function() {
    Session.setDefault('isDemo', true);
});

Template.gaHome.helpers({});

Template.gaHome.events({
    'click .helpbtn': function(event) {
        let btnId = event.currentTarget.id;
        let res = btnId.split('-');
        let helpcardId = '#helpcard-' + res[1] + '-' + res[2];
        let $helpCard = $(helpcardId);
        if ($helpCard.hasClass("active")) {
            $helpCard.removeClass("active").slideToggle(200);
        } else {
            $helpCard.addClass("active").slideToggle(200);
        }
    },
    'click .helpclose': function(event) {
        let cardId = event.target;
        $(cardId).closest('.card').removeClass("active").slideToggle(200);
    },
    'click #exampleExp': function() {
        $("#image-modal").modal('open');
    },
    'click #designExp': function() {
        if (Meteor.user()) {
            window.location.href = '/galileo/createdemo'
        } else {
            $('#sign-in-modal').modal('open');
        }
    },
    'click #browseAll': function() {
        if (Meteor.user()) {
            window.location.href = '/galileo/browse'
        } else {
            // $('#sign-in-modal').modal('open');
            window.location.href = '/galileo/browse'
        }
    }
});
