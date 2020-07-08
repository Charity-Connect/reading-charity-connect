<?php
require_once __DIR__.'/Audit.php';
class TypeCategory{

	// Connection instance
	private $connection;

	// table columns
	public $id;
	public $name;
	public $active;
	public $creation_date;
	public $created_by;
	public $update_date;
	public $updated_by;

	public function __construct($connection){
		$this->connection = $connection;
	}

	public function create(){
		if(is_admin()){
			$sql = "INSERT INTO type_categories (id,name,active,created_by,updated_by) values (:id,:name,:active,:user_id,:user_id)";
			$stmt= $this->connection->prepare($sql);
			if( $stmt->execute(['id'=>$this->id,'name'=>$this->name,'active'=>$this->active,'user_id'=>$_SESSION['id']])){
				$this->id=$this->connection->lastInsertId();
				Audit::add($this->connection,"create","type_category",$this->id,null,$this->name);
				return $this->id;
			} else {
				return "";
			}
		} else {
			return "";
		}

	}
	public function readAll(){
		$query = "SELECT id,name,active,creation_date,created_by,update_date,updated_by FROM type_categories ORDER BY name";
		$stmt = $this->connection->prepare($query);
		$stmt->execute();
		return $stmt;
	}

	public function readActive(){
		$query = "SELECT id,name,active,creation_date,created_by,update_date,updated_by FROM type_categories WHERE active='Y' ORDER BY name";
		$stmt = $this->connection->prepare($query);
		$stmt->execute();
		return $stmt;
	}

	public function read(){
		$stmt=$this->readOne($this->id);
		$row = $stmt->fetch(PDO::FETCH_ASSOC);
		$this->id=$row['id'];
		$this->name=$row['name'];
		$this->active=$row['active'];
		$this->creation_date=$row['creation_date'];
		$this->created_by=$row['created_by'];
		$this->update_date=$row['update_date'];
		$this->updated_by=$row['updated_by'];
   }

	public function readOne($id){
			$query = "SELECT id,name,active,creation_date,created_by,update_date,updated_by FROM type_categories WHERE id=:id";
			$stmt = $this->connection->prepare($query);
			$stmt->execute(['id'=>$id]);
			return $stmt;
		}

		public function update(){
			$stmt=$this->readOne($this->id);
			if($stmt->rowCount()==1){
				$sql = "UPDATE type_categories SET name=:name, active=:active,updated_by=:updated_by WHERE id=:id";
				$stmt= $this->connection->prepare($sql);
				if( $stmt->execute(['id'=>$this->id,'name'=>$this->name,'active'=>$this->active
				,'updated_by'=>$_SESSION['id']
				])){
					return Audit::add($this->connection,"update","type_categories",$this->id,null,$this->name);
				}
			} 
			return false;
		}


}
