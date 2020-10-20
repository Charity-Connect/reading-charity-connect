#  Getting Started - Reading Charity Connect

## Cloning Respoitory
1. Clone the git repository locally, and switch to the integration branch to work:

```
git clone https://github.com/Charity-Connect/reading-charity-connect.git
git checkout integration
```

Note, when working from MacOS cloning will default to the user profile folder ``"/Users/<username>"``. In order to avoid file access permissions issues with Apache, clone the repository into the "Shared" folder ``"/Users/Shared"`` instead:
```
cd /Users/Shared
git clone https://github.com/Charity-Connect/reading-charity-connect.git
```

## Setting up OracleJET
1. Navigate to the directory in which you cloned the git repository to.
2. Navigate to the `ui` folder inside, with

``cd ui``

3. Install ojet using npm:

``npm install --save-dev -g @oracle/ojet-cli``

4. Set up ojet:

```
ojet restore  
ojet build  --release
```

5. Start the ojet server:

``ojet serve``

Note, we aren't going to actually run from this ojet server, but having it active means the deployment gets rebuilt every time a file is edited.


## Development Environment Installation
1. Install the latest version of XAMPP from https://www.apachefriends.org/index.html.
2. Start the MySQL and Apache services from XAMPP.
3. Open the MySQL admin page (by default, at http://localhost/phpmyadmin/), and create a database called `connect_reading` and import the `connect_reading_schema.sql` file into it.
4. Open the Apache config file (`httpd.conf`), and change the `DocumentRoot` parameter to point to the directory where the git repository is, e.g. ``DocumentRoot "C:\Users\Bob\Documents\git\charity-connect"`` and set the directory on the line beneath to that too, e.g. ``<Directory "C:\Users\Bob\Documents\git\charity-connect">``.

## Run Code
Upon running `ojet serve` you may automatically be taken to https://localhost:8080, but this may be a blank page or have an error.
In order to properly use the local instance, navigate to the regular http port.
To run the code, go to http://localhost/ and the UI should render and the REST services should operate correctly.
