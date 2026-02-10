<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

function respond(int $status, array $payload): void
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    respond(405, ['ok' => false, 'error' => 'method_not_allowed']);
}

$raw = file_get_contents('php://input');
$payload = [];
if (is_string($raw) && trim($raw) !== '') {
    $decoded = json_decode($raw, true);
    if (is_array($decoded)) {
        $payload = $decoded;
    }
}

$postId = trim((string) ($payload['id'] ?? $_POST['id'] ?? ''));
if ($postId === '' || mb_strlen($postId) > 120) {
    respond(400, ['ok' => false, 'error' => 'invalid_id']);
}

$postsFile = __DIR__ . '/data/posts.json';
if (!is_file($postsFile)) {
    respond(500, ['ok' => false, 'error' => 'posts_file_missing']);
}

$fp = fopen($postsFile, 'c+');
if ($fp === false) {
    respond(500, ['ok' => false, 'error' => 'storage_error']);
}

if (!flock($fp, LOCK_EX)) {
    fclose($fp);
    respond(500, ['ok' => false, 'error' => 'storage_lock_failed']);
}

rewind($fp);
$content = stream_get_contents($fp);
$posts = is_string($content) && trim($content) !== '' ? json_decode($content, true) : [];

if (!is_array($posts)) {
    flock($fp, LOCK_UN);
    fclose($fp);
    respond(500, ['ok' => false, 'error' => 'posts_invalid']);
}

$found = false;
$updatedViews = 0;
foreach ($posts as &$post) {
    if (!is_array($post)) {
        continue;
    }
    if ((string) ($post['id'] ?? '') !== $postId) {
        continue;
    }
    $currentViews = is_numeric($post['views'] ?? null) ? max(0, (int) $post['views']) : 0;
    $post['views'] = $currentViews + 1;
    $updatedViews = (int) $post['views'];
    $found = true;
    break;
}
unset($post);

if (!$found) {
    flock($fp, LOCK_UN);
    fclose($fp);
    respond(404, ['ok' => false, 'error' => 'post_not_found']);
}

$json = json_encode($posts, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
if ($json === false) {
    flock($fp, LOCK_UN);
    fclose($fp);
    respond(500, ['ok' => false, 'error' => 'encode_error']);
}

rewind($fp);
ftruncate($fp, 0);
$ok = fwrite($fp, $json . PHP_EOL) !== false;
fflush($fp);
flock($fp, LOCK_UN);
fclose($fp);

if (!$ok) {
    respond(500, ['ok' => false, 'error' => 'write_error']);
}

respond(200, ['ok' => true, 'id' => $postId, 'views' => $updatedViews]);
