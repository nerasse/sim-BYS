import { eq } from "drizzle-orm";
import { getDb } from "~/db/client";
import { effectTargets } from "~/db/schema";
import { nanoid } from "nanoid";

export async function getAllEffectTargets() {
  const db = await getDb();
  return db.select().from(effectTargets).orderBy(effectTargets.name);
}

export async function getEffectTargetById(id: string) {
  const db = await getDb();
  const [target] = await db.select().from(effectTargets).where(eq(effectTargets.id, id));
  return target;
}

export async function getEffectTargetByName(name: string) {
  const db = await getDb();
  const [target] = await db.select().from(effectTargets).where(eq(effectTargets.name, name));
  return target;
}

export async function createEffectTarget(data: {
  name: string;
  displayName: string;
  description: string;
  icon?: string;
}) {
  const db = await getDb();
  const [target] = await db
    .insert(effectTargets)
    .values({
      id: nanoid(),
      name: data.name,
      displayName: data.displayName,
      description: data.description,
      icon: data.icon || null,
    })
    .returning();
  return target;
}

export async function updateEffectTarget(
  id: string,
  data: {
    name?: string;
    displayName?: string;
    description?: string;
    icon?: string;
  }
) {
  const db = await getDb();
  const [target] = await db
    .update(effectTargets)
    .set({
      ...data,
      icon: data.icon || null,
    })
    .where(eq(effectTargets.id, id))
    .returning();
  return target;
}

export async function deleteEffectTarget(id: string) {
  const db = await getDb();
  await db.delete(effectTargets).where(eq(effectTargets.id, id));
}

