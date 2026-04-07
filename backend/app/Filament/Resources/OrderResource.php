<?php

namespace App\Filament\Resources;

use App\Enums\OrderStatus;
use App\Filament\Resources\OrderResource\Pages;
use App\Models\Order;
use App\Services\OrderService;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Notifications\Notification;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class OrderResource extends Resource
{
    protected static ?string $model = Order::class;
    protected static ?string $navigationIcon = 'heroicon-o-shopping-bag';
    protected static ?string $navigationLabel = 'Bestellungen';
    protected static ?string $modelLabel = 'Bestellung';
    protected static ?string $pluralModelLabel = 'Bestellungen';
    protected static ?int $navigationSort = 2;

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('Bestellinformationen')->schema([
                Forms\Components\TextInput::make('id')->label('Bestell-Nr.')->disabled(),
                Forms\Components\TextInput::make('user.name')->label('Kunde')->disabled(),
                Forms\Components\Select::make('status')
                    ->label('Status')
                    ->options(collect(OrderStatus::cases())->mapWithKeys(fn ($s) => [$s->value => $s->label()]))
                    ->required(),
                Forms\Components\TextInput::make('total_price')->label('Gesamtpreis')->disabled()->prefix('€'),
                Forms\Components\TextInput::make('skonto_discount')->label('Skonto-Rabatt')->disabled()->prefix('€'),
                Forms\Components\TextInput::make('final_price')->label('Endpreis')->disabled()->prefix('€'),
                Forms\Components\Textarea::make('notes')->label('Anmerkungen')->disabled()->columnSpanFull(),
            ])->columns(2),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('id')->label('#')->sortable(),
                Tables\Columns\TextColumn::make('user.name')->label('Kunde')->searchable()->sortable(),
                Tables\Columns\TextColumn::make('status')
                    ->label('Status')
                    ->badge()
                    ->formatStateUsing(fn (OrderStatus $state) => $state->label())
                    ->color(fn (OrderStatus $state) => $state->color()),
                Tables\Columns\TextColumn::make('total_price')->label('Gesamt')->money('EUR')->sortable(),
                Tables\Columns\TextColumn::make('skonto_discount')->label('Skonto')->money('EUR'),
                Tables\Columns\TextColumn::make('final_price')->label('Endpreis')->money('EUR')->sortable()->weight('bold'),
                Tables\Columns\TextColumn::make('items_count')->label('Positionen')->counts('items'),
                Tables\Columns\TextColumn::make('created_at')->label('Datum')->dateTime('d.m.Y H:i')->sortable(),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->label('Status')
                    ->options(collect(OrderStatus::cases())->mapWithKeys(fn ($s) => [$s->value => $s->label()])),
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),
                Tables\Actions\Action::make('changeStatus')
                    ->label('Status ändern')
                    ->icon('heroicon-o-arrow-path')
                    ->form([
                        Forms\Components\Select::make('status')
                            ->label('Neuer Status')
                            ->options(collect(OrderStatus::cases())->mapWithKeys(fn ($s) => [$s->value => $s->label()]))
                            ->required(),
                    ])
                    ->action(function (Order $record, array $data) {
                        try {
                            $service = app(OrderService::class);
                            $service->updateStatus($record, OrderStatus::from($data['status']));
                            Notification::make()->title('Status aktualisiert')->success()->send();
                        } catch (\Exception $e) {
                            Notification::make()->title('Fehler')->body($e->getMessage())->danger()->send();
                        }
                    }),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListOrders::route('/'),
            'view' => Pages\ViewOrder::route('/{record}'),
        ];
    }
}
