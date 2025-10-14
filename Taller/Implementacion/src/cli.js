import { Client } from 'pg'
const client = new Client({
  user: 'aida_admin',       // tu usuario
  host: 'localhost',        // usualmente localhost
  database: 'aida_db',      // tu base de datos
  password: 'hola',         // contraseña del usuario
  port: 5432,               // puerto por defecto
});
await client.connect()

import { readFile } from 'node:fs/promises';

const filePath = `recursos/alumnos.csv`;
const contents = await readFile(filePath, { encoding: 'utf8' });
const header = contents.split(/\r?\n/)[0];
const columns = header.split(',').map(col => col.trim());
const dataLines = contents.split(/\r?\n/).slice(1).filter(line => line.trim() !== '');
for (const line of dataLines) {
    const values = line.split(',');
    const query = `
        INSERT INTO aida.alumnos (${columns.join(', ')}) VALUES 
            (${values.map((value) => value == '' ? 'null' : `'` + value + `'`).join(', ')})
    `;
    console.log(query)
    const res = await client.query(query)
    console.log(res.command, res.rowCount)
}

await client.end()
