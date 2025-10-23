import { getDb } from "../client";
import { playerProgress } from "../schema";
import { eq } from "drizzle-orm";

export async function getPlayerProgress(playerId: string = "default_player") {
  const db = await getDb();
  const result = await db
    .select()
    .from(playerProgress)
    .where(eq(playerProgress.id, playerId));
  return result[0];
}

export async function updatePlayerProgress(
  playerId: string = "default_player",
  updates: Partial<{
    maxAscensionUnlocked: number;
    totalRunsCompleted: number;
    totalRunsAttempted: number;
  }>
) {
  const db = await getDb();
  return db
    .update(playerProgress)
    .set(updates)
    .where(eq(playerProgress.id, playerId));
}

export async function unlockNextAscension(playerId: string = "default_player") {
  const progress = await getPlayerProgress(playerId);
  if (!progress) return null;

  return updatePlayerProgress(playerId, {
    maxAscensionUnlocked: progress.maxAscensionUnlocked + 1,
  });
}

