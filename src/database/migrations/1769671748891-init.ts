import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1769671748891 implements MigrationInterface {
    name = 'Init1769671748891'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sessions" ADD "isReuseDetected" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN "isReuseDetected"`);
    }

}
