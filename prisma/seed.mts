import Database from "better-sqlite3";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const db = new Database(join(__dirname, "..", "dev.db"));

function upsert(table: string, uniqueCol: string, data: Record<string, unknown>[]) {
  for (const row of data) {
    const cols = Object.keys(row);
    const placeholders = cols.map(() => "?").join(", ");
    const updates = cols.filter(c => c !== uniqueCol).map(c => `"${c}" = ?`).join(", ");
    const values = cols.map(c => row[c]);
    const updateValues = cols.filter(c => c !== uniqueCol).map(c => row[c]);

    const sql = `INSERT INTO "${table}" ("id", ${cols.map(c => `"${c}"`).join(", ")})
      VALUES (lower(hex(randomblob(12))), ${placeholders})
      ON CONFLICT("${uniqueCol}") DO UPDATE SET ${updates}`;

    db.prepare(sql).run(...values, ...updateValues);
  }
}

upsert("MetalDensity", "name", [
  { name: "steel", nameLv: "Tērauds", density: 7850 },
  { name: "stainless", nameLv: "Nerūsējošais tērauds", density: 7930 },
  { name: "aluminium", nameLv: "Alumīnijs", density: 2710 },
  { name: "copper", nameLv: "Varš", density: 8960 },
  { name: "brass", nameLv: "Misiņš", density: 8500 },
  { name: "wood", nameLv: "Koks", density: 600 },
]);

upsert("DefaultRate", "lineKey", [
  { lineKey: "weld_workshop", label: "Metināt darbnīca", rate: 25, unit: "st" },
  { lineKey: "weld_fast", label: "Metināt ĀTRI", rate: 40, unit: "st" },
  { lineKey: "weld_nf_workshop", label: "NT metināt darbnīca", rate: 27, unit: "st" },
  { lineKey: "weld_nf_fast", label: "NT metināt ĀTRI", rate: 43, unit: "st" },
  { lineKey: "weld_al_workshop", label: "Al metināt darbnīca", rate: 30, unit: "st" },
  { lineKey: "weld_al_fast", label: "Al metināt ĀTRI", rate: 47, unit: "st" },
  { lineKey: "metal_workshop", label: "Metālapstrāde darbnīca", rate: 23, unit: "st" },
  { lineKey: "metal_fast", label: "Metālapstrāde ĀTRI", rate: 37, unit: "st" },
  { lineKey: "assembly_helper", label: "Demontāža/montāža (palīgstrādnieks)", rate: 20, unit: "st" },
  { lineKey: "assembly_holiday", label: "Brīvdiena", rate: 20, unit: "st" },
  { lineKey: "assembly_festive", label: "Svētku diena", rate: 20, unit: "st" },
  { lineKey: "design_measure", label: "Objekta uzmērīšana_rasēt", rate: 30, unit: "st" },
  { lineKey: "design_office", label: "Birojs", rate: 25, unit: "st" },
  { lineKey: "qc_production", label: "KONTROLE ražošanai 5%", rate: 19, unit: "st" },
  { lineKey: "sandblast_m2", label: "Smilšustrūkla, m2", rate: 7.5, unit: "m2" },
  { lineKey: "sandblast_hour", label: "Smilšustrūkla, st", rate: 40, unit: "st" },
  { lineKey: "sandblast_travel", label: "Smilšustrūkla izbraukums", rate: 65, unit: "st" },
  { lineKey: "coat_powder_kg", label: "Pulverkrāsošana, kg", rate: 50, unit: "kg" },
  { lineKey: "coat_primer", label: "Pulverkrāsošana grunts 1 kārta", rate: 8.5, unit: "m2" },
  { lineKey: "coat_topcoat", label: "Pulverkrāsošana 1 kārta", rate: 9.5, unit: "m2" },
  { lineKey: "coat_cycle", label: "Pulverkrāsot 1cikls/krāsns", rate: 50, unit: "gab" },
  { lineKey: "coat_wet", label: "Slapjā krāsošana 1 kārta", rate: 8.5, unit: "m2" },
  { lineKey: "coat_spray", label: "Krāsas baloniņš", rate: 15, unit: "gab" },
  { lineKey: "coat_cesis", label: "KRĀSOT CĒSĪS", rate: 30, unit: "m2" },
  { lineKey: "transport_car", label: "Vieglais, km", rate: 0.65, unit: "km" },
  { lineKey: "transport_bus_km", label: "Buss, km", rate: 0.85, unit: "km" },
  { lineKey: "transport_bus_hr", label: "Buss, st", rate: 15, unit: "st" },
  { lineKey: "transport_truck_km", label: "Mersis, km", rate: 1.2, unit: "km" },
  { lineKey: "transport_truck_hr", label: "Mersis, st", rate: 30, unit: "st" },
  { lineKey: "transport_forklift", label: "Pacēlājs, st", rate: 30, unit: "st" },
  { lineKey: "transport_courier", label: "KURJERS", rate: 10, unit: "gab" },
  { lineKey: "mat_main", label: "MATERIĀLI", rate: 1.3, unit: "kompl" },
  { lineKey: "mat_auxiliary", label: "PALĪGMATERIĀLI", rate: 1.3, unit: "kompl" },
  { lineKey: "plasma_s235", label: "Materiāls S235, kg", rate: 0.8, unit: "kg" },
  { lineKey: "plasma_s355", label: "Materiāls S355, kg", rate: 0.86, unit: "kg" },
  { lineKey: "plasma_cut_time", label: "Griešanas laiks, min", rate: 1.67, unit: "min" },
  { lineKey: "mech_xray", label: "1090 rentgens", rate: 175, unit: "gab" },
  { lineKey: "mech_zinc_kg", label: "Cinkošana, kg", rate: 1, unit: "kg" },
  { lineKey: "mech_metallize", label: "Metalizācija, m2", rate: 30, unit: "m2" },
  { lineKey: "mech_zinc_3d", label: "Cinkošana (telpiska), kg", rate: 2.6, unit: "kg" },
  { lineKey: "mech_rack", label: "Stalažas (6m)", rate: 1.5, unit: "st" },
  { lineKey: "mech_packing", label: "Pakošanas materiāls", rate: 15, unit: "gab" },
]);

console.log("Seed complete: densities + default rates");
db.close();
