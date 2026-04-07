<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ProductResource\Pages;
use App\Models\Product;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Support\Str;

class ProductResource extends Resource
{
    protected static ?string $model = Product::class;
    protected static ?string $navigationIcon = 'heroicon-o-eye';
    protected static ?string $navigationLabel = 'Produkte';
    protected static ?string $modelLabel = 'Produkt';
    protected static ?string $pluralModelLabel = 'Produkte';
    protected static ?int $navigationSort = 1;

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('Produktdaten')->schema([
                Forms\Components\TextInput::make('name')
                    ->required()
                    ->maxLength(255)
                    ->live(onBlur: true)
                    ->afterStateUpdated(fn (string $state, Forms\Set $set) => $set('slug', Str::slug($state))),
                Forms\Components\TextInput::make('slug')
                    ->required()
                    ->unique(ignoreRecord: true)
                    ->maxLength(255),
                Forms\Components\TextInput::make('sku')
                    ->label('SKU')
                    ->unique(ignoreRecord: true)
                    ->maxLength(50),
                Forms\Components\TextInput::make('price')
                    ->label('Preis (€)')
                    ->required()
                    ->numeric()
                    ->prefix('€')
                    ->step(0.01),
                Forms\Components\TextInput::make('stock_quantity')
                    ->label('Lagerbestand')
                    ->required()
                    ->numeric()
                    ->default(0),
                Forms\Components\Toggle::make('is_active')
                    ->label('Aktiv')
                    ->default(true),
            ])->columns(2),

            Forms\Components\Section::make('Details')->schema([
                Forms\Components\Textarea::make('description')
                    ->label('Beschreibung')
                    ->rows(4)
                    ->columnSpanFull(),
                Forms\Components\TextInput::make('image_url')
                    ->label('Bild-URL')
                    ->url()
                    ->columnSpanFull(),
                Forms\Components\Select::make('categories')
                    ->label('Kategorien')
                    ->relationship('categories', 'name')
                    ->multiple()
                    ->preload()
                    ->createOptionForm([
                        Forms\Components\TextInput::make('name')->required(),
                        Forms\Components\TextInput::make('slug')->required(),
                    ]),
            ]),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('sku')->label('SKU')->searchable()->sortable(),
                Tables\Columns\TextColumn::make('name')->label('Name')->searchable()->sortable(),
                Tables\Columns\TextColumn::make('price')->label('Preis')->money('EUR')->sortable(),
                Tables\Columns\TextColumn::make('stock_quantity')->label('Bestand')->sortable()
                    ->color(fn (int $state) => $state < 20 ? 'danger' : ($state < 100 ? 'warning' : 'success')),
                Tables\Columns\IconColumn::make('is_active')->label('Aktiv')->boolean(),
                Tables\Columns\TextColumn::make('categories.name')->label('Kategorien')->badge(),
                Tables\Columns\TextColumn::make('created_at')->label('Erstellt')->dateTime('d.m.Y')->sortable()->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                Tables\Filters\TernaryFilter::make('is_active')->label('Aktiv'),
                Tables\Filters\SelectFilter::make('categories')
                    ->relationship('categories', 'name')
                    ->label('Kategorie')
                    ->multiple()
                    ->preload(),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListProducts::route('/'),
            'create' => Pages\CreateProduct::route('/create'),
            'edit' => Pages\EditProduct::route('/{record}/edit'),
        ];
    }
}
