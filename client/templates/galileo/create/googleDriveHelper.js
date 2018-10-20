let sheetsHost = 'https://sheets.googleapis.com';
let sheetsApiOrigin = 'v4/spreadsheets';
let driveApiOrigin = 'drive/v3/files';

let self = module.exports = {
    createNewExperimentSheet: function(sheetName, callback = null) {

        let request = {
            host: sheetsHost,
            data: {
                properties: {
                    title: sheetName
                },
                sheets: [{
                        properties: {
                            title: 'Overview'
                        }
                    },
                    {
                        properties: {
                            title: 'Tracking'
                        }
                    }
                ]
            }
        };

        self.gdPost(request, callback);
    },

    populateExperimentSheet: function(spreadSheetId, experimentObj, callback = null) {

        // basic sheet setup
        let data = [{
                range: "Overview!A1:A2",
                values: [
                    ["HYPOTHESIS"],
                    [experimentObj.cause + " " + experimentObj.relation + " " + experimentObj.effect]
                ]
            },
            {
                range: "Overview!C4:D4",
                majorDimension: "COLUMNS",
                values: [
                    ["MEASUREMENT TYPE"],
                    ["MEASUREMENT FREQUENCY"]
                ]
            },
            {
                range: "Overview!A5:B5",
                majorDimension: "COLUMNS",
                values: [
                    ["CAUSE"],
                    [experimentObj.cause]
                ]
            }
        ];

        // Adding cause measures
        let row = 5;
        for (let i = 0; i < experimentObj.causeMeasures.length; i++) {
            let measure = experimentObj.causeMeasures[i];
            let range = "Overview!C" + row + ":D" + row;
            data.push({
                range: range,
                majorDimension: "COLUMNS",
                values: [
                    [measure.measureType],
                    [measure.measureFrequency]
                ]
            });
            row = row + 1;
        }

        // Adding Effect
        row = row + 1;
        let range = "Overview!A" + row + ":B" + row;
        data.push({
            range: range,
            majorDimension: "COLUMNS",
            values: [
                ["EFFECT"],
                [experimentObj.effect]
            ]
        });


        // Adding Effect measures
        for (let i = 0; i < experimentObj.effectMeasures.length; i++) {
            let measure = experimentObj.effectMeasures[i];
            let range = "Overview!C" + row + ":D" + row;
            data.push({
                range: range,
                majorDimension: "COLUMNS",
                values: [
                    [measure.measureType],
                    [measure.measureFrequency]
                ]
            });
            row = row + 1;
        }

        // Adding feedback pointers
        let feedbackStartRow = row + 2;
        let feedbackEndRow = feedbackStartRow + 4;
        range = "Overview!A" + feedbackStartRow + ":A" + feedbackEndRow;
        data.push({
            range: range,
            values: [
                ["Are you providing feedback on this experiment? Answer these questions in your feedback - "],
                ["1. Does the hypothesis clearly link one cause with one effect?"],
                ["2. Is the cause specific? Can it be measured as per the details given above?"],
                ['3. Is the effect specific? Can it be measured as per the details given above?']
            ]
        });


        // Pushing data object to spreadsheet
        let url = 'v4/spreadsheets/' + spreadSheetId + '/values:batchUpdate';
        let request = {
            host: 'https://content-sheets.googleapis.com',

            // The ID of the spreadsheet to update.
            spreadsheetId: spreadSheetId,

            // this 'data' means what will go in as request payload
            data: {
                // How the input data should be interpreted.
                valueInputOption: 'RAW',

                // The new values to apply to the spreadsheet.
                data: data
            }
        };

        self.gdPost(request, callback, url);
    },

    addFilePermissions: function(sheetId, callback = null) {
        let url = driveApiOrigin + '/' + sheetId + '/permissions';
        let request = {
            data: {
                role: "commenter",
                type: "anyone"
            }
        };

        self.gdPost(request, callback, url);
    },

    authorizeDriveUse: function(callback = null) {
        Meteor.loginWithGoogle({
                requestOfflineToken: true,
                loginUrlParameters: {
                    include_granted_scopes: true
                },
                requestPermissions: ['https://www.googleapis.com/auth/drive']
            },
            function(error) {
                if (error) {
                    console.log('authorize error : ' + error);
                } else {
                    if (callback) {
                        callback();
                    }
                }
            });
    },


    gdPost: function(request, callback = null, url = sheetsApiOrigin) {
        GoogleApi.post(url, request, function(err, result) {
            if (err) {
                console.log('Post error : ');
                console.log(err);

                if (err.error === 403 || result.error.code === 403) {
                    // if you get 403, authorize and call original function again
                    self.authorizeDriveUse(function() {
                        self.gdPost(request, callback, url);
                    });
                    return;
                }
            }
            console.log('Post result : ');
            console.log(result);
            if (callback) {
                callback(err, result);
            }
        });
    }

};

function getCurrentPermissions(callback) {
    if (Meteor.user() == null) {
        callback('not-authorized', null);
        return;
    }

    if (Meteor.user().services.google == null) {
        callback('not-authorized with google', null);
        return;
    }


    GoogleApi.get('oauth2/v3/tokeninfo', {
            params: {
                access_token: Meteor.user().services.google.accessToken
            }
        },
        function(err, result) {
            console.log('inside tokeninfo callback');
            if (err) console.log(err);
            console.log(result);
            if (callback) {
                callback(err, result);
            }
        });
}

function hasGoogleDriveScope(scopes) {
    let scopesArr = scopes.split(' ');
    for (let i = 0; i < scopesArr.length; i++) {
        let scopeParts = scopesArr[i].split('/');
        let lastPart = scopeParts[scopeParts.length - 1];
        if (lastPart.includes('drive')) {
            // Current user has permissions to google drive');
            return true;
        }
    }
    return false;
}


function getDriveFiles(callback) {
    GoogleApi.get('drive/v3/files', function(err, result) {
        console.log('inside drive api callback');
        if (err) console.log(err);
        console.log(result);
        if (callback) {
            callback(err, result);
        }
    });
}