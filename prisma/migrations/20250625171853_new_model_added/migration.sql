-- CreateTable
CREATE TABLE "limit" (
    "id" SERIAL NOT NULL,
    "soilMoistureUpperLimit" INTEGER NOT NULL,
    "soilMoistureLowerLimit" INTEGER NOT NULL,
    "waterLevelLimit" INTEGER NOT NULL,

    CONSTRAINT "limit_pkey" PRIMARY KEY ("id")
);
