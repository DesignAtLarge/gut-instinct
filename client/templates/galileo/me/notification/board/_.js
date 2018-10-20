import "./_.jade";

Template.gaMeNotification.onCreated(function() {
    let inst = this;
    this.notifications = new ReactiveArray();
    Meteor.call("galileo.notification.getAllNotifications", function(err, notis) {
        if (err) {
            console.log(err);
            alert("Error");
        } else {
            inst.notifications.set(notis);
        }
    });
});

Template.gaMeNotification.helpers({
    "hasNotification": function() {
        return Template.instance().notifications.get().length !== 0;
    },
    "notifications": function() {
        return Template.instance().notifications.get();
    }
});

Template.gaMeNotification.events({
    "click #mark-all-read": function(event) {
        Meteor.call("galileo.notification.markAllRead", function(err, result) {
            if (err) {
                console.log(err);
            } else {
                window.location.reload();
            }
        });
    }
});