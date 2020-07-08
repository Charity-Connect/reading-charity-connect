<?php

include_once $_SERVER['DOCUMENT_ROOT'] .'/lib/common.php';
include_once $_SERVER['DOCUMENT_ROOT'] .'/entities/OfferType.php';

$connection=initRest();
$method = $_SERVER['REQUEST_METHOD'];

    $offer_type = new OfferType($connection);
$data = json_decode(file_get_contents('php://input'), true);
if(isset($data)&&$method=="POST") {
    // doing a create or update
    header("Access-Control-Allow-Methods: POST");
    header("Access-Control-Max-Age: 3600");
    header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");


    $offer_type->name = $data['name'];
    $offer_type->category_id = $data['category_id'];
    $offer_type->default_text = $data['default_text'];
    $offer_type->active = $data['active'];

    if(isset($data['id'])){
		$offer_type->id=$data['id'];
		$offer_type->update();
		$offer_type->read();
		echo json_encode($offer_type);

		/*$offer_type_arr  = array(
				"name" => $offer_type->name,
				"id" => $offer_type->id,
				"category_id" => $offer_type->category_id,
				"default_text" => $offer_type->default_text,
				"active" => $offer_type->active,
				"creation_date" => $offer_type->creation_date,
				"created_by" => $offer_type->created_by,
				"update_date" => $offer_type->update_date,
				"updated_by" => $offer_type->updated_by
				);
		echo json_encode($offer_type_arr);*/
			} else {
				$offer_type->create();
				$offer_type->read();
				echo json_encode($offer_type);
		
			}

	


} else if ($method=="GET") {

    // querying
    $view = "";
    if(isset($_GET["view"]))
	    $view = $_GET["view"];

    if($view=="one") {
        $offer_type->id=$_GET["id"];
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
                "id" => $id,
                "category_id" => $category_id,
                "category_name" => $category_name,
                "default_text" => $default_text,
                "creation_date" => $creation_date,
                "created_by" => $created_by,
                "update_date" => $update_date,
                "updated_by" => $updated_by
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
        $stmt = $offer_type->readActiveCategory($_GET["category_id"]);
        $count = $stmt->rowCount();

        if($count > 0){

            $offer_types = array();
            $offer_types["offer_types"] = array();
            $offer_types["count"] = $count;

            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)){

                extract($row);

                $offer_type  = array(
                "name" => $name,
                "id" => $id,
                "category_id" => $category_id,
                "category_name" => $category_name,
                "default_text" => $default_text,
                "creation_date" => $creation_date,
                "created_by" => $created_by,
                "update_date" => $update_date,
                "updated_by" => $updated_by
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
                "id" => $id,
                "category_id" => $category_id,
                "category_name" => $category_name,
                "default_text" => $default_text,
                "active" => $active,
                "creation_date" => $creation_date,
                "created_by" => $created_by,
                "update_date" => $update_date,
                "updated_by" => $updated_by
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

} else {
	http_response_code(405);
}
?>
