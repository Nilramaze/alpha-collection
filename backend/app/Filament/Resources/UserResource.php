<?php

namespace App\Filament\Resources;

use App\Filament\Resources\UserResource\Pages;
use App\Models\User;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class UserResource extends Resource
{
    protected static ?string $model = User::class;
    protected static ?string $navigationIcon = 'heroicon-o-users';
    protected static ?string $navigationLabel = 'Benutzer';
    protected static ?string $modelLabel = 'Benutzer';
    protected static ?int $navigationSort = 4;

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('Benutzerdaten')->schema([
                Forms\Components\TextInput::make('name')->required()->maxLength(255),
                Forms\Components\TextInput::make('email')->email()->required()->unique(ignoreRecord: true),
                Forms\Components\Select::make('role')->label('Rolle')
                    ->options(['user' => 'Benutzer', 'admin' => 'Admin'])->required(),
                Forms\Components\Select::make('skonto_group_id')->label('Skonto-Gruppe')
                    ->relationship('skontoGroup', 'name')->nullable()->preload(),
                Forms\Components\TextInput::make('password')->label('Passwort')
                    ->password()->dehydrated(fn ($state) => filled($state))
                    ->required(fn (string $operation) => $operation === 'create'),
            ])->columns(2),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name')->label('Name')->searchable()->sortable(),
                Tables\Columns\TextColumn::make('email')->label('E-Mail')->searchable(),
                Tables\Columns\TextColumn::make('role')->label('Rolle')->badge()
                    ->color(fn (string $state) => $state === 'admin' ? 'danger' : 'info'),
                Tables\Columns\TextColumn::make('skontoGroup.name')->label('Skonto-Gruppe')->placeholder('Keine'),
                Tables\Columns\TextColumn::make('orders_count')->label('Bestellungen')->counts('orders'),
                Tables\Columns\TextColumn::make('created_at')->label('Registriert')->dateTime('d.m.Y')->sortable(),
            ])
            ->actions([Tables\Actions\EditAction::make()])
            ->bulkActions([Tables\Actions\BulkActionGroup::make([Tables\Actions\DeleteBulkAction::make()])]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListUsers::route('/'),
            'create' => Pages\CreateUser::route('/create'),
            'edit' => Pages\EditUser::route('/{record}/edit'),
        ];
    }
}
