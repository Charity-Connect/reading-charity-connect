<?php
include_once $_SERVER['DOCUMENT_ROOT'] .'/lib/common.php';

$connection=initWeb();
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Welcome</title>
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.css">
    <style type="text/css">
        body{ font: 14px sans-serif; text-align: center; }
    </style>
</head>
<body>
    <div class="page-header">
        <h1>Hi, <b><?php echo htmlspecialchars($_SESSION["display_name"]); ?></b>. Welcome to our site.</h1>
    </div>
    <p>
        <a href="/login/reset-password.php" class="btn btn-warning">Reset Your Password</a>
        <a href="/login/logout.php" class="btn btn-danger">Sign Out of Your Account</a>
    </p>
</body>
</html>