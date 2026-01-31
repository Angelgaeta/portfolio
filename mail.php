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
        respond(400, "Peux-tu détailler un peu ton message ?");

    $subject = "📩 [Contact] Nouveau message";
    $body =
        "Nouveau message (contact ajax)\n" .
        "------------------------------\n" .
        "Nom : " . ($name !== '' ? $name : "Non précisé") . "\n" .
        "Email : {$email}\n\n" .
        "Message :\n{$message}\n";

    $ok = send_mail($recipient, $subject, $body, $fromName, $fromEmail, $email);
    if (!$ok)
        respond(500, "Oups… l’envoi a échoué. Tu peux me contacter directement par email.");

    respond(200, "Merci 🙂 Message envoyé ! Je reviens vers vous sous 24/48h.");
}

/* ============================
   2) FORM ROUTING via form_type
   ============================ */
$formType = clean_text((string) ($_POST['form_type'] ?? ''), 40);
if ($formType === '') {
    respond(400, "Formulaire invalide.");
}

switch ($formType) {

    case 'quick_quote': {
        $requestType = clean_text((string) ($_POST['request_type'] ?? 'freelance'), 20);
        $requestType = in_array($requestType, ['freelance', 'cdi'], true) ? $requestType : 'freelance';

        // Champs communs possibles
        $name = clean_text((string) ($_POST['name'] ?? ''), 80);

        if ($requestType === 'cdi') {
            // CDI fields
            $email = clean_text((string) ($_POST['email_cdi'] ?? $_POST['email'] ?? ''), 254);
            $role = clean_text((string) ($_POST['cdi_role'] ?? ''), 180);
            $location = clean_text((string) ($_POST['cdi_location'] ?? ''), 60);
            $start = clean_text((string) ($_POST['cdi_start'] ?? ''), 60);
            $offer = clean_text((string) ($_POST['cdi_offer_link'] ?? ''), 800);
            $message = clean_message((string) ($_POST['cdi_message'] ?? ''), 6000);

            if (!valid_email($email))
                respond(400, "Merci d’indiquer un email valide.");
            if (mb_strlen(trim($role)) < 2)
                respond(400, "Merci d’indiquer le poste visé.");
            if (mb_strlen(trim($message)) < 10)
                respond(400, "Peux-tu ajouter un peu de contexte (stack/process/timing) ?");

            $subject = "💼 [Opportunité CDI] {$role}";
            $body =
                "Nouvelle opportunité CDI (site)\n" .
                "-------------------------------\n" .
                "Nom : " . ($name !== '' ? $name : "Non précisé") . "\n" .
                "Email : {$email}\n" .
                "Poste : {$role}\n" .
                "Mode : " . ($location !== '' ? $location : "Non précisé") . "\n" .
                "Disponibilité : " . ($start !== '' ? $start : "Non précisée") . "\n" .
                "Offre : " . ($offer !== '' ? $offer : "Aucun") . "\n\n" .
                "Message :\n{$message}\n";

            $ok = send_mail($recipient, $subject, $body, $fromName, $fromEmail, $email);
            if (!$ok)
                respond(500, "Oups… l’envoi a échoué. Tu peux me contacter directement par email.");

            respond(200, "Merci 🙂 Message CDI envoyé ! Je reviens vers vous sous 24/48h.");
        }

        // FREELANCE (devis)
        $email = clean_text((string) ($_POST['email'] ?? ''), 254);
        $projectType = clean_text((string) ($_POST['project_type'] ?? ''), 120);
        $budget = clean_text((string) ($_POST['budget'] ?? ''), 60);
        $deadline = clean_text((string) ($_POST['deadline'] ?? ''), 60);

        $hosting = clean_text((string) ($_POST['hosting_domain'] ?? ''), 40);
        $assets = clean_text((string) ($_POST['assets'] ?? ''), 40);
        $links = clean_text((string) ($_POST['links'] ?? ''), 800);

        $priority = clean_text((string) ($_POST['priority'] ?? ''), 120);

        $message = clean_message((string) ($_POST['message'] ?? ''), 6000);

        if (!valid_email($email))
            respond(400, "Merci d’indiquer un email valide.");
        if ($projectType === '')
            respond(400, "Merci de choisir un type de projet.");
        if (mb_strlen(trim($message)) < 10)
            respond(400, "Peux-tu ajouter quelques détails (au moins 1–2 phrases) ?");

        $subject = "📩 [Devis] {$projectType}";
        $body =
            "Nouvelle demande de devis (site)\n" .
            "--------------------------------\n" .
            "Nom : " . ($name !== '' ? $name : "Non précisé") . "\n" .
            "Email : {$email}\n" .
            "Type : {$projectType}\n" .
            "Budget : " . ($budget !== '' ? $budget : "Non précisé") . "\n" .
            "Échéance : " . ($deadline !== '' ? $deadline : "Non précisée") . "\n" .
            "Priorité : " . ($priority !== '' ? $priority : "Non précisée") . "\n" .
            "Domaine/Hébergement : " . ($hosting !== '' ? $hosting : "Non précisé") . "\n" .
            "Contenus : " . ($assets !== '' ? $assets : "Non précisé") . "\n" .
            "Liens : " . ($links !== '' ? $links : "Aucun") . "\n\n" .
            "Message :\n{$message}\n";

        $ok = send_mail($recipient, $subject, $body, $fromName, $fromEmail, $email);
        if (!$ok)
            respond(500, "Oups… l’envoi a échoué. Tu peux me contacter directement par email.");

        respond(200, "Merci 🙂 Demande envoyée ! Je reviens vers vous sous 24/48h.");
    }

    case 'contact': {
        // si jamais tu l'utilises un jour avec form_type=contact
        $name = clean_text((string) ($_POST['name'] ?? ''), 80);
        $email = clean_text((string) ($_POST['email'] ?? ''), 254);
        $subject = clean_text((string) ($_POST['subject'] ?? ''), 120);
        $message = clean_message((string) ($_POST['message'] ?? ''), 6000);

        if (!valid_email($email))
            respond(400, "Merci d’indiquer un email valide.");
        if (mb_strlen(trim($message)) < 10)
            respond(400, "Peux-tu détailler un peu ton message ?");

        $finalSubject = "📩 [Contact] " . ($subject !== '' ? $subject : "Nouveau message");
        $body =
            "Nouveau message (contact)\n" .
            "-------------------------\n" .
            "Nom : " . ($name !== '' ? $name : "Non précisé") . "\n" .
            "Email : {$email}\n" .
            "Sujet : " . ($subject !== '' ? $subject : "Non précisé") . "\n\n" .
            "Message :\n{$message}\n";

        $ok = send_mail($recipient, $finalSubject, $body, $fromName, $fromEmail, $email);
        if (!$ok)
            respond(500, "Oups… l’envoi a échoué. Tu peux me contacter directement par email.");

        respond(200, "Merci 🙂 Message envoyé ! Je reviens vers vous sous 24/48h.");
    }

    default:
        respond(400, "Formulaire invalide.");
}
