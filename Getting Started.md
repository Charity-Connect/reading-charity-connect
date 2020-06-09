
# Reading Charity Connect

## Git
1. Clone the git repository locally, and switch to the integration branch to work

## ojet
1. install ojet using npm;

```
cd ui
npm install --save-dev @oracle/ojet-cli  
ojet restore  
ojet build  --release
```

2. Start the ojet server as follows;

``ojet serve``

Note, we aren't going to actually run from that server, but having it active means the deployment gets rebuilt every time we edit a file.

## Development Environment Installation

1. Install the latest version of xampp from https://www.apachefriends.org/index.html
2. Run mysql and apache from xampp
3. Open the mysql admin (phpMyAdmin), and create a database called connect_reading and import the connect_reading_schema.sql file in to that
4.  Open the apache config file, and change the DocumentRoot to point to the directory where the git repository is, e.g. ``DocumentRoot "C:\Users\Bob\Documents\git\charity-connect"`` and set the directory to that too, e.g. ``<Directory "C:\Users\Bob\Documents\git\charity-connect">``
 
## Run the code
To run the code, just go to http://localhost/ui/web/index.html and the UI should render and the rest services should operate correctly
