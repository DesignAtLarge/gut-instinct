import './_.html';
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import { ReactiveVar } from 'meteor/reactive-var';

Template.gaMeNotificationItem.events({
    "click .notification-item-outer": function(event) {
        let $item = $(event.currentTarget).children(".notification-item");
        Meteor.call("galileo.notification.readNotification", $item.attr("data-id"));
        window.location.href = $item.attr("data-url");
    }
});