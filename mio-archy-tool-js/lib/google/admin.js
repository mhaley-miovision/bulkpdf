'use strict';

var google = require('googleapis');
var Promise = require("es6-promise").Promise;

var exports = module.exports = {};

/**
 * Lists the first 500 users in the domain.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
exports.listUsers = function (authClient) {
    return new Promise(function (resolve, reject) {
        var service = google.admin('directory_v1');

        service.users.list({
            auth: authClient,
            customer: 'my_customer',
            maxResults: 500,
            orderBy: 'email',
            viewType: 'domain_public'
        }, function (err, response) {
            if (err) {
                console.log('The API returned an error: ' + err);
                reject(err);
            }
            var users = response.users;
            resolve(users);
        });
    });
};

