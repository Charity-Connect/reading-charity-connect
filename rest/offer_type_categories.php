<?php

include_once $_SERVER['DOCUMENT_ROOT'] .'/lib/common.php';
include_once $_SERVER['DOCUMENT_ROOT'] .'/entities/TypeCategory.php';

$connection=initRest();
$method = $_SERVER['REQUEST_METHOD'];

    $offer_type_category = new TypeCategory($connection);
$data = json_decode(file_get_contents('php://input'), true);
if(isset($data)&&$method=="POST") {
    // doing a create or update
    header("Access-Control-Allow-Methods: POST");
    header("Access-Control-Max-Age: 3600");
    header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

    $offer_type_category->code = $data['code'];
    $offer_type_category->name = $data['name'];
    $offer_type_category->active = $data['active'];

	$code=$offer_type_category->replace();
	if($code!=""){
		$offer_type_category_arr  = array(
				"code" => $offer_type_category->code,
                "name" => $offer_type_category->name,
                "active" => $offer_type_category->active,
				);
		echo json_encode($offer_type_category_arr);

	}else{
		echo '{';
			echo '"message": "Unable to process offer_type_category."';
		echo '}';
	}


} else if ($method=="GET") {
    // querying

    $view = "";
    if(isset($_GET["view"]))
	    $view = $_GET["view"];

    if($view=="one") {
        $offer_type_category->code=$_GET["code"];
        $offer_type_category->read();
        echo json_encode($offer_type_category);
    } else if ($view=="active") {
        $stmt = $offer_type_category->readActive();
        $count = $stmt->rowCount();
        
        if($count > 0) {
            $offer_type_categorys = array();
            $offer_type_categorys["offer_type_categorys"] = array();
            $offer_type_categorys["count"] = $count;
            
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                
                extract($row);
                
                $offer_type_category = array(
                "code" => $code,
                "name" => $name,
                "active" => $active,
                "creation_date" => $creation_date,
                "created_by" => $created_by,
                "update_date" => $update_date,
                "updated_by" => $updated_by
                );

                array_push($offer_type_categorys["offer_type_categorys"], $offer_type_category);
            }

            echo json_encode($offer_type_categorys);
        } else {
            $offer_type_categorys = array();
            $offer_type_categorys["offer_type_categorys"] = array();
            $offer_type_categorys["count"] = 0;
            
            echo json_encode($offer_type_categorys);
        }
    } else {
        $stmt = $offer_type_category->readAll();
        $count = $stmt->rowCount();

        if($count > 0){

            $offer_type_categorys = array();
            $offer_type_categorys["offer_type_categorys"] = array();
            $offer_type_categorys["count"] = $count;

            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)){

                extract($row);

                $offer_type_category  = array(
                "code" => $code,
                "name" => $name,
                "active" => $active,
                "creation_date" => $creation_date,
                "created_by" => $created_by,
                "update_date" => $update_date,
                "updated_by" => $updated_by
                );

                array_push($offer_type_categorys["offer_type_categorys"], $offer_type_category);
            }

            echo json_encode($offer_type_categorys);
        } else {
            $offer_type_categorys = array();
            $offer_type_categorys["offer_type_categorys"] = array();
            $offer_type_categorys["count"] = 0;

            echo json_encode($offer_type_categorys);
        }
    }

} else {
	http_response_code(405);
}
?>
