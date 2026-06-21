import { Injectable } from '@angular/core';
import { Usuario } from '../modelos/modelos';
import { PerfilAcesso } from '../enums/perfil-acesso.enum';
import { StatusRegistro } from '../enums/status-registro.enum';
import { RepositorioLocal } from './repositorio-local.service';

@Injectable({ providedIn: 'root' })
export class UsuarioService extends RepositorioLocal<Usuario> {
  protected readonly chave = 'zuca_usuarios';
  obterUsuarios(): Usuario[] { return this.obterTodos(); }
  obterUsuarioPorId(id:string): Usuario | undefined { return this.obterPorId(id); }
  criarUsuario(usuario: Omit<Usuario,'id'>): Usuario { return this.criar({...usuario,id:this.gerarId('usu')}); }
  alterarUsuario(usuario:Usuario): Usuario { return this.alterar(usuario); }
  inativarUsuario(id:string): void { const usuario=this.obterPorId(id); if(usuario) this.alterar({...usuario,status:StatusRegistro.INATIVO}); }
  alterarPerfilUsuario(id:string,perfil:PerfilAcesso): void { const usuario=this.obterPorId(id); if(usuario) this.alterar({...usuario,perfil}); }
}
