<?php
require_once __DIR__.'/Audit.php';
require_once __DIR__.'/User.php';
require_once __DIR__.'/Organization.php';
require_once __DIR__.'/../lib/common.php';
class UserOrganization{

	private $connection;

	// table columns
	public $id;
	public $user_id;
	public $organization_id;
	public $admin;
	public $user_approver;
	public $need_approver;
	public $manage_offers;
	public $manage_clients;
	public $client_share_approver;
	public $confirmed='N';
	private $confirmation_string;
	public $creation_date;
	public $created_by;
	public $update_date;
	public $updated_by;

	public function __construct($connection){
		$this->connection = $connection;
	}

	public function create(){
		global $site_address;
		$sql = "INSERT INTO user_organizations ( user_id,organization_id,admin,user_approver,need_approver,manage_offers,manage_clients,client_share_approver,confirmed,confirmation_string,created_by,updated_by) values (:user_id,:organization_id,:admin,:user_approver,:need_approver,:manage_offers,:manage_clients,:client_share_approver,:confirmed,:confirmation_string,:user_id2,:user_id2)";
		$stmt= $this->connection->prepare($sql);
		$this->confirmation_string=generate_string(60);
		if(!isset($this->organization_id)){
			$this->organization_id=$_SESSION['organization_id'];
		}
		$uid=-1;
		if(isset($_SESSION['id'])){
			$uid=$_SESSION['id'];
		}

		if( $stmt->execute(['user_id'=>$this->user_id,'organization_id'=>$this->organization_id,'admin'=>$this->admin,'user_approver'=>$this->user_approver,'need_approver'=>$this->need_approver,'manage_offers'=>$this->manage_offers,'manage_clients'=>$this->manage_clients,'client_share_approver'=>$this->client_share_approver,'confirmed'=>$this->confirmed,'confirmation_string'=>$this->confirmation_string,'user_id2'=>$uid])){
			$this->id=$this->connection->lastInsertId();
			Audit::add($this->connection,"create","user_organization",$this->id);

			if($this->confirmed=='N'){
				$user= new User($this->connection);
				$user->forceRead($this->user_id);

				$messageString=get_string("new_org_user_confirmation",array("%NAME%"=>$user->display_name,"%EMAIL%"=>$user->email,"%LINK%"=>$site_address."/rest/confirm_user_organization.php?id=".$this->id."&key=".$this->confirmation_string));
				$stmt=$this->readAllUserApprovers($this->organization_id);
				while ($row = $stmt->fetch(PDO::FETCH_ASSOC)){
					sendHtmlMail($row['email'],get_string("new_org_user_subject"),$messageString);
				}
			}

			return $this->id;
		} else {
			return -1;
		}

	}
	public function readAll(){
		if(is_admin()&&$_SESSION["view_all"]){
			$query = "SELECT uo.id,uo.user_id,uo.organization_id,uo.admin,uo.user_approver,uo.need_approver,uo.manage_offers,uo.manage_clients,uo.client_share_approver,uo.confirmed,uo.creation_date,uo.created_by,uo.update_date,uo.updated_by, org.name as organization_name from user_organizations uo, organizations org where uo.organization_id=org.id ORDER BY uo.id";
			$stmt = $this->connection->prepare($query);
			$stmt->execute();
		} else if(is_org_admin()){
		   	$organization_id=$_SESSION["organization_id"];
			$query = "SELECT id,user_id,organization_id,admin,user_approver,need_approver,manage_offers,manage_clients,client_share_approver,confirmed,creation_date,created_by,update_date,updated_by from user_organizations where organization_id=:organization_id ORDER BY id";
			$stmt = $this->connection->prepare($query);
			$stmt->execute(['organization_id'=>$organization_id]);
		} else {
			$user_id=$_SESSION["id"];
			$query = "SELECT id,user_id,organization_id,admin,user_approver,need_approver,manage_offers,manage_clients,client_share_approver,confirmed,creation_date,created_by,update_date,updated_by from user_organizations where user_id=:user_id ORDER BY id";
			$stmt = $this->connection->prepare($query);
			$stmt->execute(['user_id'=>$user_id]);
		}
		return $stmt;
	}

	public function readAllOrganization($organization_id){
		$query = "SELECT uo.id,uo.user_id,u.email,u.display_name,u.phone,uo.organization_id,uo.admin,uo.user_approver,uo.need_approver,uo.manage_offers,uo.manage_clients,uo.client_share_approver,uo.confirmed,uo.creation_date,uo.created_by,uo.update_date,uo.updated_by from user_organizations uo, users u where uo.user_id=u.id and organization_id=:organization_id ORDER BY uo.id";
		$stmt = $this->connection->prepare($query);
		$stmt->execute(['organization_id'=>$organization_id]);
		return $stmt;
	}

	public function readAllUser($user_id){
		$query = "SELECT uo.id,uo.user_id,uo.organization_id,uo.admin,uo.user_approver,uo.need_approver,uo.manage_offers,uo.manage_clients,uo.client_share_approver,uo.confirmed,uo.creation_date,uo.created_by,uo.update_date,uo.updated_by, org.name as organization_name from user_organizations uo, organizations org where org.id=uo.organization_id and user_id=:id ORDER BY org.name";
		$stmt = $this->connection->prepare($query);
		$stmt->execute(['id'=>$user_id]);
		return $stmt;
	}

	public function readAllUserApprovers($organization_id){
		$query = "SELECT u.id,u.email, u.display_name as user_name from user_organizations o, users u where o.user_id=u.id and o.organization_id=:id and o.user_approver='Y' and o.confirmed='Y'";
		$stmt = $this->connection->prepare($query);
		$stmt->execute(['id'=>$organization_id]);
		return $stmt;
	}

	public function readAllNeedApprovers($organization_id){
		$query = "SELECT u.id,u.email, u.display_name as user_name from user_organizations o, users u where o.user_id=u.id and o.organization_id=:id and o.need_approver='Y' and o.confirmed='Y'";
		$stmt = $this->connection->prepare($query);
		$stmt->execute(['id'=>$organization_id]);
		return $stmt;
	}

	public function readAllClientShareApprovers($organization_id){
		$query = "SELECT u.id,u.email, u.display_name as user_name,org.name as organization_name from user_organizations o, users u, organizations org where o.user_id=u.id and o.organization_id=:id and o.client_share_approver='Y' and o.confirmed='Y' and org.id=:id";
		$stmt = $this->connection->prepare($query);
		$stmt->execute(['id'=>$organization_id]);
		return $stmt;
	}
	public function read(){
		$stmt=$this->readOne($this->id);
		$row = $stmt->fetch(PDO::FETCH_ASSOC);
		if($row){
		$this->user_id=$row['user_id'];
		$this->organization_id=$row['organization_id'];
		$this->admin=$row['admin'];
		$this->user_approver=$row['user_approver'];
		$this->need_approver=$row['need_approver'];
		$this->manage_offers=$row['manage_offers'];
		$this->manage_clients=$row['manage_clients'];
		$this->client_share_approver=$row['client_share_approver'];
		$this->confirmed=$row['confirmed'];
		$this->confirmation_string=$row['confirmation_string'];
		$this->creation_date=$row['creation_date'];
		$this->created_by=$row['created_by'];
		$this->update_date=$row['update_date'];
		$this->updated_by=$row['updated_by'];
		} else {
			$this->id=null;
		}
   }

	public function readOne($id){
		if(is_admin()){
			$query = "SELECT id,user_id,organization_id,admin,user_approver,need_approver,manage_offers,manage_clients,client_share_approver,confirmed,confirmation_string,creation_date,created_by,update_date,updated_by from user_organizations where id=:id";
			$stmt = $this->connection->prepare($query);
			$stmt->execute(['id'=>$id]);
		} else if(is_org_admin()){
		   	$organization_id=$_SESSION["organization_id"];
			$query = "SELECT id,user_id,organization_id,admin,user_approver,need_approver,manage_offers,manage_clients,client_share_approver,confirmed,confirmation_string,creation_date,created_by,update_date,updated_by from user_organizations where organization_id=:organization_id and id=:id";
			$stmt = $this->connection->prepare($query);
			$stmt->execute(['organization_id'=>$organization_id,'id'=>$id]);
		} else {
			$user_id=$_SESSION["id"];
			$query = "SELECT id,user_id,organization_id,admin,user_approver,need_approver,manage_offers,manage_clients,client_share_approver,confirmed,confirmation_string,creation_date,created_by,update_date,updated_by from user_organizations where user_id=:user_id and id=:id";
			$stmt = $this->connection->prepare($query);
			$stmt->execute(['user_id'=>$user_id,'id'=>$id]);
		}
			return $stmt;
	}

	public function update(){

		$stmt=$this->readOne($this->id);
		if($stmt->rowCount()==1){
			$row = $stmt->fetch(PDO::FETCH_ASSOC);
			$orig_confirmed=$row['confirmed'];
			$organization_id=$row['organization_id'];
			if(!is_org_admin()|| $organization_id!=$_SESSION['organization_id']||!isset($this->confirmed)){
				$this->confirmed = $orig_confirmed;
			}

			$sql = "UPDATE user_organizations SET admin=:admin, user_approver=:user_approver, need_approver=:need_approver, manage_offers=:manage_offers, manage_clients=:manage_clients, client_share_approver=:client_share_approver,confirmed=:confirmed,updated_by=:updated_by WHERE id=:id";
			$stmt= $this->connection->prepare($sql);
			if( $stmt->execute(['id'=>$this->id
			,'admin'=>$this->admin
			,'user_approver'=>$this->user_approver
			,'need_approver'=>$this->need_approver
			,'manage_offers'=>$this->manage_offers
			,'manage_clients'=>$this->manage_clients
			,'client_share_approver'=>$this->client_share_approver
			,'confirmed'=>$this->confirmed
			,'updated_by'=>$_SESSION['id']
			])){
				return Audit::add($this->connection,"update","user_organization",$this->id);
			}
		} 
		return false;
	}

	public function delete(){

		$stmt=$this->readOne($this->id);
		if($stmt->rowCount()==1){
			$sql = "DELETE FROM user_organizations WHERE id=:id";
			$stmt= $this->connection->prepare($sql);
			if( $stmt->execute(['id'=>$this->id])){
				return Audit::add($this->connection,"delete","user_organization",$this->id);
			}
		} 
		return false;
	}

	public function confirmUserOrganization($id,$confirmation_string){
		global $site_address;
		$this->id=$id;
		$this->read();

		if($confirmation_string==$this->confirmation_string){
			$sql = "UPDATE user_organizations SET confirmed='Y',updated_by=:updated_by WHERE id=:id";
			$stmt= $this->connection->prepare($sql);
			if( $stmt->execute(['id'=>$id,'updated_by'=>$_SESSION['id']])) {

				$user= new User($this->connection);
				$user->forceRead($this->user_id);
				$organization= new Organization($this->connection);
				$organization->id=$this->organization_id;
				$organization->read();
				$messageBody=get_string("new_org_confirmed_body",array("%NAME%"=>$user->display_name,"%ORGANIZATION_NAME%"=>$organization->name,"%LINK%"=>$site_address));
				$messageSubject=get_string("new_org_confirmed_subject",array("%NAME%"=>$user->display_name,"%ORGANIZATION_NAME%"=>$organization->name,"%LINK%"=>$site_address));
				sendHtmlMail($user->email,$messageSubject,$messageBody);
				return true;
			}
		}
		return false;

	}

}
