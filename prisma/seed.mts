import Database from "better-sqlite3";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const db = new Database(join(__dirname, "..", "dev.db"));

function upsert(table: string, uniqueCol: string, data: Record<string, unknown>[]) {
  for (const row of data) {
    const cols = Object.keys(row);
    const placeholders = cols.map(() => "?").join(", ");
    const updates = cols.filter(c => c !== uniqueCol).map(c => `${c} = ?`).join(", ");
    const values = cols.map(c => row[c]);
    const updateValues = cols.filter(c => c !== uniqueCol).map(c => row[c]);

    const sql = `INSERT INTO ${table} (id, ${cols.join(", ")})
      VALUES (lower(hex(randomblob(12))), ${placeholders})
      ON CONFLICT(${uniqueCol}) DO UPDATE SET ${updates}`;

    db.prepare(sql).run(...values, ...updateValues);
  }
}

upsert("MetalDensity", "material", [
  { material: "S235", density: 7850, label: "Konstrukciju tērauds S235" },
  { material: "S355", density: 7850, label: "Konstrukciju tērauds S355" },
  { material: "SS304", density: 7930, label: "Nerūsējošais tērauds 304" },
  { material: "SS316", density: 8000, label: "Nerūsējošais tērauds 316" },
  { material: "AL6061", density: 2700, label: "Alumīnijs 6061" },
  { material: "AL5052", density: 2680, label: "Alumīnijs 5052" },
  { material: "CU", density: 8940, label: "Varš" },
  { material: "BRASS", density: 8500, label: "Misiņš" },
]);

upsert("HourlyRate", "category", [
  { category: "welding", rate: 18, label: "Metināšana" },
  { category: "metalwork", rate: 15, label: "Atslēdznieku darbi" },
  { category: "surface", rate: 12, label: "Virsmu apstrāde" },
  { category: "installation", rate: 16, label: "Montāža" },
]);

upsert("TransportRate", "name", [
  { name: "truck_small", rate: 1.2, unit: "km", label: "Kravas auto (mazais)" },
  { name: "truck_large", rate: 1.8, unit: "km", label: "Kravas auto (lielais)" },
  { name: "crane_truck", rate: 55, unit: "h", label: "Autoceltnis" },
]);

console.log("Seed data created successfully");
db.close();
