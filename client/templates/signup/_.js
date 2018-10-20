import './_.jade';

import {
    UserMetrics,
} from '../../../imports/api/models.js';

import {
    Accounts
} from 'meteor/accounts-base';

Template.signup.rendered = function() {
    $('.coursera-options').hide();
    $('.coursera-info').hide();
};

Template.signup.onCreated(function() {
    this.error = new ReactiveVar('');
    this.isGalileo = new ReactiveVar(false);
});

Template.signup.onRendered(function() {
    // need to set this here because 'window.location.pathname' isn't refreshed until rendering
    if (window.location.pathname === '/galileo/signup') {
        Template.instance().isGalileo.set(true);
    }
});


Template.signup.helpers({
    error_message: function() {
        return Template.instance().error.get();
    },
    homeUrl: function() {
        if (Template.instance().isGalileo.get()) {
            return "/galileo/home";
        } else {
            return "/";
        }
    },
    imageUrl: function() {
        if (Template.instance().isGalileo.get()) {
            return "/images/galileo/galileo-logo-white.png";
        } else {
            return "images/logos/gi_basic_dark_bg.png";
        }
    }
});


Template.signup.events({
    'submit form': function(event, instance) {
        event.preventDefault();
        const username = event.target.username.value;
        const password = event.target.password.value;

        //getAlerts();

        if (instance.state.get('signin')) {
            handleLogin(username, password, instance);
        } else if (instance.state.get('signup')) {
            handleCreateUser(username, password, instance);
        }
    },
    'click #login-facebook': function(event, instance) {
        event.preventDefault();

        console.log('starting to login with facebook');

        $("#login").toggleClass("hide");
        $("#loading").toggleClass("hide");

        Meteor.loginWithFacebook({
            requestPermissions: ['public_profile, email']
        }, function(err) {
            console.log('login with google facebook');

            $("#login").toggleClass("hide");
            $("#loading").toggleClass("hide");

            if (err) {
                handleBasicError(err, instance);
            }
        });
    },
    'click #login-reddit': function(event, instance) {
        event.preventDefault();
        console.log("try reddit");
        Meteor.loginWithReddit(function(e) {
            console.log("using reddit package to login");
        });
    },
    'click #login-google': function(event, instance) {
        event.preventDefault();

        console.log('starting to login with google');

        $("#login").toggleClass("hide");
        $("#loading").toggleClass("hide");

        Meteor.loginWithGoogle({
                requestOfflineToken: true,
                loginUrlParameters: {
                    include_granted_scopes: true
                },
                requestPermissions: ['profile', 'email']
            },
            function(err) {
                console.log('login with google complete');

                $("#login").toggleClass("hide");
                $("#loading").toggleClass("hide");

                if (err) {
                    handleBasicError(err, instance);
                }
            });
    },
    'click #back-coursera': function() {
        $(".forgot_div").hide();
        $('.second-back').hide();
        $('.account_signin').hide();
        $('.account_create').hide();
        $('.coursera-options').hide();
        $('.signup-links').show();
        $('#login-coursera').show();
        $('#login-facebook').show();
        $('#login-google').show();
        $('#login-openhumans').show();
        $('#login-reddit').show();
        $('#powered-info').show();
    },
    'change .coursera-fb': function(e) {
        e.preventDefault();
        $('.login-coursera2').hide();
        $('.coursera-info').toggle();
    },
    'change .coursera-email': function(e) {
        e.preventDefault();
        $('.login-coursera2').toggle();
        $('.coursera-info').hide();
    },
    'click #login-coursera': function(e) {
        e.preventDefault();
        $('.coursera-options').show();
        $('#login-coursera').hide();
        $('#login-facebook').hide();
        $('#login-google').hide();
        $('#login-openhumans').hide();
        $('#login-reddit').hide();
        $('#powered-info').hide();
        $('.account_create').hide();
        $('.account_signin').hide();
        $('.signup-links').hide();
    },
    'click .coursera-auth': function(event, instance) {
        Meteor.loginWithCoursera(function(err) {
            if (err) {
                handleBasicError(err, instance);
            }
        });
    },
    'click .toggle': function(event, instance) {
        console.log('TOGGLE');
        event.preventDefault();
        const state = {
            signin: instance.state.get('signin'),
            signup: instance.state.get('signup')
        };
        instance.state.set('signin', !state.signin);
        instance.state.set('signup', !state.signup);
    },
    'click .to-login': function(event) {
        handleClickToLogin(event)
    },
    'click #login-openhumans': function(event, instance) {
        console.log('starting to login with openhumans');

        $("#login").toggleClass("hide");
        $("#loading").toggleClass("hide");

        event.preventDefault();
        Meteor.loginWithOpenhumans(function(err) {
            console.log('login with openhumans complete');

            $("#login").toggleClass("hide");
            $("#loading").toggleClass("hide");

            if (err) {
                handleBasicError(err, instance);
            }
        });
    },
    'click #email_create': function(event) {
        event.preventDefault();
        $('.second-back').show();
        $('#login-coursera').hide();
        $('#login-facebook').hide();
        $('#login-google').hide();
        $('#login-openhumans').hide();
        $('#login-reddit').hide();
        $('#powered-info').hide();
        $('.account_signin').hide();
        $('.signup-links').hide();
        $('.account_create').show();
        $("#create_err").hide();
        $("#signin_check").hide();
    },
    'click #email_signin': function(event) {
        event.preventDefault();
        $('.second-back').show();
        $('#login-coursera').hide();
        $('#login-facebook').hide();
        $('#login-google').hide();
        $('#login-openhumans').hide();
        $('#login-reddit').hide();
        $('#powered-info').hide();
        $('.signup-links').hide();
        $('.account_create').hide();
        $('.account_signin').show();
        $("#create_err").hide();
        $("#signin_check").hide();
    },
    'click #signup': function(event) {
        event.preventDefault();
        const email = $("#new_email").val();

        let $createErr = $("#create_err");
        if (!validateEmail(email)) {
            $createErr.show();
            $createErr.html("Email not valid.");
            return;
        }

        $("#email_check").hide();

        const newPassword = $("#new_password").val();
        const confirmPassword = $("#confirm_password").val();

        if (newPassword !== confirmPassword) {
            $createErr.show();
            $createErr.html("Passwords did not match");
            return;
        }
        $("#pass_check").hide();

        $("#login").toggleClass("hide");
        $("#loading").toggleClass("hide");

        console.log('starting to create account');
        Accounts.createUser({
            email: email,
            password: newPassword
        }, function(err) {
            console.log('create account done');
            if (err) {
                console.log(err.reason);
                $("#login").toggleClass("hide");
                $("#loading").toggleClass("hide");
                $createErr.show();
                $createErr.html(err.reason);
            }
        });
    },
    'click #signin': function(event) {
        event.preventDefault();
        const email = $("#enter_email").val();
        let $signInCheck = $("#signin_check");

        if (!validateEmail(email)) {
            $signInCheck.show();
            $signInCheck.html("Email not valid");
            return;
        }

        $signInCheck.hide();

        const password = $("#enter_password").val();

        $("#login").toggleClass("hide");
        $("#loading").toggleClass("hide");

        console.log('starting to sign in');
        Meteor.loginWithPassword({
            email: email
        }, password, function(err) {
            console.log('log in complete');
            if (err) {
                $("#login").toggleClass("hide");
                $("#loading").toggleClass("hide");
                $signInCheck.show();
                $signInCheck.html(err.reason);
            }
        });
    },
    'click #forgot-pass': function(event) {
        event.preventDefault();
        let $forgotPass = $("#forgot-pass");
        if ($forgotPass.html() === "forgot password?") {
            $forgotPass.html("sign in with email?");
        } else {
            $forgotPass.html("forgot password?");
        }
        $("#send-reset").toggle();
        $("#signin").toggle();
        $("#enter_password").toggle();
        $("#enter_password_label").toggle();

    },
    'click #send-reset': function(event) {
        event.preventDefault();

        let $signInCheck = $("#signin_check");
        let $sendReset = $("#send-reset");

        const email = $("#enter_email").val();

        if (!validateEmail(email)) {
            $signInCheck.show();
            $signInCheck.html("Email not valid");
            return;
        }

        $signInCheck.hide();

        Accounts.forgotPassword({
            email: email
        }, function(err) {
            if (err) {
                $signInCheck.show();
                $signInCheck.html(err.reason);
                return;
            }
            $sendReset.removeClass("light-blue");
            $sendReset.addClass("green");
            $sendReset.html("Email Sent!");

            setTimeout(function() {
                $sendReset.removeClass("green");
                $sendReset.addClass("light-blue");
                $sendReset.html("Send me another reset link");
            }, 5000);
        });
    },
    'keypress #enter_email': function(event) {
        if (event.keyCode == 13 || event.which == 13) {
            $('#enter_password').focus();
            event.preventDefault();
        }
    },

    'keypress #enter_password': function(event) {
        if (event.keyCode == 13 || event.which == 13) {
            $('#signin').click();
            event.preventDefault();
        }
    },

    'keypress #new_email': function(event) {
        if (event.keyCode == 13 || event.which == 13) {
            $('#new_password').focus();
            event.preventDefault();
        }
    },

    'keypress #new_password': function(event) {
        if (event.keyCode == 13 || event.which == 13) {
            $('#confirm_password').focus();
            event.preventDefault();
        }
    },

    'keypress #confirm_password': function(event) {
        if (event.keyCode == 13 || event.which == 13) {
            $('#signup').click();
            event.preventDefault();
        }
    }
});

function validateEmail(email) {
    let re =
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}


function handleClickToLogin(event) {
    //highlights user clicked questions
    let $attentionWords = $('#attention-getter-words');
    $attentionWords.text('Want to know the answer? Login to view!');
    $attentionWords.css({
        'font-size': '16pt'
    });

    $('#click-login-btn').hide();
    $(event.target).parent().siblings().hide();
    $(event.target).css({
        'font-size': '18pt'
    });
    let $description = $('.description');
    $description.css({
        'width': '65%'
    });
    $description.find('h1').css({
        'text-align': 'left'
    });

    $('.sign_in').show();
}

function handleBasicError(err, instance) {
    instance.error.set(err.reason);
    console.error(instance.error.get());
}


function handleLogin(username, password, instance) {
    Meteor.loginWithPassword(username, password, function(err) {
        if (err) {
            handleBasicError(err, instance);
        } else {
            instance.error.set("");
            const user_metric = UserMetrics.find({
                user_id: Meteor.userId()
            }).fetch()[0];
            user_metric.login_counter++;
            UserMetrics.update({
                _id: user_metric._id
            }, {
                $set: {
                    login_counter: user_metric.login_counter
                }
            });
        }
    });
}

function handleCreateUser(username, password, instance) {
    Accounts.createUser({
        username: username,
        password: password,
    }, function(err) {
        if (err) {
            handleBasicError(err, instance);
            return;
        } else {
            UserMetrics.insert({
                user_id: Meteor.userId(),
                username: Meteor.user().username,
                login_counter: 0,
                visit_counter: {
                    gutboard: 0,
                    tutorial: 0,
                    topics: 0,
                    problems: 0,
                    articles: 0
                },
                time_spent: [],
                number_of_questions: 0,
                number_of_comments: 0,
                number_of_science_articles: 0
            });
        }
        // sessionStorage.setItem("novice", true);
        instance.error.set("");
    });
}