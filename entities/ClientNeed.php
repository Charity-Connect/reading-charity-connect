<?php
require_once __DIR__.'/Audit.php';
require_once __DIR__.'/Client.php';
require_once __DIR__.'/NeedRequest.php';
require_once __DIR__.'/UserOrganization.php';
require_once __DIR__.'/OfferType.php';
require_once __DIR__.'/../config/dbclass.php';

class ClientNeed{

	// Connection instance
	private $connection;
	private $client;

	// table client_id

	// table columns
	public $id;
	public $client_id;
	public $requesting_organization_id;
	public $type_id;
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

	private $base_query="SELECT cn.id
	,cn.client_id
	,cn.requesting_organization_id
	,cn.type_id
	, types.name type_name
	,types.category_id
	,cn.date_needed
	,cn.need_met
	,cn.fulfilling_need_request_id
	,org.name as fulfilling_organization_name
	,(select count(*) from need_requests nr1 where nr1.client_need_id=cn.id and nr1.agreed is null and nr1.fulfilled_elsewhere='N') as pending_responses
	,cn.notes
	,cn.creation_date
	,COALESCE(create_user.display_name,'System') as created_by
	,cn.update_date
	,COALESCE(update_user.display_name,'System') as updated_by 
	from client_needs cn
	left join users create_user on create_user.id=cn.created_by
	left join users update_user on update_user.id=cn.updated_by
	left join (need_requests nr inner join organizations org on nr.organization_id=org.id)
		on nr.id=cn.fulfilling_need_request_id
	,offer_types types 
	where types.id=cn.type_id ";

	public function create($organization_list){

		$stmt=$this->client->readOne($this->client_id);
		global $site_address;
		global $ui_root;

		if($stmt->rowCount()==1){

		if(!isset($this->need_met)){
			$this->need_met='N';
		}

		$sql = "INSERT INTO client_needs ( client_id,requesting_organization_id,type_id,date_needed,need_met,notes,created_by,updated_by) values (:client_id,:requesting_organization_id,:type,:date_needed,:need_met,:notes,:user_id,:user_id)";
		$stmt= $this->connection->prepare($sql);
		if( $stmt->execute(['client_id'=>$this->client_id
		,'requesting_organization_id'=>$_SESSION['organization_id']
		,'type'=>$this->type_id
		,'date_needed'=>$this->date_needed
		,'need_met'=>$this->need_met
		,'notes'=>$this->notes
		,'user_id'=>$_SESSION['id']])){

			$this->id=$this->connection->lastInsertId();
			Audit::add($this->connection,"create","client_need",$this->id);
			$this->creation_date=date("Y-m-d H:i:s");
			$this->created_by=$_SESSION['display_name'];
			$this->update_date=date("Y-m-d H:i:s");
			$this->updated_by=$_SESSION['display_name'];

			$offer_list=$this->getMatchingOffers();
			$org_list=array();
			foreach($offer_list as $offer_item){
				if(in_array($offer_item['organization_id'],$org_list)||!in_array($offer_item['organization_id'],$organization_list)){
					continue;
				}
				array_push($org_list,$offer_item['organization_id']);

				$need_request=new NeedRequest($this->connection);
				$need_request->client_need_id=$this->id;
				$need_request->request_organization_id=$offer_item['organization_id'];
				$need_request->offer_id=$offer_item['offer_id'];
				$need_request->client_id=$this->client_id;
				$need_request->type_id=$this->type_id;
				$need_request->need_notes=$this->notes;
				$need_request->date_needed=$this->date_needed;
				$need_request->create();

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


	public function getMatchingOffers(){
		$sql="select o.id
		,o.name
		,org.name as organization_name
		,o.organization_id
		,o.latitude as offer_latitude
		,o.longitude as offer_longitude
		, o.distance
		, o.postcode as offer_postcode
		,c.latitude as client_latitude
		,o.longitude as client_longitude
		from clients c
		, offers o
		,organizations org
		where
		c.id=:client_id
		and o.organization_id=org.id
		and org.enabled='Y'
		and o.type_id=:type_id
		and o.quantity_taken<o.quantity
		and date(:date_needed) between date(o.date_available) and date(coalesce(o.date_end,:date_needed))";
		$stmt = $this->connection->prepare($sql);
		$stmt->execute(['client_id'=>$this->client_id,'type_id'=>$this->type_id,'date_needed'=>$this->date_needed]);
		$offer_list=array();
		while ($row = $stmt->fetch(PDO::FETCH_ASSOC)){
			if(!is_null($row['distance'])&&!is_null($row['offer_latitude'])){
				if(is_null($row['offer_latitude'])||is_null($row['offer_longitude'])||is_null($row['client_latitude'])||is_null($row['client_longitude'])){
					continue;
				} else {
					$distance=distance($row['offer_latitude'],$row['offer_longitude'],$row['client_latitude'],$row['client_longitude'],"M");
					if($distance>$row['distance']){
						continue;
					}
				}
			}
		array_push($offer_list,array("offer_id"=>$row['id']
		,"offer_name"=>$row['name']
		,"organization_id"=>$row['organization_id']
		,"organization_name"=>$row['organization_name']
		));
		//$offer_list[$row['organization_id']]=$row['id'];
		}
		return $offer_list;

	}
	public function readAll($client_id){
		if(is_admin()){
			$query =  $this->base_query."  
			and cn.client_id = :client_id ORDER BY cn.id";
			$stmt = $this->connection->prepare($query);
			$stmt->execute(['client_id'=>$client_id]);
			return $stmt;
		} else {
			$query = $this->base_query." and cn.client_id = :client_id and l.link_id=:organization_id ORDER BY cn.id";
			$stmt = $this->connection->prepare($query);
			$stmt->execute(['organization_id'=>$_SESSION["organization_id"],'client_id'=>$client_id]);
			return $stmt;
		}
	}

	public function read(){
		$stmt=$this->readOne($this->id);
		$row = $stmt->fetch(PDO::FETCH_ASSOC);
		$this->client_id=$row['client_id'];
		$this->type_id=$row['type_id'];
		$this->type_name=$row['type_name'];
		$this->category_id=$row['category_id'];
		$this->date_needed=$row['date_needed'];
		$this->need_met=$row['need_met'];
		$this->fulfilling_need_request_id=$row['fulfilling_need_request_id'];
		$this->fulfilling_organization_name=$row['fulfilling_organization_name'];
		$this->pending_responses=$row['pending_responses'];
		$this->notes=$row['notes'];
		$this->creation_date=$row['creation_date'];
		$this->created_by=$row['created_by'];
		$this->update_date=$row['update_date'];
		$this->updated_by=$row['updated_by'];
   }

	public function readOne($id){
		if(is_admin()){
			$query = $this->base_query." and cn.id=:id";
			$stmt = $this->connection->prepare($query);
			$stmt->execute(['id'=>$id]);
			return $stmt;
		} else {
			$query = $this->base_query." and cn.id=:id and cn.client_id=l.client_id and l.link_type='ORG' and l.link_id=:organization_id ORDER BY cn.id";
			$stmt = $this->connection->prepare($query);
			$stmt->execute(['id'=>$id,'organization_id'=>$_SESSION["organization_id"]]);
			return $stmt;
		}

	}

	public function update($organization_list){
		global $site_address;
		global $ui_root;

		$client_need_orig= new ClientNeed($this->connection);
		$client_need_orig->id=$this->id;
		$client_need_orig->read();

		$stmt=$this->readOne($this->id);
		if($stmt->rowCount()==1){
			// can't update the type or date if it is already complete
			if($client_need_orig->need_met=='Y' &&
			 ($this->type_id!=$client_need_orig->type_id ||
			 $this->date_needed!=$client_need_orig->date_needed) ){
				 return false;
			 }

			$this->connection->beginTransaction();

			$meeting_need=false;
			if($client_need_orig->need_met=='N' 
			&& $client_need_orig->fulfilling_need_request_id!=null 
			&& ($this->type_id!=$client_need_orig->type_id ||$this->date_needed!=$client_need_orig->date_needed) ){
				$meeting_need=new NeedRequest($this->connection);
				$meeting_need->forceRead($client_need_orig->fulfilling_need_request_id);
			}

			$sql = "UPDATE client_needs SET  type_id=:type_id, date_needed=:date_needed, need_met=:need_met,fulfilling_need_request_id=:fulfilling_need_request_id, notes=:notes,updated_by=:updated_by WHERE id=:id";
			$stmt= $this->connection->prepare($sql);
			if( $stmt->execute(['id'=>$this->id,'type_id'=>$this->type_id,'date_needed'=>$this->date_needed,'need_met'=>$this->need_met,'fulfilling_need_request_id'=>$this->fulfilling_need_request_id,'notes'=>$this->notes
			,'updated_by'=>$_SESSION['id']])){
				// if the type or the date has changed, delete the old need requests and create new ones
				if($this->type_id!=$client_need_orig->type_id ||
				 $this->date_needed!=$client_need_orig->date_needed ){

					$sql = "DELETE FROM need_requests WHERE client_need_id=:id";
					$stmt = $this->connection->prepare($sql);
					$stmt->execute(['id'=>$this->id]);
		
					$offer_list=$this->getMatchingOffers();
					$org_list=array();
					foreach($offer_list as $offer_item){
						if(in_array($offer_item['organization_id'],$org_list)||!in_array($offer_item['organization_id'],$organization_list)){
							continue;
						}
						array_push($org_list,$offer_item['organization_id']);
						$need_request=new NeedRequest($this->connection);
						$need_request->client_need_id=$this->id;
						$need_request->request_organization_id=$offer_item['organization_id'];
						$need_request->offer_id=$offer_item['offer_id'];
						$need_request->client_id=$this->client_id;
						$need_request->type_id=$this->type_id;
						$need_request->need_notes=$this->notes;
						$need_request->date_needed=$this->date_needed;
						$need_request->create();		
					}
				 }
	
				Audit::add($this->connection,"update","client_need",$this->id);
				$success= $this->connection->commit();
				if($success&& $meeting_need!=false){
					
					// someone had agreed to do this and we've changed it. Let them know.
					$client = new Client($this->connection);
					$client->id=$this->client_id;
					$client->read();
					$offer_type= new OfferType($this->connection);
					$offer_type->type_id=$this->type_id;
					$offer_type->read();
					$user_organization= new UserOrganization($this->connection);
					$stmt=$user_organization->readAllNeedApprovers($meeting_need->request_organization_id);
					while ($row = $stmt->fetch(PDO::FETCH_ASSOC)){
						echo "sending";
						sendHtmlMail($row['email']
						,get_string("need_req_changed_subject")
						,get_string("need_req_changed_body"
						,array("%LINK%"=>$site_address.$ui_root."index.html?root=requests%2F".$this->id
										,"%USER_NAME%"=>$row['user_name']
										,"%CLIENT_NAME%"=>$client->name
										,"%SOURCE_ORG_NAME%"=>$_SESSION["organization_name"]
										,"%REQUEST_TYPE_ORIG%"=>$meeting_need->type_name
										,"%TARGET_DATE%"=>$meeting_need->target_date
										,"%CLIENT_ADDRESS%"=>$client->address
										,"%CLIENT_POSTCODE%"=>$client->postcode
										,"%REQUEST_TYPE%"=>$offer_type->name
										,"%DATE_NEEDED%"=>$this->date_needed
										,"%NOTES%"=>$this->notes
							)));
					}
	
				}
				return $success;
			}
		} 
		return false;
	}

	public function delete(){
		$this->connection->beginTransaction();
		$stmt=$this->readOne($this->id);
		if($stmt->rowCount()==1){
			$sql = "DELETE FROM need_requests WHERE client_need_id=:id";
			$stmt = $this->connection->prepare($sql);
			$stmt->execute(['id'=>$this->id]);
			$sql = "DELETE FROM client_needs WHERE id=:id";
			$stmt= $this->connection->prepare($sql);
			$stmt->execute(['id'=>$this->id]);
			Audit::add($this->connection,"delete","client_need",$this->id);
			return $this->connection->commit();
		} else {
			$this->connection->rollBack();
			return false;
		} 
		return false;
	}
}
