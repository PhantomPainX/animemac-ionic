import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AdminPage } from './admin.page';

const routes: Routes = [
  {
    path: '',
    component: AdminPage
  },
  {
    path: 'see-users',
    loadChildren: () => import('./see-users/see-users.module').then( m => m.SeeUsersPageModule)
  },
  {
    path: 'push-notification',
    loadChildren: () => import('./push-notification/push-notification.module').then( m => m.PushNotificationPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminPageRoutingModule {}
