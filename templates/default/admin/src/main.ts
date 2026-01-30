import { createApp } from 'vue';
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import Antd from 'ant-design-vue';
import App from './App.vue';
import router from './router';
import { setupPermissionDirective } from './directives/permission';

import 'ant-design-vue/dist/reset.css';
import './styles/index.less';

const app = createApp(App);

// Pinia
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);
app.use(pinia);

// Router
app.use(router);

// Ant Design Vue
app.use(Antd);

// 权限指令
setupPermissionDirective(app);

app.mount('#app');
