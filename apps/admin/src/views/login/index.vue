<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <img src="/vite.svg" alt="logo" class="logo" />
        <h1>TS Admin</h1>
        <p>TypeScript 全栈后台管理框架</p>
      </div>

      <a-form
        ref="formRef"
        :model="formState"
        :rules="rules"
        class="login-form"
        @finish="handleLogin"
      >
        <a-form-item name="username">
          <a-input
            v-model:value="formState.username"
            size="large"
            placeholder="用户名"
          >
            <template #prefix>
              <UserOutlined />
            </template>
          </a-input>
        </a-form-item>

        <a-form-item name="password">
          <a-input-password
            v-model:value="formState.password"
            size="large"
            placeholder="密码"
          >
            <template #prefix>
              <LockOutlined />
            </template>
          </a-input-password>
        </a-form-item>

        <a-form-item>
          <a-button
            type="primary"
            html-type="submit"
            size="large"
            block
            :loading="loading"
          >
            登录
          </a-button>
        </a-form-item>
      </a-form>

      <a-divider>其他登录方式</a-divider>

      <div class="other-login">
        <a-button 
          class="wechat-btn" 
          size="large" 
          block 
          @click="handleWechatLogin"
          :loading="wechatLoading"
        >
          <WechatOutlined />
          微信登录
        </a-button>
      </div>

      <div class="login-tips">
        <p>默认账号：admin / admin123</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { message, type FormInstance, type Rule } from 'ant-design-vue';
import { UserOutlined, LockOutlined, WechatOutlined } from '@ant-design/icons-vue';
import { useUserStore } from '@/stores';
import { getWechatAuthUrl } from '@/api/wechat';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

const formRef = ref<FormInstance>();
const loading = ref(false);
const wechatLoading = ref(false);

const formState = reactive({
  username: 'admin',
  password: 'admin123',
});

const rules: Record<string, Rule[]> = {
  username: [{ required: true, message: '请输入用户名' }],
  password: [{ required: true, message: '请输入密码' }],
};

// 检查URL参数是否有微信登录返回的token
onMounted(() => {
  const accessToken = route.query.accessToken as string;
  const refreshToken = route.query.refreshToken as string;
  const error = route.query.error as string;

  if (error) {
    message.error(decodeURIComponent(error));
    // 清除URL参数
    router.replace('/login');
    return;
  }

  if (accessToken && refreshToken) {
    // 微信登录成功，保存token
    userStore.setTokens(accessToken, refreshToken);
    message.success('微信登录成功');
    router.push('/');
  }
});

async function handleLogin() {
  try {
    loading.value = true;

    await userStore.login({
      username: formState.username,
      password: formState.password,
    });

    message.success('登录成功');

    // 跳转到之前的页面或首页
    const redirect = (route.query.redirect as string) || '/';
    router.push(redirect);
  } catch (error: any) {
    message.error(error?.message || '登录失败');
  } finally {
    loading.value = false;
  }
}

async function handleWechatLogin() {
  try {
    wechatLoading.value = true;
    
    // 获取微信授权URL，回调后跳转回登录页
    const redirectUri = `${window.location.origin}/login`;
    const { authUrl } = await getWechatAuthUrl(redirectUri);
    
    // 跳转到微信授权页面
    window.location.href = authUrl;
  } catch (error: any) {
    message.error(error?.message || '获取微信授权链接失败');
    wechatLoading.value = false;
  }
}
</script>

<style lang="less" scoped>
.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-box {
  width: 400px;
  padding: 40px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.login-header {
  text-align: center;
  margin-bottom: 32px;

  .logo {
    width: 64px;
    height: 64px;
  }

  h1 {
    margin: 16px 0 8px;
    font-size: 28px;
    font-weight: 600;
    color: #333;
  }

  p {
    color: #999;
    font-size: 14px;
  }
}

.login-form {
  .ant-input-affix-wrapper {
    padding: 8px 11px;
  }
}

.other-login {
  margin-bottom: 16px;

  .wechat-btn {
    background: #07c160;
    border-color: #07c160;
    color: #fff;

    &:hover {
      background: #06ad56;
      border-color: #06ad56;
    }
  }
}

.login-tips {
  text-align: center;
  margin-top: 16px;
  color: #999;
  font-size: 12px;
}
</style>
