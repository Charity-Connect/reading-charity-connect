<?php
include_once $_SERVER['DOCUMENT_ROOT'] .'/entities/Client.php';
class ClientNeed{

    // Connection instance
    private $connection;
    private $client;

    // table client_id

    // table columns
    public $id;
    public $client_id;
    public $type;
    public $date_needed;
    public $need_met;
    public $notes;

    public function __construct($connection){
        $this->connection = $connection;
        $client = new client($connection);

    }

    public function create(){

    	$stmt=$client->readOne($this->client_id);
    	if($stmt->rowCount()==1){

		$sql = "INSERT INTO client_needs ( client_id,type,date_needed,need_met,notes) values (:client_id,:type,:date_needed,:need_met,:notes)";
		$stmt= $this->connection->prepare($sql);
		if( $stmt->execute(['client_id'=>$this->client_id,'type'=>$this->type,'date_needed'=>$this->date_needed,'need_met'=>$this->need_met,'notes'=>$this->notes])){
		    $this->id=$this->connection->lastInsertId();
		    return $this->id;
		} else {
		    return -1;
		}
	} else {
		return -1;
	}

    }
    public function readAll($client_id){
        if(is_admin()){
        	$query = "SELECT id,client_id,type,date_needed,need_met,notes from client_needs where client_id = :client_id ORDER BY id";
        	$stmt = $this->connection->prepare($query);
        	$stmt->execute(['client_id'=>$client_id]);
        	return $stmt;
        } else {
        	$query = "SELECT cn.id,cn.client_id,cn.type,cn.date_needed,cn.need_met,cn.notes from client_needs cn, client_links l where cn.client_id=:client_id and cn.client_id=l.client_id and l.link_type='ORG' and l.link_id=:organization_id ORDER BY cn.id";
        	$stmt = $this->connection->prepare($query);
        	$stmt->execute(['organization_id'=>$_SESSION["organization_id"],'client_id'=>$client_id]);
        	return $stmt;
        }
    }

    public function read(){
        $stmt=$this->readOne($this->client_id,$this->id);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        $this->client_id=$row['client_id'];
        $this->type=$row['type'];
        $this->date_needed=$row['date_needed'];
        $this->need_met=$row['need_met'];
        $this->notes=$row['notes'];
   }

    public function readOne($client_id,$id){
        if(is_admin()){
        	$query = "SELECT id,client_id,type,date_needed,need_met,notes from client_needs where id=:id and client_id=:client_id";
        	$stmt = $this->connection->prepare($query);
        	$stmt->execute(['id'=>$id,'client_id'=>$client_id]);
        	return $stmt;
        } else {
        	$query = "SELECT cn.id,cn.client_id,cn.type,cn.date_needed,cn.need_met,cn.notes from client_needs cn, client_links l where cn.client_id=:client_id and cn.id=:id and cn.client_id=l.client_id and l.link_type='ORG' and l.link_id=:organization_id ORDER BY cn.id";
        	$stmt = $this->connection->prepare($query);
        	$stmt->execute(['client_id'=>$client_id,'id'=>$id,'organization_id'=>$_SESSION["organization_id"]]);
        	return $stmt;
        }

	}

    public function update(){

    	$stmt=readOne($this->client_id,$this->id);
		if($stmt->rowCount()==1){
	        $sql = "UPDATE client_needs SET client_id=:client_id, type=:type, date_needed=:date_needed, need_met=:need_met notes=:notes WHERE id=:id";
	        $stmt= $this->connection->prepare($sql);
	        return $stmt->execute(['id'=>$this->id,'client_id'=>$this->client_id,'type'=>$this->type,'date_needed'=>$this->date_needed,'need_met'=>$this->need_met,'notes'=>$this->notes]);
		} else {
			return false;
		}
    }

    public function delete(){
    	$stmt=readOne($this->client_id,$this->id);
		if($stmt->rowCount()==1){
	        $sql = "DELETE FROM client_needs WHERE id=:id";
	        $stmt= $this->connection->prepare($sql);
	        return $stmt->execute(['id'=>$this->id]);
		} else {
			return false;
		}

    }
}
