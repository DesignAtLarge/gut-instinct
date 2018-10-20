import "./_.jade"

Template.gaMeNotificationItem.events({
    "click .notification-item-outer": function(event) {
        let $item = $(event.currentTarget).children(".notification-item");
        Meteor.call("galileo.notification.readNotification", $item.attr("data-id"));
        window.location.href = $item.attr("data-url");
    }
});