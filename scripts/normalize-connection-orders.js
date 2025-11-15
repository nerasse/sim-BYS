import Database from 'better-sqlite3';

async function normalizeConnectionOrders() {
  console.log('Normalisation des ordres de connexion...');
  
  const db = new Database('./data/game.db');
  
  // Récupérer toutes les connexions ordonnées par detectionOrder
  const connections = db.prepare('SELECT id, name, detection_order FROM connections ORDER BY detection_order').all();
  
  console.log('Ordres actuels:');
  connections.forEach(c => {
    console.log(`  ${c.name}: ${c.detection_order}`);
  });
  
  // Réorganiser les ordres pour qu'ils soient séquentiels (1, 2, 3, ...)
  const updateStmt = db.prepare('UPDATE connections SET detection_order = ? WHERE id = ?');
  
  for (let i = 0; i < connections.length; i++) {
    const expectedOrder = i + 1;
    if (connections[i].detection_order !== expectedOrder) {
      console.log(`Mise à jour de ${connections[i].name}: ${connections[i].detection_order} → ${expectedOrder}`);
      updateStmt.run(expectedOrder, connections[i].id);
    }
  }
  
  console.log('\nOrdres après normalisation:');
  const updatedConnections = db.prepare('SELECT id, name, detection_order FROM connections ORDER BY detection_order').all();
  updatedConnections.forEach(c => {
    console.log(`  ${c.name}: ${c.detection_order}`);
  });
  
  db.close();
  console.log('\nNormalisation terminée!');
  process.exit(0);
}

normalizeConnectionOrders().catch(console.error);
