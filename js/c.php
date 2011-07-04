<?php
$a = $_GET['e'];
$type = $_GET['t'];
if($type == 's'){
  $ch = curl_init("http://bandcamp.com".$a);
}else{ 
  
  $module = $_GET['m'];
  if($module == 'url'){
    $ch = curl_init("http://api.bandcamp.com/api/url/1/info?key=drepradstrendirheinbryni&url=".urlencode($a));
  }
  if($module == 'album'){
     $ch = curl_init("http://api.bandcamp.com/api/album/2/info?key=drepradstrendirheinbryni&album_id=".$a);
  }
}
$html = curl_exec($ch);

?>