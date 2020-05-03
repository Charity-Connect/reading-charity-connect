<?php
        $zip = new ZipArchive();
        $fname=dirname(__FILE__).'/charity-connect.zip';
        $x = $zip->open($fname);  // open the zip file to extract
        if ($x === true) {
                $zip->extractTo(dirname(__FILE__)); // place in the directory with same name
                $zip->close();
                unlink("charity-connect.zip");
                echo "success";
        } else {
                echo "failed";
        }
