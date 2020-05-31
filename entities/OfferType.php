<?php
class OfferType{

    // Connection instance
    private $connection;

    // table columns
    public $type;
    public $name;
    public $category;
    public $default_text;
    public $active;

    public function __construct($connection){
        $this->connection = $connection;
    }

    public function replace(){

    	if(is_admin()){
			$sql = "REPLACE INTO offer_types ( type,name,category,default_text,active,created_by,updated_by) values (:type,:name,:category,:default_text,:active,:user_id,:user_id)";
			$stmt= $this->connection->prepare($sql);
			if( $stmt->execute(['type'=>$this->type,'name'=>$this->name,'category'=>$this->category,'default_text'=>$this->default_text,'active'=>$this->active,'user_id'=>$_SESSION['id']])){
				return $this->type;
			} else {
				return "";
			}
        } else {
        	return "";
        }

    }
    public function readAll(){
        $query = "SELECT type,name,category,default_text,active from offer_types ORDER BY name";
        $stmt = $this->connection->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    public function readActive(){
        $query = "SELECT type,name,category,default_text from offer_types where active='Y' ORDER BY name";
        $stmt = $this->connection->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    public function readActiveCategory($category){
        $query = "SELECT type,name,category,default_text from offer_types where active='Y' and category=:category ORDER BY name";
        $stmt = $this->connection->prepare($query);
        $stmt->execute(['category'=>$category]);
        return $stmt;
    }

    public function read(){
        $stmt=$this->readOne($this->type);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        $this->type=$row['type'];
        $this->name=$row['name'];
        $this->category=$row['category'];
        $this->default_text=$row['default_text'];
        $this->active=$row['active'];
   }

    public function readOne($type){
	        $query = "SELECT type,name,category,default_text,active from offer_types where type=:type";
	        $stmt = $this->connection->prepare($query);
	        $stmt->execute(['type'=>$type]);
	        return $stmt;
	    }


    public function delete(){
    	if(is_admin()){
			$sql = "DELETE FROM offer_types WHERE type=:type";
			$stmt= $this->connection->prepare($sql);
			return $stmt->execute(['type'=>$this->type]);
		} else {
			return false;
		}
    }
}
