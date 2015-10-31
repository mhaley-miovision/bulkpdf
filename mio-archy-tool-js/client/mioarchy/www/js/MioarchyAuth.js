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
        } else {
            var imgElt = createImgElement(resp);
            targetContainer.appendChild(imgElt);
            console.log(imgElt);
        }
    });
}

function createImgElement(imgResultObj) {
    var img = document.createElement('img');
    var decoded = imgResultObj.photoData.replace(/_/g,'\/').replace(/-/g,'\+').replace(/\*/g,'=');
    img.src = "data:" + imgResultObj.mimeType + ";base64," + decoded;
    return img;
}

checkAuth();