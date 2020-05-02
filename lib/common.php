<?php

$connection;

function initRest(){

global $connection;
// Initialize the session
session_start();

include_once $_SERVER['DOCUMENT_ROOT'] .'/config/dbclass.php';
$dbclass = new DBClass();
$connection = $dbclass->getConnection();


// Check if the user is logged in, if not then check for basic auth and if not, redirect them to login page
if(!isset($_SESSION["loggedin"]) || $_SESSION["loggedin"] !== true){
    if (isset($_SERVER['PHP_AUTH_USER'])) {
        $stmt = $connection->prepare("SELECT * FROM users WHERE email = :email");
        $stmt->execute(["email"=>$_SERVER['PHP_AUTH_USER']]);
        $session_user = $stmt->fetch();

        if (!$session_user || !password_verify($_SERVER['PHP_AUTH_PW'], $session_user['password']))
        {
            header("location: /login/login.php");
            exit;
        }
    } else {
        header("location: /login/login.php");
        exit;
    }
	$_SESSION["loggedin"] = true;
	$_SESSION["id"] = $session_user['id'];
	$_SESSION["email"] = $session_user['email'];
	if(isset($session_user['display_name'])){
	  $_SESSION["display_name"] = $session_user['display_name'];
	} else {
	  $_SESSION["display_name"] = $session_user['email'];
	}
}

    header("Content-Type: application/json; charset=UTF-8");

return $connection;
}

function initWeb(){
global $connection;
// Initialize the session
session_start();

// Check if the user is logged in, if not then redirect him to login page
if(!isset($_SESSION["loggedin"]) || $_SESSION["loggedin"] !== true){
    header("location: /login/login.php");
    exit;
}

include_once $_SERVER['DOCUMENT_ROOT'] .'/config/dbclass.php';
$dbclass = new DBClass();
$connection = $dbclass->getConnection();


return $connection;
}

function is_admin(){
global $connection;

  if(isset($_SESSION["loggedin"]) && $_SESSION["loggedin"] === true){

	$userId=$_SESSION["id"];
	$query = "SELECT 1 from user_roles where user_id=:user_id and role_id=1";
	$stmt = $connection->prepare($query);
	$stmt->execute(['user_id'=>$userId]);
	return ($stmt->rowCount()==1);

  }
  return false;

}


function generate_string($strength = 16) {
    $permitted_chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    $input_length = strlen($permitted_chars);
    $random_string = '';
    for($i = 0; $i < $strength; $i++) {
        $random_character = $permitted_chars[mt_rand(0, $input_length - 1)];
        $random_string .= $random_character;
    }

    return $random_string;
}

function getGeocode($postcode){

	$url='http://api.getthedata.com/postcode/'.urlencode($postcode);
	$location_str = file_get_contents($url);
	$location = json_decode ($location_str);
	if($location->{"status"}=="match"){
		$longitude=$location->{'data'}->{'longitude'};
		$latitude=$location->{'data'}->{'latitude'};
		return array($latitude,$longitude);
	} else {
		return array(-1,-1);
	}
}
