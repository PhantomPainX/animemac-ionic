import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TablinksPage } from './tablinks.page';

const routes: Routes = [
  {
    path: '',
    component: TablinksPage,
    children: [
      {
        path: 'home',
        loadChildren: () => import('../pages/home/home.module').then( m => m.HomePageModule)
      },
      {
        path: 'directorio',
        loadChildren: () => import('../pages/directorio/directorio.module').then( m => m.DirectorioPageModule)
      },
      {
        path: 'favorites',
        loadChildren: () => import('../pages/favorites/favorites.module').then( m => m.FavoritesPageModule)
      },
      {
        path: 'social-comments',
        loadChildren: () => import('../pages/social-comments/social-comments.module').then( m => m.SocialCommentsPageModule)
      },
      {
        path: 'discover',
        loadChildren: () => import('../pages/discover/discover.module').then( m => m.DiscoverPageModule)
      },
      {
        path: '',
        redirectTo: '/tablinks/home',
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TablinksPageRoutingModule {}
