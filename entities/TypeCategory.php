<?php
class TypeCategory{

    // Connection instance
    private $connection;

    // table columns
    public $code;
    public $name;

    public function __construct($connection){
        $this->connection = $connection;
    }

    public function replace(){
    	if(is_admin()){
			$sql = "REPLACE INTO type_categories (code, name) values (:code,:name)";
			$stmt= $this->connection->prepare($sql);
			if( $stmt->execute(['code'=>$this->code,'name'=>$this->name])){
				return $this->code;
			} else {
				return "";
			}
        } else {
        	return "";
        }

    }
    public function readAll(){
        $query = "SELECT code,name from type_categories ORDER BY code";
        $stmt = $this->connection->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    public function read(){
        $stmt=$this->readOne($this->code);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        $this->name=$row['name'];
        $this->code=$row['code'];
   }

    public function readOne($code){
	        $query = "SELECT code,name from type_categories where code=:code";
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
