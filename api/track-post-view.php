<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

function respond(int $status, array $payload): void
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

function client_ip(): string
{
    $ip = (string) ($_SERVER['REMOTE_ADDR'] ?? '');
    return filter_var($ip, FILTER_VALIDATE_IP) ? $ip : '0.0.0.0';
}

function rate_limit_ok(string $scope, string $ip, int $minSpacingSeconds, int $windowSeconds, int $maxAttempts): bool
{
    $dir = rtrim(sys_get_temp_dir(), DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . 'portfolio_rate_limit';
    if (!is_dir($dir) && !@mkdir($dir, 0700, true) && !is_dir($dir)) {
        return true;
    }

    $file = $dir . DIRECTORY_SEPARATOR . hash('sha256', $scope . '|' . $ip) . '.json';
    $now = time();
    $payload = ['hits' => [], 'last' => 0];

    if (is_file($file)) {
        $raw = (string) @file_get_contents($file);
        $decoded = json_decode($raw, true);
        if (is_array($decoded)) {
            $payload = array_merge($payload, $decoded);
        }
    }

    $hits = array_values(array_filter(
        array_map('intval', (array) ($payload['hits'] ?? [])),
        static fn(int $t): bool => ($now - $t) <= $windowSeconds
    ));
    $last = (int) ($payload['last'] ?? 0);

    if ($last > 0 && ($now - $last) < $minSpacingSeconds) {
        return false;
    }
    if (count($hits) >= $maxAttempts) {
        return false;
    }

    $hits[] = $now;
    $payload['hits'] = $hits;
    $payload['last'] = $now;
    @file_put_contents($file, json_encode($payload), LOCK_EX);
    return true;
}

function valid_post_id(string $id): bool
{
    if ($id === '' || mb_strlen($id) > 120) {
        return false;
    }
    return (bool) preg_match('/^[a-zA-Z0-9._:-]{1,120}$/', $id);
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    respond(405, ['ok' => false, 'error' => 'method_not_allowed']);
}

$payload = [];

if (!rate_limit_ok('track_post_view', client_ip(), 2, 60, 40)) {
    respond(429, ['ok' => false, 'error' => 'rate_limited']);
}

$raw = file_get_contents('php://input');
$contentType = strtolower((string) ($_SERVER['CONTENT_TYPE'] ?? ''));

if (str_contains($contentType, 'application/json')) {
    if (!is_string($raw) || trim($raw) === '') {
        respond(400, ['ok' => false, 'error' => 'empty_payload']);
    }
    $decoded = json_decode($raw, true);
    if (!is_array($decoded)) {
        respond(400, ['ok' => false, 'error' => 'invalid_json']);
    }
    $payload = $decoded;
} elseif (!empty($_POST)) {
    $payload = $_POST;
}

$postId = trim((string) ($payload['id'] ?? ''));
if (!valid_post_id($postId)) {
    respond(400, ['ok' => false, 'error' => 'invalid_id']);
}

$postsFile = dirname(__DIR__) . '/data/posts.json';
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
