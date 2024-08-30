import './_.html';
import { Template } from 'meteor/templating';

Template.gaEthicsDemo.rendered = function() {
    $(".card-frame").show().trigger("show");
};

Template.gaEthicsDemo.onCreated(function() {});

Template.gaEthicsDemo.helpers({

});

Template.gaEthicsDemo.events({
    'click .next-action': function() {
        history.back();
    }
});