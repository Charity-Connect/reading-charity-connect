<?php

include_once $_SERVER['DOCUMENT_ROOT'] .'/lib/common.php';
include_once $_SERVER['DOCUMENT_ROOT'] .'/entities/Offer.php';

$connection=initRest();

$method = $_SERVER['REQUEST_METHOD'];

    $offer = new Offer($connection);
$data = json_decode(file_get_contents('php://input'), true);
if(isset($data)&&$method=="POST") {
    // doing a create or update
    header("Access-Control-Allow-Methods: POST");
    header("Access-Control-Max-Age: 3600");
    header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");


    $offer->name = $data['name'];
    $offer->type_id = $data['type_id'];
    $offer->details = $data['details'];
    $offer->quantity = $data['quantity'];
    $offer->date_available = $data['date_available'];
    $offer->date_end = $data['date_end'];
    $offer->postcode = $data['postcode'];
    $offer->distance = $data['distance'];

    if(isset($data['id'])){
        $offer->id = $data['id'];
        if($offer->update()){
            $offer->read();
            echo json_encode($offer);
        }else{
            echo '{';
                echo '"message": "Unable to update offer."';
            echo '}';
        }

    } else {
	$id=$offer->create();
        if($id>0){
            $offer_arr  = array(
                    "id" => $offer->id,
                    "organization_id" => $offer->organization_id,
                    "name" => $offer->name,
                    "type_id" => $offer->type_id,
                    "details" => $offer->details,
                    "quantity" => $offer->quantity,
                    "date_available" => $offer->date_available,
                    "date_end" => $offer->date_end,
                    "postcode" => $offer->postcode,
                    "distance" => $offer->distance,
					"creation_date" => $offer->creation_date,
					"created_by" => $offer->created_by,
					"update_date" => $offer->update_date,
					"updated_by" => $offer->updated_by
                    );
            echo json_encode($offer_arr);

        }else{
            echo '{';
                echo '"message": "Unable to create offer."';
            echo '}';
        }
    }
} else if ($method=="GET") {
    // querying

    $view = "";
    if(isset($_GET["view"]))
	    $view = $_GET["view"];

    if($view=="one") {
        $offer->id=$_GET["id"];
        $offer->read();
        echo json_encode($offer);
    } else {
        $stmt = $offer->readAll();
        $count = $stmt->rowCount();

        if($count > 0){

            $offers = array();
            $offers["offers"] = array();
            $offers["count"] = $count;

            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)){

                extract($row);

                $offer  = array(
                "organization_id" => $organization_id,
                "organization_name" => $organization_name,
                "id" => $id,
                "name" => $name,
                "type_id" => $type_id,
                "type_name" => $type_name,
                "category_id" => $category_id,
                "details" => $details,
                "quantity" => $quantity,
                "quantity_taken" => $quantity_taken,
                "quantity_available" => $quantity_available,
                "date_available" => $date_available,
                "date_end" => $date_end,
                "postcode" => $postcode,
                "distance" => $distance,
                "creation_date" => $creation_date,
                "created_by" => $created_by,
                "update_date" => $update_date,
                "updated_by" => $updated_by
              );

                array_push($offers["offers"], $offer);
            }

            echo json_encode($offers);
        } else {
            $offers = array();
            $offers["offers"] = array();
            $offers["count"] = 0;

            echo json_encode($offers);
        }
    }
} else if ($method=="DELETE"){
    if(isset($_GET["id"])){
        $offer->id=$_GET["id"];
        if($offer->delete()){
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
