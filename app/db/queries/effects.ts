import { getDb } from "../client";
import { effects } from "../schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

export async function getAllEffects() {
  const db = await getDb();
  return db.select().from(effects);
}

export async function getEffectById(id: string) {
  const db = await getDb();
  const result = await db.select().from(effects).where(eq(effects.id, id));
  return result[0];
}

export async function getEffectByName(name: string) {
  const db = await getDb();
  const result = await db.select().from(effects).where(eq(effects.name, name));
  return result[0];
}

export async function getEffectsByCategory(category: "passive" | "active" | "trigger") {
  const db = await getDb();
  return db.select().from(effects).where(eq(effects.category, category));
}

export async function createEffect(data: {
  name: string;
  displayName: string;
  description: string;
  type: string;
  category: "passive" | "active" | "trigger";
  target?: string;
  unit?: string;
  icon?: string;
  config?: any;
}) {
  const db = await getDb();
  const [effect] = await db
    .insert(effects)
    .values({
      id: nanoid(),
      name: data.name,
      displayName: data.displayName,
      description: data.description,
      type: data.type,
      category: data.category,
      target: data.target || null,
      unit: data.unit || null,
      icon: data.icon || null,
      config: data.config || null,
    })
    .returning();
  return effect;
}

export async function updateEffect(
  id: string,
  data: {
    name?: string;
    displayName?: string;
    description?: string;
    type?: string;
    category?: "passive" | "active" | "trigger";
    target?: string;
    unit?: string;
    icon?: string;
    config?: any;
  }
) {
  const db = await getDb();
  const updateData: any = {};
  if (data.name) updateData.name = data.name;
  if (data.displayName) updateData.displayName = data.displayName;
  if (data.description) updateData.description = data.description;
  if (data.type) updateData.type = data.type;
  if (data.category) updateData.category = data.category;
  if (data.target !== undefined) updateData.target = data.target || null;
  if (data.unit !== undefined) updateData.unit = data.unit || null;
  if (data.icon !== undefined) updateData.icon = data.icon || null;
  if (data.config !== undefined) updateData.config = data.config || null;
  
  const [effect] = await db
    .update(effects)
    .set(updateData)
    .where(eq(effects.id, id))
    .returning();
  return effect;
}

export async function deleteEffect(id: string) {
  const db = await getDb();
  await db.delete(effects).where(eq(effects.id, id));
}

