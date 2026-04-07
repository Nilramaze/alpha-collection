<?php
namespace App\Filament\Resources\SkontoGroupResource\Pages;
use App\Filament\Resources\SkontoGroupResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;
class ListSkontoGroups extends ListRecords
{
    protected static string $resource = SkontoGroupResource::class;
    protected function getHeaderActions(): array { return [Actions\CreateAction::make()->label('Neue Gruppe')]; }
}
