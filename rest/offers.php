<?php

include_once $_SERVER['DOCUMENT_ROOT'] .'/lib/common.php';
include_once $_SERVER['DOCUMENT_ROOT'] .'/entities/Offer.php';

$connection=initRest();


    $offer = new Offer($connection);
$data = json_decode(file_get_contents('php://input'), true);
if(isset($data)) {
    // doing a create or update
    header("Access-Control-Allow-Methods: POST");
    header("Access-Control-Max-Age: 3600");
    header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");


    $offer->name = $data['name'];
    $offer->type = $data['type'];
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
                    "type" => $offer->type,
                    "details" => $offer->details,
                    "quantity" => $offer->quantity,
                    "date_available" => $offer->date_available,
                    "date_end" => $offer->date_end,
                    "postcode" => $offer->postcode,
                    "distance" => $offer->distance
                    );
            echo json_encode($offer_arr);

        }else{
            echo '{';
                echo '"message": "Unable to create offer."';
            echo '}';
        }
    }

} else {

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
                "type" => $type,
                "type_name" => $type_name,
                "details" => $details,
                "quantity" => $quantity,
                "quantity_taken" => $quantity_taken,
                "date_available" => $date_available,
                "date_end" => $date_end,
                "postcode" => $postcode,
                "distance" => $distance
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

}
?>
