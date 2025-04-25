export interface INavigationRoute {
  name: string;
  displayName: string;
  meta: { icon: string };
  children?: INavigationRoute[];
}

export default {
  root: {
    name: "/",
    displayName: "navigationRoutes.home",
  },
  routes: [
	  // {
	  //   name: "dashboard",
	  //   displayName: "仪表盘",
	  //   meta: {
	  //     icon: "",
	  //   },
	  // },
	{
	    name: "user",
	    displayName: "用户管理",
	    meta: {
	      icon: "manage_accounts",
	    },
		children: [
			{
				name: 'sub_user',
				displayName: "子账户管理",
				meta: {
				  icon: "contact_page",
				},
			},
		],
	},
    {
      name: "withdraw",
      displayName: "admin.withdrawList",
      meta: {
        icon: "credit_card",
      },
    },
	// {
	//   name: "machines_root",
	//   displayName: "admin.machines",
	//   meta: {
	//     icon: "storage", 
	//   },
	// },
	{
	  name: 'pre_alloc',
	  displayName: "admin.preAlloc",
	  meta: {
	    icon: "text_snippet",
	  },
	  children: [
		// {
		//     name: 'pre_machines',
		//     displayName: "admin.preMachines",
		//     meta: {
		//       icon: "vuestic-iconset-dashboard",
		//     },
		// },
        {
	        name: 'node_revenue',
	        displayName: 'admin.nodeRevenue',
		    meta: {
		      icon: "vuestic-iconset-dashboard",
		    },
	    },
		{
		    name: 'tao_revenue',
		    displayName: 'TAO收益',
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
		{
		  name: "allocated",
		  displayName: "分配记录",
		  meta: {
		    icon: "text_snippet", 
		  },
		},
	  ],
	},
	// {
	//   name: "version",
	//   displayName: "版本管理",
	//   meta: {
	//     icon: "publish", 
	//   },
	// },
	// {
	//   name: "notice",
	//   displayName: "消息通知",
	//   meta: {
	//     icon: "notifications", 
	//   },	  
	// },
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
