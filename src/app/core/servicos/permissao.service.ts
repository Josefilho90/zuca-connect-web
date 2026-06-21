import { Injectable, inject } from '@angular/core';
import { PerfilAcesso } from '../enums/perfil-acesso.enum';
import { AutenticacaoService } from './autenticacao.service';

@Injectable({providedIn:'root'})
export class PermissaoService {
  private readonly autenticacao=inject(AutenticacaoService);
  possuiPerfil(perfis:PerfilAcesso[]):boolean{return this.autenticacao.possuiPerfil(perfis);}
  pertenceLoja(clienteLojaId:string):boolean{const usuario=this.autenticacao.obterUsuarioLogado();return !!usuario?.clienteLojaId&&usuario.clienteLojaId===clienteLojaId;}
  ehUsuarioLoja():boolean{return this.possuiPerfil([PerfilAcesso.CLIENTE_LOJA,PerfilAcesso.VENDEDOR_LOJA]);}
  rotaInicial():string{const perfil=this.autenticacao.obterUsuarioLogado()?.perfil;if(perfil===PerfilAcesso.CLIENTE_LOJA)return '/loja/dashboard';if(perfil===PerfilAcesso.VENDEDOR_LOJA)return '/vendedor/dashboard';return '/home';}
}
