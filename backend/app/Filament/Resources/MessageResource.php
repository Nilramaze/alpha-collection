<?php

namespace App\Filament\Resources;

use App\Enums\MessageStatus;
use App\Filament\Resources\MessageResource\Pages;
use App\Models\Message;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class MessageResource extends Resource
{
    protected static ?string $model = Message::class;
    protected static ?string $navigationIcon = 'heroicon-o-chat-bubble-left-right';
    protected static ?string $navigationLabel = 'Nachrichten';
    protected static ?string $modelLabel = 'Nachricht';
    protected static ?int $navigationSort = 6;

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('Nachricht')->schema([
                Forms\Components\TextInput::make('user.name')->label('Von')->disabled(),
                Forms\Components\TextInput::make('subject')->label('Betreff')->disabled(),
                Forms\Components\Textarea::make('content')->label('Inhalt')->disabled()->rows(4)->columnSpanFull(),
                Forms\Components\Select::make('status')
                    ->label('Status')
                    ->options(collect(MessageStatus::cases())->mapWithKeys(fn ($s) => [$s->value => $s->label()]))
                    ->required(),
                Forms\Components\Textarea::make('admin_reply')
                    ->label('Antwort')
                    ->rows(4)
                    ->columnSpanFull()
                    ->placeholder('Antwort an den Kunden verfassen...'),
            ])->columns(2),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('id')->label('#')->sortable(),
                Tables\Columns\TextColumn::make('user.name')->label('Von')->searchable(),
                Tables\Columns\TextColumn::make('subject')->label('Betreff')->searchable()->limit(40),
                Tables\Columns\TextColumn::make('status')
                    ->label('Status')
                    ->badge()
                    ->formatStateUsing(fn (MessageStatus $state) => $state->label())
                    ->color(fn (MessageStatus $state) => $state === MessageStatus::OPEN ? 'warning' : 'success'),
                Tables\Columns\IconColumn::make('admin_reply')
                    ->label('Beantwortet')
                    ->boolean()
                    ->getStateUsing(fn ($record) => filled($record->admin_reply)),
                Tables\Columns\TextColumn::make('created_at')->label('Datum')->dateTime('d.m.Y H:i')->sortable(),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options(collect(MessageStatus::cases())->mapWithKeys(fn ($s) => [$s->value => $s->label()])),
            ])
            ->actions([Tables\Actions\EditAction::make()->label('Antworten')]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListMessages::route('/'),
            'edit' => Pages\EditMessage::route('/{record}/edit'),
        ];
    }
}
