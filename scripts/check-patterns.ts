#!/usr/bin/env node

/**
 * Script de diagnostic pour vérifier les patterns dans la base
 */

import { getDb, schema } from "../app/db/client";

async function checkPatterns() {
  console.log("🔍 Diagnostic des patterns dans la base...");
  
  try {
    const db = await getDb();
    const allConnections = await db.select({
      id: schema.connections.id,
      name: schema.connections.name,
      displayName: schema.connections.displayName,
      pattern: schema.connections.pattern,
    }).from(schema.connections);
    
    console.log(`📊 ${allConnections.length} connexions trouvées\n`);
    
    allConnections.forEach((connection, index) => {
      console.log(`\n${index + 1}. ${connection.name} (${connection.id})`);
      console.log(`   Nom: ${connection.displayName}`);
      console.log(`   Pattern type: ${Array.isArray(connection.pattern) ? 'Array' : 'Other'}`);
      
      if (Array.isArray(connection.pattern)) {
        console.log(`   Pattern length: ${connection.pattern.length}`);
        console.log(`   Pattern content: ${JSON.stringify(connection.pattern, null, 2)}`);
        
        // Vérifier si c'est du format Position[]
        if (connection.pattern.length > 0) {
          const firstElement = connection.pattern[0];
          console.log(`   Premier élément type: ${typeof firstElement}`);
          console.log(`   Premier élément: ${JSON.stringify(firstElement)}`);
          
          if (Array.isArray(firstElement)) {
            console.log(`   ✅ Format: Position[] (nouveau)`);
          } else if (typeof firstElement === 'number' && connection.pattern[1] !== undefined) {
            console.log(`   ✅ Format: Position[] (nouveau)`);
          } else {
            console.log(`   ❌ Format: Inconnu`);
          }
        }
      } else {
        console.log(`   ❌ Pattern vide ou invalide`);
      }
    });
    
  } catch (error) {
    console.error("❌ Erreur lors du diagnostic:", error);
  }
}

checkPatterns();
