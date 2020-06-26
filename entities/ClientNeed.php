<?php
include_once $_SERVER['DOCUMENT_ROOT'] .'/entities/Client.php';
include_once $_SERVER['DOCUMENT_ROOT'] .'/entities/NeedRequest.php';
include_once $_SERVER['DOCUMENT_ROOT'] .'/config/dbclass.php';

class ClientNeed{

	// Connection instance
	private $connection;
	private $client;

	// table client_id

	// table columns
	public $id;
	public $client_id;
	public $requesting_organization_id;
	public $type;
	public $date_needed;
	public $need_met;
	public $notes;
	public $type_name;
	public $creation_date;
	public $created_by;
	public $update_date;
	public $updated_by;
	public $fulfilling_need_request_id;

	public function __construct($connection){
		$this->connection = $connection;
		$this->client = new Client($connection);

	}

	public function create(){

		$stmt=$this->client->readOne($this->client_id);
		global $site_address;
		global $ui_root;

		if($stmt->rowCount()==1){

		if(!isset($this->need_met)){
			$this->need_met='N';
		}

		$sql = "INSERT INTO client_needs ( client_id,requesting_organization_id,type,date_needed,need_met,notes,created_by,updated_by) values (:client_id,:requesting_organization_id,:type,:date_needed,:need_met,:notes,:user_id,:user_id)";
		$stmt= $this->connection->prepare($sql);
		if( $stmt->execute(['client_id'=>$this->client_id,'requesting_organization_id'=>$_SESSION['organization_id'],'type'=>$this->type,'date_needed'=>$this->date_needed,'need_met'=>$this->need_met,'notes'=>$this->notes,'user_id'=>$_SESSION['id']])){
			$this->id=$this->connection->lastInsertId();


			$sql="select o.id,o.organization_id,o.latitude as offer_latitude,o.longitude as offer_longitude, o.distance,c.latitude as client_latitude,o.longitude as client_longitude
			from clients c, offers o, client_needs n
			where
			c.id=n.client_id
			and n.id=:id
			and o.type=n.type
			and o.quantity_taken<o.quantity
			and n.date_needed between coalesce(o.date_available,n.date_needed) and coalesce(o.date_end,n.date_needed)";
			$stmt = $this->connection->prepare($sql);
			$stmt->execute(['id'=>$this->id]);

			$oranization_list=array();
			while ($row = $stmt->fetch(PDO::FETCH_ASSOC)){
				if(!is_null($row['distance'])){
					if(is_null($row['offer_latitude'])||is_null($row['offer_longitude'])||is_null($row['client_latitude'])||is_null($row['client_longitude'])){
						continue;
					} else {
						$distance=distance($row['offer_latitude'],$row['offer_longitude'],$row['client_latitude'],$row['client_longitude'],"M");
						if($distance>$row['distance']){
							continue;
						}
					}
				}
				//array_push($oranization_list,	$row['organization_id']);
			$oranization_list[$row['organization_id']]=$row['id'];
			}

			//$oranization_list=array_unique($oranization_list);
			foreach($oranization_list as $org_id=>$off_id){
				$sql="select c.name as client_name,c.address,c.postcode,u.email,u.display_name as user_name,o.name as source_org_name,o2.name as target_org_name, ot.name type_name
				from clients c, users u, organizations o, user_organizations uo, organizations o2, offer_types ot
				where o.id=:organization_id
				and ot.type=:type
				and o2.id=uo.organization_id
				and c.id=:client_id
				and u.id=uo.user_id
				and uo.need_approver='Y'";
				$stmt = $this->connection->prepare($sql);
				$stmt->execute(['organization_id'=>$_SESSION['organization_id'],'client_id'=>$this->client_id,'type'=>$this->type]);

				$need_request=new NeedRequest($this->connection);
				$need_request->client_need_id=$this->id;
				$need_request->request_organization_id=$org_id;
				$need_request->offer_id=$off_id;
				$need_request->create();

				while ($row = $stmt->fetch(PDO::FETCH_ASSOC)){
					sendHtmlMail($row['email']
					,get_string("need_request_subject")
					,get_string("need_request_body"
						,array("%LINK%"=>$site_address.$ui_root."index.html?root=requests%2F".$need_request->id
										,"%USER_NAME%"=>$row['user_name']
										,"%CLIENT_NAME%"=>$row['client_name']
										,"%SOURCE_ORG_NAME%"=>$row['source_org_name']
										,"%TARGET_ORG_NAME%"=>$row['target_org_name']
										,"%CLIENT_ADDRESS%"=>$row['address']
										,"%CLIENT_POSTCODE%"=>$row['postcode']
										,"%REQUEST_TYPE%"=>$row['type_name']
										,"%DATE_NEEDED%"=>$this->date_needed
										,"%NOTES%"=>$this->notes
							)));
				}

			}




			return $this->id;
		} else {
	print_r($this->connection->errorInfo());
			return -1;
		}
	} else {
		return -1;
	}

	}
	public function readAll($client_id){
		if(is_admin()){
			$query = "SELECT cn.id,cn.client_id,cn.requesting_organization_id,cn.type, types.name type_name,cn.date_needed,cn.need_met,cn.fulfilling_need_request_id,cn.notes,cn.creation_date,cn.created_by,cn.update_date,cn.updated_by from client_needs cn,offer_types types where types.type=cn.type and cn.client_id = :client_id ORDER BY cn.id";
			$stmt = $this->connection->prepare($query);
			$stmt->execute(['client_id'=>$client_id]);
			return $stmt;
		} else {
			$query = "SELECT cn.id,cn.client_id,cn.requesting_organization_id,cn.type, types.name type_name,cn.date_needed,cn.need_met,cn.fulfilling_need_request_id,cn.notes,cn.creation_date,cn.created_by,cn.update_date,cn.updated_by from client_needs cn, client_links l,offer_types types where types.type=cn.type and cn.client_id=:client_id and cn.client_id=l.client_id and l.link_type='ORG' and l.link_id=:organization_id ORDER BY cn.id";
			$stmt = $this->connection->prepare($query);
			$stmt->execute(['organization_id'=>$_SESSION["organization_id"],'client_id'=>$client_id]);
			return $stmt;
		}
	}

	public function read(){
		$stmt=$this->readOne($this->id);
		$row = $stmt->fetch(PDO::FETCH_ASSOC);
		$this->client_id=$row['client_id'];
		$this->type=$row['type'];
		$this->date_needed=$row['date_needed'];
		$this->need_met=$row['need_met'];
		$this->fulfilling_need_request_id=$row['fulfilling_need_request_id'];
		$this->notes=$row['notes'];
		$this->type_name=$row['type_name'];
		$this->creation_date=$row['creation_date'];
		$this->created_by=$row['created_by'];
		$this->update_date=$row['update_date'];
		$this->updated_by=$row['updated_by'];
   }

	public function readOne($id){
		if(is_admin()){
			$query = "SELECT cn.id,cn.client_id,cn.requesting_organization_id,cn.type,types.name type_name,cn.date_needed,cn.need_met,cn.fulfilling_need_request_id,cn.notes,cn.creation_date,cn.created_by,cn.update_date,cn.updated_by from client_needs cn,offer_types types where types.type=cn.type and cn.id=:id";
			$stmt = $this->connection->prepare($query);
			$stmt->execute(['id'=>$id]);
			return $stmt;
		} else {
			$query = "SELECT cn.id,cn.client_id,cn.requesting_organization_id,cn.type,types.name type_name,cn.date_needed,cn.need_met,cn.fulfilling_need_request_id,cn.notes,cn.creation_date,cn.created_by,cn.update_date,cn.updated_by from client_needs cn, client_links l,offer_types types where cn.id=:id and cn.client_id=l.client_id and l.link_type='ORG' and l.link_id=:organization_id ORDER BY cn.id";
			$stmt = $this->connection->prepare($query);
			$stmt->execute(['id'=>$id,'organization_id'=>$_SESSION["organization_id"]]);
			return $stmt;
		}

	}

	public function update(){

		$stmt=$this->readOne($this->id);
		if($stmt->rowCount()==1){
			$sql = "UPDATE client_needs SET client_id=:client_id, type=:type, date_needed=:date_needed, need_met=:need_met,fulfilling_need_request_id=:fulfilling_need_request_id, notes=:notes,updated_by=:updated_by WHERE id=:id";
			$stmt= $this->connection->prepare($sql);
			return $stmt->execute(['id'=>$this->id,'client_id'=>$this->client_id,'type'=>$this->type,'date_needed'=>$this->date_needed,'need_met'=>$this->need_met,'fulfilling_need_request_id'=>$this->fulfilling_need_request_id,'notes'=>$this->notes
			,'updated_by'=>$_SESSION['id']
]);
		} else {
			return false;
		}
	}

	public function delete(){
		$stmt=$this->readOne($this->id);
		if($stmt->rowCount()==1){
			$sql = "DELETE FROM client_needs WHERE id=:id";
			$stmt= $this->connection->prepare($sql);
			return $stmt->execute(['id'=>$this->id]);
		} else {
			return false;
		}

	}
}
