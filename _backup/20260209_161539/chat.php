<?php
// /www/chat.php
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
     http_response_code(405);
     echo json_encode(['error' => 'Method not allowed']);
     exit;
}

// Récupérer le message JSON
$input = json_decode(file_get_contents('php://input'), true);
$userMsg = trim($input['message'] ?? '');

if ($userMsg === '') {
     http_response_code(400);
     echo json_encode(['error' => 'Empty message']);
     exit;
}

// Charger la clé en dehors du webroot
require __DIR__ . '/../private/config.php';
$apiKey = defined('OPENAI_API_KEY') ? OPENAI_API_KEY : getenv('OPENAI_API_KEY');
if (!$apiKey) {
     http_response_code(500);
     echo json_encode(['error' => 'API key missing']);
     exit;
}

// Appel OpenAI (Chat Completions)
$payload = [
     'model' => 'gpt-4o-mini',           // tu peux changer de modèle au besoin
     'messages' => [
          ['role' => 'system', 'content' => "Tu es l'assistant sympathique du site d'Angélique. Réponds en français, brièvement, style chaleureux et pro."],
          ['role' => 'user', 'content' => $userMsg]
     ],
     'temperature' => 0.7,
     'max_tokens' => 300
];

$ch = curl_init('https://api.openai.com/v1/chat/completions');
curl_setopt_array($ch, [
     CURLOPT_POST => true,
     CURLOPT_HTTPHEADER => [
          'Content-Type: application/json',
          'Authorization: Bearer ' . $apiKey
     ],
     CURLOPT_POSTFIELDS => json_encode($payload),
     CURLOPT_RETURNTRANSFER => true,
     CURLOPT_TIMEOUT => 30
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$err = curl_error($ch);
curl_close($ch);

if ($err) {
     http_response_code(502);
     echo json_encode(['error' => 'Curl error: ' . $err]);
     exit;
}
if ($httpCode < 200 || $httpCode >= 300) {
     http_response_code($httpCode);
     echo $response;
     exit;
}

$data = json_decode($response, true);
$text = $data['choices'][0]['message']['content'] ?? 'Désolé, je n’ai pas compris.';

echo json_encode(['reply' => $text]);
