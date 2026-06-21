import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { PerfilAcesso } from '../enums/perfil-acesso.enum';
import { AutenticacaoService } from '../servicos/autenticacao.service';
import { PermissaoService } from '../servicos/permissao.service';

export const perfilGuard: CanActivateFn = route => {
  const perfis = (route.data['perfis'] ?? []) as PerfilAcesso[];
  return inject(AutenticacaoService).possuiPerfil(perfis) ? true : inject(Router).createUrlTree([inject(PermissaoService).rotaInicial()]);
};
