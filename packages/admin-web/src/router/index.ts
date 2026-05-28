import { createRouter, createWebHistory } from 'vue-router';
import Layout from '../layouts/AdminLayout.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: Layout,
      redirect: '/dashboard',
      children: [
        { path: 'dashboard', component: () => import('../views/Dashboard.vue'), meta: { title: '概览' } },
        { path: 'elders', component: () => import('../views/Elders.vue'), meta: { title: '老人档案' } },
        { path: 'schedules', component: () => import('../views/Schedules.vue'), meta: { title: '排班派单' } },
        { path: 'school-cooperation', component: () => import('../views/SchoolCooperation.vue'), meta: { title: '院校合作' } },
        { path: 'exports', component: () => import('../views/Exports.vue'), meta: { title: '导出中心' } },
      ],
    },
  ],
});

export default router;
