define(['knockout'],
    function (ko) {
        var self = this;

        //get current page host/port
        var currentProto = window.location.protocol;
        var currentHost = window.location.host;
        var currentHostname = window.location.hostname;
        var currentOrigin = window.location.origin;

        var commonUrl = '/rest';

        function getBaseUrl() {
            function getContextPath() {
                return commonUrl;
            }

            if (isDevEnvironment()) {
                return currentProto + '//' + currentHostname + getContextPath();
            } else {
                return currentOrigin + getContextPath();
            }
        }

        function isDevEnvironment() {
            return currentHostname === 'localhost';
        }

        function getCommonUrl() {
            return currentOrigin.concat(commonUrl);
        }

        function createEntityUrl(entityName) {
            return getBaseUrl().concat('/', entityName);
        }

        var EntityUrl = {
            USERS: createEntityUrl('users'),
            ORGANIZATIONS: createEntityUrl('organizations'),
            USER_ORGANIZATIONS: createEntityUrl('user_organizations'),
            OFFERS: createEntityUrl('offers'),
            CLIENTS: createEntityUrl('clients'),
            NEED_REQUESTS: createEntityUrl('need_requests'),
            OFFER_TYPES: createEntityUrl('offer_types'),
            OFFER_TYPE_CATEGORIES: createEntityUrl('offer_type_categories'),

            LOGIN: createEntityUrl('login'),
            LOGIN_CHECK: createEntityUrl('login_check'),
            LOGOUT: createEntityUrl('logout'),
            ADMIN_CHECK: createEntityUrl('admin_check'),
            ORG_ADMIN_CHECK: createEntityUrl('org_admin_check'),
            PASSWORD_RESET_REQUEST: createEntityUrl('password_reset_request'),
            PASSWORD_RESET_CONFIRM: createEntityUrl('password_reset_confirm')
        };

        var constructUrl = function (entityUrl) {
            var result = entityUrl;
            return result;
        };

        return {
            getCommonUrl: getCommonUrl,
            isDevEnvironment: isDevEnvironment,
            EntityUrl: EntityUrl,
            constructUrl: constructUrl
        };

    });
