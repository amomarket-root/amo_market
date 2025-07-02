<?php

return (new PhpCsFixer\Config())
    ->setRiskyAllowed(true)
    ->setRules([
        '@PSR12' => true,
        'array_syntax' => ['syntax' => 'short'],
        'binary_operator_spaces' => ['default' => 'align_single_space_minimal'],
        'ordered_imports' => ['sort_algorithm' => 'alpha'],
        'no_unused_imports' => true,
        'single_quote' => true,
    ])
    ->setFinder(
        PhpCsFixer\Finder::create()
            ->in([
                __DIR__ . '/app',
                __DIR__ . '/routes',
                __DIR__ . '/tests',
                __DIR__ . '/database',
            ])
            ->exclude([
                'storage',
                'vendor',
                'node_modules',
                'public',
                'resources/js',
            ])
    );
