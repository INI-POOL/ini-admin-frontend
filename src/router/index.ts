import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import { isTokenValid } from "../utils/auth";

import AuthLayout from "../layouts/AuthLayout.vue";
import AppLayout from "../layouts/AppLayout.vue";

import RouteViewComponent from "../layouts/RouterBypass.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/:pathMatch(.*)*",
    redirect: { name: "dashboard" },
  },
  {
    name: "admin",
    path: "/",
    component: AppLayout,
    redirect: { name: "withdraw" },
    children: [
      {
        name: "dashboard",
        path: "dashboard",
        component: () => import("../pages/admin/dashboard/Dashboard.vue"),
        meta: { requiresAuth: true },
      },
      {
        name: "settings",
        path: "settings",
        component: () => import("../pages/settings/Settings.vue"),
      },
      {
        name: "preferences",
        path: "preferences",
        component: () => import("../pages/preferences/Preferences.vue"),
      },
      {
        name: "users",
        path: "users",
        component: () => import("../pages/users/UsersPage.vue"),
      },
      {
        name: "projects",
        path: "projects",
        component: () => import("../pages/projects/ProjectsPage.vue"),
      },
      {
        name: "faq",
        path: "/faq",
        component: () => import("../pages/faq/FaqPage.vue"),
      },
      {
        name: "withdraw",
        path: "withdraw",
        component: () => import("../pages/withdraw/WithdrawList.vue"),
        meta: {
          requiresAuth: true,
          title: "提现管理",
        },
      },
      // {
      //   name: "machines_root",
      //   path: "machines_root",
      //   component: () => import("../pages/machines/list.vue"),
      //   meta: {
      //     requiresAuth: true,
      //     title: "机器管理",
      //   },
      // },
	  {
	    name: "pre_machines",
	    path: "pre_machines",
	    component: () => import("../pages/pre_alloc/pre_machine.vue"),
	    meta: {
	      requiresAuth: true,
	      title: "预分配机器管理",
	    },
	  },
	  {
			name: "node_revenue",
			path: "node_revenue",
			component: () => import("../pages/pre_alloc/node_revenue.vue"),
			meta: {
			  requiresAuth: true,
			  title: "节点收益",
			}
	   },
	   {
	   			name: "tao_revenue",
	   			path: "tao_revenue",
	   			component: () => import("../pages/pre_alloc/tao_revenue.vue"),
	   			meta: {
	   			  requiresAuth: true,
	   			  title: "TAO收益",
	   			}
	    },
	   {
		  name: "alloc_tasks",
		  path: "alloc_tasks",
		  component: () => import("../pages/pre_alloc/pre_alloc.vue"),
		  meta: {
		    requiresAuth: true,
		    title: "分配任务",
		  },
		},
		{
		  name: "allocated",
		  path: "allocated",
		  component: () => import("../pages/allocate/allocate.vue"),
		  meta: {
			requiresAuth: true,
			title: "分配记录",
		  },
	    },
		// {
		//   name: "version",
		//   path: "version",
		//   component: () => import("../pages/version/version.vue"),
		//   meta: {
		// 	requiresAuth: true,
		// 	title: "版本管理",
		//   },
		// },
		{
		  name: "notice",
		  path: "notice",
		  component: () => import("../pages/notice/notice.vue"),
		  meta: {
			requiresAuth: true,
			title: "通知管理",
		  },
		},
		{
		  name: "sub_user",
		  path: "sub_user",
		  component: () => import("../pages/user/sub_user.vue"),
		  meta: {
			requiresAuth: true,
			title: "子账户管理",
		  },
		},
    ],
  },

  {
    path: "/auth",
    component: AuthLayout,
    children: [
      {
        name: "login",
        path: "login",
        component: () => import("../pages/auth/Login.vue"),
        meta: { requiresAuth: false },
      },
      {
        name: "signup",
        path: "signup",
        component: () => import("../pages/auth/Signup.vue"),
      },
      {
        name: "recover-password",
        path: "recover-password",
        component: () => import("../pages/auth/RecoverPassword.vue"),
      },
      {
        name: "recover-password-email",
        path: "recover-password-email",
        component: () => import("../pages/auth/CheckTheEmail.vue"),
      },
      {
        path: "",
        redirect: { name: "login" },
      },
    ],
  },
  {
    name: "404",
    path: "/404",
    component: () => import("../pages/404.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }
    // For some reason using documentation example doesn't scroll on page navigation.
    if (to.hash) {
      return { el: to.hash, behavior: "smooth" };
    } else {
      window.scrollTo(0, 0);
    }
  },
  routes,
});

// 全局前置守卫
router.beforeEach((to, from, next) => {
  // 默认需要登录验证
  const requiresAuth = to.meta.requiresAuth !== false;

  if (requiresAuth && !isTokenValid()) {
    // 如果需要验证且未登录，重定向到登录页
    next({
      path: "/auth/login",
      query: { redirect: to.fullPath }, // 保存原本要访问的路径
    });
  } else {
    next();
  }
});

export default router;
