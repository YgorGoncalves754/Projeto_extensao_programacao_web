CREATE DATABASE turismo
    WITH
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'pt_BR.UTF-8'
    LC_CTYPE = 'pt_BR.UTF-8'
    LOCALE_PROVIDER = 'libc'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1
    IS_TEMPLATE = False;

CREATE TABLE tb_pontos_turisticos (
	id_ponto_turistico  BIGINT GENERATED ALWAYS AS IDENTITY,
	nome_ponto		    VARCHAR (150) NOT NULL,
	descricao_ponto     TEXT,
	latitude		    DECIMAL(10,7) NOT NULL,
	longitude		    DECIMAL(10,7) NOT NULL,
	dt_criacao			TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

	CONSTRAINT pk_ponto_turistico
		PRIMARY KEY (id_ponto_turistico)
);

