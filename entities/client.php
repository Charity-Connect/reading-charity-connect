<?php
include_once $_SERVER['DOCUMENT_ROOT'] .'/entities/user.php';
class Client{

    // Connection instance
    private $connection;

    // table name

    // table columns
    public $id;
    public $name;
    public $address;
    public $phone;
    public $email;
    public $notes;

    public function __construct($connection){
        $this->connection = $connection;
    }

    public function create(){
        $sql = "INSERT INTO clients ( name,address,phone,email,notes) values (:name,:address,:phone,:email,:notes)";
        $stmt= $this->connection->prepare($sql);
        if( $stmt->execute(['name'=>$this->name,'address'=>$this->address,'phone'=>$this->phone,'email'=>$this->email,'notes'=>$this->notes])){
            $this->id=$this->connection->lastInsertId();
			$user = new User($connection);
        	$user->id=$_SESSION["id"];
        	$user->read();

            $sql = "INSERT INTO client_links ( client_id,link_id,link_type) values (:client_id,:organization_id,'ORG')";
			$stmt= $this->connection->prepare($sql);
			$stmt->execute(['client_id'=>$this->id,'organization_id'=>$user->organization_id]);

            return $this->id;
        } else {
            return -1;
        }

    }
    public function readAll(){
        if(is_admin()){
        	$query = "SELECT id,name,address,phone,email,notes from clients ORDER BY id";
        	$stmt = $this->connection->prepare($query);
        	$stmt->execute();
        	return $stmt;
        } else {
        	$query = "SELECT c.id,c.name,c.address,c.phone,c.email,c.notes from clients c, users u, client_links l where c.id=l.client_id and l.link_type='ORG' and l.link_id=u.organization_id and u.id=:user_id ORDER BY c.id";
        	$stmt = $this->connection->prepare($query);
        	$stmt->execute(['user_id'=>$_SESSION["id"]]);
        	return $stmt;
        }
    }

    public function read(){
        $stmt=$this->readOne($this->id);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        $this->name=$row['name'];
        $this->address=$row['address'];
        $this->phone=$row['phone'];
        $this->email=$row['email'];
        $this->notes=$row['notes'];
   }

    public function readOne($id){
        if(is_admin()){
        	$query = "SELECT id,name,address,phone,email,notes from clients where id=:id";
        	$stmt = $this->connection->prepare($query);
        	$stmt->execute(['id'=>$id]);
        	return $stmt;
        } else {
        	$query = "SELECT c.id,c.name,c.address,c.phone,c.email,c.notes from clients c, users u, client_links l where c.id=:id and c.id=l.client_id and l.link_type='ORG' and l.link_id=u.organization_id and u.id=:user_id ORDER BY c.id";
        	$stmt = $this->connection->prepare($query);
        	$stmt->execute(['id'=>$id,'user_id'=>$_SESSION["id"]]);
        	return $stmt;
        }

	}

    public function update(){

    	$stmt=readOne($this->id);
		if($stmt->rowCount()==1){
	        $sql = "UPDATE clients SET name=:name, address=:address, phone=:phone, email=:email notes=:notes WHERE id=:id";
	        $stmt= $this->connection->prepare($sql);
	        return $stmt->execute(['id'=>$this->id,'name'=>$this->name,'address'=>$this->address,'phone'=>$this->phone,'email'=>$this->email,'notes'=>$this->notes]);
		} else {
			return false;
		}
    }

    public function delete(){
    	$stmt=readOne($this->id);
		if($stmt->rowCount()==1){
	        $sql = "DELETE FROM clients WHERE id=:id";
	        $stmt= $this->connection->prepare($sql);
	        return $stmt->execute(['id'=>$this->id]);
		} else {
			return false;
		}

    }
}
