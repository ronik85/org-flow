import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1767345604468 implements MigrationInterface {
    name = 'Init1767345604468'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_450a05c0c4de5b75ac8d34835b9"`);
        await queryRunner.query(`CREATE INDEX "IDX_f3d6aea8fcca58182b2e80ce97" ON "users" ("organizationId") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_f3d6aea8fcca58182b2e80ce97"`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_450a05c0c4de5b75ac8d34835b9" UNIQUE ("password")`);
    }

}
