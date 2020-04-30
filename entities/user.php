<?php

include_once $_SERVER['DOCUMENT_ROOT'] .'/lib/common.php';
include_once $_SERVER['DOCUMENT_ROOT'] .'/entities/organization.php';

class User{

    // Connection instance
    private $connection;

    // table name

    // table columns
    public $id;
    private $password;
    public $display_name;
    public $email;
    public $phone;
    public $organization_id;
    public $organization_name;
    public $confirmed;
    private $confirmation_string;

    public function __construct($connection){
        $this->connection = $connection;
    }

    public function create(){
        $sql = "INSERT INTO users ( password,display_name,email,phone,organization_id,confirmation_string) values (:password,:display_name,:email,:phone,:organization_id,:confirmation_string)";
        $this->confirmation_string=generate_string(60);
        $stmt= $this->connection->prepare($sql);
        if( $stmt->execute(['password'=>$this->password
        ,'display_name'=>$this->display_name
        ,'email'=>$this->email
        ,'phone'=>$this->phone
        ,'organization_id'=>$this->organization_id
        ,'confirmation_string'=>$this->confirmation_string
        ])){
            $this->id=$this->connection->lastInsertId();

            if(isset($this->organization_id)){
                $organization = new Organization($this->connection);
                $organization->id=$this->organization_id;
                $organization->read();
                mail($organization->approver_email,"New Connect Reading User Approval","A new user, ".$this->email.", has registered on Connect Reading with your organization. Please confirm this user should be granted access by clicking on http://connect-reading.ai-apps.com/login/confirm_user.php?id=".$this->id."&key=".$this->confirmation_string);
            }
            return $this->id;
        } else {
            return -1;
        }

    }

    public function setPassword($password){
        $this->password=$password;
    }

    public function readAll(){
        $query = "SELECT u.id,u.display_name,u.email,u.phone,o.name as organization_name from users u left join organizations o on u.organization_id=o.id ORDER BY u.id";
        $stmt = $this->connection->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    public function read(){
        $stmt=$this->readOne($this->id);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        $this->display_name=$row['display_name'];
        $this->email=$row['email'];
        $this->phone=$row['phone'];
        $this->organization_id=$row['organization_id'];
        $this->organization_name=$row['organization_name'];
        $this->confirmation_string=$row['confirmation_string'];
    }

    public function readOne($id){
	        $query = "SELECT u.id,u.display_name,u.email,u.phone,u.organization_id, u.confirmation_string, o.name as organization_name from users u left join organizations o on u.organization_id=o.id where u.id=:id";
	        $stmt = $this->connection->prepare($query);
	        $stmt->execute(['id'=>$id]);
	        return $stmt;
	    }

    public function update(){

        $sql = "UPDATE users SET display_name=:display_name, email=:email,phone=:phone WHERE id=:id";
        $stmt= $this->connection->prepare($sql);
        return $stmt->execute(['id'=>$this->id,'display_name'=>$this->display_name,'email'=>$this->email,'phone'=>$this->phone]);
    }

    public function delete(){
        $sql = "DELETE FROM users WHERE id=:id";
        $stmt= $this->connection->prepare($sql);
        return $stmt->execute(['id'=>$this->id]);
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
