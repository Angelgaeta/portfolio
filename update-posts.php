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

$defaultToken = 'CHANGE_ME_STRONG_TOKEN';
$secretFile = __DIR__ . '/update-posts.secret.php';
$secretToken = $defaultToken;

if (is_file($secretFile)) {
    $secret = require $secretFile;
    if (is_array($secret) && isset($secret['token']) && is_string($secret['token']) && trim($secret['token']) !== '') {
        $secretToken = trim($secret['token']);
    }
}

if ($secretToken === $defaultToken) {
    respond(503, ['ok' => false, 'error' => 'token_not_configured']);
}

$authHeader = (string) ($_SERVER['HTTP_AUTHORIZATION'] ?? '');
$headerToken = (string) ($_SERVER['HTTP_X_WEBHOOK_TOKEN'] ?? '');
$queryToken = (string) ($_GET['token'] ?? '');
$providedToken = '';

if ($headerToken !== '') {
    $providedToken = $headerToken;
} elseif (preg_match('/^\s*Bearer\s+(.+)\s*$/i', $authHeader, $m)) {
    $providedToken = (string) $m[1];
} elseif ($queryToken !== '') {
    $providedToken = $queryToken;
}

if (!hash_equals($secretToken, trim($providedToken))) {
    respond(401, ['ok' => false, 'error' => 'unauthorized']);
}

$raw = file_get_contents('php://input');
if ($raw === false || trim($raw) === '') {
    respond(400, ['ok' => false, 'error' => 'empty_payload']);
}

$decoded = json_decode($raw, true);
if (!is_array($decoded)) {
    respond(400, ['ok' => false, 'error' => 'invalid_json']);
}

$mode = isset($decoded['mode']) && $decoded['mode'] === 'replace' ? 'replace' : 'append';
$incomingPosts = [];

if (isset($decoded['posts']) && is_array($decoded['posts'])) {
    $incomingPosts = $decoded['posts'];
} elseif (isset($decoded['title']) || isset($decoded['url'])) {
    $incomingPosts = [$decoded];
}

if (count($incomingPosts) === 0) {
    respond(400, ['ok' => false, 'error' => 'no_posts']);
}

function norm_text($value, int $max): string
{
    $s = trim((string) $value);
    $s = str_replace(["\r", "\n"], ' ', $s);
    if (mb_strlen($s) > $max) {
        $s = mb_substr($s, 0, $max);
    }
    return $s;
}

function norm_int($value): int
{
    if (is_numeric($value)) {
        return max(0, (int) $value);
    }
    return 0;
}

function norm_tags($value): array
{
    if (!is_array($value)) {
        return [];
    }
    $out = [];
    foreach ($value as $tag) {
        $clean = norm_text((string) $tag, 24);
        if ($clean !== '') {
            $out[] = $clean;
        }
        if (count($out) >= 6) {
            break;
        }
    }
    return $out;
}

function normalize_post(array $post): ?array
{
    $title = norm_text($post['title'] ?? '', 140);
    $url = trim((string) ($post['url'] ?? ''));
    $excerpt = norm_text($post['excerpt'] ?? '', 400);
    $date = norm_text($post['date'] ?? '', 20);
    $category = norm_text($post['category'] ?? 'General', 40);

    if ($title === '' || $url === '') {
        return null;
    }

    if (!filter_var($url, FILTER_VALIDATE_URL)) {
        return null;
    }

    $host = strtolower((string) parse_url($url, PHP_URL_HOST));
    if ($host === '' || (strpos($host, 'linkedin.com') === false)) {
        return null;
    }

    if ($date === '' || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
        $date = gmdate('Y-m-d');
    }
    if ($category === '') {
        $category = 'General';
    }

    $id = norm_text($post['id'] ?? '', 120);
    if ($id === '') {
        $id = 'li-' . substr(sha1($url . '|' . $date), 0, 16);
    }

    return [
        'id' => $id,
        'title' => $title,
        'excerpt' => $excerpt,
        'url' => $url,
        'date' => $date,
        'category' => $category,
        'likes' => norm_int($post['likes'] ?? 0),
        'comments' => norm_int($post['comments'] ?? 0),
        'shares' => norm_int($post['shares'] ?? 0),
        'views' => norm_int($post['views'] ?? 0),
        'readTimeMin' => max(1, norm_int($post['readTimeMin'] ?? 3)),
        'tags' => norm_tags($post['tags'] ?? []),
    ];
}

$normalizedIncoming = [];
foreach ($incomingPosts as $p) {
    if (!is_array($p)) {
        continue;
    }
    $normalized = normalize_post($p);
    if ($normalized !== null) {
        $normalizedIncoming[] = $normalized;
    }
}

if (count($normalizedIncoming) === 0) {
    respond(400, ['ok' => false, 'error' => 'no_valid_posts']);
}

$dataDir = __DIR__ . '/data';
$postsFile = $dataDir . '/posts.json';

if (!is_dir($dataDir) && !mkdir($dataDir, 0755, true) && !is_dir($dataDir)) {
    respond(500, ['ok' => false, 'error' => 'storage_error']);
}

$current = [];
if (is_file($postsFile)) {
    $content = file_get_contents($postsFile);
    $parsed = $content !== false ? json_decode($content, true) : null;
    if (is_array($parsed)) {
        foreach ($parsed as $item) {
            if (is_array($item)) {
                $normalized = normalize_post($item);
                if ($normalized !== null) {
                    $current[] = $normalized;
                }
            }
        }
    }
}

$merged = $mode === 'replace' ? [] : $current;
$indexByKey = [];
foreach ($merged as $idx => $post) {
    $indexByKey[$post['id']] = $idx;
    $indexByKey[$post['url']] = $idx;
}

foreach ($normalizedIncoming as $post) {
    $keyId = $post['id'];
    $keyUrl = $post['url'];
    if (isset($indexByKey[$keyId])) {
        $merged[$indexByKey[$keyId]] = $post;
        continue;
    }
    if (isset($indexByKey[$keyUrl])) {
        $merged[$indexByKey[$keyUrl]] = $post;
        continue;
    }
    $merged[] = $post;
    $newIndex = count($merged) - 1;
    $indexByKey[$keyId] = $newIndex;
    $indexByKey[$keyUrl] = $newIndex;
}

usort($merged, static function (array $a, array $b): int {
    return strcmp($b['date'], $a['date']);
});

$merged = array_slice($merged, 0, 50);

$tmpFile = $postsFile . '.tmp';
$json = json_encode($merged, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
if ($json === false) {
    respond(500, ['ok' => false, 'error' => 'encode_error']);
}

if (file_put_contents($tmpFile, $json . PHP_EOL, LOCK_EX) === false) {
    respond(500, ['ok' => false, 'error' => 'write_error']);
}

if (!rename($tmpFile, $postsFile)) {
    @unlink($tmpFile);
    respond(500, ['ok' => false, 'error' => 'write_error']);
}

respond(200, [
    'ok' => true,
    'mode' => $mode,
    'received' => count($normalizedIncoming),
    'stored' => count($merged),
]);
