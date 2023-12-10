const pool = require('../conexaosql')

const cadastrarPedido = async (req, res) => {
    const { data, pedido_produtos } = req.body;

    try {

        if (!data || !pedido_produtos || pedido_produtos.length === 0) {
            return res.status(400).json({ mensagem: 'Campos obrigatórios não informados' });
        }

        const detalhesProdutos = await obterDetalhesProdutos(pedido_produtos);

        if (detalhesProdutos.some((detalhe) => !detalhe)) {
            return res.status(400).json({ mensagem: 'Um ou mais produtos não foram encontrados' });
        }

        const valorTotal = calcularValorTotal(detalhesProdutos);

        const idPedido = await inserirPedidoNoBanco(data, valorTotal);

        await inserirDetalhesPedidoNoBanco(idPedido, detalhesProdutos);

        return res.status(201).json({ mensagem: 'Pedido cadastrado com sucesso', idPedido });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ mensagem: 'Erro interno do servidor' });
    }
}

const obterDetalhesProdutos = async (pedido_produtos) => {
    return Promise.all(
        pedido_produtos.map(async ({ produto_id, quantidade_produto }) => {
            const resultadoProduto = await pool.query(
                'SELECT * FROM produtos WHERE id = $1',
                [produto_id]
            );

            if (resultadoProduto.rows.length === 0) {
                return null; 
            }

            const produto = resultadoProduto.rows[0];
            return {
                produto_id: produto.id,
                nome_produto: produto.nome,
                quantidade_produto,
                valor: produto.valor, 
            };
        })
    );
}

const calcularValorTotal = (detalhesProdutos) => {
    return detalhesProdutos.reduce((total, detalhe) => {
        return total + detalhe.quantidade_produto * detalhe.valor;
    }, 0);
}

const inserirPedidoNoBanco = async (data, valorTotal) => {
    const resultadoPedido = await pool.query(
        'INSERT INTO pedidos (data, valor_total) VALUES ($1, $2) RETURNING id',
        [data, valorTotal]
    );
    return resultadoPedido.rows[0].id;
}

const inserirDetalhesPedidoNoBanco = async (idPedido, detalhesProdutos) => {
    await Promise.all(
        detalhesProdutos.map(async ({ produto_id, quantidade_produto }) => {
            await pool.query(
                'INSERT INTO pedido_produtos (pedido_id, produto_id, quantidade_produto) VALUES ($1, $2, $3)',
                [idPedido, produto_id, quantidade_produto]
            );
        })
    );
}

const listarPedido = async (req, res) => {
    try {
        const { a_partir } = req.query;

        let consultaSQL = 'SELECT * FROM pedidos';

        if (a_partir) {
            consultaSQL += ' WHERE data >= $1';
        }

        const parametros = a_partir ? [a_partir] : [];
        const resultadoPedidos = await pool.query(consultaSQL, parametros);
        const pedidos = await Promise.all(resultadoPedidos.rows.map(async (pedido) => {
  
            const resultadoDetalhes = await pool.query(
                'SELECT * FROM pedido_produtos WHERE pedido_id = $1',
                [pedido.id]
            );

            const detalhesProdutos = resultadoDetalhes.rows.map((detalhe) => ({
                id: detalhe.id,
                quantidade_produto: detalhe.quantidade_produto,
                valor_produto: detalhe.valor_produto,
                pedido_id: detalhe.pedido_id,
                produto_id: detalhe.produto_id,
            }));

            return {
                pedido: {
                    id: pedido.id,
                    valor_total: pedido.valor_total,
                    data: pedido.data.toISOString().split('T')[0],
                },
                pedido_produtos: detalhesProdutos,
            };
        }));

        res.status(200).json(pedidos);
    } catch (error) {
        res.status(500).json({ mensagem: 'Erro interno do servidor' });
    }
};

module.exports = {
    cadastrarPedido,
    listarPedido
}
