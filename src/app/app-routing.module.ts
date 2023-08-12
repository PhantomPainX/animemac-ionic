import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  // {
  //   path: '',
  //   loadChildren: () => import('./tablinks/tablinks.module').then(m => m.TablinksPageModule)
  // },
  {
    path: '',
    redirectTo: '',
    pathMatch: 'full'
  },
  {
    path: 'detail/:id',
    loadChildren: () => import('./pages/detail/detail.module').then( m => m.DetailPageModule)
  },
  {
    path: 'episode',
    loadChildren: () => import('./pages/episode/episode.module').then( m => m.EpisodePageModule)
  },
  {
    path: 'loader',
    loadChildren: () => import('./modals/loader/loader.module').then( m => m.LoaderPageModule)
  },
  {
    path: 'tablinks',
    loadChildren: () => import('./tablinks/tablinks.module').then( m => m.TablinksPageModule)
  },
  {
    path: 'signin',
    loadChildren: () => import('./pages/auth/signin/signin.module').then( m => m.SigninPageModule)
  },
  {
    path: 'settings',
    loadChildren: () => import('./modals/settings/settings.module').then( m => m.SettingsPageModule)
  },
  {
    path: 'image-viewer',
    loadChildren: () => import('./modals/image-viewer/image-viewer.module').then( m => m.ImageViewerPageModule)
  },
  {
    path: 'terms',
    loadChildren: () => import('./modals/terms/terms.module').then( m => m.TermsPageModule)
  },
  {
    path: 'register',
    loadChildren: () => import('./pages/auth/register/register.module').then( m => m.RegisterPageModule)
  },
  {
    path: 'forgot-password',
    loadChildren: () => import('./pages/auth/forgot-password/forgot-password.module').then( m => m.ForgotPasswordPageModule)
  },
  {
    path: 'custom-modal',
    loadChildren: () => import('./modals/custom-modal/custom-modal.module').then( m => m.CustomModalPageModule)
  },
  {
    path: 'see-more',
    loadChildren: () => import('./pages/home/see-more/see-more.module').then( m => m.SeeMorePageModule)
  },
  {
    path: 'welcome',
    loadChildren: () => import('./pages/welcome/welcome.module').then( m => m.WelcomePageModule)
  },
  {
    path: 'comment',
    loadChildren: () => import('./modals/comment/comment.module').then( m => m.CommentPageModule)
  },
  {
    path: 'profile',
    loadChildren: () => import('./pages/profile/profile.module').then( m => m.ProfilePageModule)
  },
  {
    path: 'admin',
    loadChildren: () => import('./pages/admin/admin.module').then( m => m.AdminPageModule)
  },
  {
    path: 'purchases',
    loadChildren: () => import('./pages/purchases/purchases.module').then( m => m.PurchasesPageModule)
  },
  {
    path: 'download-video',
    loadChildren: () => import('./modals/download-video/download-video.module').then( m => m.DownloadVideoPageModule)
  },
  {
    path: 'artificial-intelligence/:type/:anime_name/:image/:animeid/:token',
    loadChildren: () => import('./pages/artificial-intelligence/artificial-intelligence.module').then( m => m.ArtificialIntelligencePageModule)
  },
  {
    path: 'web-video-player',
    loadChildren: () => import('./modals/web-video-player/web-video-player.module').then( m => m.WebVideoPlayerPageModule)
  },
  {
    path: 'seen-episodes-history',
    loadChildren: () => import('./pages/seen-episodes-history/seen-episodes-history.module').then( m => m.SeenEpisodesHistoryPageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
