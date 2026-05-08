<?php

namespace App\Domain\Tickets;

final class TicketPriority
{
    public const P1 = 'P1';

    public const P2 = 'P2';

    public const P3 = 'P3';

    public const P4 = 'P4';

    public const P5 = 'P5';

    public static function all(): array
    {
        return [self::P1, self::P2, self::P3, self::P4, self::P5];
    }

    public static function responseMinutes(string $priority): int
    {
        return match ($priority) {
            self::P1 => 15,
            self::P2 => 30,
            self::P3 => 60,
            self::P4 => 240,
            self::P5 => 480,
            default => 60,
        };
    }

    public static function resolutionMinutes(string $priority): int
    {
        return match ($priority) {
            self::P1 => 120,
            self::P2 => 240,
            self::P3 => 480,
            self::P4 => 1440,
            self::P5 => 5760,
            default => 480,
        };
    }
}
