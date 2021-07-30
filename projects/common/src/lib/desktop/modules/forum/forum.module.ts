import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material';
import { Routes, RouterModule } from '@angular/router';
import { CoreModule } from '@jl/common/core';
import { CommonSharedModule } from '@jl/common/shared/shared.module';
import {
  NgxPermissionsModule,
} from 'ngx-permissions';

import { CommonDesktopModule } from '../../desktop.module';

import { AuthorLinkComponent } from './components/author-link/author-link.component';
import { CategoryListComponent } from './components/category-list/category-list.component';
import { CategoryTableComponent } from './components/category-table/category-table.component';
import { PaginationShortcutComponent } from './components/pagination-shortcut/pagination-shortcut.component';
import { PaginatorComponent } from './components/paginator/paginator.component';
import { TopicSearchResultComponent } from './components/topic-search-result/topic-search-result.component';
import { TopicSearchComponent } from './components/topic-search/topic-search.component';
import { TopicsTableComponent } from './components/topics-table/topics-table.component';
import { FollowedTopicsPageComponent } from './followed-topics-page/followed-topics-page.component';
import { ForumCategoryComponent } from './forum-category-page/forum-category.component';
import { ForumComponent } from './forum-page/forum.component';
import { TopicDetailsComponent } from './topic-details-page/topic-details.component';
import { TopicReplyComponent } from './topic-reply-page/topic-reply.component';

const routes: Routes = [
  {
    path: '',
    component: ForumComponent,
    children: [
      { path: '', pathMatch: 'full', component: CategoryListComponent },
      {
        path: 'topics',
        component: TopicSearchResultComponent,
      },
    ],
  },
  { path: 'category/:categoryId', component: ForumCategoryComponent },
  { path: 'topic/:topicId/reply', component: TopicReplyComponent },
  { path: 'topic/:topicId/edit/:postId', component: TopicReplyComponent },
  {
    path: 'topic/:topicId',
    pathMatch: 'full',
    redirectTo: 'topic/:topicId/0',
  },
  {
    path: 'topic/:topicId/:postIndex',
    component: TopicDetailsComponent,
  },
  { path: 'followed-topics', component: FollowedTopicsPageComponent },
];

/** Forum module. */
@NgModule({
  declarations: [
    ForumComponent,
    ForumCategoryComponent,
    CategoryListComponent,
    TopicSearchComponent,
    TopicSearchResultComponent,
    TopicDetailsComponent,
    TopicReplyComponent,
    FollowedTopicsPageComponent,
    TopicsTableComponent,
    CategoryTableComponent,
    PaginatorComponent,
    AuthorLinkComponent,
    PaginationShortcutComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
    CommonSharedModule,
    CoreModule,
    NgxPermissionsModule.forChild(),
    MatTableModule,
    CommonDesktopModule,
  ],
})
export class ForumModule { }
