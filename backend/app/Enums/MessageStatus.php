<?php

namespace App\Enums;

enum MessageStatus: string
{
    case OPEN = 'open';
    case CLOSED = 'closed';

    public function label(): string
    {
        return match ($this) {
            self::OPEN => 'Offen',
            self::CLOSED => 'Geschlossen',
        };
    }
}
