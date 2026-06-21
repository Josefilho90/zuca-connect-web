import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { PerfilAcesso } from '../../core/enums/perfil-acesso.enum';
import { AutenticacaoService } from '../../core/servicos/autenticacao.service';
import { PermissaoService } from '../../core/servicos/permissao.service';

interface ItemMenu { rotulo:string;rota:string;icone:string;perfis:PerfilAcesso[]; }
@Component({selector:'app-layout-principal',imports:[RouterOutlet,RouterLink,RouterLinkActive],templateUrl:'./layout-principal.component.html',styleUrl:'./layout-principal.component.scss',changeDetection:ChangeDetectionStrategy.OnPush})
export class LayoutPrincipalComponent {
  readonly autenticacao=inject(AutenticacaoService);private readonly permissao=inject(PermissaoService);readonly menuAberto=signal(false);readonly rotaInicial=this.permissao.rotaInicial();
  private readonly todos=[PerfilAcesso.OWNER,PerfilAcesso.GERENTE,PerfilAcesso.VENDEDOR]; private readonly gestao=[PerfilAcesso.OWNER,PerfilAcesso.GERENTE];
  private readonly itens:ItemMenu[]=[
    {rotulo:'Home',rota:'/home',icone:'⌂',perfis:this.todos},{rotulo:'Dashboard',rota:'/dashboard',icone:'◫',perfis:this.gestao},
    {rotulo:'Clientes',rota:'/clientes',icone:'◎',perfis:this.todos},{rotulo:'Agenda',rota:'/agenda',icone:'□',perfis:this.todos},
    {rotulo:'Pedidos',rota:'/pedidos',icone:'◇',perfis:this.todos},{rotulo:'Catálogo',rota:'/catalogo',icone:'▱',perfis:this.todos},
    {rotulo:'Estoque',rota:'/estoque',icone:'▦',perfis:this.gestao},{rotulo:'Relatórios',rota:'/relatorios',icone:'↗',perfis:this.gestao},
    {rotulo:'Administração',rota:'/administracao/usuarios',icone:'⚙',perfis:[PerfilAcesso.OWNER]},
    {rotulo:'Dashboard da Loja',rota:'/loja/dashboard',icone:'◫',perfis:[PerfilAcesso.CLIENTE_LOJA]},{rotulo:'Catálogo da Fábrica',rota:'/loja/catalogo',icone:'▱',perfis:[PerfilAcesso.CLIENTE_LOJA]},{rotulo:'Novo Pedido',rota:'/loja/novo-pedido',icone:'＋',perfis:[PerfilAcesso.CLIENTE_LOJA]},{rotulo:'Meus Pedidos',rota:'/loja/meus-pedidos',icone:'◇',perfis:[PerfilAcesso.CLIENTE_LOJA]},{rotulo:'Estoque da Loja',rota:'/loja/estoque',icone:'▦',perfis:[PerfilAcesso.CLIENTE_LOJA]},{rotulo:'Vendedores da Loja',rota:'/loja/vendedores',icone:'◎',perfis:[PerfilAcesso.CLIENTE_LOJA]},{rotulo:'Metas da Loja',rota:'/loja/metas',icone:'↗',perfis:[PerfilAcesso.CLIENTE_LOJA]},{rotulo:'Relatórios da Loja',rota:'/loja/relatorios',icone:'▤',perfis:[PerfilAcesso.CLIENTE_LOJA]},
    {rotulo:'Dashboard do Vendedor',rota:'/vendedor/dashboard',icone:'◫',perfis:[PerfilAcesso.VENDEDOR_LOJA]},{rotulo:'Catálogo da Fábrica',rota:'/vendedor/catalogo',icone:'▱',perfis:[PerfilAcesso.VENDEDOR_LOJA]},{rotulo:'Novo Pedido',rota:'/vendedor/novo-pedido',icone:'＋',perfis:[PerfilAcesso.VENDEDOR_LOJA]},{rotulo:'Meus Pedidos',rota:'/vendedor/meus-pedidos',icone:'◇',perfis:[PerfilAcesso.VENDEDOR_LOJA]},{rotulo:'Minhas Metas',rota:'/vendedor/metas',icone:'↗',perfis:[PerfilAcesso.VENDEDOR_LOJA]}
  ];
  readonly menu=computed(()=>this.itens.filter(item=>this.autenticacao.possuiPerfil(item.perfis)));
  fecharMenu():void{this.menuAberto.set(false);}
}
