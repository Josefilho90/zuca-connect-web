import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AutenticacaoService } from '../servicos/autenticacao.service';

export const autenticacaoGuard: CanActivateFn = () => {
  const autenticacao = inject(AutenticacaoService);
  return autenticacao.estaAutenticado() ? true : inject(Router).createUrlTree(['/login']);
};
