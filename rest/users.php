<?php
include_once $_SERVER['DOCUMENT_ROOT'] .'/lib/common.php';
include_once $_SERVER['DOCUMENT_ROOT'] .'/entities/User.php';

$connection=initRest();
$method = $_SERVER['REQUEST_METHOD'];

$user = new User($connection);
$data = json_decode(file_get_contents('php://input'), true);
if(isset($data)&&$method=="POST") {
    // doing a create or update
    header("Access-Control-Allow-Methods: POST");
    header("Access-Control-Max-Age: 3600");
    header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");


    $user->display_name = $data['display_name'];
	if(isset($data['email'])){
		$user->email = $data['email'];
	} 
	if(isset($data['phone'])){
		$user->phone = $data['phone'];
	}
    $organization_id=$_SESSION['organization_id'];
    if(isset($data['organization_id'])){
    	$organization_id=$data['organization_id'];
    }

    if(isset($data['id'])){
        $user->id = $data['id'];
        if($user->update()){
            $user->read();
            echo json_encode($user);
        }else{
            echo '{"error": "Unable to update user."}';
        }

    } else {
		if(is_null($user->email)){
            echo '{"error": "Email not set."}';
			http_response_code(400);
			return;
		}
		if(is_null($user->display_name)){
            echo '{"error": "Name not set."}';
			http_response_code(400);
			return;
		}
		$id=$user->create($organization_id);
		if($id>0){
					$user->read();
					echo json_encode($user);

		}else{
			echo '{';
				echo '"message": "Unable to create user."';
			echo '}';
		}
    }

} else if ($method=="GET") {

    // querying

    $view = "";
    if(isset($_GET["view"]))
	    $view = $_GET["view"];

    if($view=="one") {
        $user->id=$_GET["id"];
        $user->read();
        echo json_encode($user);
    } else if ($view=="current"){
        $user->id=$_SESSION["id"];
        $user->read();
        echo json_encode($user);
    }else {
        $stmt = $user->readAll();
        $count = $stmt->rowCount();

        if($count > 0){

            $users = array();
            $users["users"] = array();
            $users["count"] = $count;

            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)){

                extract($row);

                $user  = array(
                "id" => $id,
                "display_name" => $display_name,
                "email" => $email,
                "phone" => $phone,
                "creation_date" => $creation_date,
                "created_by" => $created_by,
                "update_date" => $update_date,
                "updated_by" => $updated_by
                );

                array_push($users["users"], $user);
            }

            echo json_encode($users);
        } else {
            $users = array();
            $users["users"] = array();
            $users["count"] = 0;

            echo json_encode($users);
        }
    }

}
?>
