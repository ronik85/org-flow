import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1769675060464 implements MigrationInterface {
    name = 'Init1769675060464'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sessions" ADD "tokenFingerprint" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "sessions" ADD CONSTRAINT "UQ_2c2e90682eecde9d55fd4c7b7f8" UNIQUE ("tokenFingerprint")`);
        await queryRunner.query(`CREATE INDEX "IDX_2c2e90682eecde9d55fd4c7b7f" ON "sessions" ("tokenFingerprint") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_2c2e90682eecde9d55fd4c7b7f"`);
        await queryRunner.query(`ALTER TABLE "sessions" DROP CONSTRAINT "UQ_2c2e90682eecde9d55fd4c7b7f8"`);
        await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN "tokenFingerprint"`);
    }

}
