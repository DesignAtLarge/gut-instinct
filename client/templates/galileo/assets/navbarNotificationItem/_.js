import "./_.jade";

Template.gaNavbarNotificationItem.events({
    "click .navbar-ind": function(event) {
        var $this = $(event.currentTarget);
        Meteor.call("galileo.notification.readNotification", $this.attr("data-id"));
        window.location.href = $this.attr("data-url");
    },
    "click .dismiss": function(event) {
        var $this = $(event.currentTarget);
        Meteor.call("galileo.notification.readNotification", $this.attr("data-id"));
    },
});