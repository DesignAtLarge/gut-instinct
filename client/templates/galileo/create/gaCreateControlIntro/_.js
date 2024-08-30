import './_.html';
import { Template } from 'meteor/templating';

Template.gaCreateControlIntro.rendered = function() {
    $(".collapsible").collapsible();
}