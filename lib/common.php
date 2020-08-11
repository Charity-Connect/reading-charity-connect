<?php
require_once __DIR__.'/../entities/Audit.php';

$connection;

function initRest(){

	global $connection;
	// Initialize the session
	
    if(!isset($_SESSION)) 
    { 
        session_start(); 
    } 

	include_once $_SERVER['DOCUMENT_ROOT'] .'/config/dbclass.php';
	$dbclass = new DBClass();
	$connection = $dbclass->getConnection();
	if(!isset($_SESSION["loggedin"]) || $_SESSION["loggedin"] !== true){

		if(isset($_SERVER['PHP_AUTH_USER'])){
			$email=$_SERVER['PHP_AUTH_USER'];
			$password=$_SERVER['PHP_AUTH_PW'];

			if (login($connection,$email,$password)){
				header("Content-Type: application/json; charset=UTF-8");
				return $connection;
			} else {
				header("location: /index.html?redirect=".urlencode(basename($_SERVER['REQUEST_URI'])));
				exit;
			}
		} else {
				header("location: /index.html?redirect=".urlencode(basename($_SERVER['REQUEST_URI'])));
				exit;
		}

	}
	header("Content-Type: application/json; charset=UTF-8");
	return $connection;
}

function initBotRest(){

	global $connection;
    if(!isset($_SESSION)) 
    { 
        session_start(); 
    } 
	$_SESSION["bot"]=true;

	include_once __DIR__ .'/../config/dbclass.php';
	$dbclass = new DBClass();
	$connection = $dbclass->getConnection();
		header("Content-Type: application/json; charset=UTF-8");
		return $connection;
}

function initPublicRest(){

	global $connection;
    if(!isset($_SESSION)) 
    { 
        session_start(); 
    } 

	include_once $_SERVER['DOCUMENT_ROOT'] .'/config/dbclass.php';
	$dbclass = new DBClass();
	$connection = $dbclass->getConnection();
		header("Content-Type: application/json; charset=UTF-8");
		return $connection;
}

function initBotWeb(){
	global $connection;
	// Initialize the session
    if(!isset($_SESSION)) 
    { 
        session_start(); 
    } 
	$_SESSION["bot"]=true;
	
	include_once __DIR__ .'/../config/dbclass.php';
	$dbclass = new DBClass();
	$connection = $dbclass->getConnection();
	
	
	return $connection;
	}

function initWeb(){
global $connection;
// Initialize the session
if(!isset($_SESSION)) 
{ 
	session_start(); 
} 

// Check if the user is logged in, if not then redirect him to login page
if(!isset($_SESSION["loggedin"]) || $_SESSION["loggedin"] !== true){
    header("location: /index.html?redirect=".urlencode(basename($_SERVER['REQUEST_URI'])));
    exit;
}

include_once $_SERVER['DOCUMENT_ROOT'] .'/config/dbclass.php';
$dbclass = new DBClass();
$connection = $dbclass->getConnection();


return $connection;
}

function is_admin(){
	global $connection;

	if(!isset($connection)){
		include_once $_SERVER['DOCUMENT_ROOT'] .'/config/dbclass.php';
		$dbclass = new DBClass();
		$connection = $dbclass->getConnection();
	}

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

	if(isset($_SESSION["bot"]) && $_SESSION["bot"] === true){
		return true;
	}

	if(!isset($connection)){
		include_once $_SERVER['DOCUMENT_ROOT'] .'/config/dbclass.php';
		$dbclass = new DBClass();
		$connection = $dbclass->getConnection();
	}

	if(isset($_SESSION["loggedin"]) && $_SESSION["loggedin"] === true){

	$userId=$_SESSION["id"];
	if(isset($_SESSION["organization_id"])){
		$organizationId=$_SESSION["organization_id"];
		$query = "SELECT id from user_organizations where user_id=:user_id and organization_id=:organization_id and confirmed='Y' and admin='Y'";
		$stmt = $connection->prepare($query);
		$stmt->execute(['user_id'=>$userId,'organization_id'=>$organizationId]);
		return ($stmt->rowCount()>0);
	}

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
$headers = "MIME-Version: 1.0"."\r\n";
$headers .= "Content-type:text/html;charset=UTF-8\r\n";

if( isset($_SERVER[ 'SERVER_NAME' ]) && $_SERVER[ 'SERVER_NAME' ] != 'localhost' ){

	mail($to,$subject,$body,$headers, '-f noreply@rdg-connect.org -F "Reading Charity Connect"');
}

}

function login($connection,$email,$password){

$status = session_status();
if($status == PHP_SESSION_NONE){
    //There is no active session
    session_start();
}
// Check if the user is logged in, if not then check for basic auth and if not, redirect them to login page
if(!isset($_SESSION["loggedin"]) || $_SESSION["loggedin"] !== true){
	$stmt = $connection->prepare("SELECT * FROM users WHERE email = :email");
    $stmt->execute(["email"=>$email]);
    $session_user = $stmt->fetch();
    if (!$session_user || !password_verify($password, $session_user['password'])){
    	return false;
    }
    session_destroy();
	session_start();
	$id=$session_user['id'];
	// Store data in session variables
	$_SESSION["loggedin"] = true;
	$_SESSION["id"] = $id;
	$_SESSION["email"] = $session_user['email'];
	$_SESSION["view_all"]=false;
	if(isset($session_user['display_name'])){
	  $_SESSION["display_name"] = $session_user['display_name'];
	} else {
	  $_SESSION["display_name"] = $session_user['email'];
	}
	$_SESSION["organization_id"]=0;
	$_SESSION["organization_name"]="No Confirmed Organizations";
	$sql = "SELECT uo.organization_id,org.name FROM user_organizations uo, organizations org WHERE uo.user_id=:id and uo.confirmed='Y' and uo.organization_id=org.id order by organization_id";
	$stmt= $connection->prepare($sql);
	$stmt->execute(['id'=>$id]);
	if($stmt->rowCount() >0){
		if($row = $stmt->fetch(PDO::FETCH_ASSOC)){
			$_SESSION["organization_id"] = $row['organization_id'];
			$_SESSION["organization_name"]=$row['name'];
		}
	}
	Audit::add($connection,"login","user",$id,null,$email);

}
return true;
}

function set_current_organizaton($organization_id){
	global $connection;

	if($organization_id==-99){
		$_SESSION["view_all"]=true;
		return $_SESSION["organization_name"]."(View All)";
	} else {

		$_SESSION["view_all"]=false;
		$sql = "select uo.organization_id,org.name from user_organizations uo, organizations org where user_id=:user_id and uo.organization_id=:organization_id and uo.confirmed='Y' and uo.organization_id=org.id";
		$stmt= $connection->prepare($sql);
		if( $stmt->execute(['user_id'=>$_SESSION["id"],'organization_id'=>$organization_id])){
			$row = $stmt->fetch(PDO::FETCH_ASSOC);
			$org_id= $row['organization_id'];
			if($org_id==$organization_id){
				$_SESSION["organization_id"] = $organization_id;
				$_SESSION["organization_name"] = $row['name'];
				return $row['name'];
			}
		}
	}
  	return false;
}

function get_current_organizaton(){
	return $_SESSION["organization_id"];
}

function logout($connection){
    if(!isset($_SESSION)) 
    { 
		session_start();
	}
	$uid=null;
	if(isset($_SESSION['id'])){
		$uid=$_SESSION['id'];
	}
	$uemail=null;
	if(isset($_SESSION["email"])){
		$uemail=$_SESSION["email"];
	}
	Audit::add($connection,"logout","user",$uid,null,$uemail);
	// Initialize the session

	// Unset all of the session variables
	$_SESSION = array();

	// Destroy the session.
	session_destroy();

}

function password_reset_request($email){
	global $connection;
	global $site_address;
	if(!isset($connection)){
		include_once $_SERVER['DOCUMENT_ROOT'] .'/config/dbclass.php';
		$dbclass = new DBClass();
		$connection = $dbclass->getConnection();
	}
	$reset_string=generate_string(60);

	$stmt = $connection->prepare("UPDATE users set password_confirmation_string = :confirmation_string WHERE email = :email");
    $success= $stmt->execute(["confirmation_string"=>$reset_string,"email"=>$email]);

    if($success==true && $stmt->rowCount()>0){
    	sendHtmlMail($email,get_string("password_reset_subject"),get_string("password_reset_body",array("%LINK%"=>$site_address."/reset_confirm.html?email=".urlencode($email)."&key=".urlencode($reset_string))));
    	return true;
    } else {
    	return false;
    }
}

function password_reset_confirm($email,$key,$new_password){
	global $connection;
	if(!isset($connection)){
		include_once $_SERVER['DOCUMENT_ROOT'] .'/config/dbclass.php';
		$dbclass = new DBClass();
		$connection = $dbclass->getConnection();
	}

	$sql="SELECT id from users WHERE email = :email and password_confirmation_string=:key and password_confirmation_string is not null";
	$stmt= $connection->prepare($sql);
	$stmt->execute(['email'=>$email,'key'=>$key]);
	if($stmt->rowCount() >0){
		if($row = $stmt->fetch(PDO::FETCH_ASSOC)){
			$id = $row['id'];
			$stmt = $connection->prepare("UPDATE users set password = :password,password_confirmation_string=null WHERE id = :id");
			$success= $stmt->execute(["password"=>password_hash($new_password, PASSWORD_DEFAULT),"id"=>$id]);
			Audit::add($connection,"login","password_reset",$id,null,$email);
			return $success;
		}
	}
    return false;
}

/*::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::*/
/*::                                                                         :*/
/*::  This routine calculates the distance between two points (given the     :*/
/*::  latitude/longitude of those points). It is being used to calculate     :*/
/*::  the distance between two locations using GeoDataSource(TM) Products    :*/
/*::                                                                         :*/
/*::  Definitions:                                                           :*/
/*::    South latitudes are negative, east longitudes are positive           :*/
/*::                                                                         :*/
/*::  Passed to function:                                                    :*/
/*::    lat1, lon1 = Latitude and Longitude of point 1 (in decimal degrees)  :*/
/*::    lat2, lon2 = Latitude and Longitude of point 2 (in decimal degrees)  :*/
/*::    unit = the unit you desire for results                               :*/
/*::           where: 'M' is statute miles (default)                         :*/
/*::                  'K' is kilometers                                      :*/
/*::                  'N' is nautical miles                                  :*/
/*::  Worldwide cities and other features databases with latitude longitude  :*/
/*::  are available at https://www.geodatasource.com                          :*/
/*::                                                                         :*/
/*::  For enquiries, please contact sales@geodatasource.com                  :*/
/*::                                                                         :*/
/*::  Official Web site: https://www.geodatasource.com                        :*/
/*::                                                                         :*/
/*::         GeoDataSource.com (C) All Rights Reserved 2018                  :*/
/*::                                                                         :*/
/*::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::*/
function distance($lat1, $lon1, $lat2, $lon2, $unit) {
  if (($lat1 == $lat2) && ($lon1 == $lon2)) {
    return 0;
  }
  else {
    $theta = $lon1 - $lon2;
    $dist = sin(deg2rad($lat1)) * sin(deg2rad($lat2)) +  cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * cos(deg2rad($theta));
    $dist = acos($dist);
    $dist = rad2deg($dist);
    $miles = $dist * 60 * 1.1515;
    $unit = strtoupper($unit);

    if ($unit == "K") {
      return ($miles * 1.609344);
    } else if ($unit == "N") {
      return ($miles * 0.8684);
    } else {
      return $miles;
    }
  }
}