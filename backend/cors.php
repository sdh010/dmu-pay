<?php
// backend/cors.php

// --- Universal CORS Header Settings ---
// Allow requests from the React app's origin.
header('Access-Control-Allow-Origin: http://localhost:3000'); 
// Allow requests to include credentials like cookies and session IDs.
header('Access-Control-Allow-Credentials: true'); 
// Specify allowed HTTP methods.
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
// Specify allowed request headers.
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
// Specify the content type of the response.
header('Content-Type: application/json; charset=UTF-8');

// Handle the preflight 'OPTIONS' request sent by browsers before POST requests.
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200); // Respond with 200 OK and exit immediately.
    exit;
}
// --- End of CORS Settings ---
?>
