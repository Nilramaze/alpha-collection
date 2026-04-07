<?php

namespace App\Filament\Resources;

use App\Filament\Resources\SkontoGroupResource\Pages;
use App\Models\SkontoGroup;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class SkontoGroupResource extends Resource
{
    protected static ?string $model = SkontoGroup::class;
    protected static ?string $navigationIcon = 'heroicon-o-receipt-percent';
    protected static ?string $navigationLabel = 'Skonto-Gruppen';
    protected static ?string $modelLabel = 'Skonto-Gruppe';
    protected static ?int $navigationSort = 5;

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('Gruppendetails')->schema([
                Forms\Components\TextInput::make('name')->label('Gruppenname')->required()->maxLength(255),
            ]),
            Forms\Components\Section::make('Rabattstaffeln')->schema([
                Forms\Components\Repeater::make('tiers')
                    ->label('Staffeln')
                    ->relationship()
                    ->schema([
                        Forms\Components\TextInput::make('min_order_value')
                            ->label('Ab Bestellwert (€)')
                            ->numeric()->required()->prefix('€')->step(0.01),
                        Forms\Components\TextInput::make('discount_percent')
                            ->label('Rabatt (%)')
                            ->numeric()->required()->suffix('%')->step(0.01)->minValue(0)->maxValue(100),
                    ])
                    ->columns(2)
                    ->defaultItems(1)
                    ->addActionLabel('Staffel hinzufügen')
                    ->reorderable(false),
            ]),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name')->label('Gruppenname')->searchable()->sortable(),
                Tables\Columns\TextColumn::make('tiers_count')->label('Staffeln')->counts('tiers'),
                Tables\Columns\TextColumn::make('users_count')->label('Benutzer')->counts('users'),
                Tables\Columns\TextColumn::make('tiers')
                    ->label('Rabatte')
                    ->formatStateUsing(fn ($record) => $record->tiers->map(fn ($t) => "ab {$t->min_order_value}€ → {$t->discount_percent}%")->join(', '))
                    ->wrap(),
            ])
            ->actions([Tables\Actions\EditAction::make()])
            ->bulkActions([Tables\Actions\BulkActionGroup::make([Tables\Actions\DeleteBulkAction::make()])]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListSkontoGroups::route('/'),
            'create' => Pages\CreateSkontoGroup::route('/create'),
            'edit' => Pages\EditSkontoGroup::route('/{record}/edit'),
        ];
    }
}
