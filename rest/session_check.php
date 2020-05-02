<?php

	session_start();
	if(isset($_SESSION["loggedin"]) && $_SESSION["loggedin"] === true){
		echo "true";
		exit;
	}
	echo "false";

?>
