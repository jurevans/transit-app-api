import {MigrationInterface, QueryRunner} from 'typeorm';

export class ShapesPrimaryKey1626462439746 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query('ALTER TABLE "gtfs"."shapes" ADD CONSTRAINT shapes_pkey PRIMARY KEY (shape_id, shape_pt_lon, shape_pt_lat, shape_pt_sequence)');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query('ALTER TABLE "gtfs"."shapes" DROP CONSTRAINT shapes_pkey');
    }

}
