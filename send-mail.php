<?php
/**
 * send-mail.php
 * --------------------------------------------------------------
 * Handles AJAX submissions for BOTH forms on the Acumen Aircool
 * website:
 *   1. form_type=contact  -> full contact page form (contact.html)
 *   2. form_type=estimate -> homepage "Get an Estimate" mini form
 *      (the glass card inside the Final CTA section on index.html)
 *
 * Returns JSON: { success: bool, message: string, errors?: {field: msg} }
 * Never redirects — the front-end (assets/js/form-handler.js) does
 * all submission via fetch() and stays on the same page.
 * --------------------------------------------------------------
 */

header('Content-Type: application/json; charset=utf-8');

// ---------------------------------------------------------------
// CONFIG — edit these two values for your environment
// ---------------------------------------------------------------
$recipient_email = 'acumenaircool@gmail.com';
$site_name        = 'Acumen Aircool Pvt. Ltd.';
$from_address     = 'no-reply@acumenaircool.com'; // should match your domain to avoid spam filtering

// ---------------------------------------------------------------
// Only accept POST, only accept AJAX requests from this site
// ---------------------------------------------------------------
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Invalid request method.']);
    exit;
}

// ---------------------------------------------------------------
// Honeypot spam trap — a hidden field named "website" that real
// users never see or fill in. If it has a value, silently report
// success (so the bot thinks it worked) without sending any mail.
// ---------------------------------------------------------------
if (!empty($_POST['website'])) {
    echo json_encode(['success' => true, 'message' => 'Thank you!']);
    exit;
}

$form_type = isset($_POST['form_type']) ? trim($_POST['form_type']) : 'contact';

$errors = [];

function clean($value) {
    return htmlspecialchars(trim($value ?? ''), ENT_QUOTES, 'UTF-8');
}

function valid_email($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

function valid_phone($phone) {
    $digits = preg_replace('/\D/', '', $phone);
    return (bool) preg_match('/^[0-9+\-\s()]{7,20}$/', $phone) && strlen($digits) >= 7;
}

// ---------------------------------------------------------------
// FORM: estimate (homepage mini quote form)
// Expected fields: name, phone, service
// ---------------------------------------------------------------
if ($form_type === 'estimate') {

    $name    = clean($_POST['name'] ?? '');
    $phone   = clean($_POST['phone'] ?? '');
    $service = clean($_POST['service'] ?? '');

    if ($name === '' || mb_strlen($name) < 2) {
        $errors['name'] = 'Please enter your name.';
    }
    if ($phone === '' || !valid_phone($phone)) {
        $errors['phone'] = 'Please enter a valid phone number.';
    }
    if ($service === '') {
        $errors['service'] = 'Please select a service.';
    }

    if (!empty($errors)) {
        echo json_encode(['success' => false, 'errors' => $errors, 'message' => 'Please fix the errors below.']);
        exit;
    }

    $subject  = "New Estimate Request — {$service}";
    $body     = "New Quick Estimate Request\n\n";
    $body    .= "Name: {$name}\n";
    $body    .= "Phone: {$phone}\n";
    $body    .= "Service Required: {$service}\n";
    $body    .= "Submitted: " . date('Y-m-d H:i:s') . "\n";
    $reply_to = null; // this short form doesn't collect an email address

// ---------------------------------------------------------------
// FORM: contact (full contact page form)
// Expected fields: first_name, last_name, company, email, phone,
// project_location, service, budget, project_type, message, consent
// ---------------------------------------------------------------
} else {

    $first_name       = clean($_POST['first_name'] ?? '');
    $last_name        = clean($_POST['last_name'] ?? '');
    $company          = clean($_POST['company'] ?? '');
    $email            = clean($_POST['email'] ?? '');
    $phone            = clean($_POST['phone'] ?? '');
    $project_location = clean($_POST['project_location'] ?? '');
    $service          = clean($_POST['service'] ?? '');
    $budget           = clean($_POST['budget'] ?? '');
    $project_type     = clean($_POST['project_type'] ?? '');
    $message          = clean($_POST['message'] ?? '');
    $consent          = isset($_POST['consent']) && $_POST['consent'] === 'on';

    if ($first_name === '' || mb_strlen($first_name) < 2) {
        $errors['first_name'] = 'Please enter your first name.';
    }
    if ($last_name === '' || mb_strlen($last_name) < 2) {
        $errors['last_name'] = 'Please enter your last name.';
    }
    if ($email === '' || !valid_email($email)) {
        $errors['email'] = 'Please enter a valid email address.';
    }
    if ($phone === '' || !valid_phone($phone)) {
        $errors['phone'] = 'Please enter a valid phone number.';
    }
    if ($service === '') {
        $errors['service'] = 'Please select a service.';
    }
    if ($message === '' || mb_strlen($message) < 20) {
        $errors['message'] = 'Please enter at least 20 characters.';
    }
    if (!$consent) {
        $errors['consent'] = 'Please confirm you agree to be contacted.';
    }

    if (!empty($errors)) {
        echo json_encode(['success' => false, 'errors' => $errors, 'message' => 'Please fix the errors below.']);
        exit;
    }

    $subject  = "New Contact Form Submission — {$service}";
    $body     = "New Website Enquiry\n\n";
    $body    .= "Name: {$first_name} {$last_name}\n";
    $body    .= "Company: {$company}\n";
    $body    .= "Email: {$email}\n";
    $body    .= "Phone: {$phone}\n";
    $body    .= "Project Location: {$project_location}\n";
    $body    .= "Service Required: {$service}\n";
    $body    .= "Estimated Budget: {$budget}\n";
    $body    .= "Project Type: {$project_type}\n";
    $body    .= "Message:\n{$message}\n";
    $body    .= "\nSubmitted: " . date('Y-m-d H:i:s') . "\n";
    $reply_to = $email;
}

// ---------------------------------------------------------------
// SEND MAIL
// ---------------------------------------------------------------
$headers  = "From: {$site_name} <{$from_address}>\r\n";
if ($reply_to) {
    $headers .= "Reply-To: {$reply_to}\r\n";
}
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
$headers .= "X-Mailer: PHP/" . phpversion();

$sent = @mail($recipient_email, $subject, $body, $headers);

if ($sent) {
    echo json_encode([
        'success' => true,
        'message' => "Thank you! We've received your request and will be in touch shortly."
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Sorry, something went wrong sending your message. Please try again or call us directly.'
    ]);
}
