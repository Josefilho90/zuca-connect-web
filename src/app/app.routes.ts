import { Routes } from '@angular/router';
import { PerfilAcesso } from './core/enums/perfil-acesso.enum';
import { autenticacaoGuard } from './core/guards/autenticacao.guard';
import { perfilGuard } from './core/guards/perfil.guard';

const TODOS = [PerfilAcesso.OWNER, PerfilAcesso.GERENTE, PerfilAcesso.VENDEDOR];
const GESTAO = [PerfilAcesso.OWNER, PerfilAcesso.GERENTE];
const LOJA = [PerfilAcesso.CLIENTE_LOJA];
const USUARIOS_LOJA = [PerfilAcesso.CLIENTE_LOJA, PerfilAcesso.VENDEDOR_LOJA];
const VENDEDOR_LOJA = [PerfilAcesso.VENDEDOR_LOJA];

export const routes: Routes = [
  { path:'login', loadComponent:() => import('./features/autenticacao/login/login.component').then(c => c.LoginComponent) },
  {
    path:'', canActivate:[autenticacaoGuard], loadComponent:() => import('./layout/layout-principal/layout-principal.component').then(c => c.LayoutPrincipalComponent),
    children:[
      {path:'home',data:{perfis:TODOS},canActivate:[perfilGuard],loadComponent:()=>import('./features/home/home.component').then(c=>c.HomeComponent)},
      {path:'dashboard',data:{perfis:GESTAO},canActivate:[perfilGuard],loadComponent:()=>import('./features/dashboard/dashboard.component').then(c=>c.DashboardComponent)},
      {path:'clientes',data:{perfis:TODOS},canActivate:[perfilGuard],loadComponent:()=>import('./features/clientes/clientes.component').then(c=>c.ClientesComponent)},
      {path:'clientes/:id/crm',data:{perfis:TODOS},canActivate:[perfilGuard],loadComponent:()=>import('./features/clientes/crm-cliente.component').then(c=>c.CrmClienteComponent)},
      {path:'clientes/novo',redirectTo:'clientes'},
      {path:'clientes/:id',redirectTo:'clientes'},
      {path:'clientes/:id/editar',redirectTo:'clientes'},
      {path:'agenda',data:{perfis:TODOS},canActivate:[perfilGuard],loadComponent:()=>import('./features/agenda/agenda.component').then(c=>c.AgendaComponent)},
      {path:'vendas',data:{perfis:TODOS},canActivate:[perfilGuard],loadComponent:()=>import('./features/vendas/vendas.component').then(c=>c.VendasComponent)},
      {path:'pedidos',data:{perfis:TODOS},canActivate:[perfilGuard],loadComponent:()=>import('./features/pedidos/pedidos-fabrica.component').then(c=>c.PedidosFabricaComponent)},
      {path:'vendas/novo',redirectTo:'vendas'},
      {path:'vendas/:id',redirectTo:'vendas'},
      {path:'vendas/:id/editar',redirectTo:'vendas'},
      {path:'catalogo',data:{perfis:TODOS},canActivate:[perfilGuard],loadComponent:()=>import('./features/catalogo/catalogo.component').then(c=>c.CatalogoComponent)},
      {path:'estoque',data:{perfis:GESTAO},canActivate:[perfilGuard],loadComponent:()=>import('./features/estoque/estoque.component').then(c=>c.EstoqueComponent)},
      {path:'relatorios',data:{perfis:GESTAO},canActivate:[perfilGuard],loadComponent:()=>import('./features/relatorios/relatorios.component').then(c=>c.RelatoriosComponent)},
      {path:'administracao/usuarios',data:{perfis:[PerfilAcesso.OWNER]},canActivate:[perfilGuard],loadComponent:()=>import('./features/administracao/administracao.component').then(c=>c.AdministracaoComponent)},
      {path:'loja/dashboard',data:{perfis:LOJA},canActivate:[perfilGuard],loadComponent:()=>import('./features/loja/dashboard-loja.component').then(c=>c.DashboardLojaComponent)},
      {path:'loja/catalogo',data:{perfis:USUARIOS_LOJA},canActivate:[perfilGuard],loadComponent:()=>import('./features/loja/catalogo-fabrica.component').then(c=>c.CatalogoFabricaComponent)},
      {path:'loja/novo-pedido',data:{perfis:USUARIOS_LOJA},canActivate:[perfilGuard],loadComponent:()=>import('./features/loja/novo-pedido-loja.component').then(c=>c.NovoPedidoLojaComponent)},
      {path:'loja/meus-pedidos',data:{perfis:LOJA},canActivate:[perfilGuard],loadComponent:()=>import('./features/loja/meus-pedidos.component').then(c=>c.MeusPedidosComponent)},
      {path:'loja/estoque',data:{perfis:LOJA},canActivate:[perfilGuard],loadComponent:()=>import('./features/loja/estoque-loja.component').then(c=>c.EstoqueLojaComponent)},
      {path:'loja/vendedores',data:{perfis:LOJA},canActivate:[perfilGuard],loadComponent:()=>import('./features/loja/vendedores-loja.component').then(c=>c.VendedoresLojaComponent)},
      {path:'loja/metas',data:{perfis:LOJA},canActivate:[perfilGuard],loadComponent:()=>import('./features/loja/metas-loja.component').then(c=>c.MetasLojaComponent)},
      {path:'loja/relatorios',data:{perfis:LOJA},canActivate:[perfilGuard],loadComponent:()=>import('./features/loja/relatorios-loja.component').then(c=>c.RelatoriosLojaComponent)},
      {path:'vendedor/dashboard',data:{perfis:VENDEDOR_LOJA},canActivate:[perfilGuard],loadComponent:()=>import('./features/loja/dashboard-loja.component').then(c=>c.DashboardLojaComponent)},
      {path:'vendedor/catalogo',data:{perfis:VENDEDOR_LOJA},canActivate:[perfilGuard],loadComponent:()=>import('./features/loja/catalogo-fabrica.component').then(c=>c.CatalogoFabricaComponent)},
      {path:'vendedor/novo-pedido',data:{perfis:VENDEDOR_LOJA},canActivate:[perfilGuard],loadComponent:()=>import('./features/loja/novo-pedido-loja.component').then(c=>c.NovoPedidoLojaComponent)},
      {path:'vendedor/meus-pedidos',data:{perfis:VENDEDOR_LOJA},canActivate:[perfilGuard],loadComponent:()=>import('./features/loja/meus-pedidos.component').then(c=>c.MeusPedidosComponent)},
      {path:'vendedor/metas',data:{perfis:VENDEDOR_LOJA},canActivate:[perfilGuard],loadComponent:()=>import('./features/loja/minhas-metas.component').then(c=>c.MinhasMetasComponent)},
      {path:'',pathMatch:'full',redirectTo:'home'}
    ]
  },
  {path:'**',redirectTo:'home'}
];
