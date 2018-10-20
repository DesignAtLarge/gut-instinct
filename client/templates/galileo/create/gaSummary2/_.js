import './_.jade'
import {
    TabooWords,
    emailList
} from '/imports/api/models';

Template.gaSummary2.rendered = function() {

    $(document).ready(function() {
        var taboo_obj = TabooWords.findOne({
            "name": "version_1"
        });
        // console.log("************ " + JSON.stringify(taboo_obj));
        var taboo_list = [];
        if (taboo_obj != undefined) {
            taboo_list = taboo_obj["taboo_words_list"];
        }

        var email_obj = emailList.findOne({
            "name": "version_1"
        });
        var email_list = [];
        if (email_obj != undefined) {
            email_list = email_obj["mail_list"];
        }
        // console.log("**************** taboo list " + taboo_list);
        localStorage.setItem("taboo_list", JSON.stringify(taboo_list));
        localStorage.setItem("email_list", JSON.stringify(email_list));
        // console.log("**************** taboo list " + email_list);

        window.setInterval(function() {
            let theText = $('#card-7').text();
            var hasTaboo = false;

            var taboo_list = JSON.parse(localStorage.getItem("taboo_list"));
            var email_list = JSON.parse(localStorage.getItem("email_list"));
            // console.log("**************** taboo list " + email_list);

            taboo_list.forEach(function(word) {
                hasTaboo = hasTaboo | (theText.search(word) !== -1);
            });

            if (hasTaboo) {
                localStorage.setItem("allowFinish", "0");
                // console.log("disable submit");
            } else {
                localStorage.setItem("allowFinish", "1");
                // console.log("enable submit");
            }

            email_list.forEach(function(key) {
                if (theText.search(key.word) !== -1) {
                    // console.log("~~~~~the key is: " + key.word);
                    localStorage.setItem("send", "1");
                    localStorage.setItem("word", key.word);
                    localStorage.setItem("email", key.email);
                }
            });
        }, 1000);
    });
};

Template.gaSummary2.onCreated(function() {
    let inst = this;
    this.nextDisabled = new ReactiveVar(true);
    this.noFeedback = new ReactiveVar(true);
    this.design = new ReactiveVar();
    this.showAskFeedback = new ReactiveVar(false);
    this.userHasUsername = new ReactiveVar(true);
    this.userHasEmail = new ReactiveVar(true);

    Meteor.call("galileo.profile.hasUsername", Meteor.userId(), function(err, result) {
        if (err) {
            alert("Server Connection Error");
        } else {
            inst.userHasUsername.set(result);
        }
    });

    Meteor.call("galileo.profile.hasEmail", Meteor.userId(), function(err, result) {
        if (err) {
            alert("Server Connection Error");
        } else {
            inst.userHasEmail.set(result);
        }
    });
});

Template.gaSummary2.helpers({
    cause: function() {
        let designId = Template.instance().data.designId.get();
        let inst = Template.instance();
        if (designId === undefined) {
            return;
        }
        Meteor.call("galileo.experiments.design.get", designId, function(err, result) {
            if (err) {
                alert("Server Connection Error");
            } else {
                inst.design.set(result);
            }
        });
        return Template.instance().data.cause.get();
    },
    effect: function() {
        return Template.instance().data.effect.get();
    },
    designId: function() {
        return Template.instance().data.designId;
    },
    nextDisabled: function() {
        return Template.instance().nextDisabled.get();
    },
    noFeedback: function() {
        return Template.instance().noFeedback.get();
    },
    examples: function() {
        return Template.instance().data.examples.get();
    },
    getDesignId: function() {
        let designId = Template.instance().data.designId.get();
        if (designId === undefined) {
            return;
        }
        return designId;
    },
    hasFeedbackRequest: function() {
        let design = Template.instance().design.get();
        if (design === undefined) {
            return;
        }
        if (design.feedback_request !== undefined) {
            Template.instance().noFeedback.set(false);
        }
        return design.feedback_request;
    },
    timeStamp: function() {
        return true;
    },
    type: function() {
        return "finishDesign";
    },
    getDesignId: function() {
        return Template.instance().data.designId.get();
    },
    showAskFeedback: function() {
        return Template.instance().showAskFeedback.get();
    },
    isOpenHumans: function() {
        return localStorage.getItem('mendelcode_ga') === "OPENHUMANS";
    },
    incompleteUsername: function() {
        return Template.instance().userHasUsername.get() === false;
    },
    incompleteEmail: function() {
        return Template.instance().userHasEmail.get() === false;
    },
    /*  Example Stage format
    3: Measure Cause
    0-0-0
    ^
    The Current Step its on

    0-0-0
      ^
      The 1st position or y position

    0-0-0
        ^
        The 2nd position or x position
    */
    getExamples: function(exampleStage) {
        let mendel = localStorage.mendelcode_ga;

        if (mendel === undefined) {
            mendel = "DEFAULT";
        }

        let rawExamples = Template.instance().data.examples.get();

        if (rawExamples === undefined) {
            return "";
        }

        let fetchedData = rawExamples.filter((obj) => obj.stage_id === exampleStage);
        let fetchedData1 = fetchedData.filter((obj) => obj.mendel_code === mendel);
        if (fetchedData1 && fetchedData1.length > 0) {
            return fetchedData1[0].data;
        } else {
            // if mendel not found, return default
            return fetchedData.filter((obj) => obj.mendel_code === "DEFAULT")[0].data;
        }
    },
});

Template.gaSummary2.events({
    'click .edit-design-btn': function(event, instance) {
        if (!(event.target.classList.contains('cancel') || event.target.classList.contains('accept'))) {
            let set2 = new Set($(".edit-design-btn.hide"));
            let set1 = new Set($(".edit-design-btn"));
            let arr = Array.from(new Set([...set1].filter(x => !set2.has(x))));

            arr2 = [];

            for (var i = 0; i < arr.length; i++) {
                if (Array.from(arr[i].classList).includes("accept")) {
                    arr2.push(arr[i])
                }
            }

            for (var i = 0; i < arr2.length; i++) {
                if (arr2[i].parentElement !== event.target.parentElement) {
                    if (arr2[i].parentElement.classList.contains('design-section')) {
                        arr2[i].parentElement.style.borderColor = "red";
                        arr2[i].parentElement.classList.add("remind");
                    } else {
                        arr2[i].parentElement.parentElement.style.borderColor = "red";
                        arr2[i].parentElement.parentElement.classList.add("remind");
                    }
                }
            }
        } else if (Array.from($(".remind")).length > 0) {
            $(".remind").css("border-color", "");
            $(".remind").removeClass('remind');
        }
    },
    'show .card-frame': function() {
        $("#experiment-design").trigger("reload");
    },
    'change .check': function(event) {
        let checked1 = $('#cause-specific-check').is(":checked");
        let checked2 = $('#effect-specific-check').is(":checked");
        let checked3 = $('#relation-defined-check').is(":checked");
        let checked4 = $('#mechanism-defined-check').is(":checked");
        let checked5 = $('#hypo-alternate-check').is(":checked");
        let nextDisabled = !checked1 || !checked2 || !checked3 || !checked4 || !checked5;
        //let nextDisabled = !checked1 || !checked2 || !checked3 || !checked5;
        Template.instance().showAskFeedback.set(!nextDisabled);
        Template.instance().nextDisabled.set(nextDisabled);
        Template.instance().noFeedback.set(nextDisabled);
    },
    'click #finishBtn': function(event) {
        let content = $('#feedbackRequest').val().trim();
        let designId = Template.instance().data.designId.get();
        let messageCause = "";
        let messageEffect = "";
        if ($('#followupMessageEffect').val() !== undefined && $('#followupMessageCause').val() !== undefined) {
            messageCause = $('#followupMessageCause').val().trim();
            messageEffect = $('#followupMessageEffect').val().trim();
        }
        let inst = Template.instance();
        if (content.length < 10) {
            localStorage.setItem("allowFinish", "2");
        } else {
            Meteor.call('galileo.experiments.design.setFollowupMessage', designId, messageCause, messageEffect)
            Meteor.call('galileo.experiments.design.setFeedbackRequest', designId, content, function(err, result) {
                localStorage.setItem("allowFinish", "1");
                let validFeedback = false;
                inst.noFeedback.set(validFeedback);
            });
        }
    }
});