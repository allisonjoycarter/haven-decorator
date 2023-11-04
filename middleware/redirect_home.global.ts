export default defineNuxtRouteMiddleware((to, from) => {
  if (to.path === '/') {
    return navigateTo('/customizer')
  } else if (to.path === '/planner') {
    return navigateTo('/planner/welcome')
  }
})