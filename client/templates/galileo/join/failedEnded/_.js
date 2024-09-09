import './_.html';
import { Template } from 'meteor/templating';

Template.gaJoinFailedEnded.onCreated(function() {
    console.log("gaJoinFailedEnded");
    console.log(this.data);
});