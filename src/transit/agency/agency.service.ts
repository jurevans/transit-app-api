import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getManager } from 'typeorm';
import { Agency } from 'src/models/entities/agency.entity';

@Injectable()
export class AgencyService {
  constructor(
    @InjectRepository(Agency)
    private agencyRepository: Repository<Agency>,
  ) {}

  findOne(props: { feedIndex: number }) {
    const { feedIndex } = props;
    return this.agencyRepository.findOneOrFail({ feedIndex });
  }

  async findLocation(params: { feedIndex: number }) {
    const { feedIndex } = params;
    const manager = getManager();
    const locationResults = await manager.query(`
      WITH centroid AS (
        SELECT ST_Centroid(geom) center
        FROM (SELECT ST_Multi(ST_Union(the_geom))::geometry(MultiPoint, 4326) AS geom
            FROM stops s
            WHERE s.feed_index = ${feedIndex}
          ) AS geom
      )
      SELECT ST_X(center) longitude, ST_Y(center) latitude from centroid;
    `);

    if (locationResults.length > 0) {
      const { longitude, latitude } = locationResults[0];
      return {
        longitude,
        latitude,
      };
    }
  }
}
