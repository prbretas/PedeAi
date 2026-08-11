-- ================================================
-- DADOS INICIAIS - PedeAí
-- Executar após o schema.sql no Supabase
-- ================================================

INSERT INTO produtos (nome, descricao, preco, imagem_url, categoria) VALUES
('X-Burguer', 'Pão, hambúrguer, queijo, alface e tomate', 18.00, 'img/x-burguer.jpg', 'lanche'),
('X-Salada', 'Pão, hambúrguer, queijo, alface, tomate e maionese', 20.00, 'img/x-salada.jpg', 'lanche'),
('X-Bacon', 'Pão, hambúrguer, queijo, bacon crocante e molho especial', 22.00, 'img/x-bacon.jpg', 'lanche'),
('X-Tudo', 'Pão, 2 hambúrgueres, queijo, bacon, ovo, presunto', 28.00, 'img/x-tudo.jpg', 'lanche'),
('Batata Frita', 'Porção generosa de batata frita sequinha', 15.00, 'img/batata-frita.jpg', 'acompanhamento'),
('Onion Rings', 'Anéis de cebola empanados e crocantes', 17.00, 'img/onion-rings.jpg', 'acompanhamento'),
('Refrigerante Lata', 'Coca-Cola, Guaraná ou Sprite', 7.00, 'img/refrigerante.jpg', 'bebida'),
('Suco Natural', 'Laranja, limão ou maracujá', 10.00, 'img/suco-natural.jpg', 'bebida'),
('Água', 'Água mineral 500ml', 4.00, 'img/agua.jpg', 'bebida'),
('Milk Shake', 'Chocolate, morango ou baunilha - 400ml', 16.00, 'img/milk-shake.jpg', 'bebida');
