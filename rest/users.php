<?php
include_once $_SERVER['DOCUMENT_ROOT'] .'/lib/common.php';
include_once $_SERVER['DOCUMENT_ROOT'] .'/entities/User.php';

$connection=initRest();

$user = new User($connection);
$data = json_decode(file_get_contents('php://input'), true);
if(isset($data)) {
    // doing a create or update
    header("Access-Control-Allow-Methods: POST");
    header("Access-Control-Max-Age: 3600");
    header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");


    $user->display_name = $data['display_name'];
    $user->email = $data['email'];
    $user->phone = $data['phone'];
    $user->organization_id = $data['organization_id'];

    if(isset($data['id'])){
        $user->id = $data['id'];
        if($user->update()){
            $user->read();
            echo json_encode($user);
        }else{
            echo '{';
                echo '"message": "Unable to update user."';
            echo '}';
        }

    } else {
	$id=$user->create();
        if($id>0){
            $user_arr  = array(
                    "id" => $user->id,
                    "display_name" => $user->display_name,
                    "email" => $user->email,
                    "phone" => $user->phone,
                    "organization_id" => $user->organization_id
                    );
            echo json_encode($user_arr);

        }else{
            echo '{';
                echo '"message": "Unable to create user."';
            echo '}';
        }
    }

} else {

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
                "phone" => $phone
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
