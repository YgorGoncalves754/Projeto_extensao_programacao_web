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

\c turismo

CREATE TABLE tb_usuarios (
	id_user   BIGINT GENERATED ALWAYS AS IDENTITY,
	username  VARCHAR(30) NOT NULL,

	CONSTRAINT pk_usuario
		PRIMARY KEY (id_user)
);

CREATE TABLE tb_pontos_turisticos (
	id_ponto_turistico  BIGINT GENERATED ALWAYS AS IDENTITY,
	id_usuario			BIGINT NOT NULL,
	nome_ponto		    VARCHAR (150) NOT NULL,
	descricao_ponto     TEXT,
	latitude		    DECIMAL(10,7) NOT NULL,
	longitude		    DECIMAL(10,7) NOT NULL,
	dt_criacao			TIMESTAMP NOT NULL,

	CONSTRAINT pk_ponto_turistico
		PRIMARY KEY (id_ponto_turistico),

	CONSTRAINT fk_usuario_criador
		FOREIGN KEY (id_usuario) REFERENCES tb_usuarios(id_user)
);

CREATE TABLE tb_imagens_ponto (
	id_imagem			BIGINT GENERATED ALWAYS AS IDENTITY,
	id_ponto_turistico  BIGINT NOT NULL,
	path_imagem			TEXT NOT NULL,

	CONSTRAINT pk_imagem
		PRIMARY KEY (id_imagem),

	CONSTRAINT fk_ponto_turistico
		FOREIGN KEY (id_ponto_turistico) REFERENCES tb_pontos_turisticos(id_ponto_turistico)
);
