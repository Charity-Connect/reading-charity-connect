<?php
class Offer{

    private $connection;

    public $id;
    public $organization_id;
    public $organization_name;
    public $name;
    public $type;
    public $type_name;
    public $details;
    public $quantity;
    public $date_available;
    public $date_end;
    public $postcode;
    private $latitude;
    private $longitude;
    public $distance;

    public function __construct($connection){
        $this->connection = $connection;
    }

    public function create(){

    	if(!is_admin()){
    		$this->id=$_SESSION('organization_id');
    	}
		if(isset($this->postcode)&&$this->postcode!=""){
			list($latitude,$longitude)=getGeocode($this->postcode);
		}
		$sql = "INSERT INTO offers (organization_id,name,type,details,quantity,date_available,date_end,postcode,latitude,longitude,distance) values
(:organization_id,:name,:type,:details,:quantity,:date_available,:date_end,:postcode,:latitude,:longitude,:distance)";
		$stmt= $this->connection->prepare($sql);
		if( $stmt->execute(['organization_id'=>$this->organization_id
			,'name'=>$this->name
			,'type'=>$this->type
			,'details'=>$this->details
			,'quantity'=>$this->quantity
			,'date_available'=>$this->date_available
			,'date_end'=>$this->date_end
			,'postcode'=>$this->postcode
			,'latitude'=>($latitude==-1) ? null:$latitude
			,'longitude'=>($latitude==-1) ? null:$longitude
			,'distance'=>$this->distance
			])){
			$this->id=$this->connection->lastInsertId();
			return $this->id;
		} else {
			return -1;
		}

    }
    public function readAll(){
        if(is_admin()){
            $query = "SELECT o.id,o.organization_id, org.name as organization_name, o.name,o.type,t.name as type_name,o.details,o.quantity,o.date_available, o.date_end, o.postcode,o.latitude,o.longitude, o.distance from offers o , offer_types t, organizations org where o.type=t.type and o.organization_id=org.id ORDER BY o.id";
       		$stmt = $this->connection->prepare($query);
       		$stmt->execute();
        } else {
	        $query = "SELECT o.id,o.organization_id, org.name as organization_name, o.name,o.type,t.name as type_name,o.details,o.quantity,o.date_available, o.date_end, o.postcode,o.latitude,o.longitude, o.distance from offers o, offer_types t, organizations org where o.organization_id=:organization_id and o.organization_id=org.id and o.type=t.type ORDER BY o.id";
			$stmt = $this->connection->prepare($query);
	        $stmt->execute(['organization_id'=>$_SESSION["organization_id"]]);
        }
        return $stmt;
    }

    public function read(){
        $stmt=$this->readOne($this->id);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        $this->organization_id=$row['organization_id'];
        $this->organization_name=$row['organization_name'];
        $this->name=$row['name'];
        $this->type=$row['type'];
        $this->type_name=$row['type_name'];
        $this->details=$row['details'];
        $this->quantity=$row['quantity'];
        $this->date_available=$row['date_available'];
        $this->date_end=$row['date_end'];
        $this->postcode=$row['postcode'];
        $this->latitude=$row['latitude'];
        $this->longitude=$row['longitude'];
        $this->distance=$row['distance'];
  }

    public function readOne($id){
        if(is_admin()){
	        $query = "SELECT o.id,o.organization_id, org.name as organization_name,o.name,o.type,t.name as type_name, o.details,o.quantity,o.date_available, o.date_end, o.postcode,o.latitude,o.longitude,o.distance from offers o, offer_types t, organizations org where o.type=t.type and o.organization_id=org.id and o.id=:id";
	        $stmt = $this->connection->prepare($query);
	        $stmt->execute(['id'=>$id]);
	    } else {
	        $query = "SELECT o.id,o.organization_id, org.name as organization_name,o.name,o.type,t.name as type_name,o.details,o.quantity,o.date_available, o.date_end, o.postcode,o.latitude,o.longitude,o.distance from offers o , offer_types t, organizations org where o.organization_id=:organization_id and o.organization_id=org.id and o.type=t.type and o.id=:id";
	        $stmt = $this->connection->prepare($query);
	        $stmt->execute(['id'=>$id,'organization_id'=>$_SESSION["organization_id"]]);
	    }
	        return $stmt;
	}

    public function getLatitude(){
    	return $this->latitude;
    }
    public function getLongitude(){
    	return $this->longitude;
    }
    public function update(){

    	$stmt=$this->readOne($this->id);
		if($stmt->rowCount()==1){

			$offerOrig=new Offer($this->connection);
			$offerOrig->id=$this->id;
			$offerOrig->read();
			if($offerOrig->postcode!=$this->postcode&&isset($this->postcode)&&$this->postcode!=""){
				list($latitude,$longitude)=getGeocode($this->postcode);
			} else {
				$latitude=$offerOrig->getLatitude();
				$longitude=$offerOrig->getLongitude();
			}

        	$sql = "UPDATE offers SET organization_id=:organization_id,name=:name, type=:type, details=:details, quantity=:quantity,date_available=:date_available,date_end=:date_end,postcode=:postcode,latitude=:latitude,longitude=:longitude WHERE id=:id";
        	$stmt= $this->connection->prepare($sql);
        	return $stmt->execute(['id'=>$this->id,'organization_id'=>$this->organization_id,'name'=>$this->name,'type'=>$this->type,'details'=>$this->details,'quantity'=>$this->quantity,'date_available'=>$this->date_available,'date_end'=>$this->date_end,'postcode'=>$this->postcode
        		,'latitude'=>($latitude==-1) ? null:$latitude
				,'longitude'=>($latitude==-1) ? null:$longitude
			]);
        } else {
        	return false;
        }
    }

    public function delete(){
    	$stmt=readOne($this->id);
		if($stmt->rowCount()==1){
	        $sql = "DELETE FROM offers WHERE id=:id";
        	$stmt= $this->connection->prepare($sql);
        	return $stmt->execute(['id'=>$this->id]);
        } else {
        	return false;
        }

    }
}
