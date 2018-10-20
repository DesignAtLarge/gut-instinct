import './_.jade';

import {
    Questions
} from '../../../../imports/api/models.js';

Template.gutboard_search.rendered = function() {


};

Template.gutboard_search.onCreated(function() {});


Template.gutboard_search.helpers({
    init: function(mendelcode) {
        sessionStorage.setItem('mendelcode', mendelcode);

        function capitalizeFirstLetter(string) {
            console.log("Enter Capitalized First Letter!");
            return string.charAt(0).toUpperCase() + string.slice(1);
        }

        setTimeout(function() {
            if (mendelcode == "AmericanGutProject") {
                $('#mendelCodeHeader').html(
                    "&nbsp;&nbsp;<i class='material-icons' style='margin-right: 0px; margin-left: 10px;'>view_week</i> <img src='/images/logos/agp.png' height='60' style='padding-top: 5px;'/>");
            } else
                $('#mendelCodeHeader').html(
                    '&nbsp;&nbsp;<i class="material-icons" style="margin-right: 0px; margin-left: 10px;">view_week</i>' +
                    "#" + capitalizeFirstLetter(mendelcode));
        }, 1000)
    },
    getQuestion: function() {
        return _.sortBy(Questions.find({}).fetch(), function(object) {
            return object.created_at.getTime();
        }).reverse();

    },
    matchQuery: function(question) {
        let query = Template.instance().data.searchQuery.toLowerCase().split(" ");

        /* check usernames */

        let user = question.owner.username.toLowerCase();
        user = user.split(" ");

        for (var i = 0; i < user.length; i++) {
            for (var j = 0; j < query.length; j++) {
                if (user[i].indexOf(query[j]) > -1) {
                    return true;
                }
            }
        }



        /* check layer 1 */
        let layer1 = question.layer_1.text.toLowerCase().split(" ");
        for (var i = 0; i < layer1.length; i++) {
            for (var j = 0; j < query.length; j++) {
                if (layer1[i].indexOf(query[j]) > -1) {
                    return true;
                }
            }
        }

        let options = "";

        for (var j = 0; j < question.layer_1.options.length; j++) {
            options = options + " " + question.layer_1.options[j].option_text.toLowerCase();
        }
        options = options.split(" ");

        for (var i = 0; i < options.length; i++) {
            for (var j = 0; j < query.length; j++) {
                if (options[i].indexOf(query[j]) > -1) {
                    return true;
                }
            }
        }

        /* check layer 2*/
        let layer2 = "";
        for (var j = 0; j < question.layer_2.length; j++) {
            layer2 = layer2 + " " + question.layer_2[j].question.toLowerCase();
            for (var i = 0; i < question.layer_2[j].options.length; i++) {
                layer2 = layer2 + " " + question.layer_2[j].options[i].option_text.toLowerCase();
            }
        }
        layer2 = layer2.split(" ");

        for (var i = 0; i < layer2.length; i++) {
            for (var j = 0; j < query.length; j++) {
                if (layer2[i].indexOf(query[j]) > -1) {
                    return true;
                }
            }
        }

        /* check comments */
        let comments = "";
        for (var j = 0; j < question.comments.length; j++) {
            comments = comments + " " + question.comments[j].text.toLowerCase();
        }

        comments = comments.split(" ");

        for (var i = 0; i < comments.length; i++) {
            for (var j = 0; j < query.length; j++) {
                if (comments[i].indexOf(query[j]) > -1) {
                    return true;
                }
            }
        }
        return false;
    }

});



Template.gutboard_search.events({

});