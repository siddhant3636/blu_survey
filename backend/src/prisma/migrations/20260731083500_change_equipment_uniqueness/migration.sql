-- DropIndex
DROP INDEX IF EXISTS "Equipment_name_key";

-- CreateIndex
CREATE UNIQUE INDEX "Equipment_name_description_key" ON "Equipment"("name", "description");
