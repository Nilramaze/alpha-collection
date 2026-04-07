<?php
namespace App\Filament\Resources\SkontoGroupResource\Pages;
use App\Filament\Resources\SkontoGroupResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;
class EditSkontoGroup extends EditRecord
{
    protected static string $resource = SkontoGroupResource::class;
    protected function getHeaderActions(): array { return [Actions\DeleteAction::make()]; }
}
