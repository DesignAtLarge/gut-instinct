// import './_.jade';
// import FeedbackSourceHelper from '../FeedbackSourceHelper';
//
// let CHECKLIST = {
//     "hypothesis": [
//         "Is the cause specific?",
//         "Is the effect specific?",
//         "Is the relation between cause and effect clear?",
//         //"Do you think this is true? Or should the alternate hypothesis be tested. Which is more likely?",
//         "Is the hypothesis concrete i.e. it either holds or it does not hold?"
//     ],
//     "causeMeasures": [
//         "Can the experiment participants correctly measure the cause?",
//         "Is this choice of measurement appropriate for the cause?",
//
//         "Is the time of reminder convenient for the participants?",
//         "Is the time of reminder appropriate to receive correct data?"
//     ],
//     "effectMeasures": [
//
//         "Can the experiment participants correctly measure the effect?",
//         "Is this choice of measurement appropriate for the effect?",
//
//         "Is the time of reminder convenient for the participants?",
//         "Is the time of reminder appropriate to receive correct data?"
//         //"Is this time convenient for people to provide information (e.g. asking people how sleepy they are, right before falling asleep is good, but also difficult to track since people might be too tired to provide this info)",
//         //"and (separate bullet) this is the right time to ask for this data (example: ask people about their quality of sleep right after they wake up, not at noon) --- add good and bad examples for all of these"
//
//     ],
//     "conditions": [
//         //"Do the control and experimental conditions vary the cause appropriately?",
//         "Is the control condition appropriate compared to the experimental condition? E.g. If comparing the effect of eating cabbage on bloatedness, people can eat lettuce/broccoli rather than not eating food at all.",
//
//         "Do the control and experimental conditions differ in ONLY one step?",
//
//         "Are all steps clear enough to ensure that different participants don't end doing different things?",
//
//         "Can participants perform all the steps in either condition in a reasonable time?",
//
//         "Does every step require participants to make ONLY minor tweaks in their lifestyle?",
//         "Is every step (in both conditions) safe for participants? Any step that asks participants to abstain from food, water, medication, or any suggestion of extreme increase in physical activity should be flagged!",
//
//         "Do these instructions account for the effect of people's daily activities on the cause measure? For example, when studying the effect of coffee on sleep, it's important to not increase drinking soda as well (since soda has caffeine too).",
//
//         //"Which daily activities might need to be stopped?".
//
//         //"If you wanted to replicate the experiment, would you add any more details to the steps?"
//         //" ask people about specific ingredients, or to be as specific as needed. e.g. if you ask people to eat a grilled cheese sandwich, should they have salt and pepper",
//         //"Do you expect to see a difference in the effect metric for control and experimental groups?",
//         //If not, how might you change the groups?",
//     ],
//     "inclusionCriteria": [
//         "Does the Inclusion Criteria include people whose participation will provide the most appropriate results? (E.g. for an experiment that tests the effect of regular coffee drinking, regular coffee drinkers should be included",
//         //"Your experiments should be run by people who'll need to make minor changes to their lifestyle while keeping everything else the same.",
//
//     ],
//     "exclusionCriteria": [
//         "Potential harm: Does the Exclusion Criteria exclude participants who might be harmed from participating in the experiment (in either Control or Experimental Group)?",
//
//         "Informed consent: Does the Exclusion Criteria exclude participants who might not be able to provide informed consent?",
//
//         "Adherence: Does the Exclusion Criteria exclude participants who might not adhere to the experimental steps for every day of the suggested duration (including providing data)? If not, please add a comment with a suggestion to remove such people from the experiment. E.g. When studying the effects of quitting smoking on the quality of sleep, you might want to avoid long-term smokers who might struggle to quit.",
//
//         "Non Profit: Does the Exclusion Criteria exclude participants who might gain from the results of the experiment and the knowledge created? If not, please add a comment with a suggestion to remove such people from the experiment."
//         //"Does the Exclusion Criteria include "
//         //"Confounders: Are there participants for whom interpreting the data might be problematic due to other lifestyle factors? Please suggest adding them to the criteria (E.g. when studying the effect of coffee on quantity of sleep, it might help to exclude participants who do night shift work. or others who have never had coffee.",
//     ],
//     "results": [
//         "Do you understand these graphs?",
//         "Which other graphs would you like to see?"
//         //"promise to weigh all the findings instead of cherry-picking data that supports a particular point of view.",
//         //"stakeholders must agree how they’ll proceed once the results are in",
//     ],
//     "overall": [
//         "Assume that the experiment was run but it failed to complete. What might you improve in the experiment design to avoid this situation?",
//         "Assume that the experiment was run to completion but it failed to find evidence for the hypothesis. What might you improve in the experiment design to improve the chance of finding an evidence for the hypothesis?",
//         "Could you share some resources for the experiment designer to find other participants?",
//     ]
// };
//
// const REVIEW_TYPE_NULL = 0;
// const REVIEW_TYPE_AGREE= 1;
// const REVIEW_TYPE_DISAGREE = 2;
//
// Template.gaExperimentFeedbackDetailOld.onCreated(function () {
//     let inst = this;
//
//     // field = passed on from parent template.
//     // This is the field for which the feedback detail view is shown, e.g. hypothesis, cause measure etc.
//     let field = inst.data.field;
//
//     this.feedbacks = new ReactiveArray();
//     this.checklist= new ReactiveArray();
//     this.reviewCount = new ReactiveVar(0);
//     this.userCount = new ReactiveVar(0);
//     this.hasUserReviewedThis = false;
//
//     this.suggestions = new ReactiveArray();
//
//     this.nextClicked = new ReactiveVar(false);
//
//     this.guestMode = new ReactiveVar(false);
//     this.isOverallPanel = (Template.instance().data.field === "overall");
//
//     if (!Meteor.userId()) {
//         this.guestMode = new ReactiveVar(true);
//     }
//     console.log("rendering in guest mode: (/feedback/detailPanel)" + this.guestMode.get());
//     console.log("rendering in pilot mode: (/feedback/detailPanel) " + this.data.pilotId);
//
//     Tracker.autorun(function () {
//         if (inst.isOverallPanel) {
//             let c = CHECKLIST[field].map((option) => {
//                 return {
//                     option: option,
//                 }
//             });
//             inst.checklist.set(c);
//             return;
//         }
//
//         let expId = inst.data.expId && inst.data.expId.get();
//         if(!expId) {
//             return;
//         }
//
//         FeedbackSourceHelper.getDetailedReviewComments(expId, field, inst.data.pilotId, function(err,result) {
//             inst.feedbacks.set(result);
//         });
//
//
//         //TODO: move to parent template
//         FeedbackSourceHelper.getDetailedReviewOptions(expId, field, inst.data.pilotId, function (err, result) {
//             if (err) {
//                 console.error("Server Connection Error " + err);
//             }
//             else {
//                 let reviewCount = 0;
//                 let userMap = {};
//                 let c = CHECKLIST[field].map((str, i) => {
//                     let agreeCount = 0;
//                     let disagreeCount = 0;
//                     let currentUserReview = REVIEW_TYPE_NULL;
//
//                     if(result && result.length > 0) {
//                         let filteredResult = result.filter(obj => obj.option === str);
//                         if (filteredResult.length > 0) {
//                             let agreesArr = filteredResult[0].agrees;
//                             let disagreesArr = filteredResult[0].disagrees;
//
//                             agreeCount = agreesArr.length;
//                             disagreeCount = disagreesArr.length;
//
//                             reviewCount += agreeCount + disagreeCount;
//
//                             // Needed to get count of users currently reviewing this part
//                             agreesArr.map((agreeingUserId) => {
//                                 userMap[agreeingUserId] = 1;
//                             });
//
//                             // Needed to get count of users currently reviewing this part
//                             disagreesArr.map((agreeingUserId) => {
//                                 userMap[agreeingUserId] = 1;
//                             });
//
//                             if (agreesArr.indexOf(Meteor.userId()) >= 0) {
//                                 currentUserReview = REVIEW_TYPE_AGREE;
//                             }
//                             else if (disagreesArr.indexOf(Meteor.userId()) >= 0) {
//                                 currentUserReview = REVIEW_TYPE_DISAGREE;
//                             }
//                         }
//                     }
//
//                     return {
//                         index: i,
//                         option: str,
//                         agreeCount: agreeCount,
//                         disagreeCount: disagreeCount,
//                         currentUserReview: currentUserReview
//                     }
//                 });
//
//                 inst.hasUserReviewedThis = userMap[Meteor.userId()];
//                 inst.userCount.set(Object.keys(userMap).length);
//                 inst.reviewCount.set(reviewCount);
//                 inst.checklist.set(c);
//             }
//         });
//
//         FeedbackSourceHelper.getSuggestions(expId, field, function (err, result) {
//             if (err) {
//                 console.log("Connection Error");
//             }
//             else {
//                 inst.suggestions.set(result);
//             }
//         });
//     });
// });
//
// Template.gaExperimentFeedbackDetailOld.helpers({
//     field: function () {
//         return Template.instance().data.field;
//     },
//     name: function () {
//         return Template.instance().data.name;
//     },
//     thething: function () {
//         return Template.instance().data.thething;
//     },
//     hasFeedback: function () {
//         return Template.instance().feedbacks.length() > 0;
//     },
//     feedbacks: function () {
//         return Template.instance().feedbacks.get();
//     },
//     checklist: function () {
//         return Template.instance().checklist.get();
//     },
//     nextClicked: function () {
//         return Template.instance().nextClicked.get();
//     },
//     notNextClicked: function () {
//         return !Template.instance().nextClicked.get();
//     },
//     // checked: function (option) {
//     //     let inst = Template.instance();
//     //     let result = inst.checklistResult.get();
//     //     if (result) {
//     //         let f = result.filter((obj) => {
//     //             return obj.option == option;
//     //         });
//     //         if (f.length > 0) {
//     //             return f[0].agrees.indexOf(Meteor.userId()) >= 0 ? "checked" : undefined;
//     //         }
//     //         else {
//     //             return undefined;
//     //         }
//     //     }
//     //     else {
//     //         return undefined;
//     //     }
//     // },
//     agreeButtonClass: function(currentUserReview) {
//         if(currentUserReview === REVIEW_TYPE_AGREE) {
//             return "fa-thumbs-up";
//         }
//         return "fa-thumbs-o-up";
//     },
//     disagreeButtonClass: function(currentUserReview) {
//         if(currentUserReview === REVIEW_TYPE_DISAGREE) {
//             return "fa-thumbs-down";
//         }
//         return "fa-thumbs-o-down";
//     },
//     reviewCount: function() {
//         let r = Template.instance().reviewCount.get();
//         let u = Template.instance().userCount.get();
//         return createReviewCountText(r,u);
//     },
//     isGuestMode: function () {
//         return Template.instance().guestMode.get();
//     },
//     buttonText: function() {
//         if(Template.instance().isOverallPanel) {
//             return "Overall Review";
//         }
//         return "Review"
//     },
//     canEdit: function(userID) {
//         return (userID === Meteor.userId());
//     },
//     isNotOverallPanel: function () {
//         return !Template.instance().isOverallPanel;
//     },
//     panelContainerStyle:function(){
//         // if(Template.instance().isOverallPanel){
//         //     return "display: none; left:102%;";
//         // }
//         // else {
//         //     return "display: none;";
//         // }
//         return "";
//     },
//     isHypothesisPanel: function () {
//         return Template.instance().data.field == "hypothesis";
//     },
//     suggestions: function () {
//         return Template.instance().suggestions.get();
//     }
// });
//
// Template.gaExperimentFeedbackDetailOld.events({
//     "update #detail-feedback-btn-hypothesis": function (event, instance) {
//
//         var inst = Template.instance();
//
//         // Show the panel
//         let $btn = $(event.currentTarget);
//         let $target = $("#" + $btn.attr("data-target"));
//         let flag = $target.is(":visible");
//         $(".detail-feedback-container").fadeOut();
//         $('.current-review-div').removeClass('current-review-div');
//         $target.fadeIn();
//         $(event.currentTarget).parent().addClass('current-review-div');
//         $('.galileo').addClass('review-container');
//
//         // Set next to true
//         inst.nextClicked.set(true);
//
//         // Go to
//         var expId = inst.data.expId.get();
//         var field = inst.data.field;
//         FeedbackSourceHelper.getSuggestions(expId, field, function (err, result) {
//             if (err) {
//                 console.log("Connection Error");
//             }
//             else {
//                 var oriLength = inst.suggestions.get().length;
//                 result = result.map((x, i) => {
//                     x.isNew = i >= oriLength;
//                     return x;
//                 });
//                 inst.suggestions.set(result);
//             }
//         });
//     },
//     "keyup .textarea-comment" : function(event) {
//         let textarea_id = $(event.target).data('id');
//
//         if ($("#addl-comment-" + textarea_id)[0].value.length > 0) {
//             $("#submit-" + textarea_id).removeClass('hide');
//         }
//         else {
//             $("#submit-" + textarea_id).addClass('hide');
//         }
//     },
//     "click .detail-feedback-btn": function (event) {
//         let $btn = $(event.currentTarget);
//         let $target = $("#" + $btn.attr("data-target"));
//         let flag = $target.is(":visible");
//         $(".detail-feedback-container").fadeOut();
//         $('.current-review-div').removeClass('current-review-div');
//         if (!flag) {
//             $target.fadeIn();
//             $(event.currentTarget).parent().addClass('current-review-div');
//             $('.galileo').addClass('review-container');
//         }
//     },
//     'click #sign-in': function () {
//         localStorage.setItem("loginRedirectUrl", window.location.pathname);
//         window.location.href = "/galileo/signup/";
//     },
//     "click .detail-feedback-container": function (event) {
//         event.stopPropagation();
//     },
//     "click .cancel" : function(e) {
//         let comment_id = $(e.target).data('id');
//
//         $("#edit-" + comment_id).toggle();
//
//         let textarea = $("#text-" + comment_id);
//         textarea.toggle();
//         textarea.focusout();
//         textarea[0].value = "";
//         $("#save-" + comment_id).toggle();
//         $("#cancel-" + comment_id).toggle();
//         $("#comment-" + comment_id).show();
//     },
//
//     "click .save" : function (e,inst) {
//         let comment_id = $(e.target).data('id');
//         let user_id = Meteor.userId();
//
//         let textarea = $("#text-" + comment_id);
//         let feedback = textarea[0].value;
//
//         //let $input = $(event.currentTarget).find("input");
//
//         if (feedback && (feedback = feedback.trim()) !== "") {
//             FeedbackSourceHelper.updateDetailedReviewOptions(comment_id, user_id, feedback, inst.data.pilotId, function (err, result) {
//                 textarea.toggle();
//                 textarea.focusout();
//
//                 //let comment = Template.instance().feedbacks.get().filter(obj => obj._id === comment_id);
//                 textarea[0].value = "";
//                 $("#save-" + comment_id).toggle();
//                 $("#cancel-" + comment_id).toggle();
//                 $("#comment-" + comment_id).show();
//                 $("#content-" + comment_id)[0].outerText = feedback;
//                 $("#edit-" + comment_id).toggle();
//             });
//         }
//         else {
//             Materialize.toast("Please enter your feedback", 3000, "toast rounded");
//         }
//         return false;
//     },
//
//     "click .edit" : function (e) {
//         let comment_id = $(e.target).data('id');
// 	    $("#edit-" + comment_id).toggle();
//         let textarea = $("#text-" + comment_id);
// 	    textarea.toggle();
// 	    textarea.focus();
//
// 	    let comment = Template.instance().feedbacks.get().filter(obj => obj._id === comment_id);
//
//         textarea[0].value = comment[0].content;
//
//         $("#comment-" + comment_id).hide();
//         $("#save-" + comment_id).toggle();
//         $("#cancel-" + comment_id).toggle();
//     },
//
//     "click .submit": function (event) {
//         let submit_id = $(event.target).data('id');
//         let inst = Template.instance();
//         let $input = $("#addl-comment-" + submit_id);
//         console.log($input);
//         let feedback = $input.val();
//
//         if (feedback && (feedback = feedback.trim()) !== "") {
//
//             let expId = inst.data.expId && inst.data.expId.get();
//             if(!expId) { return; }
//             let field = Template.instance().data.field;
//             let pilotId = Template.instance().data.pilotId;
//
//             FeedbackSourceHelper.addDetailedReviewComments(expId, field, pilotId, feedback, function (err, result) {
//                 inst.feedbacks.push(result);
//                 $input.val("");
//             });
//         }
//         else {
//             Materialize.toast("Please enter your feedback", 3000, "toast rounded");
//         }
//         return false;
//     },
//     "click .close-container": function (event) {
//         let inst = Template.instance();
//         let $target = $("#detail-feedback-" + inst.data.field);
//         $target.fadeOut();
//         $('.current-review-div').removeClass('current-review-div');
//     },
//     "click .feedback-agree": function (event, instance) {
//         let id = event.currentTarget.id.split("-")[4];
//         let field = instance.data.field;
//         let expId = instance.data.expId && instance.data.expId.get();
//         if(!expId) { return; }
//         let checklist = instance.checklist.get();
//         let checklistItem = checklist[id];
//         if(checklistItem.currentUserReview === REVIEW_TYPE_AGREE) {
//             checklistItem.agreeCount -= 1;
//             checklistItem.currentUserReview = REVIEW_TYPE_NULL;
//             FeedbackSourceHelper.cancelAgree(expId,field,instance.data.pilotId,checklistItem.option);
//         }
//         else {
//             if(checklistItem.currentUserReview === REVIEW_TYPE_DISAGREE) {
//                 checklistItem.disagreeCount -= 1;
//                 // FeedbackSourceHelper.cancelDisagree(expId,field,instance.data.pilotId,checklistItem.option);
//             }
//
//             checklistItem.agreeCount += 1;
//             checklistItem.currentUserReview = REVIEW_TYPE_AGREE;
//             // calling agree also handles removing user id's disagrees vote
//             FeedbackSourceHelper.agree(expId,field,instance.data.pilotId,checklistItem.option);
//         }
//         instance.checklist.set(checklist);
//         updateReviewAndUserCount(checklist);
//     },
//     "click .feedback-disagree": function (event, instance) {
//         let id = event.currentTarget.id.split("-")[4];
//         let field = instance.data.field;
//         let expId = instance.data.expId && instance.data.expId.get();
//         if(!expId) { return; }
//         let checklist = instance.checklist.get();
//         let checklistItem = checklist[id];
//         if(checklistItem.currentUserReview === REVIEW_TYPE_DISAGREE) {
//             checklistItem.disagreeCount -= 1;
//             checklistItem.currentUserReview = REVIEW_TYPE_NULL;
//             FeedbackSourceHelper.cancelDisagree(expId,field,instance.data.pilotId,checklistItem.option);
//         }
//         else {
//             if(checklistItem.currentUserReview === REVIEW_TYPE_AGREE) {
//                 checklistItem.agreeCount -= 1;
//                 // FeedbackSourceHelper.cancelAgree(expId,field,instance.data.pilotId,checklistItem.option);
//             }
//
//             checklistItem.disagreeCount += 1;
//             checklistItem.currentUserReview = REVIEW_TYPE_DISAGREE;
//             // calling disagree also handles removing user id's agrees vote
//             FeedbackSourceHelper.disagree(expId,field,instance.data.pilotId,checklistItem.option);
//         }
//         instance.checklist.set(checklist);
//         updateReviewAndUserCount(checklist);
//     },
//     // "click .checklist-box": function (event) {
//     //
//     //     // Cache instance
//     //     let inst = Template.instance();
//     //
//     //     // Get the checklist box (the checkbox that one clicked on)
//     //     let $cb = $(event.currentTarget);
//     //
//     //     // The field of the checklist
//     //     let field = inst.data.field;
//     //
//     //     // The experiment id
//     //     let expId = inst.data.expId && inst.data.expId.get();
//     //     if(!expId) { return; }
//     //
//     //     // Get the checklist item string
//     //     let ciId = parseInt($cb.attr("id").split("-")[4]);
//     //     let ci = CHECKLIST[field][ciId];
//     //
//     //     // Get the checklist result (for updating the agree list)
//     //     let cl = inst.checklistResult.get();
//     //     let f = cl.filter((obj) => {
//     //         return obj.option == ci;
//     //     });
//     //     let res = undefined;
//     //     if (f.length > 0) {
//     //         res = f[0];
//     //     }
//     //     else {
//     //         cl.push({
//     //             option: ci,
//     //             agrees: []
//     //         });
//     //         res = cl[cl.length - 1];
//     //     }
//     //
//     //     // Check if the checkbox is switched on or off and update the database
//     //     // as well as the agree amount
//     //     if ($cb.is(":checked")) {
//     //         Meteor.call("galileo.feedback.options.agree", expId, field, ci);
//     //         res.agrees.push(Meteor.userId());
//     //     }
//     //     else {
//     //         Meteor.call("galileo.feedback.options.cancelAgree", expId, field, ci);
//     //         res.agrees.splice(res.agrees.indexOf(Meteor.userId()), 1);
//     //     }
//     //     inst.checklistResult.set(cl);
//     // }
//     "click .next": function () {
//         Template.instance().nextClicked.set(true);
//     }
// });
//
// function updateReviewAndUserCount(checklist) {
//     if(!checklist || checklist.length === 0) {
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
//
//
// function createReviewCountText(c, u) {
//     let suffix = " reviews";
//     if(c === 1) {
//         suffix = " review";
//     }
//
//     let user= " from " + u;
//
//     let suffix2="";
//     if (u === 0) {
//         suffix2 = "";
//         user = "";
//     }
//     else if (u === 1) {
//         suffix2 = " user";
//     }
//     else if (u > 1) {
//         suffix2 = " users";
//     }
//
//     if (c === 0) {
//         suffix2 = "";
//         user = "";
//     }
//
//     return c + suffix + user + suffix2;
// }