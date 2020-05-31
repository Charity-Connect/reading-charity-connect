# Reading Charity Connect

Deployment Status

![Publish Website](https://github.com/mmillmor/charity-connect/workflows/Publish%20Website/badge.svg)

## Available Services

### Users

Users are the people who log in to the system, and who belong to an organization

/rest/users - GET to get a list of users, POST to create or update  
/rest/users/{user id} - GET a single user  
/rest/users/current - GET the current user  

#### Attributes
- email  
- display_name  
- phone  

#### Security
All users are visible to the system administrator  
Users within an organization are visible to organization admins  
Other users can only see themselves  

### Organizations

Organizations are the charities that the users belong to. 

/rest/organizations - GET to get the list of organizations, POST to create or update  
/rest/organizations/{organization id} - GET a single organization  
/rest/organizations/public - GET to get the list of organizations without requiring login  

#### Attributes
- name
- address
- phone

#### Security
Only system administrators can create an organization  
Only system administrators and organization administrators can update an organization  
Logged in users can view all organization details  
Not logged in users can view a public list of organization names  


### User Organizations

User Organizations track which organizations a user is a member of (they can be a member of more than one)  
  
/rest/user_organizations - GET to get the list of user organization memberships, POST to create or update  
/rest/user_organizations/{user organization id} - GET a single user organization membership  
/rest/users/{user id}/user_organizations - GET the user organization membership for a single user  
/rest/users/current/user_organizations - GET the user organization membership for the logged in user  

#### Attributes
- organization_id
- user_id
- admin
- user_approver
- need_approver
- confirmed

#### Security
Users can request organization membership for anyone  
User Organization memberships are only visible and updateable for the users that you have security to access  

### Offers

Offers can be created by users in an organization to record the things that their charity can do for people  

/rest/offers - GET to get a list of all offers for your organization, POST to create or update  
/rest/offers/{offer id} - GET a single offer  

#### Attributes
- organization_id
- name
- type
- details
- quantity
- date_available
- date_end
- postcode
- distance

#### Security

System administrators can create offers in any organization. Other users can only create offers in the current organization  
System administrators can view all offers. Other users can only see offers for their organizations  
  

### Clients

Clients record an individual or an organization who may have needs, and exist for one or more organizations  

/rest/clients - GET to get a list of all clients for your organization, POST to create or update  
/rest/clients/{client id} - GET a single client  

#### Attributes
- name  
- address  
- postcode  
- phone  
- email  
- notes  


#### Security

All clients are visible to the system administrator  
Only clients for the current organization are visible to others  

### Client Needs

Clients can have multiple needs, and this records those needs and whether they have been met  

/rest/clients/{client id}/client_needs - GET to get a list of all clients for this client, POST to create or update  
/rest/clients/{client id}/client_needs/{client need id} - GET a single client need  

#### Attributes
- client_id  
- type  
- date_needed  
- need_met  
- notes  


#### Security

Client needs can only be created and read for clients who the user has access to  

### Need Requests

These are requests for meeting a need that have been received by an organization

/rest/need_requests - GET to get a list of all need requests, POST to update  
/rest/need_requests/{need_request id} - GET a single need request

#### Attributes
- client_need_id  
- organization_id  
- target_date  
- agreed
- completed
- notes  


#### Security

System administrators can see all need requests
Users can only see need requests for the current organization

#### Filters
Add the following to filter the need requests;
?filter=unresponded - requests that you haven't responded to yet
?filter=agreed - requests that you have agreed to
?filter=agreed - requests that you have agreed to
?filter=rejected - requests that you have rejected
?filter=completed - requests that you have agreed to and completed
?filter=in_progress - requests that you have agreed to and which are in progress



### Offer Types

Types of thing that organizations are offering, and types of thing that clients need  

/rest/offer_types - GET to get a list of all offer types, POST to create or update  
/rest/offer_types/active - GET to get a list of all active offer types  
/rest/offer_types/{type} - GET to get a single offer types  

#### Attributes
- type  
- name  
- category  
- default_text  
- active  

#### Security

Can only be created or updated by a system administrator  
Can be ready by all logged in users  


### Offer Type Categories

Categories of Offer Types

/rest/offer_type_categories - GET to get a list of all offer type categoriess, POST to create or update  
/rest/offer_type_categories/{code} - GET to get a single offer type category  
/rest/offer_type_categories/{code}/offer_types - GET to get all offer types in a single category  

#### Attributes
- code  
- name  


#### Security

Can only be created or updated by a system administrator  
Can be ready by all logged in users  


### Session Management

/rest/login - POST a form with email and password as parameters to log in  
/rest/login_check - GET returns true if logged in, false if not  
/rest/logout - GET logs you out  
/rest/admin_check - GET returns true if the logged in user is a system administrator, false if not  
/rest/org_admin_check - GET returns true if the logged in user is an admin of the current organization, false if not  
/rest/password_reset_request - POST email address to request a password reset e-mail  
/rest/password_reset_confirm - POST email address, key, password and password2 to reset the password  
