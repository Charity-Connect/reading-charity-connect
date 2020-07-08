<?php

include_once $_SERVER['DOCUMENT_ROOT'] .'/lib/common.php';
include_once $_SERVER['DOCUMENT_ROOT'] .'/entities/ClientNeed.php';

$connection=initRest();
$method = $_SERVER['REQUEST_METHOD'];

    $client_needs = new ClientNeed($connection);
$data = json_decode(file_get_contents('php://input'), true);
$view = "";
if(isset($_GET["view"]))
	$view = $_GET["view"];

	if(isset($data)&&$method=="POST") {
    // doing a create or update
    header("Access-Control-Allow-Methods: POST");
    header("Access-Control-Max-Age: 3600");
    header("Access-Control-Allow-Headers: Content-type, Access-Control-Allow-Headers, Authorization, X-Requested-With");


    $client_needs->client_id = $_GET['client_id'];
    $client_needs->type = $data['type'];
    $client_needs->date_needed = $data['date_needed'];
	$client_needs->need_met = isset($data['need_met'])?$data['need_met']:'N';
	$client_needs->notes = isset($data['notes'])?$data['notes']:NULL;
	

    if($view=="matches"){
		$offer_list=$client_needs->getMatchingOffers();
		echo json_encode($offer_list);

	} else if(isset($data['id'])){
        $client_needs->id = $data['id'];
		$client_needs->client_id=$_GET["client_id"];
		$organization_list = $data['organization_list'];

        if($client_needs->update($organization_list)){
            $client_needs->read();
            echo json_encode($client_needs);
        }else{
            echo '{';
                echo '"message": "Unable to update client_needs."';
            echo '}';
        }

    } else {
        $client_needs->client_id=$_GET["client_id"];
		$organization_list = $data['organization_list'];
		$id=$client_needs->create($organization_list);
        if($id>0){
            $client_needs_arr  = array(
                    "id" => $client_needs->id,
                    "client_id" => $client_needs->client_id,
                    "type" => $client_needs->type,
                    "date_needed" => $client_needs->date_needed,
                    "need_met" => $client_needs->need_met,
                    "notes" => $client_needs->notes,
					"creation_date" => $client_needs->creation_date,
					"created_by" => $client_needs->created_by,
					"update_date" => $client_needs->update_date,
					"updated_by" => $client_needs->updated_by
                    );
            echo json_encode($client_needs_arr);

        }else{
            echo '{';
                echo '"message": "Unable to create client_needs."';
            echo '}';
        }
    }

} else if ($method=="GET") {
    // querying

    if($view=="one") {
        $client_needs->id=$_GET["id"];
        $client_needs->client_id=$_GET["client_id"];
        $client_needs->read();
        echo json_encode($client_needs);
    } else {
        $client_needs->client_id=$_GET["client_id"];
        $stmt = $client_needs->readAll($client_needs->client_id);
        $count = $stmt->rowCount();

        if($count > 0){

            $client_needs = array();
            $client_needs["client_needs"] = array();
            $client_needs["count"] = $count;

            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)){
                extract($row);

                $client_need  = array(
                "id" => $id,
                "client_id" => $client_id,
                "requesting_organization_id" => $requesting_organization_id,
                "type" => $type,
                "type_name" => $type_name,
                "category" => $category,
                "date_needed" => $date_needed,
                "need_met" => $need_met,
                "notes" => $notes,
                "creation_date" => $creation_date,
                "created_by" => $created_by,
                "update_date" => $update_date,
                "updated_by" => $updated_by
                );

                array_push($client_needs["client_needs"], $client_need);
            }

            echo json_encode($client_needs);
        } else {
            $client_needs = array();
            $client_needs["client_needs"] = array();
            $client_needs["count"] = 0;

            echo json_encode($client_needs);
        }
    }

} else if ($method=="DELETE"){
    if(isset($_GET["id"])){
      $client_needs->id=$_GET["id"];
      if($client_needs->delete()){
        echo '{"message": "success"}';
      } else {
        echo '{"message": "error"}';
        http_response_code(403);
      }
    } else {
      echo '{"error": "ID not set."}';
      http_response_code(400);
      return;
    }
    
} else {
	http_response_code(405);
}
?>
