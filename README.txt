En el api.txt hay que cambiar las peticiones para mostrarse en local y en producción. 


*para mostrar en local 

// 🌐 Construir URL real hacia Golf Genius
$url = "https://www.golfgenius.com/api_v2/$token/events/$event_id/rounds/$round_id/tournaments/$tournament_id";

// 🔄 Petición con cURL
$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // 👈 Solo en entorno local
$response = curl_exec($ch);


*para mostrar en producción

 //URL PROD.
// cURL para llamada segura
// $ch = curl_init($url);
// curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
// $response = curl_exec($ch);
