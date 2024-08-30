Slingshot.fileRestrictions("ethicsCertificate", {
    allowedFileTypes: /.*/i,
    maxSize: 10 * 1024 * 1024,
});

Slingshot.createDirective("ethicsCertificate", Slingshot.S3Storage, {
    AWSAccessKeyId: Meteor.settings.awsPrivateAccessID,
    AWSSecretAccessKey: Meteor.settings.awsPrivateAccessKey,
    bucket: "gut-instinct",
    acl: "public-read",
    region: "us-east-1",
    authorize: function() {
        if (!this.userId) {
            var message = "Please login before posting images";
            throw new Meteor.Error("Login Required", message);
        }
        return true;
    },
    key: function(file) {
        var currentUserId = Meteor.userId();
        return "ethicsCertificate/" + currentUserId + "/" + file.name;
    }
});