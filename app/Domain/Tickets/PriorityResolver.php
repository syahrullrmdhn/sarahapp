<?php

namespace App\Domain\Tickets;

use App\Models\Node;

final class PriorityResolver
{
    public function fromNodeOrSeverity(?Node $node, ?string $severity): string
    {
        if ($node instanceof Node) {
            return match (max(1, min(5, $node->criticality_level))) {
                1 => TicketPriority::P5,
                2 => TicketPriority::P4,
                3 => TicketPriority::P3,
                4 => TicketPriority::P2,
                5 => TicketPriority::P1,
            };
        }

        $normalized = strtolower((string) $severity);

        return match (true) {
            str_contains($normalized, 'critical'), str_contains($normalized, 'disaster'), str_contains($normalized, 'down') => TicketPriority::P1,
            str_contains($normalized, 'high'), str_contains($normalized, 'major') => TicketPriority::P2,
            str_contains($normalized, 'medium'), str_contains($normalized, 'warning') => TicketPriority::P3,
            str_contains($normalized, 'low'), str_contains($normalized, 'minor') => TicketPriority::P4,
            default => TicketPriority::P3,
        };
    }
}
