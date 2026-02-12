<?php
declare(strict_types=1);

session_set_cookie_params([
    'lifetime' => 0,
    'path' => '/',
    'secure' => true,
    'httponly' => true,
    'samesite' => 'Strict',
]);
session_start();

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

function respond(int $status, string $message, array $extra = []): void
{
    http_response_code($status);
    echo json_encode(array_merge(['status' => $status, 'message' => $message], $extra), JSON_UNESCAPED_UNICODE);
    exit;
}

function generate_csrf_token(): string
{
    $token = bin2hex(random_bytes(32));
    $_SESSION['csrf_token'] = $token;
    $_SESSION['csrf_token_ts'] = time();
    return $token;
}

function current_csrf_token(): string
{
    $ttl = 3600;
    $token = (string) ($_SESSION['csrf_token'] ?? '');
    $ts = (int) ($_SESSION['csrf_token_ts'] ?? 0);
    if ($token === '' || $ts <= 0 || (time() - $ts) > $ttl) {
        return generate_csrf_token();
    }
    return $token;
}

function verify_csrf(string $token): bool
{
    $stored = (string) ($_SESSION['csrf_token'] ?? '');
    $ts = (int) ($_SESSION['csrf_token_ts'] ?? 0);
    if ($stored === '' || $token === '' || $ts <= 0 || (time() - $ts) > 3600) {
        return false;
    }
    return hash_equals($stored, $token);
}

function safe_host(string $host): string
{
    $host = trim($host);
    $host = preg_replace('/[^a-z0-9\.\-]/i', '', $host) ?? '';
    return $host !== '' ? $host : 'localhost';
}

function client_ip(): string
{
    $ip = (string) ($_SERVER['REMOTE_ADDR'] ?? '');
    return filter_var($ip, FILTER_VALIDATE_IP) ? $ip : '0.0.0.0';
}

function rate_limit_ok(string $ip): bool
{
    $dir = rtrim(sys_get_temp_dir(), DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . 'portfolio_contact_rate';
    if (!is_dir($dir) && !@mkdir($dir, 0700, true) && !is_dir($dir)) {
        return true;
    }

    $key = hash('sha256', $ip);
    $file = $dir . DIRECTORY_SEPARATOR . $key . '.json';
    $now = time();
    $windowSeconds = 600;
    $maxAttempts = 5;
    $minSpacingSeconds = 8;

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

function clean_single_line(string $value, int $maxLen): string
{
    $value = trim($value);
    $value = preg_replace('/[\x00-\x1F\x7F]+/u', ' ', $value) ?? '';
    $value = preg_replace('/\s+/u', ' ', $value) ?? '';
    if (mb_strlen($value) > $maxLen) {
        $value = mb_substr($value, 0, $maxLen);
    }
    return trim($value);
}

function clean_message(string $value, int $maxLen): string
{
    $value = trim($value);
    $value = str_replace("\r", '', $value);
    $value = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]+/u', '', $value) ?? '';
    if (mb_strlen($value) > $maxLen) {
        $value = mb_substr($value, 0, $maxLen);
    }
    return trim($value);
}

function valid_name(string $name): bool
{
    if ($name === '' || mb_strlen($name) < 2 || mb_strlen($name) > 80) {
        return false;
    }
    return (bool) preg_match('/^[\p{L}\p{M}\s\'\.\-]{2,80}$/u', $name);
}

function valid_email(string $email): bool
{
    if ($email === '' || mb_strlen($email) > 254) {
        return false;
    }
    if (preg_match('/[\r\n]/', $email)) {
        return false;
    }
    return (bool) filter_var($email, FILTER_VALIDATE_EMAIL);
}

function valid_message(string $message): bool
{
    $len = mb_strlen($message);
    return $len >= 10 && $len <= 2000;
}

function send_mail(string $to, string $subject, string $body, string $fromName, string $fromEmail, string $replyTo): bool
{
    $headers = [];
    $headers[] = 'MIME-Version: 1.0';
    $headers[] = 'Content-Type: text/plain; charset=UTF-8';
    $headers[] = "From: {$fromName} <{$fromEmail}>";
    if ($replyTo !== '') {
        $headers[] = "Reply-To: {$replyTo}";
    }

    return @mail(
        $to,
        '=?UTF-8?B?' . base64_encode($subject) . '?=',
        $body,
        implode("\r\n", $headers)
    );
}

$method = (string) ($_SERVER['REQUEST_METHOD'] ?? '');
if ($method === 'GET' && (string) ($_GET['action'] ?? '') === 'csrf') {
    respond(200, 'OK', ['csrf_token' => current_csrf_token()]);
}

if ($method !== 'POST') {
    respond(405, 'Méthode non autorisée.');
}

$honeypot = clean_single_line((string) ($_POST['website'] ?? ''), 255);
if ($honeypot !== '') {
    respond(200, 'Merci 🙂 Votre demande a bien été envoyée.');
}

if (!rate_limit_ok(client_ip())) {
    respond(429, 'Trop de tentatives. Merci de patienter quelques instants.');
}

$csrfToken = (string) ($_POST['csrf_token'] ?? '');
if (!verify_csrf($csrfToken)) {
    respond(403, 'Session expirée. Merci de recharger puis réessayer.');
}

$recipient = 'angeldevweb@gmail.com';
$host = safe_host((string) ($_SERVER['HTTP_HOST'] ?? 'localhost'));
$fromEmail = "no-reply@{$host}";
$fromName = 'Portfolio';

if (!isset($_POST['cf_email']) && !isset($_POST['cf_message'])) {
    respond(400, 'Formulaire invalide.');
}

$name = clean_single_line((string) ($_POST['cf_name'] ?? ''), 80);
$email = clean_single_line((string) ($_POST['cf_email'] ?? ''), 254);
$message = clean_message((string) ($_POST['cf_message'] ?? ''), 2000);

if (!valid_name($name)) {
    respond(400, 'Merci d’indiquer un nom valide (2 à 80 caractères).');
}
if (!valid_email($email)) {
    respond(400, 'Merci d’indiquer un email valide.');
}
if (!valid_message($message)) {
    respond(400, 'Le message doit contenir entre 10 et 2000 caractères.');
}

$subject = '📩 [Contact] Nouveau message';
$body =
    "Nouveau message (contact ajax)\n" .
    "------------------------------\n" .
    "Nom : {$name}\n" .
    "Email : {$email}\n" .
    'IP : ' . client_ip() . "\n\n" .
    "Message :\n{$message}\n";

$ok = send_mail($recipient, $subject, $body, $fromName, $fromEmail, $email);
if (!$ok) {
    respond(500, 'Oups… l’envoi a échoué. Vous pouvez me contacter directement par email.');
}

generate_csrf_token();
respond(200, 'Merci 🙂 Message envoyé ! Je reviens vers vous sous 24/48h.');
