<?php

include_once $_SERVER['DOCUMENT_ROOT'] .'/lib/common.php';
include_once $_SERVER['DOCUMENT_ROOT'] .'/entities/UserOrganization.php';

class User{

    // Connection instance
    private $connection;
    global $site_address;

    // table columns
    public $id;
    private $password;
    public $display_name;
    public $email;
    public $phone;
    public $confirmed;
    public $organization_id;
    private $confirmation_string;

    public function __construct($connection){
        $this->connection = $connection;
    }

    public function create(){
        $sql = "INSERT INTO users ( password,display_name,email,phone,confirmation_string) values (:password,:display_name,:email,:phone,:confirmation_string)";
        $this->confirmation_string=generate_string(60);
        $stmt= $this->connection->prepare($sql);
        if( $stmt->execute(['password'=>$this->password
        ,'display_name'=>$this->display_name
        ,'email'=>$this->email
        ,'phone'=>$this->phone
        ,'confirmation_string'=>$this->confirmation_string
        ])){
            $this->id=$this->connection->lastInsertId();

            if(isset($this->organization_id)){
                $organization_user = new UserOrganization($this->connection);
                $organization_user->user_id=$this->id;
                $organization_user->organization_id=$this->organization_id;
                $organization_user->admin='N';
                $organization_user->user_approver='N';
                $organization_user->need_approver='N';
                $organization_user->create();
            }

            $messageString=get_string("new_user_confirmation",array("%NAME%"=>$user->display_name,"%LINK%"=>$site_address."/rest/confirm_user.php?id=".$this->id."&key=".$this->confirmation_string));
			sendHtmlMail($this->email,get_string("new_user_subject"),$messageString);

            return $this->id;
        } else {
            return -1;
        }

    }

    public function setPassword($password){
        $this->password=$password;
    }

    public function readAll(){

    	if(is_admin()){
        	$query = "SELECT u.id,u.display_name,u.email,u.phone from users u ORDER BY u.id";
        	$stmt = $this->connection->prepare($query);
        	$stmt->execute();
        } else if(is_org_admin()){
        	$organization_id=$_SESSION["organization_id"];
        	$query = "SELECT u.id,u.display_name,u.email,u.phone from users u, user_organizations o where u.id=o.user_id and o.organization_id=:organization_id ORDER BY u.id";
        	$stmt = $this->connection->prepare($query);
        	$stmt->execute(['organization_id'=>$organization_id]);
        } else {
			$userId=$_SESSION["id"];
        	$query = "SELECT u.id,u.display_name,u.email,u.phone from users u where u.id=:id";
        	$stmt = $this->connection->prepare($query);
        	$stmt->execute(['id'=>$userId]);
        }
        return $stmt;
    }

    public function read(){
        $stmt=$this->readOne($this->id);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        $this->display_name=$row['display_name'];
        $this->email=$row['email'];
        $this->phone=$row['phone'];
        $this->confirmation_string=$row['confirmation_string'];
    }

    public function readOne($id){
        	if(is_admin()){
	        	$query = "SELECT u.id,u.display_name,u.email,u.phone, u.confirmation_string  from users u where u.id=:id";
	        	$stmt = $this->connection->prepare($query);
	        	$stmt->execute(['id'=>$id]);
	        } else if(is_org_admin()){
	        	$organizationId=$_SESSION["organization_id"];
	        	$query = "SELECT u.id,u.display_name,u.email,u.phone from users u, user_organizations o where u.user_id=o.user_id and o.organization_id=:organization_id and u.id=:id";
	        	$stmt = $this->connection->prepare($query);
	        	$stmt->execute(['organization_id'=>$organization_id,'id'=>$id]);
	        } else {
				$user_id=$_SESSION["id"];
	        	$query = "SELECT u.id,u.display_name,u.email,u.phone from users u where u.id=:id and u.id=:id2";
	        	$stmt = $this->connection->prepare($query);
		        $stmt->execute(['id'=>$id,'id2'=>$user_id]);
        }
	        return $stmt;
	    }

    public function update(){
    	$stmt=$this->readOne($this->id);
		if($stmt->rowCount()==1){
			$sql = "UPDATE users SET display_name=:display_name, email=:email,phone=:phone WHERE id=:id";
			$stmt= $this->connection->prepare($sql);
			return $stmt->execute(['id'=>$this->id,'display_name'=>$this->display_name,'email'=>$this->email,'phone'=>$this->phone]);
		} else {
			return false;
		}
    }

    public function delete(){
    	$stmt=$this->readOne($this->id);
		if($stmt->rowCount()==1){
			$sql = "DELETE FROM users WHERE id=:id";
			$stmt= $this->connection->prepare($sql);
			return $stmt->execute(['id'=>$this->id]);
		} else {
			return false;
		}
    }

    public function confirmUser($confirmation_string){
        if($confirmation_string==$this->confirmation_string){
            $sql = "UPDATE users SET confirmed='Y' WHERE id=:id";
            $stmt= $this->connection->prepare($sql);
            return $stmt->execute(['id'=>$this->id]);
        } else {
            return false;
        }
    }
}
