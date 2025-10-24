import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PCListComponent } from './pc-list.component';
import { PCAddEditComponent } from './pc-add-edit.component';
import { PCComponentsComponent } from './pc-components.component';
import { PCBuildTemplateListComponent } from './pc-build-template-list.component';
import { PCBuildTemplateEditorComponent } from './pc-build-template-editor.component';
import { AuthGuard } from '../_helpers';
import { Role } from '../_models';

const routes: Routes = [
    { path: '', component: PCListComponent, canActivate: [AuthGuard], data: { roles: [Role.SuperAdmin, Role.Admin, Role.Staff, Role.Viewer] } },
    { path: 'add', component: PCAddEditComponent, canActivate: [AuthGuard], data: { roles: [Role.SuperAdmin, Role.Admin, Role.Staff] } },
    { path: 'templates', component: PCBuildTemplateListComponent, canActivate: [AuthGuard], data: { roles: [Role.SuperAdmin, Role.Admin, Role.Staff, Role.Viewer] } },
    { path: 'templates/add', component: PCBuildTemplateEditorComponent, canActivate: [AuthGuard], data: { roles: [Role.SuperAdmin, Role.Admin] } },
    { path: 'templates/:id/view', component: PCBuildTemplateEditorComponent, canActivate: [AuthGuard], data: { roles: [Role.SuperAdmin, Role.Admin, Role.Staff, Role.Viewer] } },
    { path: 'templates/:id/edit', component: PCBuildTemplateEditorComponent, canActivate: [AuthGuard], data: { roles: [Role.SuperAdmin, Role.Admin] } },
    { path: 'templates/:id', component: PCBuildTemplateEditorComponent, canActivate: [AuthGuard], data: { roles: [Role.SuperAdmin, Role.Admin, Role.Staff, Role.Viewer] } },
    { path: 'edit/:id', component: PCAddEditComponent, canActivate: [AuthGuard], data: { roles: [Role.SuperAdmin, Role.Admin, Role.Staff] } },
    { path: ':id/components', component: PCComponentsComponent, canActivate: [AuthGuard], data: { roles: [Role.SuperAdmin, Role.Admin, Role.Staff, Role.Viewer] } },
    { path: ':id', component: PCAddEditComponent, canActivate: [AuthGuard], data: { roles: [Role.SuperAdmin, Role.Admin, Role.Staff, Role.Viewer] } }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class PCRoutingModule { } 