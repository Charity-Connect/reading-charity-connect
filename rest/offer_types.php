<?php

include_once $_SERVER['DOCUMENT_ROOT'] .'/lib/common.php';
include_once $_SERVER['DOCUMENT_ROOT'] .'/entities/OfferType.php';

$connection=initRest();

$offer_type = new OfferType($connection);
$data = json_decode(file_get_contents('php://input'), true);
if(isset($data)) {
    // doing a create or update
    header("Access-Control-Allow-Methods: POST");
    header("Access-Control-Max-Age: 3600");
    header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");


    $offer_type->name = $data['name'];
    $offer_type->type = $data['type'];
    $offer_type->category = $data['category'];
    $offer_type->default_text = $data['default_text'];
    $offer_type->active = $data['active'];


	$type=$offer_type->replace();
	if($type=""){
		$offer_type_arr  = array(
				"name" => $offer_type->name,
				"type" => $offer_type->type,
				"category" => $offer_type->category,
				"default_text" => $offer_type->default_text,
				"active" => $offer_type->active
				);
		echo json_encode($offer_type_arr);

	}else{
		echo '{';
			echo '"message": "Unable to process offer_type."';
		echo '}';
	}


} else {

    // querying
    $view = "";
    if(isset($_GET["view"]))
	    $view = $_GET["view"];

    if($view=="one") {
        $offer_type->type=$_GET["type"];
        $offer_type->read();
        echo json_encode($offer_type);
    } else if ($view=="active") {
        $stmt = $offer_type->readActive();
        $count = $stmt->rowCount();

        if($count > 0){

            $offer_types = array();
            $offer_types["offer_types"] = array();
            $offer_types["count"] = $count;

            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)){

                extract($row);

                $offer_type  = array(
                "name" => $name,
                "type" => $type,
                "category" => $category,
                "default_text" => $default_text
                );

                array_push($offer_types["offer_types"], $offer_type);
            }

            echo json_encode($offer_types);
        } else {
            $offer_types = array();
            $offer_types["offer_types"] = array();
            $offer_types["count"] = 0;

            echo json_encode($offer_types);
        }
	} else if ($view=="active_category") {
        $stmt = $offer_type->readActiveCategory($_GET["category"]);
        $count = $stmt->rowCount();

        if($count > 0){

            $offer_types = array();
            $offer_types["offer_types"] = array();
            $offer_types["count"] = $count;

            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)){

                extract($row);

                $offer_type  = array(
                "name" => $name,
                "type" => $type,
                "default_text" => $default_text
                );

                array_push($offer_types["offer_types"], $offer_type);
            }

            echo json_encode($offer_types);
		} else {
			$offer_types = array();
			$offer_types["offer_types"] = array();
			$offer_types["count"] = 0;

			echo json_encode($offer_types);
		}

    } else {
        $stmt = $offer_type->readAll();
        $count = $stmt->rowCount();

        if($count > 0){

            $offer_types = array();
            $offer_types["offer_types"] = array();
            $offer_types["count"] = $count;

            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)){

                extract($row);

                $offer_type  = array(
                "name" => $name,
                "type" => $type,
                "category" => $category,
                "default_text" => $default_text,
                "active" => $active
                );

                array_push($offer_types["offer_types"], $offer_type);
            }

            echo json_encode($offer_types);
        } else {
            $offer_types = array();
            $offer_types["offer_types"] = array();
            $offer_types["count"] = 0;

            echo json_encode($offer_types);
        }
    }

}
?>
