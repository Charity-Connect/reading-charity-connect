<?php

include_once $_SERVER['DOCUMENT_ROOT'] .'/lib/common.php';
include_once $_SERVER['DOCUMENT_ROOT'] .'/entities/UserOrganization.php';

$connection=initRest();


    $user_organization = new UserOrganization($connection);
$data = json_decode(file_get_contents('php://input'), true);
if(isset($data)) {
    // doing a create or update
    header("Access-Control-Allow-Methods: POST");
    header("Access-Control-Max-Age: 3600");
    header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");


    $user_organization->id = $data['id'];
    $user_organization->admin = $data['admin'];
    $user_organization->user_approver = $data['user_approver'];
    $user_organization->need_approver = $data['need_approver'];
    $user_organization->manage_offers = $data['manage_offers'];
    $user_organization->manage_clients = $data['manage_clients'];
    $user_organization->client_share_approver = $data['client_share_approver'];
    if(isset($data['confirmed'])){
    	$user_organization->confirmed = $data['confirmed'];
    }


    if(isset($data['id'])){
        if($user_organization->update()){
            $user_organization->read();
            echo json_encode($user_organization);
        }else{
            echo '{';
                echo '"message": "Unable to update user_organization."';
            echo '}';
        }

    } else {
	    $user_organization->user_id = $data['user_id'];
		$id=$user_organization->create();
        if($id>0){
            $user_organization_arr  = array(
                    "id" => $user_organization->id,
                    "user_id" => $user_organization->user_id,
                    "admin" => $user_organization->admin,
                    "user_approver" => $user_organization->user_approver,
                    "need_approver" => $user_organization->need_approver,
                    "manage_offers" => $user_organization->manage_offers,
                    "manage_clients" => $user_organization->manage_clients,
                    "client_share_approver" => $user_organization->client_share_approver
                    );
            echo json_encode($user_organization_arr);

        }else{
            echo '{';
                echo '"message": "Unable to create user_organization."';
            echo '}';
        }
    }

} else {

    // querying

    $view = "";
    if(isset($_GET["view"]))
	    $view = $_GET["view"];

    if($view=="one") {
        $user_organization->id=$_GET["id"];
        $user_organization->read();
        echo json_encode($user_organization);
    } else if($view=="user" || $view=="current_user") {
    	if($view=="current_user"){
    		$user_id=$_SESSION['id'];
    	} else {
        	$user_id=$_GET["user_id"];
        }
        $stmt = $user_organization->readAllUser($user_id);
        $count = $stmt->rowCount();

        if($count > 0){

            $user_organizations = array();
            $user_organizations["user_organizations"] = array();
            $user_organizations["count"] = $count;

            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)){

                extract($row);

                $user_organization  = array(
                "id" => $id,
                "user_id" => $user_id,
                "organization_id" => $organization_id,
                "admin" => $admin,
                "user_approver" => $user_approver,
                "need_approver" => $need_approver,
                "manage_offers" => $manage_offers,
                "manage_clients" => $manage_clients,
                "client_share_approver" => $client_share_approver,
                "confirmed" => $confirmed,
                "creation_date" => $creation_date,
                "created_by" => $created_by,
                "update_date" => $update_date,
                "updated_by" => $updated_by
                );

                array_push($user_organizations["user_organizations"], $user_organization);
            }

            echo json_encode($user_organizations);
        } else {
            $user_organizations = array();
            $user_organizations["user_organizations"] = array();
            $user_organizations["count"] = 0;

            echo json_encode($user_organizations);
        }
    } else if($view=="org") {
        $organization_id=$_GET["organization_id"];
        $stmt = $user_organization->readAllOrganization($organization_id);
        $count = $stmt->rowCount();

        if($count > 0){

            $user_organizations = array();
            $user_organizations["user_organizations"] = array();
            $user_organizations["count"] = $count;

            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)){

                extract($row);

                $user_organization  = array(
                "id" => $id,
                "user_id" => $user_id,
                "organization_id" => $organization_id,
                "admin" => $admin,
                "user_approver" => $user_approver,
                "need_approver" => $need_approver,
                "manage_offers" => $manage_offers,
                "manage_clients" => $manage_clients,
                "client_share_approver" => $client_share_approver,
                "confirmed" => $confirmed,
                "creation_date" => $creation_date,
                "created_by" => $created_by,
                "update_date" => $update_date,
                "updated_by" => $updated_by
                );

                array_push($user_organizations["user_organizations"], $user_organization);
            }

            echo json_encode($user_organizations);
        } else {
            $user_organizations = array();
            $user_organizations["user_organizations"] = array();
            $user_organizations["count"] = 0;

            echo json_encode($user_organizations);
        }
    } else {
        $stmt = $user_organization->readAll();
        $count = $stmt->rowCount();

        if($count > 0){

            $user_organizations = array();
            $user_organizations["user_organizations"] = array();
            $user_organizations["count"] = $count;

            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)){

                extract($row);

                $user_organization  = array(
                "id" => $id,
                "user_id" => $user_id,
                "organization_id" => $organization_id,
                "admin" => $admin,
                "user_approver" => $user_approver,
                "need_approver" => $need_approver,
                "manage_offers" => $manage_offers,
                "manage_clients" => $manage_clients,
                "client_share_approver" => $client_share_approver,
                "confirmed" => $confirmed,
                "creation_date" => $creation_date,
                "created_by" => $created_by,
                "update_date" => $update_date,
                "updated_by" => $updated_by
                );

                array_push($user_organizations["user_organizations"], $user_organization);
            }

            echo json_encode($user_organizations);
        } else {
            $user_organizations = array();
            $user_organizations["user_organizations"] = array();
            $user_organizations["count"] = 0;

            echo json_encode($user_organizations);
        }
    }
}
?>
