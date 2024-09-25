// galileo routes
import {
    ParticipationStatus,
    ErrorMessage
} from './ga-models/constants';

import { Meteor } from "meteor/meteor";
import { Bookmarks } from './models';

import {
    UserMetrics,
} from '../api/models.js';

window.onload = checkPath;

export function redirect(newPath) {
    const baseUrl = 'http://localhost:3000';

    const newUrl = baseUrl + newPath;

    window.location.href = newUrl;

}

function logoutUser(){
    Meteor.logout(function (err) {
        if (err || error) console.log('Error loggin out!');
    });
    sessionStorage.clear();
    localStorage.clear();
    redirect('/galileo/home');
}

function checkPath() {
    var path = window.location.pathname;
    var url = new URL(window.location.href);
    var params = new URLSearchParams(url.search);
    let currentUserId = Meteor.userId();
    Meteor.setTimeout(() => {
        let user = Meteor.user();
        switch (path) {
            case '/gaExperimentDesign':
                Blaze.render(Template.gaExperimentDesign, document.body);
                break;
            case '/gutboard_slider_addq':
                Blaze.render(Template.gutboard_slider_addq, document.body);
                break;
            case '/tutorial':
                Blaze.render(Template.tutorial, document.body);
                break;
            case '/welcome':
                Blaze.render(Template.welcome, document.body);
                break;
            case '/gutboard':
                Blaze.render(Template.gutboard, document.body);
                break;
            case '/test':
                Blaze.render(Template.test, document.body);
                break;
            case '/guide':
                Blaze.render(Template.guide_question_welcome, document.body);
                break;
            case '/problems':
                Blaze.render(Template.problems, document.body);
                break;
            case '/articles':
                Blaze.render(Template.articles, document.body);
                break;
            case '/bookmark':
                Blaze.render(Template.bookmark, document.body);
                break;
            case '/landing':
                Blaze.render(Template.landing, document.body);
                break;
            case '/trial':
                Blaze.renderWithData(Template.trial, function () {
                    return { type: "pre" };
                }, document.body);
                break;
            case '/survey':
                Blaze.renderWithData(Template.post_survey, function () {
                    return {
                        type: "post"
                    };
                }, document.body);
                break;
            case '/':
                redirect('/galileo');
                break;
            case '/login-admin':
                if (!Meteor.userAsync()) {
                    Blaze.render(Template.login, document.body);
                } else {
                    redirect('consent');
                }
                break;
            case '/galileo':
                Meteor.call('galileo.profile.getRelativeExperiments', user, function (err, result) {
                    console.log("relative");
                    console.log(result);
                    if (result !== undefined && result.length > 0) {
                        let expId = result[0]._id;
                        redirect('/galileo/me/dashboard');
                    } else {
                        console.log("enterd")
                        redirect('/galileo/browse');
                    }
                });
                break;
            case '/galileo/signup':
                console.log('in sign in router');

                if (!Meteor.userId()) {
                    Blaze.render(Template.signup, document.body);
                } else {
                    console.log('going to consent');
                    redirect('/galileo/consent');
                }
                break;
            case '/galileo/consent':
                if (!user.profile.consent_agreed) {
                    console.log('going to consent final');
                    Blaze.render(Template.consent, document.body);
                } else {
                    if (!user.profile.toured.username_page) {
                        console.log('going to consent username');
                        redirect('/galileo/username');
                    } else if (localStorage.getItem("loginRedirectUrl")) {
                        Meteor.call('galileo.profile.getMendel', function (err, result) {
                            localStorage.setItem("mendelcode_ga", result);
                            let redirectTo = localStorage.getItem("loginRedirectUrl");
                            localStorage.removeItem('loginRedirectUrl');
                            console.log('going to ' + redirectTo);
                            redirect(redirectTo);
                        });
                    } else {
                        console.log("user id is: " + Meteor.userId());
                        Meteor.call('galileo.profile.getRelativeExperiments', Meteor.userId(), function (err, result) {
                            if (result !== undefined && result.length > 0) {
                                if (localStorage.getItem("mendelcode_ga") != undefined && localStorage.getItem("mendelcode_ga") != null && localStorage.getItem("mendelcode_ga") != "undefined") {
                                    redirect('/galileo/me/dashboard');
                                }
                                else {
                                    Meteor.call('galileo.profile.getMendel', function (err, result) {
                                        localStorage.setItem("mendelcode_ga", result);
                                        redirect('/galileo/me/dashboard');
                                    });
                                }
                            } else {
                                if (localStorage.getItem("mendelcode_ga") != undefined && localStorage.getItem("mendelcode_ga") != null && localStorage.getItem("mendelcode_ga") != "undefined") {
                                    console.log('going to browse');
                                    redirect('/galileo/browse');
                                }
                                else {
                                    Meteor.call('galileo.profile.getMendel', function (err, result) {
                                        localStorage.setItem("mendelcode_ga", result);
                                        console.log('going to browse');
                                        redirect('/galileo/browse');
                                    })
                                }
                            }
                        });
                    }
                }
                break;
            case '/galileo/createdemo':
                Blaze.render(Template.gaCreateDemo, document.body);
                if (Meteor.userId()) {
                    if (!Meteor.user().profile.consent_agreed) {
                        redirect('/galileo/consent');
                    } else if (!Meteor.user().profile.toured.username_page) {
                        redirect('/galileo/username');
                    } else {
                        Blaze.render(Template.gaCreateDemo, document.body);
                        if (params.has("expid")) {
                            Blaze.renderWithData(Template.gaCreateDemo, {
                                expId: params.get("expid")
                            }, document.body);
                        }
                    }
                }
                break;
            case '/galileo/addcriteria':
                if (params.has("expid")) {
                    Blaze.renderWithData(Template.gaCriteriaDemo, {
                        expId: params.get("expid")
                    }, document.body);
                }
                break;
            case 'm':
                Blaze.render(Template.gaEducationDemo, document.body);
                break;
            case '/galileo/createedu':
                if (Meteor.user()) {
                    if (!Meteor.user().profile.consent_agreed) {
                        redirect('/galileo/consent');
                    } else if (!Meteor.user().profile.toured.username_page) {
                        redirect('/galileo/username');
                    } else {
                        if (params.has("expid")) {
                            Blaze.renderWithData(Template.gaEducationDemo, {
                                expId: params.get("expid")
                            }, document.body);
                        }

                    }
                }
                break;
            case '/galileo/username':
                Blaze.renderWithData(Template.username, {
                    isGalileo: true
                }, document.body);
                break;
            case '/galileo/logout':
                Meteor.call('galileo.profile.setMendel', localStorage.getItem('mendelcode_ga'), function (error, result) {
                    Meteor.logout(function (err) {
                        if (err || error) console.log('Error loggin out!');
                    });
                    sessionStorage.clear();
                    localStorage.clear();
                    redirect('/galileo/home');
                });
                break;
            case '/galileo/console':
                Blaze.render(Template.gaConsole, document.body);
                break;
            case '/galileo/home':
                Blaze.render(Template.gaHome, document.body);
                break;
            case '/galileo/blog/why-exp':
                redirect('/galileo/blog/tutorial');
                break;
            case '/galileo/blog/why-exp-openhumans':
                Blaze.render(Template.gabWhyExpOH, document.body);
                break;
            case '/galileo/blog/why-exp-lyme':
                Blaze.render(Template.gabWhyExpLyme, document.body);
                break;
            case '/galileo/blog/why-exp-beer':
                Blaze.render(Template.gabWhyExpBeer, document.body);
                break;
            case '/galileo/blog/why-exp-nerdnite':
                Blaze.render(Template.gabWhyExpNerdNite, document.body);
                break;
            case '/galileo/blog/why-exp-probiotics':
                Blaze.render(Template.gabWhyProbiotics, document.body);
                break;
            case '/galileo/blog/why-exp-spice':
                Blaze.render(Template.gabWhyExpSpice, document.body);
                break;
            case '/galileo/blog/why-exp-circadian':
                Blaze.render(Template.gabWhyExpCircadian, document.body);
                break;
            case '/galileo/blog/why-exp-kombucha':
                Blaze.render(Template.gabWhyExpKombucha, document.body);
                break;
            case '/galileo/blog/why-exp-t1d':
                Blaze.render(Template.gabWhyExpT1D, document.body);
                break;
            case '/galileo/blog/why-exp-kefir':
                Blaze.render(Template.gabWhyExpKefir, document.body);
                break;
            case '/galileo/blog/why-exp-agp':
                Blaze.render(Template.gabWhyExpAGP, document.body);
                break;
            case '/galileo/blog/why-exp-gut-check':
                Blaze.render(Template.gabWhyExpGutCheck, document.body);
                break;
            case '/galileo/blog/why-exp-soylent':
                Blaze.render(Template.gabWhyExpSoylent, document.body);
                break;
            case '/galileo/blog/why-exp-diet':
                Blaze.render(Template.gabWhyExpDiet, document.body);
                break;
            case '/galileo/blog/tutorial':
                Blaze.render(Template.gabTutorial, document.body);
                break;
            case '/galileo/entrance':
                Blaze.render(Template.gaEntrance, document.body);
                break;
            case '/galileo/landing':
                Blaze.render(Template.gaLanding, document.body);
                break;
            case "/galileo/tour":
                Meteor.call("galileo.tour.getProgress", function (err, progress) {
                    switch (progress) {
                        case "create":
                            Meteor.call("galileo.tour.getDesignedExperimentId", function (err, expId) {
                                if (expId) {
                                    Session.set("currentExperimentId", expId);
                                    redirect("/galileo/create?expid=" + expId);
                                } else {
                                    Meteor.call("galileo.tour.getSelectedIntuitionId", function (err, id) {
                                        if (id) {
                                            Meteor.call("galileo.intuition.getIntuitionById", id, function (err, intuition) {
                                                redirect("/galileo/create?int=" + encodeURI(intuition.intuition));
                                            });
                                        } else {
                                            redirect("/galileo/create");
                                        }
                                    });
                                }
                            });
                            break;
                        case "feedback":
                        case "pilot":
                            redirect("/galileo/browse");
                            break;
                        default:
                            redirect("/galileo/" + progress);
                            break;
                    }
                });
                break;
            case '/galileo/intro':
                if (Meteor.userId()) {
                    Meteor.call("galileo.tour.startTour");
                    Meteor.call("galileo.tour.finishIntro");
                }
                Blaze.render(Template.gaIntro, document.body);
                break;
            case '/galileo/pretest':
                Meteor.call("galileo.tour.canPretest", function (err, can) {
                    if (can) {
                        Blaze.render(Template.gaPreTest, document.body);
                    } else {
                        //Materialize.toast("You haven't finished intro yet", 10000, 'toast rounded');
                        redirect("/galileo/intro");
                    }
                });
                break;
            case '/galileo/intuition':
                Meteor.call("galileo.tour.canIntuition", function (err, can) {
                    Blaze.render(Template.gaIntuition, document.body);
                    if (can) {
                        // Blaze.render(Template.gaIntuition, document.body);
                    } else {
                        // Materialize.toast("You haven't finished pre-test yet", 10000, 'toast rounded');
                        //redirect("/galileo/pretest");
                    }
                });
                break;
            case '/galileo/intuition_board':
                Meteor.call("galileo.tour.canIntuitionBoard", function (err, can) {
                    Blaze.render(Template.gaIntuitionBoard, document.body);
                    if (can) {
                        //Blaze.render(Template.gaIntuitionBoard, document.body);
                    } else {
                       // redirect("/galileo/intuition");
                        //Materialize.toast("You haven't entered three intuitions yet", 10000, 'toast rounded');
                    }
                });
                break;
            case '/galileo/create':
                Meteor.call("galileo.tour.canCreate", function (err, can) {
                    if (can) {
                        Blaze.renderWithData(Template.gaCreateMain, function () {
                            if (params.has('int')) {
                                return {
                                    intuition: params.get('int')
                                };
                            } else if (params.has('intid')) {
                                return {
                                    intuitionId: params.get('intid')
                                };
                            } else if (params.has('expid')) {
                                return {
                                    expId: params.get('expid')
                                }
                            }
                        }, document.body);
                    } else {
                        redirect("/galileo/intuition_board");
                        //Materialize.toast("You haven't selected an intuition from the intuition board yet", 10000, 'toast rounded');
                    }
                });
                break;
            case '/galileo/feedback':
                if (Meteor.isClient) {
                    console.log('executing client');
                } else if (Meteor.isServer) {
                    console.log('executing server');
                }


                if (!Meteor.userId()) {
                    Blaze.renderWithData(Template.gaExperimentFeedback, function () {
                        return {
                            id: params.get('exp_id'),
                            guest_mode: true
                        }
                    }, document.body);
                } else {
                    Meteor.call("galileo.feedback.isFeedbacking", params.get('exp_id'), 'galileo/feedback routes', function (err, is) {
                        Meteor.call("galileo.experiments.isCreator", params.get('exp_id'), function (err, isCreator) {
                            if (Meteor.isClient) {
                                console.log('isFeedbacking executing client');
                            } else if (Meteor.isServer) {
                                console.log('isFeedbacking executing server');
                            }

                            if (is || isCreator || Meteor.userAsync().profile.is_admin) {
                                Blaze.renderWithData(Template.gaExperimentFeedback, function () {
                                    return {
                                        id: params.get('exp_id'),
                                    }
                                }, document.body);
                            } else {
                                Meteor.call("galileo.feedback.canFeedback", self.params.exp_id, function (err, can) {
                                    if (can) {
                                        Blaze.renderWithData(Template.gaFeedbackConsent, function () {
                                            return {
                                                id: params.get('exp_id'),
                                            }
                                        }, document.body);
                                    } else {
                                        if (err) {
                                            Materialize.toast(err.error, 5000, 'toast rounded', function () {
                                                //history.back();
                                                redirect("/galileo/browse");
                                            });
                                        } else {
                                            Materialize.toast("Sorry, you cannot give feedback to this experiment", 5000, 'toast rounded', function () {
                                                //history.back();
                                                redirect("/galileo/browse");
                                            });
                                        }
                                    }
                                });
                            }
                        });
                    });
                }
                break;
            case '/galileo/pilotFeedback':
                if (params.has("exp_id") && params.has("pilot_id")) {
                    Meteor.call("galileo.pilot.canUserSeePilotFeedback", params.get('exp_id'), self.params.pilot_id, function (err, result) {
                        if (result) {
                            Blaze.renderWithData(Template.gaExperimentFeedback, function () {
                                return {
                                    id: params.get('exp_id'),
                                    pilotId: params.get('pilot_id')
                                }
                            }, document.body);
                        } else {
                            let errorMsg = err;
                            if (!err) {
                                errorMsg = "Sorry, you cannot view this pilot feedback."
                            }
                            Materialize.toast("Error: " + errorMsg, 3000, "toast rounded", function () {
                                history.back();
                            });
                        }
                    });
                } else if (params.has("exp_id")) {
                    Meteor.call("galileo.pilot.hasPiloted", params.get('exp_id'), function (err, result) {
                        if (result) {
                            Blaze.renderWithData(Template.gaExperimentFeedback, function () {
                                return {
                                    id: params.get('exp_id'),
                                    pilotId: result
                                }
                            }, document.body);
                        } else {
                            let errorMsg = err;
                            if (!err) {
                                errorMsg = "Sorry, you cannot give pilot feedback to this experiment."
                            }
                            Materialize.toast("Error: " + errorMsg, 3000, "toast rounded", function () {
                                history.back();
                            });
                        }
                    });
                }
                break;
            case "/galileo/pilot":
                Meteor.call("galileo.pilot.canPilot", params.get('exp_id'), function (err, can) {
                    if (err) {
                        Materialize.toast("Error: " + err, 3000, "toast rounded");
                    } else {
                        Blaze.renderWithData(Template.gaPilot, function () {
                            return {
                                id: params.get('exp_id'),
                            }
                        }, document.body);
                    }
                });
                break;
            case "/galileo/run":
                Blaze.renderWithData(Template.gaRun, function () {
                    return {
                        id: params.get('exp_id'),
                    }
                }, document.body);
                break;
            case "/galileo/share/review":
                Blaze.render(Template.loading_wheel, document.body);
                if (!Meteor.userId()) {
                    Blaze.renderWithData(Template.gaFeedbackConsent, function () {
                        return {
                            id: params.get('exp_id'),
                            guest_mode: true
                        }
                    }, document.body);
                } else {
                    self.redirect('/galileo/feedback?exp_id=' + params.get('exp_id'));
                }
                break;
            case '/galileo/me':
                redirect('/galileo/me/dashboard');
                break;
            case '/galileo/me/dashboard':
                if (params.has('user_id') && params.has('exp_id')) {
                    $(document).ready(function () {
                        var isMobile = window.matchMedia("only screen and (max-width: 760px)");
                        if (isMobile.matches) {
                            Blaze.renderWithData(Template.gaMeDataSheet, function () {
                                return {
                                    exp_id: params.get('exp_id'),
                                    user_id: params.get('user_id')
                                }
                            }, document.body);
                        } else {
                            attemptUpdateProfile(function () {
                                redirect('/galileo/me/dashboard');
                            });
                        }
                    });
                }
                else if (params.has('user_id')) {
                    Blaze.render(Template.gaMeDashboard, document.body);
                } else {
                    Blaze.render(Template.gaMeDashboard, document.body);
                }
                break;
            case '/galileo/me/notification':
                Blaze.render(Template.gaMeNotification, document.body);
                break;
            case '/galileo/me/password':
                Blaze.render(Template.gaMePassword, document.body);
                break;
            case '/galileo/me/profile':
                Blaze.render(Template.gaMeProfile, document.body);
                break;
            case "/galileo/me/intuitions":
                Blaze.render(Template.gaMeIntuitions, document.body);
                break;
            case '/galileo/me/unfinished_experiments':
                Blaze.render(Template.gaMeUnfinishedExperiments, document.body);
                break;
            case '/galileo/me/created_experiments':
                Blaze.render(Template.gaMeCreatedExperiments, document.body);
                break;
            case '/galileo/me/reviewing_experiments':
                Blaze.render(Template.gaMeReviewingExperiments, document.body);
                break;
            case '/galileo/me/pilot_experiments':
                Blaze.render(Template.gaMePilotExperiments, document.body);
                break;
            case '/galileo/me/participating_experiments':
                Blaze.render(Template.gaMeParticipatingExperiments, document.body);
                break;
            case '/galileo/me/experiment':
                Meteor.call('galileo.run.isFailedCriteria', params.get('exp_id'), function (err, isFailedCriteria) {
                    if (isFailedCriteria) {
                        redirect("/galileo/join/failed?exp_id=" + params.get('exp_id'));
                    } else {
                        redirect("/galileo/me/experiment/info?exp_id" + params.get('exp_id'));
                    }
                })
                break;
            case '/galileo/me/experiment':
                let creatorID = "";
                Meteor.call("galileo.experiments.getExperiment", params.get('exp_id'), function (err, exp) {
                    if (err) {
                        Materialize.toast(err.error, 5000, 'toast rounded', function () {
                            redirect("/galileo/browse");
                        });
                    } else {
                        //console.log("setting creatorID to " + exp.user_id);
                        creatorID = exp.user_id;

                        if (self.params.section === "design") {
                            Meteor.call("galileo.experiments.isCreator", params.get('exp_id'), function (err, can) {
                                if (can || Meteor.userAsync().profile.is_admin) {
                                    Blaze.renderWithData(Template.gaExperimentFeedback, function () {
                                        //console.log("return creatorID to " + creatorID);
                                        return {
                                            id: params.get('exp_id'),
                                            expCreatorId: creatorID,
                                            guest_mode: false
                                        };
                                    }, document.body);
                                } else {
                                    redirect("/galileo/feedback?exp_id=" + params.get('exp_id'));
                                }
                            });
                        } else {
                            Blaze.renderWithData(Template.gaMeExperiment, function () {
                                return {
                                    id: params.get('exp_id'),
                                    section: params.get('section')
                                };
                            }, document.body);
                        }
                    }
                });
                break;
            case '/galileo/browse':
                if (!Meteor.userId()) {
                    redirect("/galileo/home");
                }
                else if (Meteor.user() && Meteor.user().profile) {
                    if (params.has('mendelcode') && params.get('mendelcode').length > 0) {
                        Blaze.render(Template.gaExperimentBoard, document.body);
                        localStorage.setItem("mendelcode_ga", params.get('mendelcode'));
                    }
                    else if (canGoToBrowse(user)) {
                        Blaze.render(Template.gaExperimentBoard, document.body);
                    }
                }

                break;
            case '/galileo/browse_flag':
                Blaze.renderWithData(Template.gaExperimentBoard, {
                    flag: true
                }, document.body);
                break; 
            case '/galileo/experiment':
                if (params.has('exp_id')) {
                    Blaze.renderWithData(Template.gaExperimentBoard, {
                        id: params.get('exp_id')
                    }, document.body);
                }
                break;
            case '/galileo/criteria':
                if (params.has('exp_id')) {
                    Blaze.renderWithData(Template.gaCheckCriteria, {
                        id: params.get('exp_id')
                    }, document.body);
                }
                break;
            case '/galileo/join':
                Meteor.call("galileo.run.canParticipate", params.get('exp_id'), function (err, can) {
                    if (params.has('exp_id')) {
                        if (!err && can) {
                            redirect('/galileo/join/criteria?exp_id=' + params.get('exp_id'));
                        } else if (err.error === ErrorMessage.IS_REVIEWER_CANNOT_JOIN) {
                            redirect('/galileo/join/failed?exp_id=' + params.get('exp_id'))
                        } else {
                            Meteor.call("galileo.run.getParticipantStatus", params.get('exp_id'), function (error, isParticipant) {
                                if ((isParticipant === ParticipationStatus.PASSED_CRITERIA || isParticipant === ParticipationStatus.PREPARING)) {
                                    redirect("/galileo/me/experiment/my_participation?exp_id=" + params.get('exp_id'));
                                } else if (isParticipant === ParticipationStatus.FAILED_CRITERIA) {
                                    redirect("/galileo/join/failed?exp_id=" + params.get('exp_id'));
                                } else if (isParticipant === ParticipationStatus.FINISHED) {
                                    redirect("/galileo/join/failedEnded?exp_id=" + params.get('exp_id'));
                                } else {
                                    redirect('/galileo/browse/');
                                }
                            });
                        }
                    }
                });
                break;
            case "/galileo/share/join":
                if (params.has('exp_id')) {
                    redirect('/galileo/join/criteria?exp_id=' + params.get('exp_id'));
                }
                break;
            case '/galileo/join/consent':
                if (params.has('exp_id')) {
                    Blaze.renderWithData(Template.gaJoinConsent, {
                        id: params.get('exp_id')
                    }, document.body);
                }
                break;
            case '/galileo/join/criteria':
                if (params.has('exp_id')) {
                    Blaze.renderWithData(Template.gaJoinCriteria, {
                        id: params.get('exp_id')
                    }, document.body);
                }
                break;
            case '/galileo/join/openhumansauth':
                if (params.has('exp_id')) {
                    Blaze.renderWithData(Template.gaOhAuth, {
                        id: params.get('exp_id')
                    }, document.body);
                }
                break;
            case "/galileo/join/failed":
                if (params.has('exp_id')) {
                    Blaze.renderWithData(Template.gaJoinFailed, {
                        id: params.get('exp_id')
                    }, document.body);
                }

                break;
            case "/galileo/join/failedEnded":
                if (params.has('expid')) {
                    console.log(params.expid);
                    Blaze.renderWithData(Template.gaJoinFailedEnded,
                        function () {
                            return {
                                id: params.get('expid'),
                            };
                        }, document.body);
                }
                break;
            case "/galileo/join/passed":
                if (params.has('exp_id')) {
                    redirect("/galileo/join/openhumansauth?exp_id=" + params.get('exp_id'));
                }
                break;
            case '/gafaqs':
                Blaze.render(Template.gaFaqs, document.body);
                break;
            case '/galileo/error':
                if (params.has('code') && params.has('msg')) { }
                Blaze.renderWithData(Template.gaError, {
                    code: params.get('code'),
                    msg: params.get('msg')
                }, document.body);
                break;
            default:
        }
    }, 100);
}

function attemptUpdateProfile(success, error) {
    if (Meteor.userId()) {
        Meteor.call('galileo.profile.hasProfile', function (err, has) {
            if (err) {
                error();
            } else {
                if (has) {
                    success();
                } else {
                    Meteor.call('galileo.profile.updateProfile', function (err, result) {
                        if (err) {
                            error();
                        } else {
                            success();
                        }
                    });
                }
            }
        });
    } else {
        success();
    }
}

function canGoToBrowse(user) {
    console.log("canGoToBrowse");
    console.log(user.profile);
    console.log(user.profile.consent_agreed);
    if (user) {
        if (!Meteor.user().profile.consent_agreed) {
            redirect('/galileo/consent');
            return false;
        }
        if (!Meteor.user().profile.toured.username_page) {
            //Materialize.toast("Please set a username before proceeding", 10000, 'toast rounded');
            redirect('/galileo/username');
            return false;
        }
        return true;
    }

    return false;
}

function toCamelCase(str) {
    let words = str.split("_");
    for (let i = 0; i < words.length; i++) {
        words[i] = words[i].charAt(0).toUpperCase() + words[i].substring(1);
    }
    return words.join("");
}