import './_.jade'

Template.gaEthics.onCreated(function() {

    var self = this;
    this.nextDisabled = new ReactiveVar(true);
    this.downloadUrl = new ReactiveVar("");
    this.prompt = new ReactiveVar("");

    Meteor.call("galileo.profile.hasFinishedEthics", function(err, finished) {
        if (err) {
            throw new Meteor.Error("err");
        }
        if (finished) {
            $("#step-1").addClass("fade");
            self.prompt.set("You have already finished the Ethics Training. Please hit 'NEXT' to proceed to the next step");
            self.nextDisabled.set(false);
        } else {
            self.prompt.set("Before you can start designing your experiment, please make sure to follow the following steps to complete the Ethics Training for designing experiment");
        }
    });
});

Template.gaEthics.events({
    "show .card-frame": function(event) {
        $("#certificate-file").trigger("initiate");
    },
    "click #step-1-next": function(event) {
        //$("#step-1").addClass("fade");
        $("#step-2").removeClass("fade");
    },
    "click #finish-ethics-btn": function(event) {
        window.location.href = "/galileo/pre_create";
    },
    'change #certificate-file': function(event) {
        var inst = Template.instance();
        var uploader = new Slingshot.Upload("ethicsCertificate");
        var fileAttached = ($("#certificate-file")[0].files.length) > 0;
        var file = document.getElementById('certificate-file').files[0]
        if (fileAttached) {
            uploader.send(file, function(error, downloadUrl) {
                if (error) {
                    // Log service detailed response.
                    // console.error('Error uploading', uploader.xhr.response);
                    alert(error);
                } else {
                    inst.downloadUrl.set(downloadUrl);
                    inst.nextDisabled.set(false);
                    //$("#step-2").addClass("fade");
                    //$("#step-3").removeClass("fade");
                    $("#preview").removeClass("hide");
                    Meteor.call("galileo.profile.updateEthicsCertificate", downloadUrl);
                }
            });
        }
    },
    'click #done-btn': function(event) {
        Meteor.call("galileo.profile.updateEthicsCertificate", "GI-training");
        Template.instance().nextDisabled.set(false);
    }
});

Template.gaEthics.helpers({
    nextDisabled: function() {
        return Template.instance().nextDisabled.get();
    },
    downloadUrl: function() {
        return Template.instance().downloadUrl.get();
    },
    prompt: function() {
        return Template.instance().prompt.get();
    }
});