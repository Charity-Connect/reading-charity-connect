<?php
require_once __DIR__.'/Audit.php';
require_once __DIR__.'/User.php';
require_once __DIR__.'/UserOrganization.php';
require_once __DIR__.'/ClientShareRequest.php';
class Client{

	// Connection instance
	private $connection;

	// table columns
	public $id;
	public $name;
	public $address;
	public $postcode;
	private $latitude;
	private $longitude;
	public $phone;
	public $email;
	public $notes;
	private $force_read=false;
	public $creation_date;
	public $created_by;
	public $update_date;
	public $updated_by;

	public function __construct($connection){
		$this->connection = $connection;
	}

	private $base_query ="SELECT c.id
	,c.name
	,c.address
	,c.postcode
	,c.phone
	,c.email
	,c.longitude
	,c.latitude
	,c.notes
	,c.creation_date
	,COALESCE(create_user.display_name,'System') as created_by
	,c.update_date
	,COALESCE(update_user.display_name,'System') as updated_by 
	from clients c
	left join users create_user on create_user.id=c.created_by
	left join users update_user on update_user.id=c.updated_by
	, client_links l 
	where c.id=l.client_id and l.link_type='ORG' ";

	public function create(){

		if(isset($this->postcode)&&$this->postcode!=""){
			list($this->latitude,$this->longitude)=getGeocode($this->postcode);
		}

		$sql = "INSERT INTO clients ( name,address,postcode,latitude,longitude,phone,email,notes,created_by,updated_by) values (:name,:address,:postcode,:latitude,:longitude,:phone,:email,:notes,:user_id,:user_id)";
		$stmt= $this->connection->prepare($sql);
		if( $stmt->execute(['name'=>$this->name
			,'address'=>$this->address
			,'postcode'=>$this->postcode
			,'latitude'=>($this->latitude==-1) ? null:$this->latitude
			,'longitude'=>($this->latitude==-1) ? null:$this->longitude
			,'phone'=>$this->phone
			,'email'=>$this->email
			,'notes'=>$this->notes
			,'user_id'=>$_SESSION['id']
		])){
			$this->id=$this->connection->lastInsertId();

			$sql = "INSERT INTO client_links ( client_id,link_id,link_type,created_by,updated_by) values (:client_id,:organization_id,'ORG',:user_id,:user_id)";
			$stmt= $this->connection->prepare($sql);
			$stmt->execute(['client_id'=>$this->id,'organization_id'=>$_SESSION["organization_id"],'user_id'=>$_SESSION['id']]);

			Audit::add($this->connection,"create","client",$this->id,null,$this->name);
			return $this->id;
		} else {
			return -1;
		}

	}
	public function readAll(){
		if(is_admin()&&$_SESSION["view_all"]){
			$query = $this->base_query. "ORDER BY id";
			$stmt = $this->connection->prepare($query);
			$stmt->execute();
			return $stmt;
		} else {
			$query = $this->base_query. " and l.link_id=:organization_id  ORDER BY c.id";
			$stmt = $this->connection->prepare($query);
			$stmt->execute(['organization_id'=>$_SESSION["organization_id"]]);
			return $stmt;
		}
	}

	public function forceRead($id){
		$this->force_read=true;
		$this->id=$id;
		$this->read();
	}


	public function read(){
		$stmt=$this->readOne($this->id);
		$row = $stmt->fetch(PDO::FETCH_ASSOC);
		$this->name=$row['name'];
		$this->address=$row['address'];
		$this->postcode=$row['postcode'];
		$this->latitude=$row['latitude'];
		$this->longitude=$row['longitude'];
		$this->phone=$row['phone'];
		$this->email=$row['email'];
		$this->notes=$row['notes'];
		$this->creation_date=$row['creation_date'];
		$this->created_by=$row['created_by'];
		$this->update_date=$row['update_date'];
		$this->updated_by=$row['updated_by'];
   }

	public function readOne($id){
		if((is_admin()&&$_SESSION["view_all"])||$this->force_read==true){
			$query = $this->base_query. "and c.id=:id";
			$stmt = $this->connection->prepare($query);
			$stmt->execute(['id'=>$id]);
			return $stmt;
		} else {
			$query = $this->base_query."and c.id=:id and l.link_id=:organization_id ORDER BY c.id";
			$stmt = $this->connection->prepare($query);
			$stmt->execute(['id'=>$id,'organization_id'=>$_SESSION["organization_id"]]);
			return $stmt;
		}

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

			$clientOrig=new Client($this->connection);
			$clientOrig->id=$this->id;
			$clientOrig->read();
			if($clientOrig->postcode!=$this->postcode&&isset($this->postcode)&&$this->postcode!=""){
				list($latitude,$longitude)=getGeocode($this->postcode);
			} else {
				$latitude=$clientOrig->getLatitude();
				$longitude=$clientOrig->getLongitude();
			}

			$sql = "UPDATE clients SET name=:name, address=:address, postcode=:postcode,latitude=:latitude,longitude=:longitude,phone=:phone, email=:email, notes=:notes,updated_by=:updated_by WHERE id=:id";

			$stmt= $this->connection->prepare($sql);
			$result= $stmt->execute(['id'=>$this->id,'name'=>$this->name,'address'=>$this->address,'postcode'=>$this->postcode
		   		,'latitude'=>($latitude==-1) ? null:$latitude
				,'longitude'=>($latitude==-1) ? null:$longitude
				,'phone'=>$this->phone,'email'=>$this->email,'notes'=>$this->notes
				,'updated_by'=>$_SESSION['id']
			]);
			Audit::add($this->connection,"update","client",$this->id,null,$this->name);
			return $result;
		} else {
			return false;
		}
	}

	public function delete(){
        $stmt=$this->connection->prepare("select link_id,link_type from client_links where client_id=:id");
		$stmt->execute(['id'=>$this->id]);
		$active_org_id = $_SESSION['organization_id'];
        if($stmt->rowCount()==1){
			$row = $stmt->fetch();
			if($active_org_id==$row['link_id']){
				// TODO: add a database transaction				
				$stmt= $this->connection->prepare("DELETE FROM clients WHERE id=:client_id; DELETE FROM client_needs WHERE client_id=:client_id; DELETE FROM need_requests WHERE client_need_id=:client_id; DELETE FROM client_links WHERE client_id=:client_id AND link_type='ORG'");
				Audit::add($this->connection,"delete","client",$this->id);
				return $stmt->execute(['client_id'=>$this->id]);
			}
        } elseif($stmt->rowCount()>1)  {
			$stmt= $this->connection->prepare("DELETE FROM client_links WHERE client_id=:client_id AND link_id=:organization_id AND link_type='ORG'");
			return $stmt->execute(['client_id'=>$this->id, 'organization_id'=>$active_org_id]);
			Audit::add($this->connection,"delete","client_links",$this->connection->lastInsertId());
		}
		return false;
        }

	/* find an array of duplicates. Optionally pass in a single id and organization_id to find a single duplicate */
	public function duplicateCheck($id=-1,$organization_id=-1){
		if(!isset($this->id)){
			$this->id=-1;
		}
		if(!isset($this->name)||is_null($this->name)){
			$this->name="";
		}
		if(!isset($this->address)||is_null($this->address)){
			$this->address="";
		}
		if(!isset($this->postcode)||is_null($this->postcode)){
			$this->postcode="";
		}
		if(!isset($this->phone)||is_null($this->phone)){
			$this->phone="";
		}
		if(!isset($this->email)||is_null($this->email)){
			$this->email="";
		}
		$query = "SELECT c.id,ifnull(c.name,'') as name,ifnull(c.address,'') as address,ifnull(c.postcode,'') as postcode,ifnull(c.phone,'') as phone,ifnull(c.email,'') as email,l.link_id as organization_id, o.name as organization_name from clients c, client_links l, organizations o where c.id=l.client_id and l.link_type='ORG' and l.link_id=o.id and (trim(lower(c.name))=:name or trim(replace(lower(c.address),',',''))=:address or trim(lower(c.postcode))=:postcode or trim(replace(c.phone,' ','')) = :phone or trim(lower(c.email)=:email)) and c.id!=:id";

		if($id!=-1){
			$query=$query." and c.id=:client_id and o.id=:organization_id";
			$stmt = $this->connection->prepare($query);
			$stmt->execute(['client_id'=>$id,'organization_id'=>$organization_id, 'id'=>$this->id,'name'=>trim(strtolower($this->name)),'address'=>trim(str_replace("'","",strtolower($this->address))),'postcode'=>trim(strtolower($this->postcode)),'phone'=>trim(str_replace(" ","",$this->phone)),'email'=>trim(strtolower($this->email))]);
		} else {
			$stmt = $this->connection->prepare($query);
			$stmt->execute(['id'=>$this->id,'name'=>trim(strtolower($this->name)),'address'=>trim(str_replace("'","",strtolower($this->address))),'postcode'=>trim(strtolower($this->postcode)),'phone'=>trim(str_replace(" ","",$this->phone)),'email'=>trim(strtolower($this->email))]);
		}
		if( $stmt->rowCount()==0){
			return false;
		}
		$matchedPeople=[];
		while ($row = $stmt->fetch(PDO::FETCH_ASSOC)){
			$matchScore=0;
			$matchArray=new stdClass();
			$matchArray->id=$row['id'];
			$matchArray->organization_id=$row['organization_id'];
			if($row['organization_id']==$_SESSION['organization_id']){
				$matchArray->current_organization='Y';
			} else {
				$matchArray->current_organization='N';
			}

			$matchArray->organization_name=$row['organization_name'];

			if(trim(strtolower($row['name']))==trim(strtolower($this->name))){
				if(trim($row['name'])==""){
					$matchArray->name="Not Set";
				} else {
					$matchScore=$matchScore+10;
					$matchArray->name="Match: ".$row['name'];
				}
			} else {
				if(trim($row['name'])==""){
					$matchArray->name="Not Set";
				} else if($matchArray->current_organization=='Y'){
					$matchArray->name="No Match: ".$row['name'];
				} else {
					$matchArray->name="No Match";
				}
			}
			if(trim(strtolower($row['address']))==trim(strtolower($this->address))){
				if(trim($row['address'])===""){
					$matchArray->address="Not Set";
				} else {
					$matchScore=$matchScore+5;
					$matchArray->address="Match: ".$row['address'];
				}
			}	else {
				if(trim($row['address'])==""){
					$matchArray->address="Not Set";
				} else if($matchArray->current_organization=='Y'){
					$matchArray->address="No Match: ".$row['address'];
				} else {
					$matchArray->address="No Match";
				}
			}
			if(strtolower($row['postcode'])==strtolower($this->postcode)){
				if($row['postcode']==""){
					$matchArray->postcode="Not Set";
				} else {
					$matchScore=$matchScore+5;
					$matchArray->postcode="Match: ".$row['postcode'];
				}
			}	else {
				if(trim($row['postcode'])==""){
					$matchArray->postcode="Not Set";
				} else if($matchArray->current_organization=='Y'){
					$matchArray->postcode="No Match: ".$row['postcode'];
				} else {
					$matchArray->postcode="No Match";
				}
			}
			if(strtolower($row['email'])==strtolower($this->email)){
				if($row['email']==""){
					$matchArray->email="Not Set";
				} else {
					$matchScore=$matchScore+10;
					$matchArray->email="Match: ".$row['email'];
				}
			}	else {
				if(trim($row['email'])==""){
					$matchArray->email="Not Set";
				} else if($matchArray->current_organization=='Y'){
					$matchArray->email="No Match: ".$row['email'];
				} else {
					$matchArray->email="No Match";
				}
			}
			if(str_replace(" ","",$row['phone'])==str_replace(" ","",$this->phone)){
				if($row['phone']==""){
					$matchArray->phone="Not Set";
				} else {
					$matchScore=$matchScore+5;
					$matchArray->phone="Match: ".$row['phone'];
				}
			}else {
				if(trim($row['phone'])==""){
					$matchArray->phone="Not Set";
				} else if($matchArray->current_organization=='Y'){
					$matchArray->phone="No Match: ".$row['phone'];
				} else {
					$matchArray->phone="No Match";
				}
			}
			if($matchScore>=10){
				array_push($matchedPeople,$matchArray);
			}
		}
		return $matchedPeople;
	}

	public function requestAccess($id,$organization_id,$notes){
		global $site_address;
		$matchedPeople=$this->duplicateCheck($id,$organization_id);
		if($matchedPeople){
			if(count($matchedPeople)!=1){
				return false;
			} else {


				$shareRequest = new ClientShareRequest($this->connection);
				$shareRequest->organization_id=$organization_id;
				$shareRequest->requesting_organization_id=$_SESSION["organization_id"];
				$shareRequest->client_id=$id;
				$shareRequest->notes=$notes;
				$shareRequest->create();

				$matchedClient=new Client($this->connection);
				$matchedClient->forceRead($id);

				$user_organization = new UserOrganization($this->connection);
				$stmt=$user_organization->readAllClientShareApprovers($organization_id);

				$messageSubject=get_string("client_share_subject",array("%CLIENT_NAME%"=>$matchedClient->name));
				$messageString=get_string("client_share_body",array("%SOURCE_ORGANISATION%"=>$_SESSION["organization_name"],"%CLIENT_NAME%"=>$matchedClient->name,"%LINK%"=>$site_address."/ui/index.html?root=requests"));
				while ($row = $stmt->fetch(PDO::FETCH_ASSOC)){
					sendHtmlMail($row['email'],$messageSubject,$messageString);
				}

				return true;

			}

		} else {
			return false;
		}
	}

}
