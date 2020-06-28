<?php
class NeedRequest{

	// Connection instance
	private $connection;

	// table columns
	public $id;
	public $client_need_id;
	public $request_organization_id;
	public $client_name;
	public $client_address;
	public $client_postcode;
	public $client_phone;
	public $client_email;
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
	public $offer_id;
	public $creation_date;
	public $created_by;
	public $update_date;
	public $updated_by;
	public $overdue;

	public function __construct($connection){
		$this->connection = $connection;
	}

	private $base_query = "SELECT request.id
			,request.client_need_id
			,request.organization_id as request_organization_id
			,request.offer_id
			,request.target_date
			,request.notes request_response_notes
			,request.agreed
			,request.complete
			,request.confirmation_code
			,request.notes request_response_notes
			,request.creation_date
			,request.created_by
			,request.update_date
			,request.updated_by
			,client_need.notes need_notes
            ,if(STRCMP(request.agreed,'Y') = 0 ,client.name,IF(INSTR(client.name,' ')>0,LEFT(client.name,INSTR(client.name,' ')+1),client.name) )as client_name
			,if(STRCMP(request.agreed,'Y') = 0 ,client.address,'') as client_address
			,if(STRCMP(request.agreed,'Y') = 0 ,client.postcode,'') as client_postcode
			,if(STRCMP(request.agreed,'Y') = 0 ,client.phone,'') as client_phone
			,if(STRCMP(request.agreed,'Y') = 0 ,client.email,'') as client_email
			,types.type
			,types.name as type_name
			,client_need.date_needed
			,org.name source_organization_name
			,if(target_date<CURDATE(),'Y','N') as overdue
			from need_requests request
			, client_needs client_need
			, clients client
			, offer_types types
			, organizations org
			where request.client_need_id=client_need.id
			and request.fulfilled_elsewhere='N'
			and client_need.client_id=client.id
			and client_need.type=types.type
			and org.id=client_need.requesting_organization_id ";


	public function create(){

		$this->confirmation_code=generate_string(60);

		$sql = "INSERT INTO need_requests ( client_need_id,organization_id,offer_id,confirmation_code,complete,target_date,notes,created_by,updated_by) values (:client_need_id,:organization_id,:offer_id,:confirmation_code,:complete,:target_date,:notes,:user_id,:user_id)";
		$stmt= $this->connection->prepare($sql);
		if(!isset($this->complete)){
			$this->complete='N';
		}
		if( $stmt->execute(['client_need_id'=>$this->client_need_id
			,'organization_id'=>$this->request_organization_id
			,'offer_id'=>$this->offer_id
			,'confirmation_code'=>$this->confirmation_code
			,'complete'=>$this->complete
			,'target_date'=>$this->target_date
			,'notes'=>$this->request_response_notes
			,'user_id'=>$_SESSION['id']
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

		if(is_admin()&&$_SESSION["organization_id"]==-99){
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

	public function readFiltered($agreed="",$completed="",$overdue=FALSE){

		$where_clause="";
		if($agreed==="Y"){
		  $where_clause=$where_clause." and agreed='Y' ";
		} else if ($agreed==="N")  {
		  $where_clause=$where_clause." and agreed='N' ";
		}else if ($agreed==="U")  {
		  $where_clause=$where_clause." and agreed IS NULL ";
		}else if ($agreed==="YU")  {
			$where_clause=$where_clause." and (agreed='Y' or agreed IS NULL) ";
		  }
		if($completed==="Y"){
		  $where_clause=$where_clause." and complete='Y' ";
		} else if ($completed==="N")  {
		  $where_clause=$where_clause." and complete='N' ";
		}
		if($overdue){
			$where_clause=$where_clause." and target_date<CURDATE() ";
		}
		if(is_admin()&&$_SESSION["organization_id"]==-99){
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
		$this->offer_id=$row['offer_id'];
		$this->confirmation_code=$row['confirmation_code'];
		$this->agreed=$row['agreed'];
		$this->complete=$row['complete'];
		$this->target_date=$row['target_date'];
		$this->request_response_notes=$row['request_response_notes'];
		$this->need_notes=$row['need_notes'];
		$this->overdue=$row['overdue'];
		$this->creation_date=$row['creation_date'];
		$this->created_by=$row['created_by'];
		$this->update_date=$row['update_date'];
		$this->updated_by=$row['updated_by'];
   }

	public function readOne($id){
		if(is_admin()&&$_SESSION["organization_id"]==-99){
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

			$row = $stmt->fetch(PDO::FETCH_ASSOC);
			$orig_agreed=$row['agreed'];
			$orig_complete=$row['complete'];
			$offer_id=$row['offer_id'];
			$client_need_id=$row['client_need_id'];

			$sql = "UPDATE need_requests SET agreed=:agreed,complete=:complete,target_date=:target_date,notes=:notes,updated_by=:updated_by WHERE id=:id";

			$stmt= $this->connection->prepare($sql);
			$result= $stmt->execute(['id'=>$this->id
		   		,'agreed'=>$this->agreed
				,'complete'=>$this->complete
				,'target_date'=>$this->target_date
				,'notes'=>$this->request_response_notes
				,'updated_by'=>$_SESSION['id']
			]);
			if(!$result){return false;}

			if($this->agreed!=$orig_agreed && $this->agreed=='Y'){
				// lock the agreement
				$sql= "update client_needs set fulfilling_need_request_id=:id where id=:client_need_id and fulfilling_need_request_id is null";
				$stmt= $this->connection->prepare($sql);
				$result= $stmt->execute(['id'=>$this->id, 'client_need_id'=>$client_need_id]);
				if(!$result){return false;}
				if($stmt->rowCount()==0){
					// someone else has already agreed
					$this->agreed='N';
					$sql = "UPDATE need_requests SET agreed='N',target_date=null,updated_by=:updated_by WHERE id=:id";
					$stmt= $this->connection->prepare($sql);
					$result= $stmt->execute(['id'=>$this->id]);
					if(!$result){return false;}
				} else {
					$sql= "update need_requests set fulfilled_elsewhere='Y' where client_need_id=:client_need_id and id!=:id";
					$stmt= $this->connection->prepare($sql);
					$result= $stmt->execute(['id'=>$this->id, 'client_need_id'=>$client_need_id]);
					if(!$result){return false;}
				}
			} else if ($this->agreed!=$orig_agreed && $this->agreed=='N' && $orig_agreed=='Y'){
				// revoking the agreement, so set things back as they were
				$sql= "update client_needs set fulfilling_need_request_id=null where id=:client_need_id and fulfilling_need_request_id =:id";
				$stmt= $this->connection->prepare($sql);
				$result= $stmt->execute(['id'=>$this->id, 'client_need_id'=>$client_need_id]);
				if(!$result){return false;}
				$sql= "update need_requests set fulfilled_elsewhere='N' where client_need_id=:client_need_id";
				$stmt= $this->connection->prepare($sql);
				$result= $stmt->execute(['client_need_id'=>$client_need_id]);
				if(!$result){return false;}
			}

			if($this->complete=$orig_complete){
				$sql= "update client_needs set need_met=:complete where id=:client_need_id";
				$stmt= $this->connection->prepare($sql);
				$result= $stmt->execute(['complete'=>$this->complete, 'client_need_id'=>$client_need_id]);
				if(!$result){return false;}
			}

			// update the remaining count
			if($this->agreed!=$orig_agreed){
				$sql = "UPDATE offers o SET o.quantity_taken=(select count(*) from need_requests nr where nr.offer_id=o.id and nr.agreed='Y'),updated_by=:updated_by WHERE o.id=:offer_id";
				$stmt= $this->connection->prepare($sql);
				$result= $stmt->execute(['offer_id'=>$offer_id
								,'updated_by'=>$_SESSION['id']
				]);
				if(!$result){return false;}
			}
			return $this;

		} else {
			return false;
		}
	}
}
