import { Injectable, inject } from '@angular/core';
import { AtendimentoCrm, CompraCrm, CrmCliente, ObservacaoCrm, ProximaAcaoCrm, VendedorCrm } from '../../core/modelos/crm-cliente.model';
import { Cliente, Pedido, Produto, Usuario } from '../../core/modelos/modelos';
import { ClienteLoja, PedidoLoja } from '../../core/modelos/loja.model';
import { StatusPedido } from '../../core/enums/status-registro.enum';
import { ArmazenamentoService } from '../../core/servicos/armazenamento.service';
import { AutenticacaoService } from '../../core/servicos/autenticacao.service';
import { PerfilAcesso } from '../../core/enums/perfil-acesso.enum';

@Injectable({ providedIn: 'root' })
export class CrmClienteService {
  private readonly armazenamento = inject(ArmazenamentoService);
  private readonly autenticacao = inject(AutenticacaoService);
  private readonly chaveAtendimentos = 'zuca_crm_atendimentos';
  private readonly chaveObservacoes = 'zuca_crm_observacoes';
  private readonly chaveProximasAcoes = 'zuca_crm_proximas_acoes';

  obterCrm(clienteId: string): CrmCliente | null {
    const cliente = this.obterClientes().find(item => item.id === clienteId);
    if (!cliente) return null;
    const usuario=this.autenticacao.obterUsuarioLogado();const lojaVinculada=this.armazenamento.obter<ClienteLoja[]>('zuca_clientes_loja',[]).find(loja=>loja.clienteId===clienteId);if(usuario?.perfil===PerfilAcesso.VENDEDOR&&lojaVinculada?.vendedorFabrica!==usuario.nome)return null;

    const pedidos = this.obterPedidos().filter(pedido => pedido.clienteId === clienteId).sort((a, b) => b.data.localeCompare(a.data));
    const comprasValidas = pedidos.filter(pedido => pedido.status === StatusPedido.PEDIDO || pedido.status === StatusPedido.FINALIZADO);
    const loja = this.armazenamento.obter<ClienteLoja[]>('zuca_clientes_loja', []).find(item => item.clienteId === clienteId);
    const pedidosLoja = loja ? this.armazenamento.obter<PedidoLoja[]>('zuca_pedidos_loja', []).filter(pedido => pedido.clienteLojaId === loja.id).sort((a,b) => b.data.localeCompare(a.data)) : [];
    const atendimentos = this.obterAtendimentos(cliente, pedidos);
    const observacoes = this.obterObservacoes(cliente);
    const indicadores = this.calcularIndicadores(cliente, comprasValidas);
    const pedidosLojaValidos = pedidosLoja.filter(pedido => !['RASCUNHO','RECUSADO','CANCELADO'].includes(pedido.status));
    const totalLoja = pedidosLojaValidos.reduce((total,pedido) => total + pedido.total, 0);
    if (pedidosLojaValidos.length) { indicadores.totalComprado += totalLoja; indicadores.quantidadeCompras += pedidosLojaValidos.length; indicadores.ticketMedio = indicadores.totalComprado / indicadores.quantidadeCompras; indicadores.ultimaCompra = [indicadores.ultimaCompra, pedidosLojaValidos[0]?.data].filter(Boolean).sort().reverse()[0] ?? null; }

    return {
      cliente,
      dataCadastro: this.calcularDataCadastro(cliente.id),
      indicadores,
      compras: [...this.mapearComprasLoja(pedidosLoja), ...this.mapearCompras(pedidos)].sort((a,b) => b.data.localeCompare(a.data)),
      vendedor: this.obterVendedorResponsavel(pedidos, atendimentos),
      atendimentos,
      observacoes,
      proximasAcoes: this.obterProximasAcoes(cliente, pedidos)
    };
  }

  adicionarObservacao(clienteId: string, texto: string, usuario: string): ObservacaoCrm {
    const conteudo = texto.trim();
    if (!conteudo) throw new Error('Informe uma observação antes de salvar.');
    const observacao: ObservacaoCrm = { id: `obs-${Date.now()}`, clienteId, texto: conteudo, data: new Date().toISOString(), usuario };
    this.armazenamento.salvar(this.chaveObservacoes, [observacao, ...this.armazenamento.obter<ObservacaoCrm[]>(this.chaveObservacoes, [])]);
    return observacao;
  }

  salvarAtendimento(clienteId:string,dados:Omit<AtendimentoCrm,'id'|'clienteId'>,id?:string):void{const todos=this.armazenamento.obter<AtendimentoCrm[]>(this.chaveAtendimentos,[]);const atendimento:AtendimentoCrm={...dados,clienteId,id:id??`at-${Date.now()}`};this.armazenamento.salvar(this.chaveAtendimentos,id?todos.map(item=>item.id===id?atendimento:item):[atendimento,...todos]);}
  excluirAtendimento(id:string):void{this.armazenamento.salvar(this.chaveAtendimentos,this.armazenamento.obter<AtendimentoCrm[]>(this.chaveAtendimentos,[]).filter(item=>item.id!==id));}
  salvarProximaAcao(clienteId:string,dados:Omit<ProximaAcaoCrm,'id'|'clienteId'>,id?:string):void{const todas=this.armazenamento.obter<ProximaAcaoCrm[]>(this.chaveProximasAcoes,[]);const acao:ProximaAcaoCrm={...dados,clienteId,id:id??`acao-${Date.now()}`};this.armazenamento.salvar(this.chaveProximasAcoes,id?todas.map(item=>item.id===id?acao:item):[...todas,acao]);}
  excluirProximaAcao(id:string):void{this.armazenamento.salvar(this.chaveProximasAcoes,this.armazenamento.obter<ProximaAcaoCrm[]>(this.chaveProximasAcoes,[]).filter(item=>item.id!==id));}
  alternarProximaAcao(id:string):void{const todas=this.armazenamento.obter<ProximaAcaoCrm[]>(this.chaveProximasAcoes,[]);this.armazenamento.salvar(this.chaveProximasAcoes,todas.map(item=>item.id===id?{...item,concluida:!item.concluida}:item));}

  private calcularIndicadores(cliente: Cliente, pedidos: Pedido[]) {
    const totalComprado = pedidos.reduce((total, pedido) => total + pedido.valorTotal, 0);
    const itens = pedidos.flatMap(pedido => pedido.itens);
    const produtos = this.armazenamento.obter<Produto[]>('zuca_produtos', []);
    const produtoMaisComprado = this.obterMaisFrequente(itens.map(item => item.produtoNome));
    const categorias = itens.map(item => produtos.find(produto => produto.id === item.produtoId)?.categoria).filter((categoria): categoria is string => !!categoria);
    return {
      totalComprado,
      ticketMedio: pedidos.length ? totalComprado / pedidos.length : 0,
      ultimaCompra: pedidos[0]?.data ?? null,
      frequenciaCompra: pedidos.length > 1 ? `A cada ${Math.max(15, Math.round(180 / pedidos.length))} dias` : pedidos.length ? 'Compra inicial' : 'Sem compras',
      status: cliente.status,
      produtoMaisComprado: produtoMaisComprado || 'Sem histórico',
      categoriaMaisComprada: this.obterMaisFrequente(categorias) || 'Sem histórico',
      quantidadeCompras: pedidos.length
    };
  }

  private mapearCompras(pedidos: Pedido[]): CompraCrm[] {
    const formasPagamento = ['Pix', 'Boleto 30 dias', 'Cartão empresarial', 'Transferência bancária'];
    return pedidos.map((pedido, indice) => ({
      id: pedido.id,
      data: pedido.data,
      codigoVenda: pedido.numero,
      produtos: pedido.itens.map(item => item.produtoNome).join(', '),
      quantidade: pedido.itens.reduce((total, item) => total + item.quantidade, 0),
      valorTotal: pedido.valorTotal,
      vendedor: pedido.vendedor,
      formaPagamento: formasPagamento[indice % formasPagamento.length],
      status: pedido.status
    }));
  }

  private mapearComprasLoja(pedidos: PedidoLoja[]): CompraCrm[] { return pedidos.map(pedido => ({ id:pedido.id,data:pedido.data,codigoVenda:pedido.numero,produtos:pedido.itens.map(item=>item.nome).join(', '),quantidade:pedido.itens.reduce((total,item)=>total+item.quantidade,0),valorTotal:pedido.total,vendedor:pedido.vendedorLojaNome,formaPagamento:pedido.condicaoPagamento,status:pedido.status })); }

  private obterVendedorResponsavel(pedidos: Pedido[], atendimentos: AtendimentoCrm[]): VendedorCrm | null {
    const nome = pedidos[0]?.vendedor ?? atendimentos[0]?.vendedor;
    if (!nome) return null;
    const usuario = this.armazenamento.obter<Usuario[]>('zuca_usuarios', []).find(item => item.nome === nome);
    const totalVendido = pedidos.filter(pedido => pedido.vendedor === nome && pedido.status !== StatusPedido.CANCELADO).reduce((total, pedido) => total + pedido.valorTotal, 0);
    return { nome, email: usuario?.email ?? 'comercial@zucacouros.com', contato: `Ramal ${120 + (Number(usuario?.id.replace(/\D/g, '')) || 1)}`, quantidadeAtendimentos: atendimentos.filter(item => item.vendedor === nome).length, totalVendido };
  }

  private obterAtendimentos(cliente: Cliente, pedidos: Pedido[]): AtendimentoCrm[] {
    const todos = this.armazenamento.obter<AtendimentoCrm[]>(this.chaveAtendimentos, []);
    const existentes = todos.filter(item => item.clienteId === cliente.id);
    if (existentes.length) return existentes.sort((a, b) => b.data.localeCompare(a.data));
    const vendedor = pedidos[0]?.vendedor ?? 'Carlos Lima';
    const hoje = new Date();
    const atendimentos: AtendimentoCrm[] = [
      { id:`at-${cliente.id}-1`,clienteId:cliente.id,data:this.dataComDiferenca(hoje,-3),tipo:'WhatsApp',vendedor,descricao:'Contato para confirmar recebimento e satisfação com os calçados.',proximaAcao:'Enviar catálogo da próxima coleção',status:'CONCLUÍDO' },
      { id:`at-${cliente.id}-2`,clienteId:cliente.id,data:this.dataComDiferenca(hoje,-18),tipo:'Pós-venda',vendedor,descricao:'Acompanhamento da última compra e levantamento de reposição.',proximaAcao:'Retornar em 15 dias',status:'CONCLUÍDO' },
      { id:`at-${cliente.id}-3`,clienteId:cliente.id,data:this.dataComDiferenca(hoje,5),tipo:'Ligação',vendedor,descricao:'Apresentar condições comerciais para novo pedido.',proximaAcao:'Registrar nova oportunidade',status:'PENDENTE' }
    ];
    this.armazenamento.salvar(this.chaveAtendimentos, [...todos, ...atendimentos]);
    return atendimentos.sort((a, b) => b.data.localeCompare(a.data));
  }

  private obterObservacoes(cliente: Cliente): ObservacaoCrm[] {
    const todas = this.armazenamento.obter<ObservacaoCrm[]>(this.chaveObservacoes, []);
    const existentes = todas.filter(item => item.clienteId === cliente.id).sort((a, b) => b.data.localeCompare(a.data));
    if (existentes.length || !cliente.observacoes) return existentes;
    const inicial: ObservacaoCrm = { id:`obs-${cliente.id}-inicial`,clienteId:cliente.id,texto:cliente.observacoes,data:`${this.calcularDataCadastro(cliente.id)}T10:00:00`,usuario:'Equipe comercial' };
    this.armazenamento.salvar(this.chaveObservacoes, [...todas, inicial]);
    return [inicial];
  }

  private obterProximasAcoes(cliente: Cliente, pedidos: Pedido[]): ProximaAcaoCrm[] {
    const todas=this.armazenamento.obter<ProximaAcaoCrm[]>(this.chaveProximasAcoes,[]);const existentes=todas.filter(acao=>acao.clienteId===cliente.id).sort((a,b)=>a.dataPrevista.localeCompare(b.dataPrevista));if(existentes.length)return existentes;
    const base = new Date();
    const semCompras = !pedidos.some(pedido => pedido.status === StatusPedido.FINALIZADO || pedido.status === StatusPedido.PEDIDO);
    const acoes:ProximaAcaoCrm[] = [
      { id:`acao-${cliente.id}-1`,clienteId:cliente.id,titulo:semCompras?'Entrar em contato':'Fazer pós-venda',descricao:semCompras?'Entender o interesse nas linhas de calçados.':'Confirmar satisfação e necessidade de reposição.',dataPrevista:this.dataComDiferenca(base,3),concluida:false },
      { id:`acao-${cliente.id}-2`,clienteId:cliente.id,titulo:'Oferecer novo catálogo',descricao:'Apresentar os lançamentos e condições comerciais.',dataPrevista:this.dataComDiferenca(base,10),concluida:false },
      { id:`acao-${cliente.id}-3`,clienteId:cliente.id,titulo:cliente.status==='INATIVO'?'Recuperar cliente inativo':'Registrar nova oportunidade',descricao:'Criar oportunidade para a próxima coleção.',dataPrevista:this.dataComDiferenca(base,20),concluida:false }
    ];
    this.armazenamento.salvar(this.chaveProximasAcoes,[...todas,...acoes]);return acoes;
  }

  private obterMaisFrequente(valores: string[]): string { const totais = new Map<string, number>(); valores.forEach(valor => totais.set(valor, (totais.get(valor) ?? 0) + 1)); return [...totais.entries()].sort((a,b) => b[1] - a[1])[0]?.[0] ?? ''; }
  private calcularDataCadastro(id: string): string { const numero = Number(id.replace(/\D/g, '')) || 1; const data = new Date(); data.setMonth(data.getMonth() - 8 - (numero % 24)); return data.toISOString().slice(0,10); }
  private dataComDiferenca(base: Date, dias: number): string { const data = new Date(base); data.setDate(data.getDate() + dias); return data.toISOString().slice(0,10); }
  private obterClientes(): Cliente[] { return this.armazenamento.obter<Cliente[]>('zuca_clientes', []); }
  private obterPedidos(): Pedido[] { return this.armazenamento.obter<Pedido[]>('zuca_pedidos', []); }
}
