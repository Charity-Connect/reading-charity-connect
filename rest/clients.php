<?php

include_once $_SERVER['DOCUMENT_ROOT'] .'/lib/common.php';
include_once $_SERVER['DOCUMENT_ROOT'] .'/entities/Client.php';

$connection=initRest();
$method = $_SERVER['REQUEST_METHOD'];

    $client = new Client($connection);
	$data = json_decode(file_get_contents('php://input'), true);
  if(isset($data)&&$method=="POST") {
    // doing a create or update
    header("Access-Control-Allow-Methods: POST");
    header("Access-Control-Max-Age: 3600");
    header("Access-Control-Allow-Headers: Content-address, Access-Control-Allow-Headers, Authorization, X-Requested-With");


    $client->name = $data['name'];
    $client->address = $data['address'];
    $client->postcode = $data['postcode'];
    $client->phone = $data['phone'];
    $client->email = $data['email'];
    $client->notes = $data['notes'];


    if(isset($_GET["action"])){
      $action=$_GET["action"];
      if($action=="duplicate_check"){
        if($duplicateMatches=$client->duplicateCheck()){
        	$duplicateMatchMessage=new stdClass();
        	$duplicateMatchMessage->count=count($duplicateMatches);
        	$duplicateMatchMessage->duplicates=$duplicateMatches;
        	echo json_encode($duplicateMatchMessage);
        } else {
        	echo "{\"count\":0}";
        }
      } else if($action=="duplicate_request"){
    	$id = $data['id'];
    	$organization_id = $data['organization_id'];
    	if($client->requestAccess($id,$organization_id,$client->notes)){
			echo '{"status": "success"}';
    	} else {
			echo '{"status": "failed"}';
    	}
      }
    } else {

		if(isset($data['id'])){
			$client->id = $data['id'];
			if($client->update()){
				$client->read();
				echo json_encode($client);
			}else{
				echo '{';
					echo '"message": "Unable to update client."';
				echo '}';
			}

		} else {
		$id=$client->create();
			if($id>0){
				$client_arr  = array(
						"id" => $client->id,
						"name" => $client->name,
						"address" => $client->address,
						"postcode" => $client->postcode,
						"phone" => $client->phone,
						"email" => $client->email,
						"notes" => $client->notes
						);
				echo json_encode($client_arr);

			}else{
				echo '{';
					echo '"message": "Unable to create client."';
				echo '}';
			}
		}

    }

} else if ($method=="GET") {
    // querying

    $view = "";
    if(isset($_GET["view"]))
	    $view = $_GET["view"];

    if($view=="one") {
        $client->id=$_GET["id"];
        $client->read();
        echo json_encode($client);
    } else {
        $stmt = $client->readAll();
        $count = $stmt->rowCount();
        if($count > 0){

            $clients = array();
            $clients["clients"] = array();
            $clients["count"] = $count;

            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)){

                extract($row);

                $client  = array(
                "id" => $id,
                "name" => $name,
                "address" => $address,
                "postcode" => $postcode,
                "phone" => $phone,
                "email" => $email,
                "notes" => $notes,
                "creation_date" => $creation_date,
                "created_by" => $created_by,
                "update_date" => $update_date,
                "updated_by" => $updated_by
                );

                array_push($clients["clients"], $client);
            }

            echo json_encode($clients);
        } else {
            $clients = array();
            $clients["clients"] = array();
            $clients["count"] = 0;

            echo json_encode($clients);
        }
    }
  } else if ($method=="DELETE"){
    if(isset($_GET["id"])){
      $client->id=$_GET["id"];
      if($client->delete()){
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
