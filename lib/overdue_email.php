<?php

include_once $_SERVER['DOCUMENT_ROOT'] .'/lib/common.php';
include_once $_SERVER['DOCUMENT_ROOT'] .'/config/dbclass.php';
include_once $_SERVER['DOCUMENT_ROOT'] .'/entities/NeedRequest.php';
include_once $_SERVER['DOCUMENT_ROOT'] .'/entities/Organization.php';
include_once $_SERVER['DOCUMENT_ROOT'] .'/entities/UserOrganization.php';
global $site_address;
global $ui_root;

$connection=initBotWeb();

$organization = new Organization($connection);
$need_request = new NeedRequest($connection);
$user_organization = new UserOrganization($connection);

$orgStmt = $organization->readAll();
while ($orgRow = $orgStmt->fetch(PDO::FETCH_ASSOC)){
    $_SESSION['organization_id']=$orgRow['id'];
    $needStmt = $need_request->readFiltered("Y","N",TRUE);
    $count = $needStmt->rowCount();
    echo "<p>Organization:".$orgRow["name"];
    if($count > 0){
        $overdueTable="<table cellspacing=\"0\" cellpadding=\"5\" ><tr><td >Client</td><td>Need</td><td>Date Needed</td><td>Your Target Date</td><td>Days Overdue</td><td>View</td></tr>";
        

        while ($needRow = $needStmt->fetch(PDO::FETCH_ASSOC)){
            $overdueTable.= "<tr><td>"
            .$needRow['client_name']."</td><td>"
            . $needRow["type_name"]."</td><td>"
            .date( 'j M Y', strtotime($needRow["date_needed"]))."</td><td>"
            .date( 'j M Y', strtotime($needRow["target_date"]))."</td><td>"
            .round((time()-strtotime($needRow["target_date"]))/(60*60*24))."</td><td>"
            ."<a href=\"".$site_address.$ui_root."index.html?root=requests&id=".$needRow["id"]."\">View</a></td></tr>";
        }
        $overdueTable.="</table>";
        echo $overdueTable."</p>";
        $userStmt=$user_organization->readAllNeedApprovers($orgRow['id']);
        $overdueSubject=get_string("overdue_subject",array("%ORGANIZATION_NAME%"=>$orgRow["name"]));
        while ($userRow = $userStmt->fetch(PDO::FETCH_ASSOC)){
            $overdueBody=get_string("overdue_body",array("%ORGANIZATION_NAME%"=>$orgRow["name"],"%USER_NAME%"=>(is_null($userRow["user_name"])?$userRow["email"]:$userRow["user_name"]),"%ACTION_TABLE%"=>$overdueTable));
            if(isset($_GET["test"])&&$_GET["test"]=="Y"){
                echo "<p>sending mail to ".$userRow["email"]."</p>".$overdueBody;
            } else {
                sendHtmlMail($userRow["email"],$overdueSubject,$overdueBody);
                echo "<p>sending mail to ".$userRow["email"]."</p>";
            }
        }

    }
}
        

