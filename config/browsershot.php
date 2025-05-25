<?php

return [
    'node_binary' => env('BROWSERSHOT_NODE_BINARY', 'node'),
    'npm_binary' => env('BROWSERSHOT_NPM_BINARY', 'npm'),
    'chrome_path' => env('BROWSERSHOT_CHROME_PATH', null),
    'include_path' => env('BROWSERSHOT_INCLUDE_PATH', '$PATH:/usr/local/bin'),
];
