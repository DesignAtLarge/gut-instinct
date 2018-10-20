import './_.jade';
import {
    Session
} from 'meteor/session'

Template.gaLanding.onCreated(function() {});

Template.gaLanding.helpers({
    redirectUrl: function() {
        //return Session.get('isDemo') ? "/galileo/createdemo" : "/galileo/intro" ;
        //vineet has edited this to bypass the entire intro phase
        return Session.get('isDemo') ? "/galileo/createdemo" : "/galileo/browse";
    }
});