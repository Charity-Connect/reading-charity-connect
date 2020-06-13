<?php
class ClientShareRequest{

	private $connection;

	public $id;
	public $organization_id;
	public $organization_name;
	public $requesting_organization_id;
	public $requesting_organization_name;
	public $client_id;
	public $client_name;
	public $approved;
	public $notes;
	public $creation_date;
	public $created_by;
	public $update_date;
	public $updated_by;

	public function __construct($connection){
		$this->connection = $connection;
	}

		private $base_query = "SELECT c.id
		,c.organization_id
		,org2.name as organization_name
		,c.requesting_organization_id
		,org.name as requesting_organization_name
		,c.client_id
		,clients.name as client_name
		,clients.address as client_address
		,clients.postcode as client_postcode
		,c.approved
		,c.notes
		,c.creation_date
		,c.created_by
		,c.update_date
		,c.updated_by
		from client_share_requests c
		, organizations org
		, organizations org2
		, clients clients
		where c.organization_id = org2.id
		and c.requesting_organization_id = org.id
		and clients.id=c.client_id ";


	public function create(){

		$sql = "INSERT INTO client_share_requests (organization_id,requesting_organization_id,client_id,notes,approved,created_by,updated_by) values
(:organization_id,:requesting_organization_id,:client_id,:notes,:approved,:user_id,:user_id)";
		$stmt= $this->connection->prepare($sql);
		if( $stmt->execute(['organization_id'=>$this->organization_id
			,'requesting_organization_id'=>$this->requesting_organization_id
			,'client_id'=>$this->client_id
			,'approved'=>$this->approved
			,'notes'=>$this->notes
			,'user_id'=>$_SESSION['id']
			])){
			$this->id=$this->connection->lastInsertId();
			return $this->id;
		} else {
			return -1;
		}

	}
	public function readAll(){
		if(is_admin()&&$_SESSION["organization_id"]==-99){
			$query = $this->base_query." ORDER BY c.id";
	   		$stmt = $this->connection->prepare($query);
	   		$stmt->execute();
		} else {
			$query = $this->base_query." and c.organization_id=:organization_id ORDER BY c.id";
			$stmt = $this->connection->prepare($query);
			$stmt->execute(['organization_id'=>$_SESSION["organization_id"]]);
		}
		return $stmt;
	}

	public function readFiltered($approved=""){

		$where_clause="";
		if($approved==="Y"){
		  $where_clause=$where_clause." and approved='Y' ";
		} else if ($approved==="N")  {
		  $where_clause=$where_clause." and approved='N' ";
		} else if ($approved==="A")  {
		  $where_clause=$where_clause." and approved is not null ";
		}else if ($approved==="P")  {
		  $where_clause=$where_clause." and approved is null ";
		}
		if(is_admin()){
			$query =$this->base_query.$where_clause." ORDER BY c.id";
			$stmt = $this->connection->prepare($query);
			$stmt->execute();
			return $stmt;
		} else {
			$query =$this->base_query.$where_clause." and c.organization_id=:organization_id ORDER BY c.id";
			$stmt = $this->connection->prepare($query);
			$stmt->execute(['organization_id'=>$_SESSION["organization_id"]]);
			return $stmt;
		}
	}


	public function read(){
		$stmt=$this->readOne($this->id);
		$row = $stmt->fetch(PDO::FETCH_ASSOC);
		$this->organization_id=$row['organization_id'];
		$this->organization_name=$row['organization_name'];
		$this->requesting_organization_id=$row['requesting_organization_id'];
		$this->requesting_organization_name=$row['requesting_organization_name'];
		$this->client_id=$row['client_id'];
		$this->client_name=$row['client_name'];
		$this->client_address=$row['client_address'];
		$this->client_postcode=$row['client_postcode'];
		$this->notes=$row['notes'];
		$this->approved=$row['approved'];
		$this->creation_date=$row['creation_date'];
		$this->created_by=$row['created_by'];
		$this->update_date=$row['update_date'];
		$this->updated_by=$row['updated_by'];
  }

	public function readOne($id){
		if(is_admin()&&$_SESSION["organization_id"]==-99){
			$query = $this->base_query." and c.id=:id";
			$stmt = $this->connection->prepare($query);
			$stmt->execute(['id'=>$id]);
		} else {
			$query = $this->base_query." and c.organization_id=:organization_id and c.id=:id";
			$stmt = $this->connection->prepare($query);
			$stmt->execute(['id'=>$id,'organization_id'=>$_SESSION["organization_id"]]);
		}
			return $stmt;
	}

	public function update(){

		$stmt=$this->readOne($this->id);

		if($stmt->rowCount()==1){
			if($this->approved=='Y'){
				$sql = "INSERT ignore INTO client_links ( client_id,link_id,link_type,created_by,updated_by) select client_id,requesting_organization_id,'ORG',:user_id,:user_id from client_share_requests where id=:id";
				$stmt= $this->connection->prepare($sql);
				$stmt->execute(['id'=>$this->id,'user_id'=>$_SESSION['id']]);
			} else if($this->approved=='N'){
				$sql = "DELETE FROM client_links where client_id=(select client_id from client_share_requests where id=:id) and link_id=(select requesting_organization_id from client_share_requests where id=:id) and link_type='ORG'";
				$stmt= $this->connection->prepare($sql);
				$stmt->execute(['id'=>$this->id]);
			}

			$sql = "UPDATE client_share_requests SET approved=:approved,updated_by=:updated_by WHERE id=:id";
			$stmt= $this->connection->prepare($sql);
			return $stmt->execute(['id'=>$this->id
				,'approved'=>$this->approved
				,'updated_by'=>$_SESSION['id']

			]);
		} else {
			return false;
		}
	}

	public function delete(){
		$stmt=readOne($this->id);
		if($stmt->rowCount()==1){
			$sql = "DELETE FROM client_share_requests WHERE id=:id";
			$stmt= $this->connection->prepare($sql);
			return $stmt->execute(['id'=>$this->id]);
		} else {
			return false;
		}

	}
}
