// galileo routes
import {
    ParticipationStatus,
    ErrorMessage
} from './ga-models/constants';
import './ga-routes2.js';



Router.route('/galileo', {
    name: 'galileo',
    action: function() {
        let self = this;
        let currentUser = Meteor.userId();

        // // check if user has ongoing exp
        Meteor.call('galileo.profile.getRelativeExperiments', currentUser, function(err, result) {
            console.log("relative");
            console.log(result);
            if (result !== undefined && result.length > 0) {
                let expId = result[0]._id;
                self.redirect('/galileo/me/dashboard');
            } else {
                console.log("enterd")
                self.redirect('/galileo/browse');
            }
        });
        /*
        // check if user has participating exp
        Meteor.call('galileo.experiments.getParticipatingExpByUser', currentUser, function(err, result) {
            console.log("participating");
            console.log(result);
            if (result !== undefined && result.length >= 0){
                let expId = result[0]._id;
                self.redirect('/galileo/me/dashboard');
            }
        });
        
        // check if user has under review exp
        Meteor.call("galileo.experiments.getExperimentsWithReviewData", currentUser, function(err, result) {
            console.log("get exp result");
            console.log(result)
            if (result !== undefined && result.length >= 0){
                let expId = result[0]._id;
                self.redirect('/galileo/me/experiment/' + expId + '/design');
            } else {
                self.redirect('/galileo/me/dashboard');
            }
        });
        
        // check if user has any other exp
        Meteor.call('galileo.experiments.getExperimentsByUser', currentUser, function (err, result) {
            console.log("get exp by user");
            console.log(result)
            if (result !== undefined && result.length >= 0) {
                self.redirect('/galileo/me/dashboard');
            } else {
                self.redirect('/galileo/entrance');
            }
        });

        Meteor.call("galileo.tour.startedTouring", function (err, started) {
            console.log("touring");
            console.log(started)
            if (started) {
                Meteor.call("galileo.tour.finishedTouring", function (err, finished) {
                    if (finished) {
                        self.redirect("/galileo/me");
                    }
                    else {
                        self.redirect("/galileo/landing");
                    }
                });
            }
            else {
                self.redirect("/galileo/landing");
            }
        })
        */
    }
});

// --------------- DEVELOPER CONSOLE ----------------------
Router.route('/galileo/console', {
    name: "galileo.console",
    action: function() {
        this.render("gaConsole");
    }
});
// --------------- DEVELOPER CONSOLE ----------------------

Router.route('/galileo/home', {
    name: 'galileo.home',
    action: function() {
        this.render("gaHome");
    }
});

Router.route('/galileo/blog/why-exp', {
    name: 'galileo.blog.why-exp',
    action: function() {
        this.redirect('/galileo/blog/tutorial');
    }
});

Router.route('/galileo/blog/why-exp-openhumans', {
    name: 'galileo.blog.why-exp-openhumans',
    action: function() {
        this.render("gabWhyExpOH");
    }
});

Router.route('/galileo/blog/why-exp-lyme', {
    name: 'galileo.blog.why-exp-lyme',
    action: function() {
        this.render("gabWhyExpLyme");
    }
});

Router.route('/galileo/blog/why-exp-beer', {
    name: 'galileo.blog.why-exp-beer',
    action: function() {
        this.render("gabWhyExpBeer");
    }
});

Router.route('/galileo/blog/why-exp-nerdnite', {
    name: 'galileo.blog.why-exp-nerdnite',
    action: function() {
        this.render("gabWhyExpNerdNite");
    }
});

Router.route('/galileo/blog/why-exp-probiotics', {
    name: 'galileo.blog.why-exp-probiotics',
    action: function() {
        this.render("gabWhyProbiotics");
    }
});

Router.route('/galileo/blog/why-exp-spice', {
    name: 'galileo.blog.why-exp-spice',
    action: function() {
        this.render("gabWhyExpSpice");
    }
});

Router.route('/galileo/blog/why-exp-circadian', {
    name: 'galileo.blog.why-exp-circadian',
    action: function() {
        this.render("gabWhyExpCircadian");
    }
});

Router.route('/galileo/blog/why-exp-kombucha', {
    name: 'galileo.blog.why-exp-kombucha',
    action: function() {
        this.render("gabWhyExpKombucha");
    }
});

Router.route('/galileo/blog/why-exp-t1d', {
    name: 'galileo.blog.why-exp-T1D',
    action: function() {
        this.render("gabWhyExpT1D");
    }
});

Router.route('/galileo/blog/why-exp-kefir', {
    name: 'galileo.blog.why-exp-kefir',
    action: function() {
        this.render("gabWhyExpKefir");
    }
});

Router.route('/galileo/blog/why-exp-agp', {
    name: 'galileo.blog.why-exp-agp',
    action: function() {
        this.render("gabWhyExpAGP");
    }
});

Router.route('/galileo/blog/why-exp-gut-check', {
    name: 'galileo.blog.why-exp-gut-check',
    action: function() {
        this.render("gabWhyExpGutCheck");
    }
});

Router.route('/galileo/blog/why-exp-soylent', {
    name: 'galileo.blog.why-exp-soylent',
    action: function() {
        this.render("gabWhyExpSoylent");
    }
});

Router.route('/galileo/blog/why-exp-diet', {
    name: 'galileo.blog.why-exp-diet',
    action: function() {
        this.render("gabWhyExpDiet");
    }
});

Router.route('/galileo/blog/tutorial', {
    name: 'galileo.blog.tutorial',
    action: function() {
        this.render("gabTutorial");
    }
});

Router.route('/galileo/entrance', {
    name: 'galileo.entrance',
    action: function() {
        this.render("gaEntrance");
    }
});

Router.route('/galileo/landing', {
    name: 'galileo.landing',
    action: function() {
        this.render("gaLanding");
    }
    //commented out by vineet
    //self.redirect("/galileo/browse");
});


Router.route("/galileo/tour", {
    name: 'galileo.tour',
    action: function() {
        let self = this;
        Meteor.call("galileo.tour.getProgress", function(err, progress) {
            switch (progress) {
                case "create":
                    Meteor.call("galileo.tour.getDesignedExperimentId", function(err, expId) {
                        if (expId) {
                            Session.set("currentExperimentId", expId);
                            self.redirect("/galileo/create?expid=" + expId);
                        } else {
                            Meteor.call("galileo.tour.getSelectedIntuitionId", function(err, id) {
                                if (id) {
                                    Meteor.call("galileo.intuition.getIntuitionById", id, function(err, intuition) {
                                        self.redirect("/galileo/create?int=" + encodeURI(intuition.intuition));
                                    });
                                } else {
                                    self.redirect("/galileo/create");
                                }
                            });
                        }
                    });
                    break;
                case "feedback":
                case "pilot":
                    self.redirect("/galileo/browse");
                    break;
                default:
                    self.redirect("/galileo/" + progress);
                    break;
            }
        });
    }
});

Router.route('/galileo/intro', {
    name: "galileo.intro",
    action: function() {
        if (Meteor.userId()) {
            Meteor.call("galileo.tour.startTour");
            Meteor.call("galileo.tour.finishIntro");
        }
        this.render("gaIntro");
    }
});

Router.route('/galileo/pretest', {
    name: 'galileo.pretest',
    action: function() {
        let self = this;
        Meteor.call("galileo.tour.canPretest", function(err, can) {
            if (can) {
                self.render("gaPreTest");
            } else {
                Materialize.toast("You haven't finished intro yet", 10000, 'toast rounded');
                self.redirect("/galileo/intro");
            }
        });
    }
});

Router.route('/galileo/intuition', {
    name: 'galileo.intuition',
    action: function() {
        let self = this;
        Meteor.call("galileo.tour.canIntuition", function(err, can) {
            if (can) {
                self.render("gaIntuition");
            } else {
                Materialize.toast("You haven't finished pre-test yet", 10000, 'toast rounded');
                self.redirect("/galileo/pretest");
            }
        });
    }
});

Router.route('/galileo/intuition_board', {
    name: 'galileo.intuitionBoard',
    action: function() {
        let self = this;
        Meteor.call("galileo.tour.canIntuitionBoard", function(err, can) {
            if (can) {
                self.render("gaIntuitionBoard");
            } else {
                Materialize.toast("You haven't entered three intuitions yet", 10000, 'toast rounded');
                self.redirect("/galileo/intuition");
            }
        });
    }
});

// Router.route('/galileo/ethics', {
//     name: 'galileo.ethics',
//     action: function () {
//         let self = this;
//         Meteor.call("galileo.profile.hasFinishedEthics", function (err, finished) {
//             if (finished) {
//                 self.redirect("/galileo/create");
//             }
//             else {
//                 self.render('gaEthics');
//             }
//         });
//     }
// });

// Router.route("/galileo/pre_create", {
//     name: 'galileo.preCreate',
//     action: function () {
//         this.render("gaPreCreate");
//     }
// });

Router.route('/galileo/create', {
    name: 'galileo.create',
    action: function() {
        let self = this;
        Meteor.call("galileo.tour.canCreate", function(err, can) {
            if (can) {
                self.render("gaCreateMain", {
                    data: function() {
                        if (self.params.query.int) {
                            return {
                                intuition: self.params.query.int
                            };
                        } else if (self.params.query.intid) {
                            return {
                                intuitionId: self.params.query.intid
                            };
                        } else if (self.params.query.expid) {
                            return {
                                expId: self.params.query.expid
                            }
                        }
                    }
                });
            } else {
                self.redirect("/galileo/intuition_board");
                Materialize.toast("You haven't selected an intuition from the intuition board yet", 10000, 'toast rounded');
            }
        });
    }
});

Router.route('/galileo/feedback/:exp_id', {
    name: 'galileo.experiment.feedback',
    action: function() {
        let self = this;

        // TODO: these routes are executed client side, they cause methods to be called again and again and slow down the app
        // TODO: OPTIMIZE
        if (Meteor.isClient) {
            console.log('executing client');
        } else if (Meteor.isServer) {
            console.log('executing server');
        }


        if (!Meteor.userId()) {
            self.render("gaExperimentFeedback", {
                data: function() {
                    return {
                        id: self.params.exp_id,
                        guest_mode: true
                    }
                }
            });
        } else {
            Meteor.call("galileo.feedback.isFeedbacking", self.params.exp_id, 'galileo/feedback routes', function(err, is) {
                Meteor.call("galileo.experiments.isCreator", self.params.exp_id, function(err, isCreator) {
                    if (Meteor.isClient) {
                        console.log('isFeedbacking executing client');
                    } else if (Meteor.isServer) {
                        console.log('isFeedbacking executing server');
                    }

                    if (is || isCreator || Meteor.user().profile.is_admin) {
                        self.render("gaExperimentFeedback", {
                            data: function() {
                                return {
                                    id: self.params.exp_id
                                }
                            }
                        });
                    } else {
                        Meteor.call("galileo.feedback.canFeedback", self.params.exp_id, function(err, can) {
                            if (can) {
                                self.render("gaFeedbackConsent", {
                                    data: function() {
                                        return {
                                            id: self.params.exp_id
                                        };
                                    }
                                });
                            } else {
                                if (err) {
                                    Materialize.toast(err.error, 5000, 'toast rounded', function() {
                                        //history.back();
                                        self.redirect("/galileo/browse");
                                    });
                                } else {
                                    Materialize.toast("Sorry, you cannot give feedback to this experiment", 5000, 'toast rounded', function() {
                                        //history.back();
                                        self.redirect("/galileo/browse");
                                    });
                                }
                            }
                        });
                    }
                });
            });
        }
    }
});


//added for feedbackPilot
Router.route('/galileo/pilotFeedback/:exp_id', {
    name: 'galileo.experiment.pilotFeedback',
    action: function() {
        let self = this;
        Meteor.call("galileo.pilot.hasPiloted", self.params.exp_id, function(err, result) {
            if (result) {
                self.render("gaExperimentFeedback", {
                    data: function() {
                        return {
                            id: self.params.exp_id,
                            pilotId: result
                        }
                    }
                });
            } else {
                let errorMsg = err;
                if (!err) {
                    errorMsg = "Sorry, you cannot give pilot feedback to this experiment."
                }
                Materialize.toast("Error: " + errorMsg, 3000, "toast rounded", function() {
                    history.back();
                });
            }
        });
    }
});

// Route for creator of experiment to see pilot feedback
Router.route('/galileo/pilotFeedback/:exp_id/:pilot_id', {
    name: 'galileo.experiment.viewPilotFeedback',
    action: function() {
        let self = this;
        Meteor.call("galileo.pilot.canUserSeePilotFeedback", self.params.exp_id, self.params.pilot_id, function(err, result) {
            if (result) {
                self.render("gaExperimentFeedback", {
                    data: function() {
                        return {
                            id: self.params.exp_id,
                            pilotId: self.params.pilot_id
                        }
                    }
                });
            } else {
                let errorMsg = err;
                if (!err) {
                    errorMsg = "Sorry, you cannot view this pilot feedback."
                }
                Materialize.toast("Error: " + errorMsg, 3000, "toast rounded", function() {
                    history.back();
                });
            }
        });
    }
});


Router.route("/galileo/pilot/:exp_id", {
    name: 'galileo.pilot',
    action: function() {
        let self = this;
        Meteor.call("galileo.pilot.canPilot", this.params.exp_id, function(err, can) {
            if (err) {
                Materialize.toast("Error: " + err, 3000, "toast rounded");
            } else {
                self.render("gaPilot", {
                    data: function() {
                        return {
                            id: self.params.exp_id
                        }
                    }
                });
            }
        });
    }
});

Router.route("/galileo/run/:exp_id", {
    name: "galileo.run",
    action: function() {
        let self = this;
        self.render("gaRun", {
            data: function() {
                return {
                    id: self.params.exp_id
                }
            }
        });
    }
});

Router.route("/galileo/share/review/:exp_id", {
    name: "galileo.share.review",
    action: function() {
        this.render("loading_wheel");

        let self = this;
        if (!Meteor.userId()) {
            self.render("gaFeedbackConsent", {
                data: function() {
                    return {
                        id: self.params.exp_id,
                        guest_mode: true
                    };
                }
            });
        } else {
            self.redirect('/galileo/feedback/' + self.params.exp_id);
        }
    }
});

Router.route('/galileo/me', {
    name: 'galileo.me',
    action: function() {
        this.redirect('/galileo/me/dashboard');
    }
});

Router.route('/galileo/me/dashboard', {
    name: 'galileo.me.dashboard',
    action: function() {
        let self = this;
        attemptUpdateProfile(function() {
            self.render('gaMeDashboard');
        });
    }
});

Router.route('/galileo/me/dashboard/:user_id', {
    name: 'galileo.me.dashboard.user',
    action: function() {
        let self = this;
        self.render('gaMeDashboard');
    }
});

Router.route('/galileo/me/dashboard/:exp_id/:user_id', {
    name: 'galileo.me.datasheet',
    action: function() {
        let self = this;
        $(document).ready(function() {
            var isMobile = window.matchMedia("only screen and (max-width: 760px)");

            if (isMobile.matches) {
                self.render("gaMeDataSheet", {
                    data: function() {
                        return {
                            exp_id: self.params.exp_id,
                            user_id: self.params.user_id
                        }
                    }
                });
            } else {
                attemptUpdateProfile(function() {
                    self.redirect('/galileo/me/dashboard');
                });
            }
        });
    }
});

Router.route('/galileo/me/notification', {
    name: 'galileo.me.notification',
    action: function() {
        this.render("gaMeNotification");
    }
});

Router.route('/galileo/me/password', {
    name: 'galileo.me.password',
    action: function() {
        this.render('gaMePassword');
    }
});

Router.route('/galileo/me/profile', {
    name: 'galileo.me.profile',
    action: function() {
        this.render('gaMeProfile');
    }
});

Router.route("/galileo/me/intuitions", {
    name: 'galileo.me.intuitions',
    action: function() {
        this.render("gaMeIntuitions");
    }
});

Router.route('/galileo/me/unfinished_experiments', {
    name: 'galileo.me.unfinishedExperiments',
    action: function() {
        this.render('gaMeUnfinishedExperiments');
    }
});

Router.route('/galileo/me/created_experiments', {
    name: 'galileo.me.createdExperiments',
    action: function() {
        this.render('gaMeCreatedExperiments');
    }
});

Router.route('/galileo/me/reviewing_experiments', {
    name: 'galileo.me.reviewingExperiments',
    action: function() {
        this.render('gaMeReviewingExperiments');
    }
});

Router.route('/galileo/me/pilot_experiments', {
    name: 'galileo.me.pilotExperiments',
    action: function() {
        this.render('gaMePilotExperiments');
    }
});

Router.route('/galileo/me/participating_experiments', {
    name: 'galileo.me.participatingExperiments',
    action: function() {
        this.render('gaMeParticipatingExperiments');
    }
});

Router.route('/galileo/me/experiment/:exp_id', {
    name: 'galileo.me.experiment',
    action: function() {
        let self = this;
        Meteor.call('galileo.run.isFailedCriteria', self.params.exp_id, function(err, isFailedCriteria) {
            if (isFailedCriteria) {
                self.redirect("/galileo/join/failed/" + self.params.exp_id);
            } else {
                self.redirect("/galileo/me/experiment/" + self.params.exp_id + "/info");
            }
        })
    }
});

function toCamelCase(str) {
    let words = str.split("_");
    for (let i = 0; i < words.length; i++) {
        words[i] = words[i].charAt(0).toUpperCase() + words[i].substring(1);
    }
    return words.join("");
}

Router.route('/galileo/me/experiment/:exp_id/:section', {
    name: 'galileo.me.experiment.section',
    action: function() {
        let creatorID = "";
        let self = this;

        Meteor.call("galileo.experiments.getExperiment", self.params.exp_id, function(err, exp) {
            if (err) {
                Materialize.toast(err.error, 5000, 'toast rounded', function() {
                    self.redirect("/galileo/browse");
                });
            } else {
                //console.log("setting creatorID to " + exp.user_id);
                creatorID = exp.user_id;

                if (self.params.section === "design") {
                    Meteor.call("galileo.experiments.isCreator", self.params.exp_id, function(err, can) {
                        if (can || Meteor.user().profile.is_admin) {
                            self.render("gaExperimentFeedback", {
                                data: function() {
                                    //console.log("return creatorID to " + creatorID);
                                    return {
                                        id: self.params.exp_id,
                                        expCreatorId: creatorID,
                                        guest_mode: false
                                    };
                                }
                            });
                        } else {
                            self.redirect("/galileo/feedback/" + self.params.exp_id);
                        }
                    });
                } else {
                    self.render('gaMeExperiment' + toCamelCase(self.params.section), {
                        data: function() {
                            return {
                                id: self.params.exp_id,
                                section: self.params.section
                            };
                        }
                    });
                }
            }
        });
    }
});

Router.route('/galileo/browse', {
    name: 'galileo.browse',
    action: function() {
        // have to pass "this" for redirection
        if (canGoToBrowse(this)) {
            this.render('gaExperimentBoard');
        }
    }
});

Router.route('/galileo/browse_flag', {
    name: 'galileo.browse_flag',
    action: function() {
        this.render('gaExperimentBoard', {
            data: function() {
                return {
                    flag: true
                }
            }
        });
    }
});

Router.route('/galileo/browse/:mendelcode', {
    name: 'galileo.browse.mendel',
    action: function() {
        let self = this;
        // have to pass "this" for redirection
        if (canGoToBrowse(this)) {
            this.render('gaExperimentBoard');
            if (self.params.mendelcode.length > 0) {
                localStorage.setItem("mendelcode_ga",self.params.mendelcode);
            }
        }
    }
});


function canGoToBrowse(thisRouter) {
    let user = Meteor.user();
    if (user) {
        if (!user.profile.consent_agreed) {
            thisRouter.redirect('/galileo/consent');
            return false;
        }
        if (!user.username) {
            Materialize.toast("Please set a username before proceeding", 10000, 'toast rounded');
            thisRouter.redirect('/galileo/username');
            return false;
        }
    }

    return true;
}

Router.route('/galileo/experiment/:exp_id', {
    name: 'galileo.experiment',
    template: 'gaExperiment',
    data: function() {
        return {
            id: this.params.exp_id
        };
    }
});

Router.route('/galileo/criteria/:exp_id', {
    name: 'galileo.criteria',
    template: 'gaCheckCriteria',
    data: function() {
        return {
            id: this.params.exp_id
        };
    }
});


Router.route('/galileo/join/:exp_id', {
    name: 'galileo.join',
    action: function() {
        let self = this;
        Meteor.call("galileo.run.canParticipate", self.params.exp_id, function(err, can) {
            if (!err && can) {
                self.redirect('/galileo/join/criteria/' + self.params.exp_id);
            } else if (err.error === ErrorMessage.IS_REVIEWER_CANNOT_JOIN) {
                self.redirect('/galileo/join/failed/' + self.params.exp_id)
            } else {
                Meteor.call("galileo.run.getParticipantStatus", self.params.exp_id, function(error, isParticipant) {
                    if ((isParticipant === ParticipationStatus.PASSED_CRITERIA || isParticipant === ParticipationStatus.PREPARING)) {
                        self.redirect("/galileo/me/experiment/" + self.params.exp_id + "/my_participation");
                    } else if (isParticipant === ParticipationStatus.FAILED_CRITERIA) {
                        self.redirect("/galileo/join/failed/" + self.params.exp_id);
                    } else if (isParticipant === ParticipationStatus.FINISHED) {
                        self.redirect("/galileo/join/failedEnded/" + self.params.exp_id);
                    } else {
                        self.redirect('/galileo/browse/');
                    }
                });
            }
        });
    }
});

Router.route("/galileo/share/join/:exp_id", {
    name: "galileo.share.join",
    action: function() {
        let self = this;
        this.redirect('/galileo/join/criteria/' + self.params.exp_id);
    }
});

Router.route('/galileo/join/consent/:exp_id', {
    name: 'galileo.join.consent',
    template: 'gaJoinConsent',
    data: function() {
        return {
            id: this.params.exp_id
        };
    }
});

Router.route('/galileo/join/criteria/:exp_id', {
    name: 'galileo.join.criteria',
    template: 'gaJoinCriteria',
    action: function() {
        let self = this;
        self.render("gaJoinCriteria");
    },
    data: function() {
        return {
            id: this.params.exp_id
        };
    }
});

Router.route('/galileo/join/openhumansauth/:exp_id', {
    name: 'galileo.join.ohAuth',
    template: 'gaOhAuth',
    action: function() {
        this.render('gaOhAuth');
    },
    data: function() {
        return {
            id: this.params.exp_id
        };
    }
});

Router.route("/galileo/join/failed/:exp_id", {
    name: 'galileo.join.failed',
    template: 'gaJoinFailed',
    data: function() {
        return {
            id: this.params.exp_id
        };
    }
});

Router.route("/galileo/join/failedEnded/:exp_id", {
    name: 'galileo.join.failedEnded',
    template: 'gaJoinFailedEnded',
    data: function() {
        return {
            id: this.params.exp_id
        };
    }
});

Router.route("/galileo/join/passed/:exp_id", {
    name: "galileo.join.passed",
    action: function() {
        let self = this;
        self.redirect("/galileo/join/openhumansauth/" + self.params.exp_id);
    }
});

Router.route('/gafaqs', function() {
    this.render('gaFaqs');
});

Router.route('/galileo/error', {
    name: 'galileo.error',
    template: 'gaError',
    data: function() {
        return {
            code: this.params.query.code,
            msg: this.params.query.msg
        };
    }
});


function attemptUpdateProfile(success, error) {
    if (Meteor.userId()) {
        Meteor.call('galileo.profile.hasProfile', function(err, has) {
            if (err) {
                error();
            } else {
                if (has) {
                    success();
                } else {
                    Meteor.call('galileo.profile.updateProfile', function(err, result) {
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