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

	public function __construct($connection){
		$this->connection = $connection;
	}

	public function insert(){
		$uid=-1;
		if(isset($_SESSION['id'])){
			$uid=$_SESSION['id'];
		}
		$sql = "INSERT INTO audit (user_id,action,object,key_id,key_code) values (:user_id,:action,:object,:key_id,:key_code)";
		$stmt= $this->connection->prepare($sql);
		return $stmt->execute(['user_id'=>$uid
		,'action'=>$this->action
		,'object'=>$this->object
		,'key_id'=>$this->key_id
		,'key_code'=>$this->key_code
		]);
	}

	public static function add($connection,$action,$object,$key_id,$key_code=null){
		$uid=-1;
		if(isset($_SESSION['id'])){
			$uid=$_SESSION['id'];
		}
		$sql = "INSERT INTO audit (user_id,action,object,key_id,key_code) values (:user_id,:action,:object,:key_id,:key_code)";
		$stmt= $connection->prepare($sql);
		return $stmt->execute(['user_id'=>$uid
		,'action'=>$action
		,'object'=>$object
		,'key_id'=>$key_id
		,'key_code'=>$key_code]);
	}

	public function readAll(){
		$query = "SELECT * FROM audit ORDER BY audit_date";
		$stmt = $this->connection->prepare($query);
		$stmt->execute();
		return $stmt;
	}

	public function readByDate($date){
		$query = "SELECT * FROM audit where audit_date between :date and date_add(:date,INTERVAL 1 DAY) ORDER BY audit_date";
		$stmt = $this->connection->prepare($query);
		$stmt->execute(['date'=>$date]);
		return $stmt;
	}


}
