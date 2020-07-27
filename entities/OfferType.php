<?php
require_once __DIR__.'/Audit.php';
class OfferType{

	// Connection instance
	private $connection;

	// table columns
	public $id;
	public $name;
	public $category_id;
	public $category_name;
	public $default_text;
	public $active;
	public $creation_date;
	public $created_by;
	public $update_date;
	public $updated_by;

	private $base_query ="SELECT ot.id
	,ot.name
	,ot.category_id
	,tc.name as category_name
	, ot.default_text
	,ot.active
	,ot.creation_date
	,COALESCE(create_user.display_name,'System') as created_by
	,ot.update_date
	,COALESCE(update_user.display_name,'System') as updated_by 
	from offer_types ot
	left join users create_user on create_user.id=ot.created_by
		left join users update_user on update_user.id=ot.updated_by
	, type_categories tc 
	where ot.category_id=tc.id ";

	public function __construct($connection){
		$this->connection = $connection;
	}

	public function create(){

		if(is_admin()){
			$sql = "INSERT INTO offer_types ( name,category,category_id,default_text,active,created_by,updated_by) values (:name,:category_name,:category_id,:default_text,:active,:user_id,:user_id)";
			$stmt= $this->connection->prepare($sql);
			if( $stmt->execute(['name'=>$this->name,'category_name'=>$this->category_name,'category_id'=>$this->category_id,'default_text'=>$this->default_text,'active'=>$this->active,'user_id'=>$_SESSION['id']])){
				$this->id=$this->connection->lastInsertId();
				Audit::add($this->connection,"create","offer_type",$this->id,null,$this->name);
				$this->creation_date=date("Y-m-d H:i:s");
				$this->created_by=$_SESSION['display_name'];
				$this->update_date=date("Y-m-d H:i:s");
				$this->updated_by=$_SESSION['display_name'];
					return $this->id;
			} else {
				return "";
			}
		} else {
			return "";
		}

	}
	public function readAll(){
		$query = $this->base_query." ORDER BY ot.name";
		$stmt = $this->connection->prepare($query);
		$stmt->execute();
		return $stmt;
	}

	public function readActive(){
		$query = $this->base_query." and ot.active='Y' ORDER BY ot.name";
		$stmt = $this->connection->prepare($query);
		$stmt->execute();
		return $stmt;
	}

	public function readActiveCategory($category_id){
		$query = $this->base_query." and ot.active='Y' and ot.category_id=:category_id ORDER BY ot.name";
		$stmt = $this->connection->prepare($query);
		$stmt->execute(['category_id'=>$category_id]);
		return $stmt;
	}

	public function read(){
		$stmt=$this->readOne($this->id);
		$row = $stmt->fetch(PDO::FETCH_ASSOC);
		$this->id=$row['id'];
		$this->name=$row['name'];
		$this->category_id=$row['category_id'];
		$this->category_name=$row['category_name'];
		$this->default_text=$row['default_text'];
		$this->active=$row['active'];
		$this->creation_date=$row['creation_date'];
		$this->created_by=$row['created_by'];
		$this->update_date=$row['update_date'];
		$this->updated_by=$row['updated_by'];
   }

	public function readOne($id){
		$this->id=$id;
			$query = $this->base_query." and ot.id=:id";
			$stmt = $this->connection->prepare($query);
			$stmt->execute(['id'=>$this->id]);
			return $stmt;
		}

		public function update(){
			$stmt=$this->readOne($this->id);
			if($stmt->rowCount()==1){
				$sql = "UPDATE offer_types SET name=:name, default_text=:default_text,active=:active,updated_by=:updated_by WHERE id=:id";
				$stmt= $this->connection->prepare($sql);
				if( $stmt->execute(['id'=>$this->id,'name'=>$this->name,'default_text'=>$this->default_text,'active'=>$this->active
				,'updated_by'=>$_SESSION['id']
				])){
					$this->update_date=date("Y-m-d H:i:s");
					$this->updated_by=$_SESSION['display_name'];
		
					return Audit::add($this->connection,"update","offer_types",$this->id,null,$this->name);
				}
			} 
			return false;
		}
	
}
