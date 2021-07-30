import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CoreModule } from '@jl/common/core';
import { CommonSharedModule } from '@jl/common/shared/shared.module';
import {
  NgxPermissionsModule,
} from 'ngx-permissions';

import { CommonMobileModule } from '../../mobile.module';

import { CategoryListItemComponent } from './components/category-list-item/category-list-item.component';
import { CategoryListComponent } from './components/category-list/category-list.component';
import { PaginatorComponent } from './components/paginator/paginator.component';
import { PostsListItemComponent } from './components/posts-list-item/posts-list-item.component';
import { PostsListComponent } from './components/posts-list/posts-list.component';
import { TopicSearchComponent } from './components/topic-search/topic-search.component';
import { TopicsListItemComponent } from './components/topics-list-item/topics-list-item.component';
import { TopicsListComponent } from './components/topics-list/topics-list.component';
import { CreateTopicPageComponent } from './create-topic-page/create-topic-page.component';
import { FollowedTopicsPageComponent } from './followed-topics-page/followed-topics.component';
import { ForumCategoryComponent } from './forum-category-page/forum-category.component';
import { ForumComponent } from './forum-page/forum.component';
import { EditPostModalComponent } from './modals/edit-post-modal/edit-post-modal.component';
import { TopicPageComponent } from './topic-page/topic-page.component';

const routes: Routes = [
  {
    path: '',
    component: ForumComponent,
  },
  {
    path: 'followed-topics',
    component: FollowedTopicsPageComponent,
  },
  {
    path: 'category/:id',
    component: ForumCategoryComponent,
  },
  {
    path: 'create-topic',
    component: CreateTopicPageComponent,
  },
  {
    path: 'topic/:id',
    component: TopicPageComponent,
  },
  {
    path: 'topic/:id/:postPosition',
    component: TopicPageComponent,
  },
];

/** Forum module. */
@NgModule({
  declarations: [
    ForumComponent,
    TopicSearchComponent,
    CategoryListComponent,
    TopicsListComponent,
    ForumCategoryComponent,
    PaginatorComponent,
    CategoryListItemComponent,
    TopicsListItemComponent,
    TopicPageComponent,
    PostsListComponent,
    PostsListItemComponent,
    EditPostModalComponent,
    CreateTopicPageComponent,
    FollowedTopicsPageComponent,
  ],
  entryComponents: [
    EditPostModalComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    CommonSharedModule,
    CoreModule,
    NgxPermissionsModule.forChild(),
    MatTableModule,
    CommonMobileModule,
  ],
})
export class ForumModule { }
