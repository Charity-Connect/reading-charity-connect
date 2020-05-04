<?php
class NeedRequest{

    // Connection instance
    private $connection;

    // table columns
    public $id;
    public $client_need_id;
    public $organization_id;
    public $client_name;
    public $type_name;
    public $date_needed;
    private $confirmation_code;
    public $agreed;
    public $complete;
    public $target_date;
    public $notes;

    public function __construct($connection){
        $this->connection = $connection;
    }

    public function create(){

        $this->confirmation_code=generate_string(60);

        $sql = "INSERT INTO need_requests ( client_need_id,organization_id,confirmation_code,agreed,complete,target_date,notes) values (:client_need_id,:organization_id,:confirmation_code,:agreed,:complete,:target_date,:notes)";
        $stmt= $this->connection->prepare($sql);
        if( $stmt->execute(['client_need_id'=>$this->client_need_id
        	,'organization_id'=>$this->organization_id
        	,'confirmation_code'=>$this->confirmation_code
        	,'agreed'=>isset($this->$agreed)?$this->$agreed:'N'
        	,'complete'=>isset($this->$complete)?$this->$complete:'N'
        	,'target_date'=>$this->target_date
        	,'notes'=>$this->notes
        	])){
            $this->id=$this->connection->lastInsertId();

            return $this->id;
        } else {
            return -1;
        }

    }
    public function readAll(){
        if(is_admin()){
        	$query = "SELECT request.id,request.client_need_id,request.organization_id,request.target_date,request.notes, client.name as client_name ,t.name as type_name, need.date_needed from need_requests request, client_needs need, clients client, offer_types t where request.client_need_id=need.id and need.client_id=client.id and need.type=t.type ORDER BY id";
			$stmt = $this->connection->prepare($query);
        	$stmt->execute();
        	return $stmt;
        } else {
        	$query = "SELECT request.id,request.client_need_id,request.organization_id,request.target_date,request.notes, client.name as client_name ,t.name as type_name, need.date_needed from need_requests request, client_needs need, clients client, offer_types t where request.client_need_id=need.id and need.client_id=client.id and need.type=t.type and request.organization_id=:organization_id  ORDER BY request.id";
			$stmt = $this->connection->prepare($query);
        	$stmt->execute(['organization_id'=>$_SESSION["organization_id"]]);
        	return $stmt;
        }
    }

    public function read(){
        $stmt=$this->readOne($this->id);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        $this->client_need_id=$row['client_need_id'];
        $this->client_name=$row['client_name'];
        $this->type_name=$row['type_name'];
        $this->date_needed=$row['date_needed'];
        $this->organization_id=$row['organization_id'];
        $this->confirmation_code=$row['confirmation_code'];
        $this->agreed=$row['agreed'];
        $this->complete=$row['complete'];
        $this->target_date=$row['target_date'];
        $this->notes=$row['notes'];
   }

    public function readOne($id){
        if(is_admin()){
        	$query = "SELECT request.id,request.client_need_id,request.organization_id,request.target_date,request.notes, client.name as client_name ,t.name as type_name, need.date_needed from need_requests request, client_needs need, clients client, offer_types t where request.client_need_id=need.id and need.client_id=client.id and need.type=t.type and request.id=:id";
        	$stmt = $this->connection->prepare($query);
        	$stmt->execute(['id'=>$id]);
        	return $stmt;
        } else {
        	$query = "SELECT request.id,request.client_need_id,request.organization_id,request.target_date,request.notes, client.name as client_name ,t.name as type_name, need.date_needed from need_requests request, client_needs need, clients client, offer_types t where request.client_need_id=need.id and need.client_id=client.id and need.type=t.type and request.id=:id and request.organization_id=:organization_id";
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
				,'complete'=>$this->complete
				,'target_date'=>$this->target_date
				,'notes'=>$this->notes]);
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
