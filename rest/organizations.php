<?php

include_once $_SERVER['DOCUMENT_ROOT'] .'/lib/common.php';
include_once $_SERVER['DOCUMENT_ROOT'] .'/entities/Organization.php';

$connection=initRest();


$organization = new Organization($connection);
$data = json_decode(file_get_contents('php://input'), true);
if(isset($data)) {
    // doing a create or update
    header("Access-Control-Allow-Methods: POST");
    header("Access-Control-Max-Age: 3600");
    header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");


    $organization->name = $data['name'];
    $organization->address = $data['address'];
    $organization->phone = $data['phone'];

    if(isset($data['id'])){
        $organization->id = $data['id'];
        if($organization->update()){
            $organization->read();
            echo json_encode($organization);
        }else{
            echo '{';
                echo '"message": "Unable to update organization."';
            echo '}';
        }

    } else {
	$id=$organization->create();
        if($id>0){
            $organization_arr  = array(
                    "id" => $organization->id,
                    "name" => $organization->name,
                    "address" => $organization->address,
                    "phone" => $organization->phone
                    );
            echo json_encode($organization_arr);

        }else{
            echo '{';
                echo '"message": "Unable to create organization."';
            echo '}';
        }
    }

} else {

    // querying

    $view = "";
    if(isset($_GET["view"]))
	    $view = $_GET["view"];

    if($view=="one") {
        $organization->id=$_GET["id"];
        $organization->read();
        echo json_encode($organization);
    } else {
        $stmt = $organization->readAll();
        $count = $stmt->rowCount();

        if($count > 0){

            $organizations = array();
            $organizations["organizations"] = array();
            $organizations["count"] = $count;

            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)){

                extract($row);

                $organization  = array(
                "id" => $id,
                "name" => $name,
                "address" => $address,
                "phone" => $phone,
                "creation_date" => $creation_date,
                "created_by" => $created_by,
                "update_date" => $update_date,
                "updated_by" => $updated_by
                );

                array_push($organizations["organizations"], $organization);
            }

            echo json_encode($organizations);
        } else {
            $organizations = array();
            $organizations["organizations"] = array();
            $organizations["count"] = 0;

            echo json_encode($organizations);
        }
    }

}
?>
