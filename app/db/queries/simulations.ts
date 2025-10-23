import { getDb } from "../client";
import { simulationRuns, simulationSteps } from "../schema";
import { eq, desc } from "drizzle-orm";
import type { NewSimulationRun, NewSimulationStep } from "../schema";

export async function createSimulationRun(data: NewSimulationRun) {
  const db = await getDb();
  return db.insert(simulationRuns).values(data).returning();
}

export async function getSimulationRunById(id: string) {
  const db = await getDb();
  const result = await db
    .select()
    .from(simulationRuns)
    .where(eq(simulationRuns.id, id));
  return result[0];
}

export async function getAllSimulationRuns() {
  const db = await getDb();
  return db.select().from(simulationRuns).orderBy(desc(simulationRuns.createdAt));
}

export async function updateSimulationRun(
  id: string,
  updates: Partial<NewSimulationRun>
) {
  const db = await getDb();
  return db
    .update(simulationRuns)
    .set(updates)
    .where(eq(simulationRuns.id, id));
}

export async function createSimulationStep(data: NewSimulationStep) {
  const db = await getDb();
  return db.insert(simulationSteps).values(data).returning();
}

export async function getSimulationSteps(runId: string) {
  const db = await getDb();
  return db
    .select()
    .from(simulationSteps)
    .where(eq(simulationSteps.runId, runId))
    .orderBy(simulationSteps.stepIndex);
}

