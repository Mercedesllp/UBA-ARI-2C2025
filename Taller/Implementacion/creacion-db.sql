CREATE USER aida_owner nologin;
CREATE USER aida_admin PASSWORD 'hola';
CREATE DATABASE aida_db OWNER aida_owner;
GRANT CONNECT ON DATABASE aida_db TO aida_admin;