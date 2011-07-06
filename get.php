<?php
$type = $_GET['type'];
if($type == 'scrape'){
  $url = $_GET['url'];
  $ch = curl_init("http://bandcamp.com".$url);
}elseif( $type == 'api'){ 
  $module = $_GET['module'];
  if($module == 'url'){
    $ch = curl_init("http://api.bandcamp.com/api/url/1/info?key=drepradstrendirheinbryni&url=".urlencode($_GET['url']));
  }
  if($module == 'album'){
  $id = $_GET['id'];
  
     $ch = curl_init("http://api.bandcamp.com/api/album/2/info?key=drepradstrendirheinbryni&album_id=".$id);
  }
}else{
  $date= $_GET['sort_field'];
  $tag = $_GET['tag'];
  $page = $_GET['page'];
  $sort_asc = $_GET['sort_asc'];
  $ch = curl_init("http://bandcamp.com/tag/".$tag."?page=".$page."&amp;sort_asc=".$sort_asc."&amp;sort_field=".$date."");
};

//seems to work out faster if bandcamp things we are a browser
curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_5_8) AppleWebKit/534.30 (KHTML, like Gecko) Chrome/12.0.742.112 Safari/534.30');
$html = curl_exec($ch);
curl_close($ch);

?>