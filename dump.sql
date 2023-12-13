-- Criar o banco de dados
CREATE DATABASE pdv;

-- Criar a tabela usuarios
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nome TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    senha TEXT
);

-- Criar a tabela produtos
CREATE TABLE produtos (
    id SERIAL PRIMARY KEY,
    descricao TEXT NOT NULL,
    valor INTEGER,
    produto_imagem BYTEA
);

-- Criar a tabela pedidos
CREATE TABLE pedidos (
    id SERIAL PRIMARY KEY,
    data TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    valor_total INTEGER
);

-- Criar a tabela pedido_produtos
CREATE TABLE pedido_produtos (
    id SERIAL PRIMARY KEY,
    pedido_id INTEGER REFERENCES pedidos(id),
    produto_id INTEGER REFERENCES produtos(id),
    quantidade_produto INTEGER
);

ALTER TABLE pedido_produtos
DROP CONSTRAINT pedido_produtos_produto_id_fkey;

ALTER TABLE pedido_produtos
ADD CONSTRAINT pedido_produtos_produto_id_fkey
FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE;

ALTER TABLE produtos
ALTER COLUMN produto_imagem TYPE TEXT;