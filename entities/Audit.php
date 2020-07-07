<?php
class Audit{

	// Connection instance
	private $connection;

	// table columns
	public $id;
	public $user_id;
	public $audit_date;
	public $action;
	public $object;
	public $key_id;
	public $key_code;
	public $name;

	public function __construct($connection){
		$this->connection = $connection;
	}

	public function insert(){
		$uid=null;
		if(isset($_SESSION['id'])){
			$uid=$_SESSION['id'];
		}
		$sql = "INSERT INTO audit (user_id,action,object,key_id,key_code,name) values (:user_id,:action,:object,:key_id,:key_code,:name)";
		$stmt= $this->connection->prepare($sql);
		return $stmt->execute(['user_id'=>$uid
		,'action'=>$this->action
		,'object'=>$this->object
		,'key_id'=>$this->key_id
		,'key_code'=>$this->key_code
		,'name'=>$this->name
		]);
	}

	public static function add($connection,$action,$object,$key_id,$key_code=null,$name=null){
		$uid=null;
		if(isset($_SESSION['id'])){
			$uid=$_SESSION['id'];
		}
		$sql = "INSERT INTO audit (user_id,action,object,key_id,key_code,name) values (:user_id,:action,:object,:key_id,:key_code,:name)";
		$stmt= $connection->prepare($sql);
		if( $stmt->execute(['user_id'=>$uid
		,'action'=>$action
		,'object'=>$object
		,'key_id'=>$key_id
		,'key_code'=>$key_code
		,'name'=>$name
		])){
			$stmt->closeCursor();
			return true;
		} else {
			print_r($connection->errorInfo());
			return false;
		}
	}

	public function readAll(){
		if(is_admin()){
		$query = "SELECT a.id,a.audit_date,a.user_id,u.display_name,u.email,a.action,a.object,a.key_id,a.key_code,a.name
		FROM audit a 
		left join users u on u.id=a.user_id
		ORDER BY audit_date";
		$stmt = $this->connection->prepare($query);
		$stmt->execute();
		return $stmt;
		}
	}

	public function readByDate($date){
		if(is_admin()){
			$query = "SELECT a.id,a.audit_date,a.user_id,u.display_name,u.email,a.action,a.object,a.key_id,a.key_code,a.name
		FROM audit a 
		left join users u on u.id=a.user_id
		where a.audit_date between :date and date_add(:date,INTERVAL 1 DAY)
		ORDER BY audit_date";
		$stmt = $this->connection->prepare($query);
		$stmt->execute(['date'=>$date]);
		return $stmt;
		}
	}


}
