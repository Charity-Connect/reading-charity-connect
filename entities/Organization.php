<?php
class Organization{

    private $connection;

    // table columns
    public $id;
    public $name;
    public $address;
    public $phone;
    public $approver_email;

    public function __construct($connection){
        $this->connection = $connection;
    }

    public function create(){
        $sql = "INSERT INTO organizations ( name,address,phone,approver_email) values (:name,:address,:phone,:approver_email)";
        $stmt= $this->connection->prepare($sql);
        if( $stmt->execute(['name'=>$this->name,'address'=>$this->address,'phone'=>$this->phone,'approver_email'=>$this->approver_email])){
            $this->id=$this->connection->lastInsertId();
            return $this->id;
        } else {
            return -1;
        }

    }
    public function readAll(){
        $query = "SELECT id,name,address,phone,approver_email from organizations ORDER BY id";
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
        $this->approver_email=$row['approver_email'];
   }

    public function readOne($id){
	        $query = "SELECT id,name,address,phone,approver_email from organizations where id=:id";
	        $stmt = $this->connection->prepare($query);
	        $stmt->execute(['id'=>$id]);
	        return $stmt;
	    }

    public function update(){

        $sql = "UPDATE organizations SET name=:name, address=:address, phone=:phone, approver_email=:approver_email WHERE id=:id";
        $stmt= $this->connection->prepare($sql);
        return $stmt->execute(['id'=>$this->id,'name'=>$this->name,'address'=>$this->address,'phone'=>$this->phone,'approver_email'=>$this->approver_email]);
    }

    public function delete(){
        $sql = "DELETE FROM organizations WHERE id=:id";
        $stmt= $this->connection->prepare($sql);
        return $stmt->execute(['id'=>$this->id]);

    }
}
