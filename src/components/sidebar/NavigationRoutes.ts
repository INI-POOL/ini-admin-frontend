export interface INavigationRoute {
  name: string;
  displayName: string;
  meta: { icon: string };
  children?: INavigationRoute[];
}

  // "admin" : {
  // 	  "preAlloc":"Pre Alloc",
  // 	  "machines":"Machine List",
  // 	  "preMachines":"Pre-alloc Machine Info",
  // 	  "withdrawList":"Withdraw List",
  // }
export default {
  root: {
    name: "/",
    displayName: "navigationRoutes.home",
  },
  routes: [
    {
      name: "withdraw",
      displayName: "admin.withdrawList",
      meta: {
        icon: "credit_card",
      },
    },
	{
	  name: "machines",
	  displayName: "admin.machines",
	  meta: {
	    icon: "vuestic-iconset-dashboard", 
	  },
	},
	{
	  name: 'pre_alloc',
	  displayName: "admin.preAlloc",
	  meta: {
	    icon: "more_horiz",
	  },
	  children: [
	    {
	      name: 'pre_machines',
	      displayName: "admin.preMachines",
		  meta: {
		    icon: "vuestic-iconset-dashboard",
		  },
	    },
        {
	      name: 'node_revenue',
	      displayName: 'admin.nodeRevenue',
		  meta: {
		    icon: "vuestic-iconset-dashboard",
		  },
	    },
		{
		  name: 'alloc_tasks',
		  displayName: 'admin.allocTask',
		  meta: {
		    icon: "vuestic-iconset-dashboard",
		  },
		},
	  ],
	},
	{
	  name: "allocated",
	  displayName: "分配记录",
	  meta: {
	    icon: "vuestic-iconset-dashboard", 
	  },
	},
    // {
    //   name: "dashboard",
    //   displayName: "menu.dashboard",
    //   meta: {
    //     icon: "vuestic-iconset-dashboard",
    //   },
    // },
    // {
    //   name: 'users',
    //   displayName: 'menu.users',
    //   meta: {
    //     icon: 'group',
    //   },
    // },
    // {
    //   name: 'projects',
    //   displayName: 'menu.projects',
    //   meta: {
    //     icon: 'folder_shared',
    //   },
    // },
    // {
    //   name: 'payments',
    //   displayName: 'menu.payments',
    //   meta: {
    //     icon: 'credit_card',
    //   },
    //   children: [
    //     {
    //       name: 'payment-methods',
    //       displayName: 'menu.payment-methods',
    //     },
    //     {
    //       name: 'pricing-plans',
    //       displayName: 'menu.pricing-plans',
    //     },
    //     {
    //       name: 'billing',
    //       displayName: 'menu.billing',
    //     },
    //   ],
    // },
    // {
    //   name: 'auth',
    //   displayName: 'menu.auth',
    //   meta: {
    //     icon: 'login',
    //   },
    //   children: [
    //     {
    //       name: 'login',
    //       displayName: 'menu.login',
    //     },
    //     {
    //       name: 'signup',
    //       displayName: 'menu.signup',
    //     },
    //     {
    //       name: 'recover-password',
    //       displayName: 'menu.recover-password',
    //     },
    //   ],
    // },

    // {
    //   name: 'faq',
    //   displayName: 'menu.faq',
    //   meta: {
    //     icon: 'quiz',
    //   },
    // },
    
    // {
    //   name: "404",
    //   displayName: "menu.404",
    //   meta: {
    //     icon: "vuestic-iconset-files",
    //   },
    // },
    // {
    //   name: "preferences",
    //   displayName: "menu.preferences",
    //   meta: {
    //     icon: "manage_accounts",
    //   },
    // },
    // {
    //   name: "settings",
    //   displayName: "menu.settings",
    //   meta: {
    //     icon: "settings",
    //   },
    // },
  ] as INavigationRoute[],
};
