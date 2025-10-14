SET ROLE TO aida_owner;
CREATE SCHEMA aida;
GRANT USAGE ON SCHEMA aida TO aida_admin;

CREATE TABLE aida.alumnos (
  lu text PRIMARY KEY,
  apellido text NOT NULL,
  nombres text NOT NULL,
  titulo text,
  titulo_en_tramite date,
  egreso date
);

GRANT SELECT, INSERT, UPDATE, DELETE ON aida.alumnos TO aida_admin;