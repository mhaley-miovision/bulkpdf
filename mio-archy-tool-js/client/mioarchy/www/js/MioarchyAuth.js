var CLIENT_ID = '88230792771-sfqdsio0m68c010sak58qhapee9aqstv.apps.googleusercontent.com';
var SCOPES = ['https://www.googleapis.com/auth/admin.directory.user.readonly'];

/**
 * Check if current user has authorized this application.
 */
function checkAuth() {
    if (gapi.auth) {
        console.log("ready");
        gapi.auth.authorize(
            {
                'client_id': CLIENT_ID,
                'scope': SCOPES.join(' '),
                'immediate': true
            }, handleAuthResult);
    } else {
        console.log("not ready");
        setTimeout(checkAuth, 100);
    }
}

/**
 * Load Directory API client library. List users once client library
 * is loaded.
 */
function loadDirectoryApi() {
    gapi.client.load('admin', 'directory_v1', directoryApiOnLoad);
}

function directoryApiOnLoad() {
    console.log("Done loading Google directory API.");
}

/**
 * Handle response from authorization server.
 *
 * @param {Object} authResult Authorization result.
 */
function handleAuthResult(authResult) {
    var authorizeDiv = document.getElementById('authorize-div');

    console.log(authResult);

    if (authResult && !authResult.error) {
        // Hide auth UI, then load client library.
        authorizeDiv.style.display = 'none';
        loadDirectoryApi();
    } else {
        // Show auth UI, allowing the user to initiate authorization by
        // clicking authorize button.
        authorizeDiv.style.display = 'inline';
    }
}

/**
 * Initiate auth flow in response to user clicking authorize button.
 *
 * @param {Event} event Button click event.
 */
function handleAuthClick(event) {
    gapi.auth.authorize(
        {client_id: CLIENT_ID, scope: SCOPES, immediate: false},
        handleAuthResult);
    return false;
}


function loadUserImgSrc(userEmail, targetContainer) {
    var request = gapi.client.directory.users.photos.get({
        'userKey': userEmail
    });
    request.execute(function(resp) {
        if (resp.error) {
            console.log("Error loading user image: " + userEmail)
            var imgElt = createImgElement(null); // get the blank pic
            targetContainer.appendChild(imgElt);
        } else {
            var imgElt = createImgElement(resp);
            targetContainer.appendChild(imgElt);
        }
    });
}

function createImgElement(imgResultObj) {
    var img = document.createElement('img');
    if (imgResultObj) {
        var decoded = imgResultObj.photoData.replace(/_/g, '\/').replace(/-/g, '\+').replace(/\*/g, '=');
        img.src = "data:" + imgResultObj.mimeType + ";base64," + decoded;
    } else {
        img.src = "data:image/png;base64,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";
    }
    return img;
}

checkAuth();