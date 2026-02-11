import { Controller, Get, Query } from "@nestjs/common";
import { LocationsService } from "./location.service";
import { LocationQueryDto } from "./dto/location.dto";

@Controller("locations")
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Get()
  async getLocations(@Query() query: LocationQueryDto) {
    console.log("Received location query:", query);
    const locations = await this.locationsService.getLocations(query);

    return {
      statusCode: 200,
      message: "Locations retrieved successfully",
      data: locations,
    };
  }
}
