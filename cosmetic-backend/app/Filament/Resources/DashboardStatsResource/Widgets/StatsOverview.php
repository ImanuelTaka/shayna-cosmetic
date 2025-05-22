<?php

namespace App\Filament\Resources\DashboardStatsResource\Widgets;

use App\Models\Brand;
use App\Models\Cosmetic;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class StatsOverview extends BaseWidget
{
    protected function getStats(): array
    {
        return [
            //
            Stat::make('Total Brands', Brand::count())
            ->description('Jumlah partnership')
            ->color('info'),
            Stat::make('Total Product', Cosmetic::count())
            ->description('Jumlah Product')
            ->color('info'),
        ];
    }
}