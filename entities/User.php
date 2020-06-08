<?php

include_once $_SERVER['DOCUMENT_ROOT'] .'/lib/common.php';
include_once $_SERVER['DOCUMENT_ROOT'] .'/entities/UserOrganization.php';

class User{

    // Connection instance
    private $connection;

    // table columns
    public $id;
    private $password="";
    public $display_name;
    public $email;
    public $phone;
    public $confirmed;
    private $confirmation_string;
    private $force_read=false;
    public $admin;
    public $organization_name;
    public $organization_id;
    public $user_organizations=array();

    public function __construct($connection){
        $this->connection = $connection;
    }

    public function create($organization_id){
        global $site_address;

        $sql = "INSERT INTO users ( password,display_name,email,phone,confirmation_string,created_by,updated_by) values (:password,:display_name,:email,:phone,:confirmation_string,:user_id,:user_id)";
        $this->confirmation_string=generate_string(60);
        $stmt= $this->connection->prepare($sql);
        if( $stmt->execute(['password'=>$this->password
        ,'display_name'=>$this->display_name
        ,'email'=>$this->email
        ,'phone'=>$this->phone
        ,'confirmation_string'=>$this->confirmation_string
        ,'user_id'=>$_SESSION['id']
        ])){
            $this->id=$this->connection->lastInsertId();
			$organization_user = new UserOrganization($this->connection);
			$organization_user->user_id=$this->id;
			$organization_user->organization_id=$organization_id;
			$organization_user->admin='N';
			$organization_user->user_approver='N';
			$organization_user->need_approver='N';
			if(isset($_SESSION['id'])){
				$organization_user->confirmed='Y';
			} else {
				$organization_user->confirmed='N';
			}
			$organization_user->create();



            $messageString=get_string("new_user_confirmation",array("%NAME%"=>$this->display_name,"%LINK%"=>$site_address."/rest/confirm_user.php?id=".$this->id."&key=".$this->confirmation_string));
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

	public function forceRead($id){
		$this->force_read=true;
		$this->id=$id;
		$this->read();
	}
    public function read(){
        $stmt=$this->readOne($this->id);
        $row = $stmt->fetch(PDO::FETCH_ASSOC,PDO::FETCH_NUM, PDO::FETCH_ORI_NEXT);
        $this->display_name=$row['display_name'];
        $this->id=$row['id'];
        $this->email=$row['email'];
        $this->phone=$row['phone'];
        $this->confirmed=$row['confirmed'];
        $this->admin=is_null($row['admin'])?"N":"Y";
        $this->organization_id=$row['organization_id'];
        $this->organization_name=$row['organization_name'];
        if(isset($row['confirmation_string'])){
        	$this->confirmation_string=$row['confirmation_string'];
        } else {
        	$this->confirmation_string=null;
        }
                $organization_user = new UserOrganization($this->connection);
		        $stmt=$organization_user->readAllUser($this->id);
		        $this->user_organizations=array();
		        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)){
					extract($row);
					$user_organization  = array(
					"id" => $id,
					"user_id" => $user_id,
					"organization_id" => $organization_id,
					"organization_name" => $organization_name,
					"organization_admin" => $admin,
					"user_approver" => $user_approver,
					"need_approver" => $need_approver,
					"manage_offers" => $manage_offers,
					"manage_clients" => $manage_clients,
					"confirmed" => $confirmed
					);
			        array_push($this->user_organizations,$user_organization);
			}

    }

    public function readOne($id){
        	if(is_admin()||$this->force_read==true){
	        	$query = "SELECT u.id,u.display_name,u.email,u.phone,u.confirmed, org.id as organization_id, org.name as organization_name, role.role_id as admin from users u left join user_roles role on role.user_id=u.id and role.role_id=1, user_organizations uo, organizations org where u.id=uo.user_id and org.id=uo.organization_id and u.id=:id order by if(org.id=:organization_id,-1,u.id)";
	        	$stmt = $this->connection->prepare($query);
	        	$stmt->execute(['id'=>$id,'organization_id'=>$_SESSION["organization_id"]]);
	        } else if(is_org_admin()){
				$query = "SELECT u.id,u.display_name,u.email,u.phone,u.confirmed, org.id as organization_id, org.name as organization_name , role.role_id as admin
				from users u left join user_roles role on role.user_id=u.id and role.role_id=1, user_organizations uo, organizations org
				where u.id=uo.user_id
				and org.id=uo.organization_id and
				uo.organization_id=:organization_id
				and u.id=:id
				UNION (SELECT u.id,u.display_name,u.email,u.phone ,u.confirmed, org.id as organization_id, org.name as organization_name, role.role_id as admin
				from users u left join user_roles role on role.user_id=u.id and role.role_id=1, user_organizations uo, organizations org
				where
				u.id=:id2 and u.id=:id
				and org.id=uo.organization_id and u.id=uo.user_id)";
				$stmt = $this->connection->prepare($query);
				$stmt->execute(['organization_id'=>$_SESSION["organization_id"],'id'=>$id,'id2'=>$_SESSION["id"]]);
	        } else {
	        	$query = "SELECT u.id,u.display_name,u.email,u.phone,u.confirmed, org.id as organization_id, org.name as organization_name, role.role_id as admin from users u left join organizations org on org.id=:organization_id left join user_roles role on role.user_id=u.id and role.role_id=1 where u.id=:id ";
	        	$stmt = $this->connection->prepare($query);
		        $stmt->execute(['id'=>$_SESSION["id"],'organization_id'=>$_SESSION["organization_id"]]);
        }

		$this->force_read=false;
		return $stmt;
	    }

    public function update(){
    	$stmt=$this->readOne($this->id);
		if($stmt->rowCount()==1){
			$sql = "UPDATE users SET display_name=:display_name, email=:email,phone=:phone,updated_by=:updated_by WHERE id=:id";
			$stmt= $this->connection->prepare($sql);
			return $stmt->execute(['id'=>$this->id,'display_name'=>$this->display_name,'email'=>$this->email,'phone'=>$this->phone
			,'updated_by'=>$_SESSION['id']
			]);
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

    public function confirmUser($id,$confirmation_string){
		$query = "SELECT 1 from users u where u.id=:id and confirmation_string=:confirmation_string";
		$stmt = $this->connection->prepare($query);
		$stmt->execute(['id'=>$id,'confirmation_string'=>$confirmation_string]);
		if($stmt->rowCount()==1){
            $sql = "UPDATE users SET confirmed='Y',updated_by=:updated_by WHERE id=:id";
            $stmt= $this->connection->prepare($sql);
            return $stmt->execute(['id'=>$id
            ,'updated_by'=>$_SESSION['id']
			]);
        }
        return false;

    }
}
