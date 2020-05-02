<?php

global $dev_headers;

if($dev_headers){
	if(!isset($_SERVER["REMOTE_ADDR"])){
	 	header("Access-Control-Allow-Origin: localhost:8000");
	}
}
	session_start();
	if(isset($_SESSION["loggedin"]) && $_SESSION["loggedin"] === true){
		echo "true";
		exit;
	}
	echo "false";

?>
