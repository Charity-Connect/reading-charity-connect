<?php

include_once $_SERVER['DOCUMENT_ROOT'] .'/lib/common.php';
include_once $_SERVER['DOCUMENT_ROOT'] .'/entities/client_needs.php';

$connection=initRest();


    $client_needs = new client_needs($connection);
$data = json_decode(file_get_contents('php://input'), true);
if(isset($data)) {
    // doing a create or update
    header("Access-Control-Allow-Methods: POST");
    header("Access-Control-Max-Age: 3600");
    header("Access-Control-Allow-Headers: Content-type, Access-Control-Allow-Headers, Authorization, X-Requested-With");


    $client_needs->client_id = $data['client_id'];
    $client_needs->type = $data['type'];
    $client_needs->date_needed = $data['date_needed'];
    $client_needs->need_met = $data['need_met'];
    $client_needs->notes = $data['notes'];

    if(isset($data['id'])){
        $client_needs->id = $data['id'];
        if($client_needs->update()){
            $client_needs->read();
            echo json_encode($client_needs);
        }else{
            echo '{';
                echo '"message": "Unable to update client_needs."';
            echo '}';
        }

    } else {
	$id=$client_needs->create();
        if($id>0){
            $client_needs_arr  = array(
                    "id" => $client_needs->id,
                    "client_id" => $client_needs->client_id,
                    "type" => $client_needs->type,
                    "date_needed" => $client_needs->date_needed,
                    "need_met" => $client_needs->need_met,
                    "notes" => $client_needs->notes
                    );
            echo json_encode($client_needs_arr);

        }else{
            echo '{';
                echo '"message": "Unable to create client_needs."';
            echo '}';
        }
    }

} else {

    // querying

    $view = "";
    if(isset($_GET["view"]))
	    $view = $_GET["view"];

    if($view=="one") {
        $client_needs->id=$_GET["id"];
        $client_needs->read();
        echo json_encode($client_needs);
    } else {
        $stmt = $client_needs->readAll();
        $count = $stmt->rowCount();

        if($count > 0){

            $client_needs = array();
            $client_needs["client_needss"] = array();
            $client_needs["count"] = $count;

            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)){

                extract($row);

                $client_needs  = array(
                "id" => $id,
                "client_id" => $client_id,
                "type" => $type,
                "date_needed" => $date_needed,
                "need_met" => $need_met,
                "notes" => $notes
                );

                array_push($client_needs["client_needs"], $client_needs);
            }

            echo json_encode($client_needss);
        } else {
            $client_needs = array();
            $client_needs["client_needs"] = array();
            $client_needs["count"] = 0;

            echo json_encode($client_needs);
        }
    }

}
?>
