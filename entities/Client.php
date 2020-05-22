<?php
include_once $_SERVER['DOCUMENT_ROOT'] .'/entities/User.php';
class Client{

    // Connection instance
    private $connection;

    // table columns
    public $id;
    public $name;
    public $address;
    public $postcode;
    private $latitude;
    private $longitude;
    public $phone;
    public $email;
    public $notes;

    public function __construct($connection){
        $this->connection = $connection;
    }

    public function create(){

		if(isset($this->postcode)&&$this->postcode!=""){
			list($latitude,$longitude)=getGeocode($this->postcode);
		}

        $sql = "INSERT INTO clients ( name,address,postcode,latitude,longitude,phone,email,notes) values (:name,:address,:postcode,:latitude,:longitude,:phone,:email,:notes)";
        $stmt= $this->connection->prepare($sql);
        if( $stmt->execute(['name'=>$this->name
        	,'address'=>$this->address
        	,'postcode'=>$this->postcode
        	,'latitude'=>($latitude==-1) ? null:$latitude
        	,'longitude'=>($latitude==-1) ? null:$longitude
        	,'phone'=>$this->phone
        	,'email'=>$this->email
        	,'notes'=>$this->notes])){
            $this->id=$this->connection->lastInsertId();

			$user = new User($this->connection);
        	$user->id=$_SESSION["id"];
        	$user->read();

            $sql = "INSERT INTO client_links ( client_id,link_id,link_type) values (:client_id,:organization_id,'ORG')";
			$stmt= $this->connection->prepare($sql);
			$stmt->execute(['client_id'=>$this->id,'organization_id'=>$_SESSION["organization_id"]]);

            return $this->id;
        } else {
            return -1;
        }

    }
    public function readAll(){
        if(is_admin()){
        	$query = "SELECT id,name,address,postcode,phone,email,notes from clients ORDER BY id";
        	$stmt = $this->connection->prepare($query);
        	$stmt->execute();
        	return $stmt;
        } else {
        	$query = "SELECT c.id,c.name,c.address,c.postcode,c.phone,c.email,c.notes from clients c, client_links l where c.id=l.client_id and l.link_type='ORG' and l.link_id=:organization_id  ORDER BY c.id";
			$stmt = $this->connection->prepare($query);
        	$stmt->execute(['organization_id'=>$_SESSION["organization_id"]]);
        	return $stmt;
        }
    }

    public function read(){
        $stmt=$this->readOne($this->id);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        $this->name=$row['name'];
        $this->address=$row['address'];
        $this->postcode=$row['postcode'];
        $this->latitude=$row['latitude'];
        $this->longitude=$row['longitude'];
        $this->phone=$row['phone'];
        $this->email=$row['email'];
        $this->notes=$row['notes'];
   }

    public function readOne($id){
        if(is_admin()){
        	$query = "SELECT c.id,c.name,c.address,c.postcode,c.latitude,c.longitude,c.phone,c.email,c.notes from clients c where c.id=:id";
        	$stmt = $this->connection->prepare($query);
        	$stmt->execute(['id'=>$id]);
        	return $stmt;
        } else {
        	$query = "SELECT c.id,c.name,c.address,c.postcode,c.latitude,c.longitude,c.phone,c.email,c.notes from clients c, client_links l where c.id=:id and c.id=l.client_id and l.link_type='ORG' and l.link_id=:organization_id ORDER BY c.id";
        	$stmt = $this->connection->prepare($query);
        	$stmt->execute(['id'=>$id,'organization_id'=>$_SESSION["organization_id"]]);
        	return $stmt;
        }

	}
    public function getLatitude(){
    	return $this->latitude;
    }
    public function getLongitude(){
    	return $this->longitude;
    }

    public function update(){

    	$stmt=$this->readOne($this->id);
		if($stmt->rowCount()==1){

			$clientOrig=new Client($this->connection);
			$clientOrig->id=$this->id;
			$clientOrig->read();
			if($clientOrig->postcode!=$this->postcode&&isset($this->postcode)&&$this->postcode!=""){
				list($latitude,$longitude)=getGeocode($this->postcode);
			} else {
				$latitude=$clientOrig->getLatitude();
				$longitude=$clientOrig->getLongitude();
			}

	        $sql = "UPDATE clients SET name=:name, address=:address, postcode=:postcode,latitude=:latitude,longitude=:longitude,phone=:phone, email=:email, notes=:notes WHERE id=:id";

			$stmt= $this->connection->prepare($sql);
	        $result= $stmt->execute(['id'=>$this->id,'name'=>$this->name,'address'=>$this->address,'postcode'=>$this->postcode
           		,'latitude'=>($latitude==-1) ? null:$latitude
				,'longitude'=>($latitude==-1) ? null:$longitude
				,'phone'=>$this->phone,'email'=>$this->email,'notes'=>$this->notes]);
			return $result;
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
