import { Injectable, inject } from '@angular/core';
import { Cliente } from '../modelos/modelos';
import { ClienteLoja } from '../modelos/loja.model';
import { PerfilAcesso } from '../enums/perfil-acesso.enum';
import { StatusRegistro } from '../enums/status-registro.enum';
import { RepositorioLocal } from './repositorio-local.service';
import { AutenticacaoService } from './autenticacao.service';

@Injectable({ providedIn: 'root' })
export class ClienteService extends RepositorioLocal<Cliente> {
  protected readonly chave = 'zuca_clientes';
  private readonly autenticacao = inject(AutenticacaoService);
  obterClientes(): Cliente[] { const usuario=this.autenticacao.obterUsuarioLogado();if(usuario?.perfil!==PerfilAcesso.VENDEDOR)return this.obterTodos();const ids=this.armazenamento.obter<ClienteLoja[]>('zuca_clientes_loja',[]).filter(loja=>loja.vendedorFabrica===usuario.nome).map(loja=>loja.clienteId);return this.obterTodos().filter(cliente=>ids.includes(cliente.id)); }
  obterClientePorId(id: string): Cliente | undefined { return this.obterPorId(id); }
  criarCliente(cliente: Omit<Cliente, 'id'>): Cliente { return this.criar({ ...cliente, id: this.gerarId('cli') }); }
  alterarCliente(cliente: Cliente): Cliente { return this.alterar(cliente); }
  inativarCliente(id: string): void { const cliente = this.obterPorId(id); if (cliente) this.alterar({ ...cliente, status: StatusRegistro.INATIVO }); }
  pesquisarClientes(termo: string): Cliente[] { const busca = termo.toLowerCase(); return this.obterClientes().filter(c => `${c.nome} ${c.documento} ${c.cidade}`.toLowerCase().includes(busca)); }
}
