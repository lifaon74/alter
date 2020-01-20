import { IModule } from '../../../../core/bootstrap';
import { AppWindowComponent } from './window/window.component';
import { AppApplicationsListComponent } from './applications-list/applications-list.component';

export const DESKTOP_APP_MODULE: IModule = {
  components: [
    AppWindowComponent,
    AppApplicationsListComponent,
  ],
};
