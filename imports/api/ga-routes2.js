// Routes to keep login flow in galileo and gut instinct separate

Router.route('/galileo/signup', {
    name: 'galileo.signup',
    action: function() {
        console.log('in sign in router');

        if (!Meteor.userId()) {
            this.render("signup");
        } else {
            console.log('going to consent');
            this.redirect('/galileo/consent');
        }
    }
});

Router.route('/galileo/consent', {
    name: 'galileo.consent',
    action: function() {
        if (!Meteor.user().profile.consent_agreed) {
            Meteor.call("galileo.profile.updateProfile");
            console.log('going to consent final');
            this.render('consent');
        } else {
            if (Meteor.user() && !Meteor.user().profile.toured.username_page) {
                console.log('going to consent username');
                this.redirect('/galileo/username');
            } else if (localStorage.getItem("loginRedirectUrl")) {
                let self = this;
                Meteor.call('galileo.profile.getMendel', function(err, result) {
                    localStorage.setItem("mendelcode_ga", result);
                    let redirectTo = localStorage.getItem("loginRedirectUrl");
                    localStorage.removeItem('loginRedirectUrl');
                    console.log('going to ' + redirectTo);
                    self.redirect(redirectTo);
                });
            } else {
                let self = this;
                console.log("user id is: " + Meteor.userId());
                Meteor.call('galileo.profile.getRelativeExperiments', Meteor.userId(), function(err, result) {
                    if (result !== undefined && result.length > 0) {
                        if (localStorage.getItem("mendelcode_ga") != undefined && localStorage.getItem("mendelcode_ga") != null && localStorage.getItem("mendelcode_ga") != "undefined") {
                            self.redirect('/galileo/me/dashboard');
                        }
                        else {
                            Meteor.call('galileo.profile.getMendel', function(err, result) {
                                localStorage.setItem("mendelcode_ga", result);
                                self.redirect('/galileo/me/dashboard');
                            });
                        }
                    } else {
                        if (localStorage.getItem("mendelcode_ga") != undefined && localStorage.getItem("mendelcode_ga") != null && localStorage.getItem("mendelcode_ga") != "undefined") {
                            console.log('going to browse');
                            self.redirect('/galileo/browse');
                        }
                        else {
                            Meteor.call('galileo.profile.getMendel', function(err, result) {
                                localStorage.setItem("mendelcode_ga", result);
                                console.log('going to browse');
                                self.redirect('/galileo/browse');
                            })
                        }  
                    }
                });
            }
        }
    }
});

Router.route('/galileo/createdemo', {
    name: 'galileo.createdemo',
    action: function() {
        if (Meteor.user()) {
            if (!Meteor.user().profile.consent_agreed) {
                this.redirect('/galileo/consent');
            } else if (!Meteor.user().profile.toured.username_page) {
                this.redirect('/galileo/username');
            } else {
                this.render("gaCreateDemo", {
                    data: function() {
                        if (this.params.query.expid) {
                            return {
                                expId: this.params.query.expid
                            }
                        }
                    }
                });
            }
        }
    }
});


Router.route('/galileo/addcriteria', {
    name: 'galileo.addcriteria',
    action: function() {
        this.render("gaCriteriaDemo", {
            data: function() {
                if (this.params.query.expid) {
                    return {
                        expId: this.params.query.expid
                    }
                }
            }
        });
    }
});

Router.route('/galileo/ethics', {
    name: 'galileo.ethics',
    action: function() {
        this.render('gaEthicsDemo')
    }
});


//----- EMMA CLASS RELEASE
/*Router.route('/galileo/createedu', {
    name: 'galileo.createedu',
    action: function () {
        this.render('gaEducationDemo')
    }
});*/

//----- EMMA CLASS RELEASE -- from master_education_demo
Router.route('/galileo/createedu', {
    name: 'galileo.createedu',
    action: function() {
        if (Meteor.user()) {
            if (!Meteor.user().profile.consent_agreed) {
                this.redirect('/galileo/consent');
            } else if (!Meteor.user().profile.toured.username_page) {
                this.redirect('/galileo/username');
            } else {
                this.render("gaEducationDemo", {
                    data: function() {
                        if (this.params.query.expid) {
                            return {
                                expId: this.params.query.expid
                            }
                        }
                    }
                });
            }
        }
    }
});

Router.route('/galileo/username', {
    name: 'galileo.username',
    action: function() {
        this.render('username', {
            data: {
                isGalileo: true
            }
        });
    }
});

Router.route('/galileo/logout', {
    name: 'galileo.logout',
    action: function() {
        let inst = this
        Meteor.call('galileo.profile.setMendel', localStorage.getItem('mendelcode_ga'), function(error, result) {
            Meteor.logout(function(err) {
                if (err || error) console.log('Error loggin out!');
            });
            sessionStorage.clear();
            localStorage.clear();
            inst.redirect('/galileo/home');
        });
    }
});