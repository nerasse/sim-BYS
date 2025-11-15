#!/usr/bin/env node

/**
 * Script de migration pour convertir les patterns de connexions
 * du format legacy (matrice 2D) au nouveau format (liste de positions)
 * 
 * Exécution: npx tsx scripts/migrate-connection-patterns.ts
 */

import { getDb, schema } from "../app/db/client";
import { sql } from "drizzle-orm";

// Types pour la migration
type LegacyPattern = number[][]; // Format ancien: matrice 2D
type NewPattern = Array<[row: number, col: number]>; // Format nouveau: liste de positions

/**
 * Convertit un pattern legacy vers le nouveau format
 */
function convertLegacyPattern(legacyPattern: LegacyPattern, connectionId: string): NewPattern {
  const newPattern: NewPattern = [];
  
  // Convertir la matrice en liste de positions
  for (let row = 0; row < legacyPattern.length; row++) {
    for (let col = 0; col < legacyPattern[row].length; col++) {
      if (legacyPattern[row][col] === 1) {
        newPattern.push([row, col]);
      }
    }
  }
  
  return newPattern;
}

/**
 * Fonction principale de migration
 */
async function migrateConnectionPatterns() {
  console.log("🔄 Migration des patterns de connexions...");
  
  try {
    const db = await getDb();
    // Récupérer toutes les connexions
    const allConnections = await db.select({
      id: schema.connections.id,
      name: schema.connections.name,
      pattern: schema.connections.pattern,
    }).from(schema.connections);
    
    console.log(`📊 ${allConnections.length} connexions trouvées`);
    
    let migratedCount = 0;
    
    // Mettre à jour chaque connexion
    for (const connection of allConnections) {
      if (!connection.pattern) {
        console.log(`⚠️  La connexion ${connection.name} (${connection.id}) n'a pas de pattern, ignorée`);
        continue;
      }
      
      // Vérifier si c'est déjà au nouveau format
      if (Array.isArray(connection.pattern) && connection.pattern.length > 0 && 
          typeof connection.pattern[0] === 'object' && 
          !Array.isArray(connection.pattern[0][0])) {
        console.log(`✅ La connexion ${connection.name} (${connection.id}) est déjà au nouveau format`);
        continue;
      }
      
      // Convertir vers le nouveau format
      const legacyPattern = connection.pattern as unknown as LegacyPattern;
      const newPattern = convertLegacyPattern(legacyPattern, connection.id);
      
      // Mettre à jour en base
      await db.update(schema.connections)
        .set({ pattern: newPattern })
        .where(sql`${schema.connections.id} = ${connection.id}`);
      
      migratedCount++;
      console.log(`🔄 ${connection.name} (${connection.id}): matrice → ${newPattern.length} positions`);
    }
    
    console.log(`✅ Migration terminée avec succès! ${migratedCount} connexions migrées.`);
    
  } catch (error) {
    console.error("❌ Erreur lors de la migration:", error);
    process.exit(1);
  }
}

// Point d'entrée du script
async function main() {
  await migrateConnectionPatterns();
}

// Exécuter le script
main().catch(console.error);

export { migrateConnectionPatterns };
