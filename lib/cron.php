<?php
require_once 'common.php';
require_once '../config/dbclass.php';
require_once 'Cron/CronExpression.php';
date_default_timezone_set("Europe/London");

$connection=initBotWeb();

$timeZone = preg_replace('/([+-]\d{2})(\d{2})/',
'\'\1:\2\'', date('O'));

$connection->exec("SET time_zone=$timeZone;");

$get_jobs="select * from crontab";
$cron_jobs = $connection->query($get_jobs) or die(print_r($dbh->errorInfo()));
$now = new DateTime();
foreach($cron_jobs as $job){

	$cron=Cron\CronExpression::factory($job["cron"]);
	if ($job["last_run"]==null || $cron->getNextRunDate($job["last_run"])<$now ){
		echo "running ".$job["command"];
		include($job["command"]);
		$stmt = $connection->prepare("update crontab set last_run=now() where id=:id");
		$stmt->execute(['id'=>$job["id"]]);
	}
//echo $cron->getNextRunDate()->format('Y-m-d H:i:s').'\n';


//echo $cron->getPreviousRunDate()->format('Y-m-d H:i:s');
}

?>
