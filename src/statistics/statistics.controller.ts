import { Controller, Get, Param } from '@nestjs/common';
import { StatisticsService } from './statistics.service';

@Controller('statistics')
export class StatisticsController {
    constructor(private readonly statisticsService: StatisticsService) { }

    @Get('cscounts')
    async getsandcCounts() {
        return this.statisticsService.getsandcCounts();
    }
    @Get('counts')
    async getCounts() {
        return this.statisticsService.getCounts();
    }
    @Get('distributor-counts/:distributorId')
    async getDistributorCounts(@Param('distributorId') distributorId: number) {
        return await this.statisticsService.getDistributorStatistics(distributorId);
    }
}
