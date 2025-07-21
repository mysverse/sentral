-- CreateTable
CREATE TABLE "Leaderboard" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "eventName" TEXT NOT NULL,
    "playerName" TEXT NOT NULL,
    "lapTime" DOUBLE PRECISION NOT NULL,
    "position" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Leaderboard_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Leaderboard_eventId_lapTime_idx" ON "Leaderboard"("eventId", "lapTime");

-- CreateIndex
CREATE UNIQUE INDEX "Leaderboard_eventId_playerName_key" ON "Leaderboard"("eventId", "playerName");
