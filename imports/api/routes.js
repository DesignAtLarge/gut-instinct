import {
    UserMetrics,
    UserEmail,
    UserTestResponse
} from './models.js';
import './ga-routes.js';

Router.route('/', function() {
    this.redirect('/galileo');
    /*
    // TUSHAR COMMENTED ALL TO HANDLE GALILEO ROUTES, UNCOMMENT BELOW FOR DOCENT

    if (Meteor.user()){
        if (!Meteor.user().profile.consent_agreed) {
            this.redirect('consent');
        } else {

            if (!Meteor.user().profile.toured.username_page) {
                this.redirect('/username');
            } else if (!Meteor.user().profile.took_pretest) {
                this.redirect('/trial');
            //} else if (Meteor.user().profile.questions.length == 1 && Meteor.user().profile.intro_completed) {
                // this.redirect('/addq');
                // setTimeout(function function_name(argument) {
                //     Materialize.toast('You need to add one other question before accessing the entire Gut Instinct content', 4000, 'toast');
                // }, 1000);
            } else {
                if (!Meteor.user().profile.intro_completed){
                    //this.redirect('intro');
                    //this.render('gutboard_slider');
                    //

                    let docentProgress = localStorage.getItem("docentProgress")
                    if (docentProgress && (docentProgress == 25 || docentProgress == 50)) {
                        this.redirect('/t/introduction');
                        setTimeout(function function_name(argument) {
                            Materialize.toast('You need to finish this quick guide before accessing the entire Gut Instinct content', 4000, 'toast');
                        }, 1500);
                        //window.location.replace('/t/introduction')
                        return;
                    }
                    if (docentProgress && docentProgress == 85) {
                        this.redirect('gutboard_slider_addq');
                        setTimeout(function function_name(argument) {
                            Materialize.toast('You need to finish this quick guide before accessing the entire Gut Instinct content', 4000, 'toast');
                        }, 1500);
                        //window.location.replace('/gutboard_slider_addq');
                        return;
                    }
                    this.redirect('/guide');
                    setTimeout(function function_name(argument) {
                        Materialize.toast('You need to finish this quick guide before accessing the entire Gut Instinct content', 4000, 'toast');
                    }, 1000);
                    return;
                }
                else {
                    if (Meteor.user().profile.condition == 7) this.redirect('/topics');
                    else this.redirect('gutboard');
                    //alert("guide completed");
                }
            }
            //this.redirect('gutboard');
        }
    }
    else {
        console.log("Meteor-user0");
    }
    */
});

Router.route('/login-admin', function() {
    if (!Meteor.user()) {
        this.render('login');
    } else {
        this.redirect('consent');
    }
});


Router.route('/signup', function() {
    if (!Meteor.user()) {
        this.render('signup');
    } else {
        this.render("loading_wheel");
        // Tushar hardcoded to route into /galileo space
        this.redirect('/galileo/consent');
    }
});


// TEMP LANDING ROUTE, change once ready
Router.route('/login-admin1', function() {
    if (!Meteor.user()) {
        this.render('new_login');
    } else {
        this.redirect('consent');
    }
});

Router.route('/consent', function() {
    if (!Meteor.user().profile.consent_agreed) {
        Meteor.call("galileo.profile.updateProfile");
        this.render('consent');
    } else {
        this.redirect('/intro');
    }
});

Router.route('/tutorial', function() {
    this.render('tutorial');
});

Router.route('/gutboard', function() {
    try {
        if (Meteor.user() && !Meteor.user().profile.consent_agreed) {
            this.redirect('consent');
            return;
        }
        if (Meteor.user() && !Meteor.user().profile.toured.username_page) {
            this.redirect('/username');
            return;
        }
        if (Meteor.user() && !Meteor.user().profile.took_pretest) {
            this.redirect('/trial');
            return;
        }
        if (Meteor.user() && !Meteor.user().profile.intro_completed) {
            //this.redirect('intro');
            //this.render('gutboard_slider');
            //

            let docentProgress = localStorage.getItem("docentProgress")
            if (docentProgress && (docentProgress == 25 || docentProgress == 50)) {
                this.redirect('/t/introduction');
                setTimeout(function function_name(argument) {
                    Materialize.toast('You need to finish this quick guide before accessing the entire Gut Instinct content', 4000, 'toast');
                }, 1500);
                //window.location.replace('/t/introduction')
                return;
            }
            if (docentProgress && docentProgress == 85) {
                this.redirect('gutboard_slider_addq');
                setTimeout(function function_name(argument) {
                    Materialize.toast('You need to finish this quick guide before accessing the entire Gut Instinct content', 4000, 'toast');
                }, 1500);
                //window.location.replace('/gutboard_slider_addq');
                return;
            }
            this.redirect('/guide');
            setTimeout(function function_name(argument) {
                Materialize.toast('You need to finish this quick guide before accessing the entire Gut Instinct content', 4000, 'toast');
            }, 1000);
            return;
        }
        // if (Meteor.user() && Meteor.user().profile.questions.length == 1 && Meteor.user().profile.intro_completed) {
        //     this.redirect('/addq');
        //     setTimeout(function function_name(argument) {
        //         Materialize.toast('You need to add one other question before accessing the entire Gut Instinct content', 4000, 'toast');
        //     }, 1000);
        //     return;
        // }
        if (Meteor.user() && Meteor.user().profile.condition != 7)
            this.render('gutboard_slider', {
                data: function() {
                    return {
                        mendelcode: "AmericanGutProject"
                    };
                }
            });
    } catch (e) {}
});

Router.route('/gutboard/:mendelcode', function() {
    try {
        if (Meteor.user() && !Meteor.user().profile.consent_agreed) {
            this.redirect('consent');
            return;
        }
        if (Meteor.user() && !Meteor.user().profile.toured.username_page) {
            this.redirect('/username');
            return;
        }
        if (Meteor.user() && !Meteor.user().profile.took_pretest) {
            this.redirect('/trial');
            return;
        }
        if (Meteor.user() && !Meteor.user().profile.intro_completed) {
            this.redirect('/guide');
            setTimeout(function function_name(argument) {
                Materialize.toast('You need to finish this quick guide before accessing the entire Gut Instinct content', 4000, 'toast');
            }, 1000);
            return;
        }
        // if (Meteor.user() && Meteor.user().profile.questions.length == 1 && Meteor.user().profile.intro_completed) {
        //     this.redirect('/addq');
        //     setTimeout(function function_name(argument) {
        //         Materialize.toast('You need to add one other question before accessing the entire Gut Instinct content', 4000, 'toast');
        //     }, 1000);
        //     return;
        // }
        if (Meteor.user() && Meteor.user().profile.condition != 7)
            this.render('gutboard_slider', {
                data: function() {
                    return {
                        mendelcode: this.params.mendelcode
                    };
                }
            });
    } catch (e) {}
});

Router.route('/gutboard/:mendelcode/search', {
    template: 'gutboard_search',
    data: function() {
        return {
            mendelcode: this.params.mendelcode,
            searchQuery: this.params.query.q
        };
    }
});

Router.route('/addq', function() {
    try {
        if (Meteor.user() && !Meteor.user().profile.consent_agreed) {
            this.redirect('consent');
            return;
        }
        if (Meteor.user() && !Meteor.user().profile.toured.username_page) {
            this.redirect('/username');
            return;
        }
        if (Meteor.user() && !Meteor.user().profile.took_pretest) {
            this.redirect('/trial');
            return;
        }

        if (Meteor.user() && Meteor.user().profile.intro_completed && !Meteor.user().profile.guide_completed && Meteor.user().profile.condition == 10 && Meteor.user().profile.condition == 11) {
            this.redirect('/guide');
            setTimeout(function function_name(argument) {
                Materialize.toast('Before asking more questions, just complete this quick guide about asking useful questions', 5000, 'toast');
            }, 1000);
            return;
        }

        if (Meteor.user() && Meteor.user().profile.condition != 7)
            this.render('gutboard_slider_addq');
    } catch (e) {}
});

Router.route('/gutboard_slider_addq', function() {
    try {
        if (Meteor.user() && !Meteor.user().profile.consent_agreed) {
            this.redirect('consent');
            return;
        }
        if (Meteor.user() && !Meteor.user().profile.toured.username_page) {
            this.redirect('/username');
            return;
        }
        if (Meteor.user() && !Meteor.user().profile.took_pretest) {
            this.redirect('/trial');
            return;
        }

        if (Meteor.user() && Meteor.user().profile.intro_completed && !Meteor.user().profile.guide_completed) {
            this.redirect('/guide');
            setTimeout(function function_name(argument) {
                Materialize.toast('Before asking more questions, just complete this quick guide about asking useful questions', 5000, 'toast');
            }, 1000);
            return;
        }

        if (Meteor.user() && Meteor.user().profile.condition != 7)
            this.render('gutboard_slider_addq');
    } catch (e) {}
});

Router.route('/gutboard_old', function() {
    let username = Meteor.user().username;
    let condition = Meteor.user().profile.condition;

    if (condition == 1) {
        this.redirect('problems');
        return;
    }
    this.render('gutboard');
});

Router.route('/gutboard_slider', function() {

    if (Meteor.user()) {
        if (Meteor.user() && !Meteor.user().profile.consent_agreed) {
            this.redirect('consent');
            return;
        }
        if (Meteor.user() && !Meteor.user().profile.toured.username_page) {
            this.redirect('/username');
            return;
        }
        if (Meteor.user() && !Meteor.user().profile.took_pretest) {
            this.redirect('/trial');
            return;
        }
        if (Meteor.user() && !Meteor.user().profile.intro_completed) {
            //this.redirect('intro');
            //this.render('gutboard_slider');
            //

            let docentProgress = localStorage.getItem("docentProgress")
            if (docentProgress && (docentProgress == 25 || docentProgress == 50)) {
                this.redirect('/t/introduction');
                setTimeout(function function_name(argument) {
                    Materialize.toast('You need to finish this quick guide before accessing the entire Gut Instinct content', 4000, 'toast');
                }, 1500);
                //window.location.replace('/t/introduction')
                return;
            }
            if (docentProgress && docentProgress == 85) {
                this.redirect('gutboard_slider_addq');
                setTimeout(function function_name(argument) {
                    Materialize.toast('You need to finish this quick guide before accessing the entire Gut Instinct content', 4000, 'toast');
                }, 1500);
                //window.location.replace('/gutboard_slider_addq');
                return;
            }
            this.redirect('/guide');
            setTimeout(function function_name(argument) {
                Materialize.toast('You need to finish this quick guide before accessing the entire Gut Instinct content', 4000, 'toast');
            }, 1000);
            return;
        }
        // if (Meteor.user() && Meteor.user().profile.questions.length == 1 && Meteor.user().profile.intro_completed) {
        //     this.redirect('/addq');
        //     setTimeout(function function_name(argument) {
        //         Materialize.toast('You need to add one other question before accessing the entire Gut Instinct content', 4000, 'toast');
        //     }, 1000);
        //     return;
        // }
        let username = Meteor.user().username;
        let condition = Meteor.user().profile.condition;

        if (condition == 1 || condition == 8) {
            this.render('gutboard_slider');
            return;
        } else {
            if (!Meteor.user().profile.guide_completed) {
                //alert("guide not completed");
                //this.redirect('intro');
                this.redirect('/guide');
            } else {
                //alert("guide completed");
                //this.redirect('gutboard');
                this.render('gutboard_slider');
            }
        }
    } else {
        console.log("Meteor-userg");
    }
});

Router.route('/problems', function() {
    let condition = Meteor.user().profile.condition;

    if (condition != 1) {
        this.redirect('gutboard');
        return;
    }
    this.render('problems');
});

Router.route('/articles', function() {
    let condition = Meteor.user().profile.condition;

    if (condition != 2) {
        this.redirect('gutboard');
        return;
    }
    this.render('articles');
});

Router.route('/bookmark', function() {
    let condition = Meteor.user().profile.condition;

    if (false && condition != 1) {
        this.redirect('gutboard');
        return;
    }
    this.render('bookmark');
});

Router.route('/welcome', function() {

    setTimeout(function() {
        if (Meteor.user()) {
            let username = Meteor.user().username;
            // let fetchResult = UserEmail.findOne({"username": username});

            // if(fetchResult == undefined){
            //     this.render('welcome_step2');
            // }
            //docent-exp - needs to be fixed?
            // else{

            let TestResult = UserTestResponse.findOne({
                "username": username
            });
            if (TestResult == undefined) {
                this.redirect('/username');
            } else {
                this.redirect('/gutboard');
                // this.redirect('/t/introduction');
            }

            // }
        } else {
            console.log("Meteor-userw");
        }
    }.bind(this), 100)

});

Router.route('/welcome_uncheck', function() {
    // condition to db
    let currentUsername = Meteor.user().username;
    let fetchResult = UserEmail.findOne({
        "username": currentUsername
    });


    if (fetchResult == undefined) {
        let emailID = UserEmail.insert({
            username: currentUsername,
            agree: 0,
            email: "",
            agid: ""
        });
    }

    this.render('welcome');
});

Router.route('/welcome_step1', function() {
    this.redirect('welcome_step2');
});

Router.route('/username', function() {
    let inst = this;
    this.render('username');
});

Router.route('/telluswhatyouknownow', function() {
    this.render('telluswhatyouknownow');
});

Router.route('/trial', function() {
    try {
        if (Meteor.user() && !Meteor.user().profile.consent_agreed) {
            this.redirect('consent');
            return;
        }
        if (Meteor.user() && !Meteor.user().profile.toured.username_page) {
            this.redirect('/username');
            return;
        }
        if (Meteor.user()) {
            this.render('trial', {
                data: function() {
                    return {
                        type: "pre"
                    };
                }
            });
        }
    } catch (e) {}
});

Router.route('/survey', function() {
    try {
        if (Meteor.user() && !Meteor.user().profile.consent_agreed) {
            this.redirect('consent');
            return;
        }
        if (Meteor.user() && !Meteor.user().profile.toured.username_page) {
            this.redirect('/username');
            return;
        }
        if (Meteor.user()) {
            this.render('post_survey', {
                data: function() {
                    return {
                        type: "post"
                    };
                }
            });
        }
    } catch (e) {}
});

Router.route('/check', function() {
    try {
        if (Meteor.user() && !Meteor.user().profile.consent_agreed) {
            this.redirect('consent');
            return;
        }
        if (Meteor.user() && !Meteor.user().profile.toured.username_page) {
            this.redirect('/username');
            return;
        }
        if (Meteor.user()) {
            this.render('trial', {
                data: function() {
                    return {
                        type: "post"
                    };
                }
            });
        }
    } catch (e) {}
});

// Router.route('/trial', {
//     template: 'trial',
//     data: function() {
//         return { type: "pre" };
//     }
// });

// Router.route('/post_trial',  {
//     template: 'trial',
//     data: function() {
//         return { type: "post" };
//     }
// });

Router.route('/posttest', function() {
    this.render('posttest');
});

Router.route('/welcome_step2', function() {
    this.render('welcome_step2');
});


Router.route('/t/:name', function() {
    try {
        if (Meteor.user() && !Meteor.user().profile.consent_agreed) {
            this.redirect('consent');
            return;
        }
        if (Meteor.user() && !Meteor.user().profile.took_pretest) {
            this.redirect('/trial');
            return;
        }
        // if (Meteor.user() && Meteor.user().profile.questions.length == 1 && Meteor.user().profile.intro_completed) {
        //     this.redirect('/addq');
        //     setTimeout(function function_name(argument) {
        //         Materialize.toast('You need to add one other question before accessing the entire Gut Instinct content', 4000, 'toast');
        //     }, 1000);
        //     return;
        // }
        if (Meteor.user()) {
            this.render('tag', {
                data: function() {
                    try {
                        if (Meteor.user())
                            return {
                                name: this.params.name,
                                user: Meteor.user().username
                            };
                    } catch (e) {}
                }
            });
        }
    } catch (e) {}
});


Router.route('/personal_question/:name', {
    template: 'personal_tag_question',
    data: function() {
        return {
            name: this.params.name
        };
    }
});

Router.route('/personal/:name', {
    //docent-exp: ideally docent-exp should be implemented here but it's not
    //template: 'personal_question_bin',
    template: 'personal_tag_question',
    data: function() {
        return {
            name: this.params.name
        };
    }
});

Router.route('/guide_question', function() {
    try {
        if (Meteor.user() && !Meteor.user().profile.consent_agreed) {
            this.redirect('consent');
            return;
        }
        if (Meteor.user() && !Meteor.user().profile.took_pretest) {
            this.redirect('/trial');
            return;
        }
        if (Meteor.user()) {
            let username = Meteor.user().username;
            let condition = Meteor.user().profile.condition;
            //docent-exp: access guide only for cond 3 or 4
            if (condition == 3 || condition == 4 || condition == 5 || condition == 6 || condition == 0 || condition == 10 || condition == 11) {
                this.render('guide_question_info', {
                    data: function() {
                        return {
                            name: Meteor.user().username
                        };
                    }
                });
            }
        }
    } catch (e) {}
});

Router.route('/guide', function() {
    try {
        if (Meteor.user() && !Meteor.user().profile.consent_agreed) {
            this.redirect('consent');
            return;
        }
        if (Meteor.user() && !Meteor.user().profile.took_pretest) {
            this.redirect('/trial');
            return;
        }
        if (Meteor.user()) {
            let condition = Meteor.user().profile.condition;
            //if (condicondition == 3 || condition == 4 || condition == 0) {
            this.render('guide_question_welcome', {
                data: function() {
                    return {
                        name: Meteor.user().username
                    };
                }
            });
            // }
            // else {

            // }
            //this.render('guide_question_welcome');
        }
    } catch (e) {}
});

Router.route('/guide_bin', function() {
    this.render('guide_question_bin');
});

Router.route('/guide_result', function() {
    try {
        if (Meteor.user() && !Meteor.user().profile.consent_agreed) {
            this.redirect('consent');
            return;
        }
        if (Meteor.user() && !Meteor.user().profile.took_pretest) {
            this.redirect('/trial');
            return;
        }
        if (Meteor.user()) {
            let condition = Meteor.user().profile.condition;
            if (condition == 3 || condition == 4 || condition == 5 || condition == 6 || condition == 0 || condition == 10 || condition == 11) {
                this.render('guide_question_result');
            } else {

            }
        }
    } catch (e) {}
});

Router.route('/personal_welcome', function() {
    this.render('personal_question_bin');
});

Router.route('/q/:hashcode', {
    template: 'question',
    data: function() {
        return {
            hashcode: this.params.hashcode
        };
    }
});

Router.route('/p/:hashcode', {
    template: 'learn_problem',
    data: function() {
        return {
            hashcode: this.params.hashcode
        };
    }
});

Router.route('/logout', function() {
    let inst = this;
    Meteor.call('galileo.profile.setMendel', localStorage.getItem('mendelcode_ga'), function(error, result) {
        Meteor.logout(function(err) {
            if (err || error) console.log('Error loggin out!');
        });
        sessionStorage.clear();
        localStorage.clear();
        inst.redirect('/galileo/home');
    });

    this.render('loading_wheel');
}, {
    name: 'logout'
});

Router.route('/test', function() {
    this.render('test');
});

Router.route('/landing', function() {

    let landingURL = "";
    if (this.params.query.accessURL === '/login-bin/landing.html') {
        landingURL = '/login-bin';
    } else {
        landingURL = '/login-bin/landing.html?redirectAccess=' + this.params.query.accessURL;
    }

    /* /landing?condition= */
    //localStorage.setItem("condition", this.params.query.condition);

    this.redirect(landingURL);
});

Router.route('/intro', function() {
    try {
        if (Meteor.user() && !Meteor.user().profile.consent_agreed) {
            this.redirect('consent');
            return;
        }
        if (Meteor.user()) {
            let username = Meteor.user().username;
            let condition = Meteor.user().profile.condition;
            if (Meteor.user().profile.intro_completed) {
                this.redirect('/gutboard');
                return;
            }
            //docent-exp: fix all these conditions
            let redirectURL = "/intro-bin/intro.html";
            if (condition) {
                if (condition == 1 || condition == 8) redirectURL = "/intro-bin/index.html";
                if (condition == 2 || condition == 9) redirectURL = "/intro-bin/main.html";
                if (condition == 3 || condition == 5 || condition == 10) redirectURL = "/intro-bin/global.html";
                if (condition == 4 || condition == 6 || condition == 11) redirectURL = "/intro-bin/intro.html";
                if (condition == 7) redirectURL = "/intro-bin/introduction.html";
            }
            this.redirect(redirectURL);
        }
    } catch (e) {}
});

Router.route('/login-error', function() {

    this.redirect('/login-bin/landing.html?status=101');
});

Router.route('/login-process', function() {

    function promiseWait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    this.render("loading_wheel");
    //this.render('login-process');

    let username = CryptoJS.AES.decrypt(this.params.query.hWf5Ae4xvLMxSQYN, "82rSvyNZRpdvsEJw").toString(CryptoJS.enc.Utf8);
    let password = CryptoJS.AES.decrypt(this.params.query.FsheDddeK7c6UbEe, "82rSvyNZRpdvsEJw").toString(CryptoJS.enc.Utf8);

    let redirectRouting = this.params.query.redirectURL;

    let userRedirect = false;
    // sanity check
    if (redirectRouting != 'coldbrew') {
        userRedirect = true;
    }

    promiseWait(2000);

    Meteor.loginWithPassword(username, password, function(err) {
        if (err) {
            Router.go('/login-error');

        } else {

            if (!Meteor.user().profile.consent_agreed) {
                Router.go('/consent');
            } else {
                if (userRedirect) {
                    Router.go(redirectRouting);
                } else {
                    Router.go("/welcome");
                }
            }
        }
    });

});

Router.route('/entrance', function() {
    try {
        if (Meteor.user() && !Meteor.user().profile.consent_agreed) {
            this.redirect('consent');
            return;
        }
        if (Meteor.user()) {
            if (Meteor.user().profile.condition == 7 && Meteor.user().profile.guide_completed) this.redirect('/topics');
            else if (Meteor.user().profile.condition == 7 && !Meteor.user().profile.guide_completed) this.redirect('/guide');
            else this.render('entrance');
        }
    } catch (e) {}
}, {
    name: 'entrance'
});

Router.route('/profile', function() {
    try {
        if (Meteor.user() && !Meteor.user().profile.consent_agreed) {
            this.redirect('consent');
            return;
        }
        if (Meteor.user() && !Meteor.user().profile.took_pretest) {
            this.redirect('/trial');
            return;
        }
        if (Meteor.user() && !Meteor.user().profile.intro_completed) {
            //this.redirect('intro');
            //this.render('gutboard_slider');
            //

            let docentProgress = localStorage.getItem("docentProgress")
            if (docentProgress && (docentProgress == 25 || docentProgress == 50)) {
                this.redirect('/t/introduction');
                setTimeout(function function_name(argument) {
                    Materialize.toast('You need to finish this quick guide before accessing the entire Gut Instinct content', 4000, 'toast');
                }, 1500);
                //window.location.replace('/t/introduction')
                return;
            }
            if (docentProgress && docentProgress == 85) {
                this.redirect('gutboard_slider_addq');
                setTimeout(function function_name(argument) {
                    Materialize.toast('You need to finish this quick guide before accessing the entire Gut Instinct content', 4000, 'toast');
                }, 1500);
                //window.location.replace('/gutboard_slider_addq');
                return;
            }
            this.redirect('/guide');
            setTimeout(function function_name(argument) {
                Materialize.toast('You need to finish this quick guide before accessing the entire Gut Instinct content', 4000, 'toast');
            }, 1000);
            return;
        }
        // if (Meteor.user() && Meteor.user().profile.questions.length == 1 && Meteor.user().profile.intro_completed) {
        //     this.redirect('/addq');
        //     setTimeout(function function_name(argument) {
        //         Materialize.toast('You need to add one other question before accessing the entire Gut Instinct content', 4000, 'toast');
        //     }, 1000);
        //     return;
        // }
        if (Meteor.user()) {
            this.render('profile');
        }
    } catch (e) {}
});

Router.route('/topics', function() {
    try {
        if (Meteor.user() && !Meteor.user().profile.consent_agreed) {
            this.redirect('consent');
            return;
        }
        if (Meteor.user() && !Meteor.user().profile.took_pretest) {
            this.redirect('/trial');
            return;
        }
        if (Meteor.user() && !Meteor.user().profile.intro_completed) {
            //this.redirect('intro');
            //this.render('gutboard_slider');
            //

            let docentProgress = localStorage.getItem("docentProgress");
            if (docentProgress && (docentProgress === 25 || docentProgress === 50)) {
                this.redirect('/t/introduction');
                setTimeout(function function_name(argument) {
                    Materialize.toast('You need to finish this quick guide before accessing the entire Gut Instinct content', 4000, 'toast');
                }, 1500);
                //window.location.replace('/t/introduction')
                return;
            }
            if (docentProgress && docentProgress === 85) {
                this.redirect('gutboard_slider_addq');
                setTimeout(function function_name(argument) {
                    Materialize.toast('You need to finish this quick guide before accessing the entire Gut Instinct content', 4000, 'toast');
                }, 1500);
                //window.location.replace('/gutboard_slider_addq');
                return;
            }
            this.redirect('/guide');
            setTimeout(function function_name(argument) {
                Materialize.toast('You need to finish this quick guide before accessing the entire Gut Instinct content', 4000, 'toast');
            }, 1000);
            return;
        }
        // if (Meteor.user() && Meteor.user().profile.questions.length == 1 && Meteor.user().profile.intro_completed) {
        //     this.redirect('/addq');
        //     setTimeout(function function_name(argument) {
        //         Materialize.toast('You need to add one other question before accessing the entire Gut Instinct content', 4000, 'toast');
        //     }, 1000);
        //     return;
        // }
        if (Meteor.user()) {
            let condition = Meteor.user().profile.condition;

            if (condition === 2 || condition === 4 || condition === 6 || condition === 7 || condition === 0 || condition === 9 || condition === 11) {
                this.render('topics');
            } else {

            }
        }
    } catch (e) {}
});

Router.route('/reset-password/:token', {
    name: 'reset-password',
    action: function() {
        this.render('reset_password');
    },
    data: function() {
        return {
            token: this.params.token
        };
    }
});

Router.onBeforeAction(function() {

    function promiseWait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    this.render("loading_wheel");

    if (!Meteor.user() && !Meteor.loggingIn()) {

        promiseWait(100);

        /*
        // TUSHAR COMMENTED TO HANDLE GALILEO ROUTES, UNCOMMENT BELOW FOR DOCENT
        if (Router.current().url === '/login-bin/landing.html' || Router.current().url === '/') {
            this.redirect('/landing');
        }
        else{
            let landingString = '/landing?accessURL=' + Router.current().url;
            this.redirect(landingString);
        }
        */

        this.redirect('/galileo/home');

    } else {
        this.next();
    }
}, {
    except: ['landing', 'login-process', 'login-error', 'login-admin', 'logout', 'intro', 'login-admin1', 'signup', 'auth_openhumans',
        'galileo.home', 'galileo.signup', 'galileo.landing', 'galileo.browse', 'galileo.experiment', 'reset-password',
        "galileo.share.review", "galileo.share.review.guest", "galileo.experiment.feedback", "galileo.join.consent", "galileo.blog.why-exp", "galileo.blog.why-exp-openhumans",
        "galileo.blog.why-exp-lyme", "galileo.blog.why-exp-kefir", 'galileo.blog.why-exp-T1D', 'galileo.blog.why-exp-kombucha', "galileo.blog.tutorial", "galileo.blog.why-exp-agp",
        "galileo.me.datasheet", "galileo.blog.why-exp-gut-check", 'galileo.blog.why-exp-soylent', 'galileo.blog.why-exp-diet', 'galileo.join', 'galileo.join.criteria', 'galileo.share.join',
        "galileo.blog.why-exp-beer", "galileo.blog.why-exp-spice", "galileo.blog.why-exp-circadian","galileo.blog.why-exp-nerdnite", "galileo.blog.why-exp-probiotics"
    ]
});