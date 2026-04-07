<?php
namespace App\Filament\Resources\OrderResource\Pages;
use App\Filament\Resources\OrderResource;
use Filament\Resources\Pages\ViewRecord;
use Filament\Infolists;
use Filament\Infolists\Infolist;
use App\Enums\OrderStatus;

class ViewOrder extends ViewRecord
{
    protected static string $resource = OrderResource::class;

    public function infolist(Infolist $infolist): Infolist
    {
        return $infolist->schema([
            Infolists\Components\Section::make('Bestelldetails')->schema([
                Infolists\Components\TextEntry::make('id')->label('Bestell-Nr.'),
                Infolists\Components\TextEntry::make('user.name')->label('Kunde'),
                Infolists\Components\TextEntry::make('user.email')->label('E-Mail'),
                Infolists\Components\TextEntry::make('status')
                    ->label('Status')
                    ->badge()
                    ->formatStateUsing(fn (OrderStatus $state) => $state->label())
                    ->color(fn (OrderStatus $state) => $state->color()),
                Infolists\Components\TextEntry::make('total_price')->label('Gesamtpreis')->money('EUR'),
                Infolists\Components\TextEntry::make('skonto_discount')->label('Skonto-Rabatt')->money('EUR'),
                Infolists\Components\TextEntry::make('final_price')->label('Endpreis')->money('EUR')->weight('bold'),
                Infolists\Components\TextEntry::make('notes')->label('Anmerkungen')->columnSpanFull(),
                Infolists\Components\TextEntry::make('created_at')->label('Bestellt am')->dateTime('d.m.Y H:i'),
            ])->columns(2),

            Infolists\Components\Section::make('Positionen')->schema([
                Infolists\Components\RepeatableEntry::make('items')->label('')->schema([
                    Infolists\Components\TextEntry::make('product.name')->label('Produkt'),
                    Infolists\Components\TextEntry::make('product.sku')->label('SKU'),
                    Infolists\Components\TextEntry::make('quantity')->label('Menge'),
                    Infolists\Components\TextEntry::make('price_snapshot')->label('Stückpreis')->money('EUR'),
                    Infolists\Components\TextEntry::make('subtotal')->label('Summe')->money('EUR'),
                ])->columns(5),
            ]),
        ]);
    }
}
