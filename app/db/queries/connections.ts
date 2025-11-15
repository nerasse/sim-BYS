import { getDb } from "../client";
import { connections } from "../schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

export async function getAllConnections() {
  const db = await getDb();
  return db.select().from(connections).orderBy(connections.detectionOrder);
}

export async function getActiveConnections() {
  const db = await getDb();
  return db
    .select()
    .from(connections)
    .where(eq(connections.isActive, true))
    .orderBy(connections.detectionOrder);
}

export async function getConnectionById(id: string) {
  const db = await getDb();
  const result = await db.select().from(connections).where(eq(connections.id, id));
  return result[0];
}

export async function createConnection(data: {
  name: string;
  displayName: string;
  description?: string;
  pattern: number[][];
  baseMultiplier: number;
  isActive?: boolean;
}) {
  const db = await getDb();
  const allConnections = await getAllConnections();
  const maxOrder = Math.max(0, ...allConnections.map(c => c.detectionOrder));
  
  const [connection] = await db
    .insert(connections)
    .values({
      id: nanoid(),
      name: data.name,
      displayName: data.displayName,
      description: data.description || null,
      pattern: data.pattern,
      baseMultiplier: data.baseMultiplier,
      isActive: data.isActive ?? true,
      detectionOrder: maxOrder + 1,
    })
    .returning();
  return connection;
}

export async function updateConnection(
  id: string,
  data: {
    name?: string;
    displayName?: string;
    description?: string;
    pattern?: number[][];
    baseMultiplier?: number;
    isActive?: boolean;
  }
) {
  const db = await getDb();
  const updateData: any = {};
  if (data.name) updateData.name = data.name;
  if (data.displayName) updateData.displayName = data.displayName;
  if (data.description !== undefined) updateData.description = data.description || null;
  if (data.pattern) updateData.pattern = data.pattern;
  if (data.baseMultiplier !== undefined) updateData.baseMultiplier = data.baseMultiplier;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;
  
  const [connection] = await db
    .update(connections)
    .set(updateData)
    .where(eq(connections.id, id))
    .returning();
  return connection;
}

export async function reorderConnections(reorderedIds: string[]) {
  const db = await getDb();
  
  // Mettre à jour l'ordre de détection pour chaque connexion
  for (let i = 0; i < reorderedIds.length; i++) {
    await db
      .update(connections)
      .set({ detectionOrder: i + 1 })
      .where(eq(connections.id, reorderedIds[i]));
  }
}

export async function normalizeConnectionOrders() {
  const db = await getDb();
  const allConnections = await db.select().from(connections).orderBy(connections.detectionOrder);
  
  // Réorganiser les ordres pour qu'ils soient séquentiels (1, 2, 3, ...)
  for (let i = 0; i < allConnections.length; i++) {
    const expectedOrder = i + 1;
    if (allConnections[i].detectionOrder !== expectedOrder) {
      await db
        .update(connections)
        .set({ detectionOrder: expectedOrder })
        .where(eq(connections.id, allConnections[i].id));
    }
  }
  
  return allConnections.length;
}

export async function deleteConnection(id: string) {
  const db = await getDb();
  
  // D'abord supprimer toutes les configurations de combo qui référencent cette connexion
  const { deletePresetComboConfigsByComboId } = await import('./preset-combo-configs');
  await deletePresetComboConfigsByComboId(id);
  
  // Ensuite supprimer la connexion
  await db.delete(connections).where(eq(connections.id, id));
  
  // Normaliser les ordres après suppression
  await normalizeConnectionOrders();
}

