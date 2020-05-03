<?php
class NeedRequest{

    // Connection instance
    private $connection;

    // table columns
    public $id;
    public $client_need_id;
    public $organization_id;
    public $confirmation_code;
    private $agreed;
    private $complete;

    public function __construct($connection){
        $this->connection = $connection;
    }

    public function create(){

        $this->confirmation_code=generate_string(60);

        $sql = "INSERT INTO need_requests ( client_need_id,organization_id,confirmation_code,agreed,complete) values (:client_need_id,:organization_id,:confirmation_code,:agreed,:complete)";
        $stmt= $this->connection->prepare($sql);
        if( $stmt->execute(['client_need_id'=>$this->client_need_id
        	,'organization_id'=>$this->organization_id
        	,'confirmation_code'=>$this->confirmation_code
        	,'agreed'=>isset($this->$agreed)?$this->$agreed:'N'
        	,'complete'=>isset($this->$complete)?$this->$complete:'N'
        	])){
            $this->id=$this->connection->lastInsertId();

            return $this->id;
        } else {
            return -1;
        }

    }
    public function readAll(){
        if(is_admin()){
        	$query = "SELECT id,client_need_id,organization_id from need_requests ORDER BY id";
        	$stmt = $this->connection->prepare($query);
        	$stmt->execute();
        	return $stmt;
        } else {
        	$query = "SELECT c.id,c.client_need_id,c.organization_id from need_requests c where c.organization_id=:organization_id  ORDER BY c.id";
			$stmt = $this->connection->prepare($query);
        	$stmt->execute(['organization_id'=>$_SESSION["organization_id"]]);
        	return $stmt;
        }
    }

    public function read(){
        $stmt=$this->readOne($this->id);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        $this->client_need_id=$row['client_need_id'];
        $this->organization_id=$row['organization_id'];
        $this->confirmation_code=$row['confirmation_code'];
        $this->agreed=$row['agreed'];
        $this->complete=$row['complete'];
   }

    public function readOne($id){
        if(is_admin()){
        	$query = "SELECT c.id,c.client_need_id,c.organization_id,c.confirmation_code,c.agreed,c.complete from need_requests c where c.id=:id";
        	$stmt = $this->connection->prepare($query);
        	$stmt->execute(['id'=>$id]);
        	return $stmt;
        } else {
        	$query = "SELECT c.id,c.client_need_id,c.organization_id,c.confirmation_code,c.agreed,c.complete from need_requests c where c.id=:id and c.organization_id=:organization_id ORDER BY c.id";
        	$stmt = $this->connection->prepare($query);
        	$stmt->execute(['id'=>$id,'organization_id'=>$_SESSION["organization_id"]]);
        	return $stmt;
        }

	}

    public function update(){

    	$stmt=$this->readOne($this->id);
		if($stmt->rowCount()==1){


	        $sql = "UPDATE need_requests SET agreed=:agreed,complete=:complete WHERE id=:id";

			$stmt= $this->connection->prepare($sql);
	        $result= $stmt->execute(['id'=>$this->id
           		,'agreed'=>$this->agreed
				,'complete'=>$this->complete]);
			return $result;
		} else {
			return false;
		}
    }

    public function delete(){
    	$stmt=readOne($this->id);
		if($stmt->rowCount()==1){
	        $sql = "DELETE FROM need_requests WHERE id=:id";
	        $stmt= $this->connection->prepare($sql);
	        return $stmt->execute(['id'=>$this->id]);
		} else {
			return false;
		}

    }
}
