import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const Home = () => import('@/views/Home.vue')
const Activity = () => import('@/views/Activity.vue')
const Store = () => import('@/views/Store.vue')
const Community = () => import('@/views/Community.vue')
const AiRecognition = () => import('@/views/AiRecognition.vue')
const Login = () => import('@/views/Login.vue')
const Register = () => import('@/views/Register.vue')
const Profile = () => import('@/views/Profile.vue')

const Achievements = () => import('@/views/Achievements.vue')
const Upcycling = () => import('@/views/Upcycling.vue')
const CarbonFootprint = () => import('@/views/CarbonFootprint.vue')
const HelpCenter = () => import('@/views/HelpCenter.vue')
const AIAdvice = () => import('@/views/AIAdvice.vue')
const About = () => import('@/views/About.vue')
const Join = () => import('@/views/Join.vue')
const Contact = () => import('@/views/Contact.vue')
const TechShowcase = () => import('@/components/ui/TechShowcase.vue')
const ApiTest = () => import('@/views/ApiTest.vue')


const routes = [
  { path: '/', name: 'home', component: Home },
  { path: '/activity', name: 'activity', component: Activity },
  { path: '/store', name: 'store', component: Store },
  { path: '/community', name: 'community', component: Community },
  { path: '/checkin', redirect: { name: 'community' } },
  { path: '/ai-recognition', name: 'aiRecognition', component: AiRecognition },
  { path: '/carbon-footprint', name: 'carbonFootprint', component: CarbonFootprint },
  { path: '/help', name: 'help', component: HelpCenter },
  { path: '/ai-advice', name: 'aiAdvice', component: AIAdvice },
  { path: '/about', name: 'about', component: About },
  { path: '/join', name: 'join', component: Join },
  { path: '/contact', name: 'contact', component: Contact },
  { path: '/tech-showcase', name: 'techShowcase', component: TechShowcase },
  { path: '/login', name: 'login', component: Login },
  { path: '/register', name: 'register', component: Register },
  { path: '/profile', name: 'profile', component: Profile, meta: { requiresAuth: true } },

  { path: '/achievements', name: 'achievements', component: Achievements },
  { path: '/upcycling', name: 'upcycling', component: Upcycling },
  { path: '/api-test', name: 'apiTest', component: ApiTest },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }
})

export default router