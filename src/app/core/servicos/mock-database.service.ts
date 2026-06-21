import { Injectable, inject } from '@angular/core';
import { PerfilAcesso } from '../enums/perfil-acesso.enum';
import { StatusPedido, StatusRegistro, TipoEventoAgenda } from '../enums/status-registro.enum';
import { ArmazenamentoService } from './armazenamento.service';
import { Cliente, EventoAgenda, ItemEstoque, Pedido, Produto, Usuario } from '../modelos/modelos';
import { ClienteLoja, EstoqueLoja, MetaLoja, PedidoLoja, VendedorLoja } from '../modelos/loja.model';
import { MUNICIPIOS_NORDESTE } from '../constantes/localidades-nordeste';

@Injectable({ providedIn: 'root' })
export class MockDatabaseService {
  private readonly armazenamento = inject(ArmazenamentoService);
  inicializar(): void {
    const versaoAtual = 2;
    if (this.armazenamento.obter('zuca_banco_versao', 0) >= versaoAtual) { this.garantirDadosLoja(); this.migrarClientesParaNordeste(); return; }

    const usuarios = this.gerarUsuarios();
    const clientes = this.gerarClientes();
    const produtos = this.gerarProdutos();
    const estoque = this.gerarEstoque(produtos);
    const pedidos = this.gerarPedidos(clientes, produtos, usuarios);
    const agenda = this.gerarAgenda(clientes);

    const dados: Record<string, unknown> = {
      zuca_usuarios: usuarios,
      zuca_clientes: clientes,
      zuca_produtos: produtos,
      zuca_catalogos: produtos,
      zuca_estoque: estoque,
      zuca_movimentacoes: [],
      zuca_pedidos: pedidos,
      zuca_agenda: agenda,
      zuca_crm_atendimentos: [],
      zuca_crm_observacoes: [],
      zuca_avisos: [{ id: 'av1', titulo: 'Coleção Essenza', mensagem: 'A nova coleção já está disponível com condições especiais de lançamento.', tipo: 'campanha', ativo: true }]
    };

    Object.entries(dados).forEach(([chave, valor]) => this.armazenamento.salvar(chave, valor));
    this.armazenamento.salvar('zuca_banco_inicializado', true);
    this.armazenamento.salvar('zuca_banco_versao', versaoAtual);
    this.garantirDadosLoja();
    this.migrarClientesParaNordeste();
  }

  private garantirDadosLoja(): void {
    const clientes=this.armazenamento.obter<Cliente[]>('zuca_clientes',[]);const produtos=this.armazenamento.obter<Produto[]>('zuca_produtos',[]);const usuarios=this.armazenamento.obter<Usuario[]>('zuca_usuarios',[]);
    const lojas:ClienteLoja[]=this.armazenamento.obter('zuca_clientes_loja',[]);
    const dadosLojas=lojas.length?lojas:[
      {id:'loja-1',clienteId:clientes[0]?.id??'c1',nomeLoja:clientes[0]?.nome??'Boutique Passo Fino',razaoSocial:'Passo Fino Calçados Ltda.',cnpj:clientes[0]?.documento??'12.345.678/0001-90',email:clientes[0]?.email??'compras@passofino.com',telefone:clientes[0]?.telefone??'(11) 3222-1100',estado:'BA',municipio:'Salvador',endereco:'Av. Sete de Setembro, 850',responsavel:'Fernanda Souza',vendedorFabrica:'Carlos Lima',status:StatusRegistro.ATIVO,dataCadastro:'2024-02-15'},
      {id:'loja-2',clienteId:clientes[3]?.id??'c4',nomeLoja:clientes[3]?.nome??'Empório Estilo Nobre',razaoSocial:'Estilo Nobre Comércio Ltda.',cnpj:clientes[3]?.documento??'45.222.333/0001-10',email:clientes[3]?.email??'contato@estilonobre.com',telefone:clientes[3]?.telefone??'(85) 3344-1200',estado:'CE',municipio:'Fortaleza',endereco:'Rua Monsenhor Tabosa, 410',responsavel:'Marcelo Nunes',vendedorFabrica:'Ana Beatriz',status:StatusRegistro.ATIVO,dataCadastro:'2024-08-10'}
    ];
    if(!lojas.length)this.armazenamento.salvar('zuca_clientes_loja',dadosLojas);
    if(!usuarios.some(u=>u.perfil===PerfilAcesso.CLIENTE_LOJA)){this.armazenamento.salvar('zuca_usuarios',[...usuarios,
      {id:'ul1',nome:'Fernanda Souza',email:'loja@zucacouros.com',senha:'123456',perfil:PerfilAcesso.CLIENTE_LOJA,status:StatusRegistro.ATIVO,clienteLojaId:'loja-1',telefone:'(71) 99911-2200',dataCadastro:'2024-02-15'},
      {id:'ul2',nome:'Lucas Santos',email:'vendedor.loja@zucacouros.com',senha:'123456',perfil:PerfilAcesso.VENDEDOR_LOJA,status:StatusRegistro.ATIVO,clienteLojaId:'loja-1',telefone:'(71) 99933-4400',dataCadastro:'2025-01-10'},
      {id:'ul3',nome:'Marcelo Nunes',email:'loja2@zucacouros.com',senha:'123456',perfil:PerfilAcesso.CLIENTE_LOJA,status:StatusRegistro.ATIVO,clienteLojaId:'loja-2',telefone:'(85) 99955-6600',dataCadastro:'2024-08-10'}]);}
    if(!this.armazenamento.existe('zuca_vendedores_loja')){const vendedores:VendedorLoja[]=[{id:'vl1',clienteLojaId:'loja-1',usuarioId:'ul2',nome:'Lucas Santos',email:'vendedor.loja@zucacouros.com',telefone:'(71) 99933-4400',status:StatusRegistro.ATIVO,dataCadastro:'2025-01-10',metaAtual:18000},{id:'vl2',clienteLojaId:'loja-1',nome:'Camila Rocha',email:'camila@passofino.com',telefone:'(71) 99922-1188',status:StatusRegistro.ATIVO,dataCadastro:'2025-03-20',metaAtual:15000},{id:'vl3',clienteLojaId:'loja-2',nome:'Bruno Lima',email:'bruno@estilonobre.com',telefone:'(85) 99887-7711',status:StatusRegistro.ATIVO,dataCadastro:'2025-02-12',metaAtual:16000}];this.armazenamento.salvar('zuca_vendedores_loja',vendedores);}
    if(!this.armazenamento.existe('zuca_estoque_loja')){const estoque:EstoqueLoja[]=dadosLojas.flatMap((loja,li)=>produtos.slice(li*8,li*8+12).map((p,i)=>({id:`el-${loja.id}-${i}`,clienteLojaId:loja.id,produtoId:p.id,produto:p.nome,referencia:p.codigo,categoria:p.categoria,cor:p.cor,tamanho:p.tamanho,quantidadeDisponivel:3+((i*7)%24),quantidadeMinima:6+(i%3),ultimaMovimentacao:new Date(Date.now()-i*86400000).toISOString(),status:StatusRegistro.ATIVO})));this.armazenamento.salvar('zuca_estoque_loja',estoque);this.armazenamento.salvar('zuca_movimentacoes_estoque_loja',[]);}
    if(!this.armazenamento.existe('zuca_metas_loja')){const mes=new Date().toISOString().slice(0,7);const metas:MetaLoja[]=[{id:'ml1',clienteLojaId:'loja-1',tipo:'LOJA',mesAno:mes,valorMeta:50000,status:StatusRegistro.ATIVO},{id:'ml2',clienteLojaId:'loja-1',tipo:'VENDEDOR',mesAno:mes,valorMeta:18000,vendedorId:'vl1',vendedorNome:'Lucas Santos',status:StatusRegistro.ATIVO},{id:'ml3',clienteLojaId:'loja-1',tipo:'VENDEDOR',mesAno:mes,valorMeta:15000,vendedorId:'vl2',vendedorNome:'Camila Rocha',status:StatusRegistro.ATIVO}];this.armazenamento.salvar('zuca_metas_loja',metas);}
    if(!this.armazenamento.existe('zuca_pedidos_loja')){const estados=['BA','CE','PE','RN','PB','AL','SE','MA','PI'];const status:PedidoLoja['status'][]=['PENDENTE DE ANÁLISE','ENVIADO','ACEITO','EM PRODUÇÃO','FATURADO','FINALIZADO','RECUSADO'];const pedidos:PedidoLoja[]=Array.from({length:22},(_,i)=>{const loja=dadosLojas[i%2],produto=produtos[i%Math.max(1,produtos.length)]??{id:'p1',codigo:'ZC-001',nome:'Sapato Verona',categoria:'Social',cor:'Preto',tamanho:40,preco:299.9} as Produto;const quantidade=2+(i%6),total=quantidade*produto.preco,data=new Date(Date.now()-i*2*86400000).toISOString().slice(0,10),situacao=status[i%status.length];return{id:`pl${i+1}`,numero:`LOJA-${String(1200+i).padStart(4,'0')}`,clienteLojaId:loja.id,clienteLojaNome:loja.nomeLoja,vendedorLojaId:i%2?'vl2':'vl1',vendedorLojaNome:i%2?'Camila Rocha':'Lucas Santos',vendedorFabrica:loja.vendedorFabrica,data,status:situacao,itens:[{produtoId:produto.id,referencia:produto.codigo,nome:produto.nome,categoria:produto.categoria,cor:produto.cor,tamanho:produto.tamanho,quantidade,precoUnitario:produto.preco,desconto:0,subtotal:total}],total,observacoes:'Pedido gerado para demonstração.',condicaoPagamento:'Boleto 30 dias',prazoDesejado:new Date(Date.now()+20*86400000).toISOString().slice(0,10),municipio:loja.municipio,estado:estados[i%estados.length],origem:i%2?'VENDEDOR LOJA':'CLIENTE LOJA',historico:[{status:situacao,data:`${data}T10:00:00`,usuario:i%2?'Lucas Santos':'Fernanda Souza'}]};});this.armazenamento.salvar('zuca_pedidos_loja',pedidos);}
  }

  private migrarClientesParaNordeste():void{if(this.armazenamento.existe('zuca_migracao_clientes_nordeste_v1'))return;const localidades=this.obterLocalidadesNordeste(),clientes=this.armazenamento.obter<Cliente[]>('zuca_clientes',[]).map((cliente,indice)=>{const[cidade,estado]=localidades[indice%localidades.length];return{...cliente,cidade,estado};});this.armazenamento.salvar('zuca_clientes',clientes);const lojas=this.armazenamento.obter<ClienteLoja[]>('zuca_clientes_loja',[]).map(loja=>{const cliente=clientes.find(item=>item.id===loja.clienteId);return cliente?{...loja,municipio:cliente.cidade,estado:cliente.estado}:loja;});this.armazenamento.salvar('zuca_clientes_loja',lojas);const pedidos=this.armazenamento.obter<PedidoLoja[]>('zuca_pedidos_loja',[]).map(pedido=>{const loja=lojas.find(item=>item.id===pedido.clienteLojaId);return loja?{...pedido,municipio:loja.municipio,estado:loja.estado}:pedido;});this.armazenamento.salvar('zuca_pedidos_loja',pedidos);this.armazenamento.salvar('zuca_migracao_clientes_nordeste_v1',true);}
  private obterLocalidadesNordeste():[string,string][]{return Object.entries(MUNICIPIOS_NORDESTE).flatMap(([estado,municipios])=>municipios.map(municipio=>[municipio,estado] as [string,string]));}

  private gerarUsuarios(): Usuario[] {
    return [
      ['João Zuca', 'owner@zucacouros.com', PerfilAcesso.OWNER],
      ['Marina Alves', 'gerente@zucacouros.com', PerfilAcesso.GERENTE],
      ['Rafael Nogueira', 'gerente2@zucacouros.com', PerfilAcesso.GERENTE],
      ['Carlos Lima', 'vendedor@zucacouros.com', PerfilAcesso.VENDEDOR],
      ['Ana Beatriz', 'vendedor2@zucacouros.com', PerfilAcesso.VENDEDOR],
      ['Renato Reis', 'vendedor3@zucacouros.com', PerfilAcesso.VENDEDOR],
      ['Paula Mendes', 'vendedor4@zucacouros.com', PerfilAcesso.VENDEDOR],
      ['Diego Castro', 'vendedor5@zucacouros.com', PerfilAcesso.VENDEDOR]
    ].map(([nome, email, perfil], indice) => ({
      id: `u${indice + 1}`, nome: nome as string, email: email as string, senha: '123456',
      perfil: perfil as PerfilAcesso, status: StatusRegistro.ATIVO
    }));
  }

  private gerarClientes(): Cliente[] {
    const localidades = this.obterLocalidadesNordeste();
    const prefixos = ['Boutique','Calçados','Casa','Empório','Loja','Ateliê'];
    const nomes = ['Passo Fino','Horizonte','Bela Forma','Estilo Nobre','Caminho','Vitrine','Elegance','Pé de Ouro','Villa Couro','Essenza'];
    return Array.from({ length: 30 }, (_, indice) => {
      const [cidade, estado] = localidades[indice % localidades.length];
      const nome = `${prefixos[indice % prefixos.length]} ${nomes[indice % nomes.length]} ${indice + 1}`;
      const ddd = 11 + (indice % 78);
      return {
        id: `c${indice + 1}`, nome, documento: `${String(12 + indice).padStart(2,'0')}.345.678/0001-${String(10 + indice).slice(-2)}`,
        telefone: `(${ddd}) 3${String(2200000 + indice * 137).slice(-7)}`,
        whatsapp: `(${ddd}) 9${String(88000000 + indice * 251).slice(-8)}`,
        email: `contato${indice + 1}@clientezuca.com.br`, cidade, estado,
        observacoes: indice % 4 === 0 ? 'Cliente com atendimento prioritário.' : 'Cliente da carteira comercial.',
        status: indice === 28 ? StatusRegistro.INATIVO : StatusRegistro.ATIVO
      };
    });
  }

  private gerarProdutos(): Produto[] {
    const categorias = ['Sandália','Chinelo','Sapato Social','Tênis','Bota','Rasteira'];
    const linhas = ['Verona','Firenze','Siena','Milano','Capri','Toscana','Roma','Venezia','Nápoles'];
    const cores = ['Preto','Conhaque','Café','Caramelo','Areia','Branco','Marinho'];
    const materiais = ['Couro legítimo','Couro nobuck','Couro floater','Camurça premium'];
    return Array.from({ length: 50 }, (_, indice) => {
      const categoria = categorias[indice % categorias.length];
      return {
        id: `p${indice + 1}`, nome: `${categoria} ${linhas[indice % linhas.length]}`,
        codigo: `ZC-${String(indice + 1).padStart(3,'0')}`, categoria, modelo: linhas[(indice + 2) % linhas.length],
        cor: cores[indice % cores.length], tamanho: 34 + (indice % 11), material: materiais[indice % materiais.length],
        preco: 129.9 + (indice % 12) * 35, imagem: '', descricao: `${categoria} com acabamento artesanal Zuca Couros.`,
        status: StatusRegistro.ATIVO, visivelCatalogo: indice % 7 !== 0
      };
    });
  }

  private gerarEstoque(produtos: Produto[]): ItemEstoque[] {
    return produtos.map((produto, indice) => ({
      id: `e${indice + 1}`, produtoId: produto.id, produto: produto.nome, codigo: produto.codigo,
      tamanho: produto.tamanho, cor: produto.cor, quantidadeAtual: 5 + ((indice * 7) % 42),
      quantidadeMinima: 8 + (indice % 5), localizacao: `${String.fromCharCode(65 + (indice % 6))}${1 + (indice % 8)}-P${1 + (indice % 4)}`,
      status: StatusRegistro.ATIVO
    }));
  }

  private gerarPedidos(clientes: Cliente[], produtos: Produto[], usuarios: Usuario[]): Pedido[] {
    const vendedores = usuarios.filter(usuario => usuario.perfil === PerfilAcesso.VENDEDOR);
    const status = [StatusPedido.ORCAMENTO, StatusPedido.PEDIDO, StatusPedido.CANCELADO, StatusPedido.FINALIZADO];
    return Array.from({ length: 10 }, (_, indice) => {
      const cliente = clientes[(indice * 3) % clientes.length];
      const quantidadeItens = 1 + (indice % 3);
      const itens = Array.from({ length: quantidadeItens }, (_, itemIndice) => {
        const produto = produtos[(indice * 5 + itemIndice * 7) % produtos.length];
        const quantidade = 1 + ((indice + itemIndice) % 6);
        return { produtoId: produto.id, produtoNome: produto.nome, quantidade, valorUnitario: produto.preco, subtotal: quantidade * produto.preco };
      });
      const data = new Date();
      data.setDate(data.getDate() - indice * 6);
      return {
        id: `v${indice + 1}`, numero: `PED-${String(1100 + indice).padStart(4,'0')}`, clienteId: cliente.id,
        clienteNome: cliente.nome, data: data.toISOString().slice(0,10), vendedor: vendedores[indice % vendedores.length].nome,
        itens, valorTotal: itens.reduce((total, item) => total + item.subtotal, 0), status: status[indice % status.length]
      };
    });
  }

  private gerarAgenda(clientes: Cliente[]): EventoAgenda[] {
    const tipos = [TipoEventoAgenda.PROMOCAO, TipoEventoAgenda.VISITA, TipoEventoAgenda.COMPRA, TipoEventoAgenda.CAMPANHA, TipoEventoAgenda.DATA_ESPECIAL];
    const titulos = ['Apresentação da coleção','Visita comercial','Reposição de produtos','Campanha sazonal','Data comemorativa'];
    return Array.from({ length: 20 }, (_, indice) => {
      const data = new Date();
      data.setDate(data.getDate() + indice + 1);
      return {
        id: `a${indice + 1}`, titulo: `${titulos[indice % titulos.length]} ${indice + 1}`,
        descricao: 'Compromisso gerado automaticamente para demonstração.', data: data.toISOString().slice(0,10),
        horario: `${String(8 + (indice % 9)).padStart(2,'0')}:${indice % 2 ? '30' : '00'}`,
        tipo: tipos[indice % tipos.length], cliente: clientes[indice % clientes.length].nome
      };
    });
  }

  inicializarLegado(): void {
    if (this.armazenamento.existe('zuca_banco_inicializado')) return;
    const produtos = [
      { id:'p1', nome:'Oxford Verona', codigo:'OX-401', categoria:'Social', modelo:'Oxford', cor:'Conhaque', tamanho:40, material:'Couro legítimo', preco:489.9, imagem:'', descricao:'Clássico com acabamento artesanal.', status:StatusRegistro.ATIVO, visivelCatalogo:true },
      { id:'p2', nome:'Mocassim Firenze', codigo:'MO-208', categoria:'Casual', modelo:'Mocassim', cor:'Café', tamanho:41, material:'Couro nobuck', preco:399.9, imagem:'', descricao:'Conforto para todos os dias.', status:StatusRegistro.ATIVO, visivelCatalogo:true },
      { id:'p3', nome:'Bota Siena', codigo:'BO-118', categoria:'Bota', modelo:'Chelsea', cor:'Preto', tamanho:39, material:'Couro legítimo', preco:549.9, imagem:'', descricao:'Design versátil e solado premium.', status:StatusRegistro.ATIVO, visivelCatalogo:true }
    ];
    const dados: Record<string, unknown> = {
      zuca_usuarios: [
        {id:'u1',nome:'João Zuca',email:'owner@zucacouros.com',senha:'123456',perfil:PerfilAcesso.OWNER,status:StatusRegistro.ATIVO},
        {id:'u2',nome:'Marina Alves',email:'gerente@zucacouros.com',senha:'123456',perfil:PerfilAcesso.GERENTE,status:StatusRegistro.ATIVO},
        {id:'u3',nome:'Carlos Lima',email:'vendedor@zucacouros.com',senha:'123456',perfil:PerfilAcesso.VENDEDOR,status:StatusRegistro.ATIVO}
      ],
      zuca_clientes: [
        {id:'c1',nome:'Boutique Passo Fino',documento:'12.345.678/0001-90',telefone:'(11) 3222-1100',whatsapp:'(11) 99988-1200',email:'compras@passofino.com',cidade:'São Paulo',estado:'SP',observacoes:'Cliente premium desde 2021.',status:StatusRegistro.ATIVO},
        {id:'c2',nome:'Calçados Horizonte',documento:'45.222.333/0001-10',telefone:'(31) 3344-1200',whatsapp:'(31) 98877-2200',email:'contato@horizonte.com',cidade:'Belo Horizonte',estado:'MG',observacoes:'Preferência por linha social.',status:StatusRegistro.ATIVO},
        {id:'c3',nome:'Empório do Couro',documento:'28.421.700/0001-21',telefone:'(21) 3122-9911',whatsapp:'(21) 99771-4432',email:'pedidos@emporio.com',cidade:'Rio de Janeiro',estado:'RJ',observacoes:'Atendimento quinzenal.',status:StatusRegistro.ATIVO}
      ],
      zuca_produtos: produtos, zuca_catalogos: produtos,
      zuca_estoque: produtos.map((p, indice) => ({id:`e${indice+1}`,produtoId:p.id,produto:p.nome,codigo:p.codigo,tamanho:p.tamanho,cor:p.cor,quantidadeAtual:[18,5,9][indice],quantidadeMinima:8,localizacao:`A${indice+1}-P2`,status:StatusRegistro.ATIVO})),
      zuca_movimentacoes: [],
      zuca_pedidos: [
        {id:'v1',numero:'PED-1048',clienteId:'c1',clienteNome:'Boutique Passo Fino',data:'2026-06-18',vendedor:'Carlos Lima',itens:[{produtoId:'p1',produtoNome:'Oxford Verona',quantidade:4,valorUnitario:489.9,subtotal:1959.6}],valorTotal:1959.6,status:StatusPedido.PEDIDO},
        {id:'v2',numero:'PED-1047',clienteId:'c2',clienteNome:'Calçados Horizonte',data:'2026-06-17',vendedor:'Carlos Lima',itens:[{produtoId:'p2',produtoNome:'Mocassim Firenze',quantidade:6,valorUnitario:399.9,subtotal:2399.4}],valorTotal:2399.4,status:StatusPedido.FINALIZADO}
      ],
      zuca_agenda: [
        {id:'a1',titulo:'Visita Passo Fino',descricao:'Apresentar coleção inverno',data:'2026-06-20',horario:'10:00',tipo:TipoEventoAgenda.VISITA,cliente:'Boutique Passo Fino'},
        {id:'a2',titulo:'Campanha Dia dos Pais',descricao:'Reunião de lançamento',data:'2026-06-23',horario:'14:30',tipo:TipoEventoAgenda.CAMPANHA}
      ],
      zuca_avisos: [{id:'av1',titulo:'Coleção Essenza 2026',mensagem:'A nova coleção já está disponível. Confira os modelos e condições especiais de lançamento.',tipo:'campanha',ativo:true}],
      zuca_indicadores: [
        {titulo:'Vendas no mês',valor:'R$ 84.320',variacao:12.5,icone:'↗',destaque:true},
        {titulo:'Clientes ativos',valor:'248',variacao:8.2,icone:'◉'},
        {titulo:'Produtos',valor:'126',variacao:4.1,icone:'◇'},
        {titulo:'Meta atingida',valor:'78%',variacao:10,icone:'◎'}
      ]
    };
    Object.entries(dados).forEach(([chave, valor]) => this.armazenamento.salvar(chave, valor));
    this.armazenamento.salvar('zuca_banco_inicializado', true);
  }
}
