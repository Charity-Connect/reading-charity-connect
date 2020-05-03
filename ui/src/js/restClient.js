define(['jquery', 'utils'],
    function ($, utils) {
        var self = this;

        /**
         * Method provides asynchronous HTTP POST request to given URL with given object as a body.
         * ContentType is 'application/json'.
         * parameters:
         *      - url - absolute URL
         *      - entityRepresentation - object which will be stringified and pasted as a body of the request
         * returns:
         *      a Promise which is resolved with newly created entityId if request was successfull,
         *          rejected with error event if request failed.
         */
        doPost = function(url, entity) {
            return new Promise(function (resolve, reject) {
                $.ajax({ type: "POST",
                    contentType: "application/x-www-form-urlencoded",
                    url: url,
                    data : entity,
                    success: function (data, status, xhr) {
                        resolve(xhr.responseText);
                    },
                    error: function (event) {
                        console.error("Error occured in REST client, when sending POST to url: " + url);
                        reject(event);
                    }
                });
            });
        };

        /**
         * Method provides asynchronous HTTP GET request to given URL.
         * parameters:
         *      - url - absolute URL
         * returns:
         *      a Promise which is resolved with HTTP response if request was successfull,
         *          rejected with error event if request failed.
         */
        doGet = function(url) {
            return new Promise(function(resolve, reject) {
                $.ajax({ type: "GET",                 
                    url: url,
                    success: function (response) {
                        resolve(response);
                    },
                    error: function(event) {
                        console.error("Error occured in REST client, when sending GET to url: " + url);
                        utils.showErrorMessage("REST read failed", url);
                        reject(event);
                    }
                });
            });
        };

        return {
            doPost: doPost,
            doGet: doGet
        };

    });