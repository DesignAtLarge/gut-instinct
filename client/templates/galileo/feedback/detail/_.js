import './_.jade';
import FeedbackSourceHelper from '../FeedbackSourceHelper';
import CHECKLIST from '../checklist';
import {
    OptionString
} from '/imports/api/ga-models/constants';

const REVIEW_TYPE_NULL = 0;
const REVIEW_TYPE_AGREE = 1;
const REVIEW_TYPE_DISAGREE = 2;

Template.gaExperimentFeedbackDetail.onCreated(function() {

    let inst = this;
    // console.log("rendering with expId... " + inst.data.expId)

    // Main data
    inst.feedbacks = new ReactiveArray();
    inst.checklist = new ReactiveArray();
    inst.suggestions = new ReactiveArray();
    inst.exp = new ReactiveVar();
    inst.canReviewAdmin = new ReactiveVar(undefined);
    inst.hasRelatedWork = new ReactiveVar(true);

    // Other informations
    inst.isOverallPanel = new ReactiveVar(inst.data.field == "overall");
    // inst.reviewCount = new ReactiveVar(0);
    // inst.userCount = new ReactiveVar(0);
    // inst.hasUserReviewedThis = new ReactiveVar(false); // default is false
    inst.userReviewStatus = new ReactiveVar(null);
    inst.guestMode = new ReactiveVar(Meteor.userId() != undefined);

    inst.expCreatorID = new ReactiveVar(null);

    inst.expCreatorID.set(this.data.expCreatorID);

    Meteor.call("galileo.experiments.getExperiment", this.data.expId, function(err, exp) {
        inst.exp.set(exp);
    });

    Meteor.call("galileo.profile.getProfile", function(err, profile) {
        let canReview = profile.feedback_experiments.includes(inst.data.expId);
        inst.canReviewAdmin.set(canReview);
    });

    Tracker.autorun(function() {

        // process detail comments
        FeedbackSourceHelper.getDetailedReviewComments(inst.data.expId, inst.data.field, inst.data.pilotId, function(err, result) {
            // console.log("in getDetailedReviewComments with pilotId: " + inst.data.pilotId)
            // console.log("in getDetailedReviewComments with expId: " + inst.data.expId)
            // console.log("in getDetailedReviewComments with field: " + inst.data.field)
            // console.log("----got all feedbacks...  " + JSON.stringify(result));
            inst.feedbacks.set(result);
        });

        // process voting options
        FeedbackSourceHelper.getDetailedReviewOptions(inst.data.expId, inst.data.field, inst.data.pilotId, function(err, result) {
            loadChecklist(inst, result);

            userReviewStatusBuffer = [];

            function processOptionFromDB(element) {
                let currentUser = Meteor.userId();
                let agreeUsers = element.agrees;
                let disagreeUsers = element.disagrees;

                if (agreeUsers.includes(currentUser)) {
                    userReviewStatusBuffer.push(1);
                } else if (disagreeUsers.includes(currentUser)) {
                    userReviewStatusBuffer.push(-1);
                } else {
                    userReviewStatusBuffer.push(0);
                }
            }

            result.forEach(function(element) {
                processOptionFromDB(element)
            });

            // console.log("updated review buffer " + userReviewStatusBuffer);
            inst.userReviewStatus.set(userReviewStatusBuffer);
        });

        FeedbackSourceHelper.getSuggestions(inst.data.expId, inst.data.field, function(err, result) {
            inst.suggestions.set(result);
        });
    });
});

Template.gaExperimentFeedbackDetail.onRendered(function() {
    // You can do this multiple times
    var element = $(".detail-feedback-checklist")
    element.on('scroll', function() {
        if (element[0].scrollHeight - element[0].scrollTop - element[0].clientHeight < 1) {
            element.children('#greyDiv').addClass('hide')
        } else {
            element.children('#greyDiv').removeClass('hide');
        }
    });
})

Template.gaExperimentFeedbackDetail.onDestroyed(function() {
    $(".detail-feedback-checklist").off('scroll');
})

Template.gaExperimentFeedbackDetail.helpers({
    isNotOverallPanel: function() {
        return !Template.instance().isOverallPanel.get();
    },
    checklist: function() {
        return Template.instance().checklist.get();
    },
    agreeButtonClass: function(currentUserReview) {
        if (currentUserReview === REVIEW_TYPE_AGREE) {
            return "fa-thumbs-up";
        }
        return "fa-thumbs-o-up";
    },
    disagreeButtonClass: function(currentUserReview) {
        if (currentUserReview === REVIEW_TYPE_DISAGREE) {
            return "fa-thumbs-down";
        }
        return "fa-thumbs-o-down";
    },
    // reviewCount: function() {
    //     let r = Template.instance().reviewCount.get();
    //     let u = Template.instance().userCount.get();
    //     return createReviewCountText(r,u);
    // },

    //     getFeedbackHintString: function(option) {
    // //hypo
    //         if (option===OptionString.CAUSE_SPECIFIC) {
    //             return "Help the creator make the cause more specific...";
    //
    //         } else if (option===OptionString.EFFECT_SPECIFIC) {
    //             return "Help the creator make the effect more specific...";
    //
    //         } else if (option===OptionString.RELATION_CLEAR) {
    //             return "Help the creator make the relation between cause and effect clearer...";
    //
    //         } else if (option===OptionString.HYPOTHESIS_CONCRETE) {
    //             return "Help the creator make hypothesis more concrete...";
    //
    //         } else if (option===OptionString.MECHANISM) {
    //             return "Which other mechanisms can you think about?";
    //
    // //cause and effect
    //         } else if (option===OptionString.CHOICE_APPROPRIATE_CAUSE) {
    //             return "Suggest a better way to measure the cause. E.g. measuring the amount rather than absence/presence";
    //
    //         } else if (option===OptionString.MEASURE_CAUSE) {
    //             return "What difficulty might participants face in measuring the cause? How could it be fixed?";
    //
    //         } else if (option===OptionString.REMINDER_CONVENIENT) {
    //             return "What time would you suggest so the participants aren't disturbed..";
    //
    //         } else if (option===OptionString.REMINDER_APPROPRIATE) {
    //             return "What time would you suggest so the participants can provide the correct data..";
    //
    //     //effect
    //         } else if (option===OptionString.CHOICE_APPROPRIATE_EFFECT) {
    //             return "Suggest a better way to measure the effect. E.g. measuring the amount rather than absence/presence";
    //
    //         } else if (option===OptionString.MEASURE_EFFECT) {
    //             return "What difficulty might participants face in measuring the cause? How could it be fixed?";
    //
    // //Steps
    //         } else if (option===OptionString.ARE_STEPS_CLEAR) {
    //             return "Which steps are unclear? How might you make them more concrete?";
    //
    //         } else if (option===OptionString.IS_STEP_SAFE) {
    //             return "Please list the steps that aren't safe. How might you make it safe for participants?";
    //
    //         } else if (option===OptionString.DAILY_ACTIVITIES) {
    //             return "Which daily activities might influence measuring the cause? Please list as many as possible so the creator can tackle them.";
    //
    //     //control cond
    //         } else if (option===OptionString.CC_APPROPRIATE) {
    //             return "How can the control condition become more similar to the experimental condition while correctly manipulating the cause?";
    //
    //         } else if (option===OptionString.CC_DIFFER) {
    //             return "How would you modify the steps in the two conditions so they vary in only one step that manipulates the cause?";
    //
    //         } else if (option===OptionString.CAN_PART_PERFORM) {
    //             return "Why cannot participants perform all the steps? How might you fix this issue.";
    //
    //         } else if (option===OptionString.EVERY_STEP) {
    //             return "Which step(s) doesn't require participants to...";
    //
    //
    // //criteria
    //         } else if (option===OptionString.POTENTIAL_HARM) {
    //             return "Which other participants might be harmed by participating in this experiment? Please list them.";
    //
    //         } else if (option===OptionString.INFORMED_CONSENT) {
    //             return "Which other participants might not be able to provie informed consent? Please list them.";
    //
    //         } else if (option===OptionString.ADHERENCE) {
    //             return "Please list all participants who might not be able to follow the steps correctly";
    //
    //         } else if (option===OptionString.GAIN) {
    //             return "Please list participants who might not gain from the lessons of this experiment";
    //         //inclusion
    //         } else if (option===OptionString.APPROPRIATE_RESULTS) {
    //             return "Please list groups of people who should be included in this experiment to get appropriate results";
    //
    //         } else {
    //             return "How might the creator fix this issue?";
    //         }
    //     },
    getFeedbackByField: function(field) {
        let validFeedback = Template.instance().feedbacks.get();
        let returnValidFeedback = [];

        validFeedback.forEach(function(element) {
            if (element.field.indexOf(field) !== -1) {
                returnValidFeedback.push(element);
            }
        });

        return returnValidFeedback;
    },
    hasFeedbackFollowupByField: function(field, index) {
        let validFeedback = Template.instance().feedbacks.get();
        let returnValidFeedback = [];
        let option = field + "-" + index;
        validFeedback.forEach(function(element) {
            if (element.field.indexOf(option) !== -1) {
                returnValidFeedback.push(element);
            }
        });

        return returnValidFeedback.length > 0;
    },
    hasPermissionViewFeedbackFollowup: function() {
        let expCreatorID = Template.instance().expCreatorID.get();
        let canReviewAdmin = Template.instance().canReviewAdmin.get();
        return ((!canReviewAdmin && Meteor.user().profile.is_admin) || (expCreatorID && expCreatorID === Meteor.userId()))
    },
    isAdminReviewer: function() {
        let expCreatorID = Template.instance().expCreatorID.get();
        if (Meteor.user().profile.is_admin && Template.instance().canReviewAdmin.get()) {
            return true;
        } else {
            return false;
        }
    }
});

Template.gaExperimentFeedbackDetail.events({
    // "scroll window": function (event, instance) {
    //     console.log("scrolling");
    //     $(".detail-feedback-container").css("margin-top", Math.min($(window).scrollTop(), 100));
    // },
    "click .feedback-agree": function(event, instance) {
        if (Meteor.userId()) {
            let expId = instance.data.expId;
            let exp = Template.instance().exp.get();
            if (!expId) {
                return;
            }
            // check if exp creator is current user
            let expCreatorID = Template.instance().expCreatorID.get();
            if (exp && exp.status >= 11) {
                Materialize.toast("Sorry, your experiment is already completed.", 3000);
                return;
            } else if ((expCreatorID && expCreatorID === Meteor.userId()) || (Meteor.user().profile.is_admin && !Template.instance().canReviewAdmin.get())) {
                Materialize.toast("Sorry, you cannot review your own experiment.", 3000);
                return;
            }

            let id = event.currentTarget.id.split("-")[4];
            let field = instance.data.field;

            let checklist = instance.checklist.get();
            let checklistItem = checklist[id];

            let optionAreaRID = $(event.target).attr("rid");
            let optionIndex = $(event.target).attr("index");

            if (checklistItem.currentUserReview === REVIEW_TYPE_AGREE) {
                checklistItem.agreeCount -= 1;
                checklistItem.currentUserReview = REVIEW_TYPE_NULL;
                FeedbackSourceHelper.cancelAgree(expId, field, instance.data.pilotId, checklistItem.option);
            } else {
                if (checklistItem.currentUserReview === REVIEW_TYPE_DISAGREE) {
                    checklistItem.disagreeCount -= 1;
                    // FeedbackSourceHelper.cancelDisagree(expId,field,instance.data.pilotId,checklistItem.option);
                }

                checklistItem.agreeCount += 1;
                checklistItem.currentUserReview = REVIEW_TYPE_AGREE;
                // calling agree also handles removing user id's disagrees vote
                FeedbackSourceHelper.agree(expId, field, instance.data.pilotId, checklistItem.option);
            }
            $("#" + optionAreaRID).hide();
            instance.checklist.set(checklist);
            // updateReviewAndUserCount(checklist);
        } else {
            Materialize.toast("Please Login first to review experiment.", 3000);
        }
    },
    "click .feedback-disagree": function(event, instance) {
        if (Meteor.userId()) {
            // guard check
            let expId = instance.data.expId;
            let exp = Template.instance().exp.get();
            if (!expId) {
                return;
            }

            // check if exp creator is current user
            let expCreatorID = Template.instance().expCreatorID.get();
            if (exp && exp.status >= 11) {
                Materialize.toast("Sorry, your experiment is already completed.", 3000);
                return;
            } else if ((expCreatorID && expCreatorID === Meteor.userId()) || (Meteor.user().profile.is_admin && !Template.instance().canReviewAdmin.get())) {
                Materialize.toast("Sorry, you cannot review your own experiment.", 3000);
                return;
            }

            // get c.index of the target
            let id = event.currentTarget.id.split("-")[4];
            let field = instance.data.field;

            let checklist = instance.checklist.get();
            let checklistItem = checklist[id];

            let optionAreaRID = $(event.target).attr("rid");
            let optionIndex = $(event.target).attr("index");

            if (checklistItem.currentUserReview === REVIEW_TYPE_DISAGREE) {
                checklistItem.disagreeCount -= 1;
                checklistItem.currentUserReview = REVIEW_TYPE_NULL;
                $("#" + optionAreaRID).hide();
                FeedbackSourceHelper.cancelDisagree(expId, field, instance.data.pilotId, checklistItem.option);
            } else {
                if (checklistItem.currentUserReview === REVIEW_TYPE_AGREE) {
                    checklistItem.agreeCount -= 1;
                    $("#" + optionAreaRID).show();
                    // FeedbackSourceHelper.cancelAgree(expId,field,instance.data.pilotId,checklistItem.option);
                }

                checklistItem.disagreeCount += 1;
                checklistItem.currentUserReview = REVIEW_TYPE_DISAGREE;
                // calling disagree also handles removing user id's agrees vote
                $("#" + optionAreaRID).show();
                FeedbackSourceHelper.disagree(expId, field, instance.data.pilotId, checklistItem.option);
            }
            instance.checklist.set(checklist);
            // updateReviewAndUserCount(checklist);
        } else {
            Materialize.toast("Please Login first to review experiment.", 3000);
        }
    },
    "keyup .textarea-comment": function(event) {
        let commentAreaRID = $(event.target).attr("rid");

        if ($(event.target).val().length > 0) {
            $("#submitBtn-" + commentAreaRID).show();
        } else {
            $("#submitBtn-" + commentAreaRID).hide();
        }
    },
    "click .feedbackFollowupSubmit": function(event) {
        let currentUser = Meteor.userId();
        let commentAreaRID = $(event.target).attr("rid");
        let optionIndex = $(event.target).attr("index");
        let feedbackContentID = "#feedbackContent-" + commentAreaRID;
        let feecbackVal = $(feedbackContentID).val().trim();
        let inst = Template.instance();
        let currentFeedbacks = inst.feedbacks.get();
        let newFeedback = true;
        let feedbackId = "";
        if (feecbackVal.length > 2) {

            let expId = inst.data.expId;
            if (!expId) {
                return;
            }
            let field = Template.instance().data.field;
            let pilotId = Template.instance().data.pilotId;
            field = field + "-" + optionIndex;
            console.log(field);
            if (currentFeedbacks === undefined) {
                newFeedback = true;
            } else {
                currentFeedbacks.forEach(function(f) {
                    if (f.field === field && f.user_id === currentUser) {
                        newFeedback = false;
                        feedbackId = f._id;
                    }
                });
            }

            if (newFeedback === true) {
                FeedbackSourceHelper.addDetailedReviewComments(expId, field, pilotId, feecbackVal, function(err, result) {
                    inst.feedbacks.push(result);
                    //$input.val("");
                    Materialize.toast("Thank you for your comment", 3000, "toast rounded");
                });

            } else {
                FeedbackSourceHelper.updateDetailedReviewOptions(feedbackId, currentUser, feecbackVal);
                FeedbackSourceHelper.getDetailedReviewComments(expId, field, pilotId, function(err, result) {
                    inst.feedbacks.set(result);
                });
                Materialize.toast("You have successfully update your comment", 3000, "toast rounded");
            }

            $(event.target).hide();
            $(feedbackContentID).prop('disabled', false);
        } else {
            Materialize.toast("Please provide more comment before submit", 3000, "toast rounded");
        }
    },
    "click .expandFeedbackFollowupResult": function(event) {
        let expandAreaRID = $(event.target).attr("rid");
        let expandTargetID = "#feedbackResultArea-" + expandAreaRID;

        $(expandTargetID).show();
    }
})

function loadChecklist(inst, result) {
    let exp = inst.exp.get();
    // let reviewCount = 0;
    // let userMap = {};
    let checklist = OptionString.findOne({
        "name": "version_1"
    });
    let c = checklist[inst.data.field].map((str, i) => {
        let agreeCount = 0;
        let disagreeCount = 0;
        let currentUserReview = REVIEW_TYPE_NULL;
        if (result && result.length > 0) {
            let filteredResult = result.filter(obj => obj.option === str.rubric);
            if (filteredResult.length > 0) {
                let agreesArr = filteredResult[0].agrees;
                let disagreesArr = filteredResult[0].disagrees;

                agreeCount = agreesArr.length;
                disagreeCount = disagreesArr.length;

                // reviewCount += agreeCount + disagreeCount;

                // // Needed to get count of users currently reviewing this part
                // agreesArr.map((agreeingUserId) => {
                //     userMap[agreeingUserId] = 1;
                // });
                //
                // // Needed to get count of users currently reviewing this part
                // disagreesArr.map((agreeingUserId) => {
                //     userMap[agreeingUserId] = 1;
                // });

                if (agreesArr.indexOf(Meteor.userId()) >= 0) {
                    currentUserReview = REVIEW_TYPE_AGREE;
                } else if (disagreesArr.indexOf(Meteor.userId()) >= 0) {
                    currentUserReview = REVIEW_TYPE_DISAGREE;
                }
            }
        }

        let rid = Math.floor(Math.random() * 1000000) + Math.floor(Math.random() * 1000000) + 1;

        return {
            index: i,
            option: str.rubric,
            hint: str.hint,
            agreeCount: agreeCount,
            disagreeCount: disagreeCount,
            currentUserReview: currentUserReview,
            rid: rid
        }
    });

    if (inst.data.field == "hypothesis" && exp){
        let related_work = exp.design.related_works;
        if (!related_work || related_work.length == 0) {
            c.splice(5, 1);
            // console.log("check list is: " + JSON.stringify(c));
        }
    }
    // inst.hasUserReviewedThis = userMap[Meteor.userId()];
    // inst.userCount.set(Object.keys(userMap).length);
    // inst.reviewCount.set(reviewCount);
    inst.checklist.set(c);
}

// function updateReviewAndUserCount(checklist) {
//     if (!checklist || checklist.length === 0) {
//         return;
//     }
//
//     let currentUserReviews = 0;
//     let newReviewCount = checklist.reduce((accumulator, currentItem) => {
//         currentUserReviews += currentItem.currentUserReview;
//         return accumulator + currentItem.agreeCount + currentItem.disagreeCount;
//     }, 0);
//
//     Template.instance().reviewCount.set(newReviewCount);
//
//     let originalUserCount = Template.instance().userCount.get();
//     if(Template.instance().hasUserReviewedThis) {
//         if(currentUserReviews === 0) {
//             // current user had reviewed before and now reviewCount has become 0, so user count should also decrease
//             Template.instance().userCount.set(originalUserCount - 1);
//             Template.instance().hasUserReviewedThis = false;
//         }
//     }
//     else {
//         // current user had not reviewed before and now reviewCount has increased, so user count should also increase
//         if(currentUserReviews > 0) {
//             Template.instance().userCount.set(originalUserCount + 1);
//             Template.instance().hasUserReviewedThis = true;
//         }
//     }
// }
