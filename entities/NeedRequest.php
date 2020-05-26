<?php
class NeedRequest{

    // Connection instance
    private $connection;

    // table columns
    public $id;
    public $client_need_id;
    public $request_organization_id;
    public $client_name;
    public $client_postcode;
    public $type;
    public $type_name;
    public $date_needed;
    private $confirmation_code;
    public $agreed;
    public $complete;
    public $target_date;
    public $request_response_notes;
    public $need_notes;
    public $source_organization_name;

    public function __construct($connection){
        $this->connection = $connection;
    }

    private $base_query = "SELECT request.id
	        	,request.client_need_id
	        	,request.organization_id as request_organization_id
	        	,request.target_date
	        	,request.notes request_response_notes
	        	,request.agreed
	        	,request.complete
	        	,request.confirmation_code
	        	,request.notes request_response_notes
	        	,client_need.notes need_notes
	        	,client.name as client_name
	        	,client.postcode as client_postcode
	        	,types.type
	        	,types.name as type_name
	        	,client_need.date_needed
	        	,org.name source_organization_name
	        	from need_requests request
	        	, client_needs client_need
	        	, clients client
	        	, offer_types types
	        	, organizations org
	        	where request.client_need_id=client_need.id
	        	and client_need.client_id=client.id
	        	and client_need.type=types.type
	        	and org.id=client_need.requesting_organization_id ";


    public function create(){

        $this->confirmation_code=generate_string(60);

        $sql = "INSERT INTO need_requests ( client_need_id,organization_id,confirmation_code,agreed,complete,target_date,notes) values (:client_need_id,:organization_id,:confirmation_code,:agreed,:complete,:target_date,:notes)";
        $stmt= $this->connection->prepare($sql);
        if(!isset($this->agreed)){
        	$this->agreed='N';
        }
        if(!isset($this->complete)){
        	$this->complete='N';
        }
        if( $stmt->execute(['client_need_id'=>$this->client_need_id
        	,'organization_id'=>$this->request_organization_id
        	,'confirmation_code'=>$this->confirmation_code
        	,'agreed'=>$this->agreed
        	,'complete'=>$this->complete
        	,'target_date'=>$this->target_date
        	,'notes'=>$this->request_response_notes
        	])){
            $this->id=$this->connection->lastInsertId();

            return $this->id;
        } else {
            return -1;
        }

    }

    public function getConfirmationCode(){
    	return $this->confirmation_code;
    }
    public function readAll(){

        if(is_admin()){
        	$query =$this->base_query." ORDER BY request.id";
			$stmt = $this->connection->prepare($query);
        	$stmt->execute();
        	return $stmt;
        } else {
        	$query =$this->base_query." and request.organization_id=:organization_id ORDER BY request.id";
			$stmt = $this->connection->prepare($query);
        	$stmt->execute(['organization_id'=>$_SESSION["organization_id"]]);
        	return $stmt;
        }
    }

    public function readFiltered($agreed="",$completed=""){

        $where_clause="";
        if($agreed==="Y"){
          $where_clause=$where_clause." and agreed='Y' ";
        } else if ($agreed==="N")  {
          $where_clause=$where_clause." and agreed='N' ";
        }else if ($agreed==="U")  {
          $where_clause=$where_clause." and agreed IS NULL ";
        }
        if($completed==="Y"){
          $where_clause=$where_clause." and complete='Y' ";
        } else if ($completed==="N")  {
          $where_clause=$where_clause." and complete='N' ";
        }
        if(is_admin()){
        	$query =$this->base_query.$where_clause." ORDER BY request.id";
			$stmt = $this->connection->prepare($query);
        	$stmt->execute();
        	return $stmt;
        } else {
        	$query =$this->base_query.$where_clause." and request.organization_id=:organization_id ORDER BY request.id";
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
        $this->client_postcode=$row['client_postcode'];
        $this->type=$row['type'];
        $this->type_name=$row['type_name'];
        $this->date_needed=$row['date_needed'];
        $this->request_organization_id=$row['request_organization_id'];
        $this->confirmation_code=$row['confirmation_code'];
        $this->agreed=$row['agreed'];
        $this->complete=$row['complete'];
        $this->target_date=$row['target_date'];
        $this->request_response_notes=$row['request_response_notes'];
        $this->need_notes=$row['need_notes'];
   }

    public function readOne($id){
        if(is_admin()){
            $query =$this->base_query." and request.id=:id";
        	$stmt = $this->connection->prepare($query);
        	$stmt->execute(['id'=>$id]);
        	return $stmt;
        } else {
            $query =$this->base_query." and request.organization_id=:organization_id and request.id=:id";
        	$stmt = $this->connection->prepare($query);
        	$stmt->execute(['id'=>$id,'organization_id'=>$_SESSION["organization_id"]]);
        	return $stmt;
        }

	}

    public function update(){

    	$stmt=$this->readOne($this->id);
		if($stmt->rowCount()==1){


	        $sql = "UPDATE need_requests SET agreed=:agreed,complete=:complete,target_date=:target_date,notes=:notes WHERE id=:id";

			$stmt= $this->connection->prepare($sql);
	        $result= $stmt->execute(['id'=>$this->id
           		,'agreed'=>$this->agreed
				,'complete'=>$this->complete
				,'target_date'=>$this->target_date
				,'notes'=>$this->request_response_notes]);
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
