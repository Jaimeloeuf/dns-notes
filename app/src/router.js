import { createRouter, createWebHashHistory } from "vue-router";
import Home from "./components/Home.vue";

const router = createRouter({
  history: createWebHashHistory(),

  // Always scroll to top of view on first visit and no savedPosition, else reuse savedPosition
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition;
    else return { top: 0 };
  },

  /**
   * @notice
   * Routes uses lazily loaded components with route level code-splitting
   * this generates a separate chunk (about.[hash].js) for this route
   * which is lazy-loaded when the route is visited.
   */
  routes: [
    // @todo Change this to a home UI
    {
      path: "/",
      name: "home",
      component: Home,
      // Pass URL query parameters as prop to component
      props: (route) => route.query,
    },
    {
      path: "/create",
      name: "create",
      props: (route) => route.query,
      component: () => import("./components/Create.vue"),
    },
    {
      path: "/view",
      name: "view",
      component: () => import("./components/ViewNotes.vue"),
    },

    // @todo Add a 404 not found
  ],
});

export default router;
