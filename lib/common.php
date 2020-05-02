<?php

$connection;
$dev_headers=true;

function initRest(){

global $connection;
global $dev_headers;
// Initialize the session
session_start();

include_once $_SERVER['DOCUMENT_ROOT'] .'/config/dbclass.php';
$dbclass = new DBClass();
$connection = $dbclass->getConnection();
$email=$_SERVER['PHP_AUTH_USER'];
$password=$_SERVER['PHP_AUTH_PW'];

if (login($connection,$email,$password)){
    header("Content-Type: application/json; charset=UTF-8");
	return $connection;
} else {
	header("location: /login/login.php");
    exit;
}


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

function is_org_admin(){
	global $connection;

  if(isset($_SESSION["loggedin"]) && $_SESSION["loggedin"] === true){

	$userId=$_SESSION["id"];
	$organizationId=$_SESSION["organization_id"];
	$query = "SELECT id from user_organizations where user_id=:user_id and organization_id=:organization_id and confirmed='Y' and admin='Y'";
	$stmt = $connection->prepare($query);
	$stmt->execute(['user_id'=>$userId,'organization_id'=>$organizationId]);
	return ($stmt->rowCount()>0);

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

function get_string($code,$tokens=array()){
	global $connection;
	$sql = "select string from strings where code=:code";
	$stmt= $connection->prepare($sql);
	if( $stmt->execute(['code'=>$code])){
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        $string = $row['string'];
        if(count($tokens)>0){
        	foreach ($tokens as $key => $value) {
        		$string=str_replace($key,$value,$string);
        	}
        }
		return $string;
	}
	return "";
}

function sendHtmlMail($to,$subject,$body){
// Always set content-type when sending HTML email
$headers = "MIME-Version: 1.0" . "\r\n";
$headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";

	mail($to,$subject,$body,$headers);

}

function login($connection,$email,$password){
global $dev_headers;
if($dev_headers==true){
	$_SESSION["loggedin"] = true;
	$_SESSION["id"] = 19;
	$_SESSION["email"] = "oli@test.com";
	$_SESSION["organization_id"]=1;
	return true;
}
// Check if the user is logged in, if not then check for basic auth and if not, redirect them to login page
if(!isset($_SESSION["loggedin"]) || $_SESSION["loggedin"] !== true){
	$stmt = $connection->prepare("SELECT * FROM users WHERE email = :email");
    $stmt->execute(["email"=>$email]);
    $session_user = $stmt->fetch();
    if (!$session_user || !password_verify($password, $session_user['password'])){
    	return false;
    }
	session_start();
	$id=$session_user['id'];
	// Store data in session variables
	$_SESSION["loggedin"] = true;
	$_SESSION["id"] = $id;
	$_SESSION["email"] = $session_user['email'];
	if(isset($session_user['display_name'])){
	  $_SESSION["display_name"] = $session_user['display_name'];
	} else {
	  $_SESSION["display_name"] = $session_user['email'];
	}
	$sql = "SELECT organization_id FROM user_organizations WHERE user_id=:id and confirmed='Y' order by organization_id";
	$stmt= $connection->prepare($sql);
	$stmt->execute(['id'=>$id]);
	if($stmt->rowCount() >0){
		if($row = $stmt->fetch(PDO::FETCH_ASSOC)){
			$_SESSION["organization_id"] = $row['organization_id'];
		}
	}
}
return true;
}

function logout(){
	// Initialize the session
	session_start();

	// Unset all of the session variables
	$_SESSION = array();

	// Destroy the session.
	session_destroy();

}

