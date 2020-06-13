<?php
class TypeCategory{

    // Connection instance
    private $connection;

    // table columns
    public $code;
    public $name;
    public $creation_date;
	public $created_by;
	public $update_date;
	public $updated_by;

    public function __construct($connection){
        $this->connection = $connection;
    }

    public function replace(){
    	if(is_admin()){
			$sql = "REPLACE INTO type_categories (code, name,created_by,updated_by) values (:code,:name,:user_id,:user_id)";
			$stmt= $this->connection->prepare($sql);
			if( $stmt->execute(['code'=>$this->code,'name'=>$this->name,'user_id'=>$_SESSION['id']])){
				return $this->code;
			} else {
				return "";
			}
        } else {
        	return "";
        }

    }
    public function readAll(){
        $query = "SELECT code,name,creation_date,created_by,update_date,updated_by from type_categories ORDER BY code";
        $stmt = $this->connection->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    public function read(){
        $stmt=$this->readOne($this->code);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        $this->name=$row['name'];
        $this->code=$row['code'];
        $this->creation_date=$row['creation_date'];
		$this->created_by=$row['created_by'];
		$this->update_date=$row['update_date'];
		$this->updated_by=$row['updated_by'];
   }

    public function readOne($code){
	        $query = "SELECT code,name,creation_date,created_by,update_date,updated_by from type_categories where code=:code";
	        $stmt = $this->connection->prepare($query);
	        $stmt->execute(['code'=>$code]);
	        return $stmt;
	    }


    public function delete(){
    	if(is_admin()){
			$sql = "DELETE FROM type_categories WHERE code=:code";
			$stmt= $this->connection->prepare($sql);
			return $stmt->execute(['code'=>$this->code]);
        } else {
        	return "";
        }

    }
}
