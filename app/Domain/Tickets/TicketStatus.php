<?php

namespace App\Domain\Tickets;

final class TicketStatus
{
    public const NEW = 'new';

    public const ACKNOWLEDGED = 'acknowledged';

    public const ASSIGNED = 'assigned';

    public const IN_PROGRESS = 'in_progress';

    public const RESOLVED = 'resolved';

    public const CLOSED = 'closed';

    public const ESCALATED = 'escalated';

    public static function all(): array
    {
        return [
            self::NEW,
            self::ACKNOWLEDGED,
            self::ASSIGNED,
            self::IN_PROGRESS,
            self::RESOLVED,
            self::CLOSED,
            self::ESCALATED,
        ];
    }
}
