# UI

## Build

To build the UI, 

    cd ui
    npm install --save-dev @oracle/ojet-cli  
    ojet restore  
    ojet build  --release

after pushing to git, visit /ui/deploy_ui.php to deploy the zip file