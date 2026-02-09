<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

function respond(int $status, string $message): void
{
    http_response_code($status);
    echo json_encode(['status' => $status, 'message' => $message], JSON_UNESCAPED_UNICODE);
    exit;
}

function clean_text(string $s, int $maxLen = 4000): string
{
    $s = trim($s);
    $s = str_replace(["\r", "\n"], " ", $s);
    if (mb_strlen($s) > $maxLen)
        $s = mb_substr($s, 0, $maxLen);
    return $s;
}

function clean_message(string $s, int $maxLen = 8000): string
{
    $s = trim($s);
    $s = str_replace("\r", "", $s);
    if (mb_strlen($s) > $maxLen)
        $s = mb_substr($s, 0, $maxLen);
    return $s;
}

function valid_email(string $email): bool
{
    $email = trim($email);
    if (mb_strlen($email) > 254)
        return false;
    return (bool) filter_var($email, FILTER_VALIDATE_EMAIL);
}

function safe_host(string $host): string
{
    $host = trim($host);
    $host = preg_replace('/[^a-z0-9\.\-]/i', '', $host) ?? '';
    return $host !== '' ? $host : 'localhost';
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    respond(400, "Méthode non autorisée.");
}

/* Honeypot */
$honeypot = (string) ($_POST['website'] ?? '');
if (trim($honeypot) !== '') {
    respond(200, "Merci 🙂 Votre demande a bien été envoyée.");
}

/* CONFIG */
$recipient = "angeldevweb@gmail.com";
$host = safe_host($_SERVER['HTTP_HOST'] ?? 'localhost');
$fromEmail = "no-reply@{$host}";
$fromName = "Portfolio";

function send_mail(string $to, string $subject, string $body, string $fromName, string $fromEmail, string $replyTo): bool
{
    $headers = [];
    $headers[] = "MIME-Version: 1.0";
    $headers[] = "Content-Type: text/plain; charset=UTF-8";
    $headers[] = "From: {$fromName} <{$fromEmail}>";
    if ($replyTo !== '')
        $headers[] = "Reply-To: {$replyTo}";

    return @mail(
        $to,
        "=?UTF-8?B?" . base64_encode($subject) . "?=",
        $body,
        implode("\r\n", $headers)
    );
}

/* ============================
   1) LEGACY CONTACT AJAX (cf_*)
   ============================ */
if (isset($_POST['cf_email']) || isset($_POST['cf_message'])) {
    $name = clean_text((string) ($_POST['cf_name'] ?? ''), 80);
    $email = clean_text((string) ($_POST['cf_email'] ?? ''), 254);
    $message = clean_message((string) ($_POST['cf_message'] ?? ''), 6000);

    if (!valid_email($email))
        respond(400, "Merci d’indiquer un email valide.");
    if (mb_strlen(trim($message)) < 10)
        respond(400, "Pouvez-vous détailler un peu votre message ?");

    $subject = "📩 [Contact] Nouveau message";
    $body =
        "Nouveau message (contact ajax)\n" .
        "------------------------------\n" .
        "Nom : " . ($name !== '' ? $name : "Non précisé") . "\n" .
        "Email : {$email}\n\n" .
        "Message :\n{$message}\n";

    $ok = send_mail($recipient, $subject, $body, $fromName, $fromEmail, $email);
    if (!$ok)
        respond(500, "Oups… l’envoi a échoué. Vous pouvez me contacter directement par email.");

respond(200, "Merci 🙂 Message envoyé ! Je reviens vers vous sous 24/48h.");
}

respond(400, "Formulaire invalide.");
