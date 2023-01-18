import { DB } from ".";

const user = `CREATE TABLE users (
    pubkey VARCHAR PRIMARY KEY,
    is_admin BOOLEAN NOT NULL,
    can_create_raffle BOOLEAN NOT NULL,
		name VARCHAR,
		discord VARCHAR,
		twitter VARCHAR,
		instagram VARCHAR,
		pfp VARCHAR
);`;

const raffle = `CREATE TABLE raffle (
		pubkey VARCHAR PRIMARY KEY,
    raffle_type VARCHAR NOT NULL,
    raffle_mint VARCHAR,
    max_tickets DECIMAL(20),
    expiration TIMESTAMP WITH TIME ZONE,
		hidden BOOLEAN
);`;

const raffleEntry = `CREATE TABLE raffle_entry (
  users_key VARCHAR REFERENCES users (pubkey) ON UPDATE CASCADE ON DELETE CASCADE,
	raffle_key VARCHAR REFERENCES raffle (pubkey) ON UPDATE CASCADE,
	count numeric NOT NULL DEFAULT 0,
	CONSTRAINT raffle_entry_pkey PRIMARY KEY (users_key, raffle_key)
);`;

export async function migrate() {
  await DB.query("begin", []);
  await DB.query(raffle, []);
  await DB.query(user, []);
  await DB.query(raffleEntry, []);
  await DB.query("commit", []);
}

migrate();
