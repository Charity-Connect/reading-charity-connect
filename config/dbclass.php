<?php
$force_login=true;
$site_address="http://localhost";
$ui_root="/ui/web/";

class DBClass {

    private $host = 'localhost';
    private $username = 'root';
    private $password = '';
    private $database = 'connect_reading';



    public $connection;

    // get the database connection
    public function getConnection(){

        $this->connection = null;

        try{
            $this->connection = new PDO("mysql:host=" . $this->host . ";dbname=" . $this->database, $this->username, $this->password);
            $this->connection->exec("set names utf8;SET time_zone = 'Europe/London'");
			$this->connection->setAttribute( PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION );
        }catch(PDOException $exception){
            echo "Error: " . $exception->getMessage();
        }

        return $this->connection;
    }
}
?>