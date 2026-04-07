<?php

namespace App\Enums;

enum OrderStatus: string
{
    case EINGEGANGEN = 'eingegangen';
    case BEARBEITET  = 'bearbeitet';
    case VERSENDET   = 'versendet';
    case BEZAHLT     = 'bezahlt';
    case GESCHLOSSEN = 'geschlossen';
    case STORNIERT   = 'storniert';

    public function label(): string
    {
        return match ($this) {
            self::EINGEGANGEN => 'Eingegangen',
            self::BEARBEITET  => 'Bearbeitet',
            self::VERSENDET   => 'Versendet',
            self::BEZAHLT     => 'Bezahlt',
            self::GESCHLOSSEN => 'Geschlossen',
            self::STORNIERT   => 'Storniert',
        };
    }

    public function color(): string
    {
        return match ($this) {
            self::EINGEGANGEN => 'warning',
            self::BEARBEITET  => 'info',
            self::VERSENDET   => 'success',
            self::BEZAHLT     => 'primary',
            self::GESCHLOSSEN => 'secondary',
            self::STORNIERT   => 'danger',
        };
    }

    /** Status-Übergänge, die per Admin-UI erlaubt sind */
    public function isManuallySettable(): bool
    {
        return match ($this) {
            self::STORNIERT => false,   // nur per Storno-Button
            default         => true,
        };
    }
}
