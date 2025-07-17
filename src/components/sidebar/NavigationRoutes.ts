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
	  {
	    name: "dashboard",
	    displayName: "总览",
	    meta: {
	      icon: "",
	    },
	  },
	{
	    name: "user",
	    displayName: "矿工管理",
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
      {
        name: "machines_root",
        displayName: "机器列表",
        meta: {
          icon: "storage", 
        },
      },
		],
	},
  {
    name: "user",
    displayName: "矿池管理",
    meta: {
      icon: "manage_accounts",
    },
  children: [
    {
      name: 'node_revenue',
      displayName: '节点收益',
    meta: {
      icon: "vuestic-iconset-dashboard",
    },
  },
  ],
},
    // {
    //   name: "withdraw",
    //   displayName: "提现列表",
    //   meta: {
    //     icon: "credit_card",
    //   },
    // },
	{
	  name: 'pre_alloc',
	  displayName: "收益发放",
	  meta: {
	    icon: "text_snippet",
	  },
	  children: [
		{
		    name: 'pre_machines',
		    displayName: "预发放数据",
		    meta: {
		      icon: "vuestic-iconset-dashboard",
		    },
		},
       
		// {
		//     name: 'tao_revenue',
		//     displayName: 'TAO收益',
		//     meta: {
		//       icon: "vuestic-iconset-dashboard",
		//     },
		// },
		{
		  name: 'alloc_tasks',
		  displayName: '发放任务',
		  meta: {
		    icon: "vuestic-iconset-dashboard",
		  },
		},
		{
		  name: "allocated",
		  displayName: "已发放",
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
    {
      name: "settings",
      displayName: "矿池设置",
      meta: {
        icon: "settings",
      },
    },
  ] as INavigationRoute[],
};
