<?php
require_once __DIR__.'/Audit.php';
require_once __DIR__.'/Client.php';
class Organization{

	private $connection;

	// table columns
	public $id;
	public $name;
	public $address;
	public $phone;
	public $enabled;
	public $creation_date;
	public $created_by;
	public $update_date;
	public $updated_by;

	public function __construct($connection){
		$this->connection = $connection;
	}

	private $base_query="SELECT org.id
	,org.name
	,org.address
	,org.phone
	,org.enabled
	,org.creation_date
	,COALESCE(create_user.display_name,'System') as created_by
	,org.update_date
	,COALESCE(update_user.display_name,'System') as updated_by 
	from organizations org
	left join users create_user on create_user.id=org.created_by
	left join users update_user on update_user.id=org.updated_by ";

	public function create(){
		if(is_admin()){
			if(!isset($this->enabled)){
				$this->enabled='Y';
			}
			$sql = "INSERT INTO organizations ( name,address,phone,enabled,created_by,updated_by) values (:name,:address,:phone,:enabled,:user_id,:user_id)";
			$stmt= $this->connection->prepare($sql);
			if( $stmt->execute(['name'=>$this->name,'address'=>$this->address,'phone'=>$this->phone,'enabled'=>$this->enabled,'user_id'=>$_SESSION['id']])){
				$this->id=$this->connection->lastInsertId();
				Audit::add($this->connection,"create","organization",$this->id,null,$this->name);
				$this->creation_date=date("Y-m-d H:i:s");
				$this->created_by=$_SESSION['display_name'];
				$this->update_date=date("Y-m-d H:i:s");
				$this->updated_by=$_SESSION['display_name'];
	
				return $this->id;
			} else {
				return -1;
			}

		} else {
			return -1;
		}

	}
	public function readAll(){
		$query = $this->base_query." ORDER BY org.id";
		$stmt = $this->connection->prepare($query);
		$stmt->execute();
		return $stmt;
	}

	public function readActive(){
		$query = $this->base_query." where org.enabled='Y' ORDER BY org.id";
		$stmt = $this->connection->prepare($query);
		$stmt->execute();
		return $stmt;
	}

	public function read(){
		$stmt=$this->readOne($this->id);
		$row = $stmt->fetch(PDO::FETCH_ASSOC);
		$this->name=$row['name'];
		$this->address=$row['address'];
		$this->phone=$row['phone'];
		$this->enabled=$row['enabled'];
		$this->creation_date=$row['creation_date'];
		$this->created_by=$row['created_by'];
		$this->update_date=$row['update_date'];
		$this->updated_by=$row['updated_by'];
   }

	public function readOne($id){
			$query = $this->base_query." where org.id=:id";
			$stmt = $this->connection->prepare($query);
			$stmt->execute(['id'=>$id]);
			return $stmt;
	}

	public function update(){

		if(is_admin() || ($this->id==$_SESSION['organization_id'] && is_org_admin())){

			$sql = "UPDATE organizations SET name=:name, address=:address, phone=:phone,enabled=:enabled,updated_by=:updated_by WHERE id=:id";
			$stmt= $this->connection->prepare($sql);
			if( $stmt->execute(['id'=>$this->id,'name'=>$this->name,'address'=>$this->address,'phone'=>$this->phone,'enabled'=>$this->enabled
			,'updated_by'=>$_SESSION['id']
])){
	return Audit::add($this->connection,"update","organization",$this->id,null,$this->name);

}
		} 
		return false;
	}

	public function delete() {
		if(is_admin()) {
			$stmt=$this->connection->prepare("SELECT client_id FROM client_links WHERE link_id=:id AND link_type='ORG'");
			$stmt->execute(['id'=>$this->id]);
			$client = new Client($this->connection);
			
			while ($row = $stmt->fetch()) {
				$client->id= $row['client_id'];
				$client->delete($this->id);
			}
			
			$this->connection->beginTransaction();
			$sql = "DELETE FROM organizations WHERE id=:id; DELETE FROM need_requests WHERE organization_id=:id;
					DELETE FROM client_share_requests WHERE organization_id=:id OR requesting_organization_id=:id;
					DELETE FROM user_organizations WHERE organization_id=:id;";
		$stmt= $this->connection->prepare($sql);
			if( $stmt->execute(['id'=>$this->id])){
				$stmt->closeCursor();
				Audit::add($this->connection,"delete","organization",$this->id);
				return $this->connection->commit();
			} else {
				$this->connection->rollBack();
				return false;
			} 
		}
		return false;
	}
}
