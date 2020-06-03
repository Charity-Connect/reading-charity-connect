<?php
class Organization{

    private $connection;

    // table columns
    public $id;
    public $name;
    public $address;
    public $phone;

    public function __construct($connection){
        $this->connection = $connection;
    }

    public function create(){
		if(is_admin()){
			$sql = "INSERT INTO organizations ( name,address,phone,created_by,updated_by) values (:name,:address,:phone,:user_id,:user_id)";
			$stmt= $this->connection->prepare($sql);
			if( $stmt->execute(['name'=>$this->name,'address'=>$this->address,'phone'=>$this->phone,'user_id'=>$_SESSION['id']])){
				$this->id=$this->connection->lastInsertId();
				return $this->id;
			} else {
				return -1;
			}

		} else {
			return -1;
		}

    }
    public function readAll(){
        $query = "SELECT id,name,address,phone from organizations ORDER BY id";
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
   }

    public function readOne($id){
	        $query = "SELECT id,name,address,phone from organizations where id=:id";
	        $stmt = $this->connection->prepare($query);
	        $stmt->execute(['id'=>$id]);
	        return $stmt;
	}

    public function update(){

    	if(is_admin() || ($this->id==$_SESSION['organization_id'] && is_org_admin())){

			$sql = "UPDATE organizations SET name=:name, address=:address, phone=:phone,updated_by=:updated_by WHERE id=:id";
			$stmt= $this->connection->prepare($sql);
			return $stmt->execute(['id'=>$this->id,'name'=>$this->name,'address'=>$this->address,'phone'=>$this->phone
			,'updated_by'=>$_SESSION['id']
]);
		} else {
			return false;
		}
    }

    public function delete(){
    	if(is_admin() || ($this->id==$_SESSION['organization_id'] && is_org_admin())){
			$sql = "DELETE FROM organizations WHERE id=:id";
			$stmt= $this->connection->prepare($sql);
			return $stmt->execute(['id'=>$this->id]);
		} else {
			return false;
		}

    }
}
