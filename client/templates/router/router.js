import { Template } from 'meteor/templating';

import './router.html';

Template.router.rendered = function () {
    console.log("Start Rendered");
};

Template.router.onCreated(function () { });

Template.router.helpers({

    isStringEqual(str1, str2) {
        return str1 === str2;
    },
    windowPath: function () {
        var path = window.location.pathname;
        console.log(path);
        return path;
    },
});


Template.router.events({

});