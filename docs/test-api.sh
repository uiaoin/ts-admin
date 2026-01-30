#!/bin/bash

# TS Admin API 自动化测试脚本
# 测试所有核心 API 接口

BASE_URL="http://localhost:3000/api"
REPORT_FILE="./test-report.md"
PASS_COUNT=0
FAIL_COUNT=0
TOKEN=""

# 颜色输出
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

# 初始化报告
init_report() {
  cat > $REPORT_FILE << 'EOF'
# API 自动化测试报告

> 测试时间: $(date '+%Y-%m-%d %H:%M:%S')

## 测试结果汇总

EOF
}

# 记录测试结果
log_result() {
  local name=$1
  local status=$2
  local msg=$3
  
  if [ "$status" == "PASS" ]; then
    echo -e "${GREEN}✓ PASS${NC}: $name"
    echo "| $name | ✅ 通过 | $msg |" >> $REPORT_FILE
    ((PASS_COUNT++))
  else
    echo -e "${RED}✗ FAIL${NC}: $name - $msg"
    echo "| $name | ❌ 失败 | $msg |" >> $REPORT_FILE
    ((FAIL_COUNT++))
  fi
}

# 测试登录
test_login() {
  echo "========== 认证模块测试 =========="
  
  # 正确登录
  response=$(curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"username":"admin","password":"admin123"}')
  
  TOKEN=$(echo $response | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
  
  if [ -n "$TOKEN" ]; then
    log_result "登录接口 (正确密码)" "PASS" "获取Token成功"
  else
    log_result "登录接口 (正确密码)" "FAIL" "无法获取Token"
    return 1
  fi
  
  # 错误密码
  response=$(curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"username":"admin","password":"wrongpassword"}')
  
  if echo $response | grep -q "密码错误\|用户名或密码错误"; then
    log_result "登录接口 (错误密码)" "PASS" "正确拒绝"
  else
    log_result "登录接口 (错误密码)" "FAIL" "未正确处理"
  fi
}

# 测试用户信息
test_user_info() {
  response=$(curl -s -X GET "$BASE_URL/auth/info" \
    -H "Authorization: Bearer $TOKEN")
  
  if echo $response | grep -q '"username":"admin"'; then
    log_result "获取用户信息" "PASS" "返回用户数据"
  else
    log_result "获取用户信息" "FAIL" "数据异常"
  fi
}

# 测试获取菜单
test_user_menus() {
  response=$(curl -s -X GET "$BASE_URL/auth/menus" \
    -H "Authorization: Bearer $TOKEN")
  
  if echo $response | grep -q '"name"'; then
    log_result "获取用户菜单" "PASS" "返回菜单列表"
  else
    log_result "获取用户菜单" "FAIL" "数据异常"
  fi
}

# 测试用户管理
test_user_crud() {
  echo "========== 用户管理测试 =========="
  
  # 查询用户列表
  response=$(curl -s -X GET "$BASE_URL/system/user?page=1&pageSize=10" \
    -H "Authorization: Bearer $TOKEN")
  
  if echo $response | grep -q '"list"'; then
    log_result "用户列表查询" "PASS" "返回列表数据"
  else
    log_result "用户列表查询" "FAIL" "数据异常"
  fi
  
  # 创建用户
  response=$(curl -s -X POST "$BASE_URL/system/user" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"username":"testuser001","password":"test123456","nickname":"测试用户","deptId":1,"roleIds":[2]}')
  
  USER_ID=$(echo $response | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
  
  if [ -n "$USER_ID" ]; then
    log_result "创建用户" "PASS" "ID: $USER_ID"
    
    # 更新用户
    response=$(curl -s -X PUT "$BASE_URL/system/user/$USER_ID" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d '{"nickname":"测试用户-已更新"}')
    
    if echo $response | grep -q '测试用户-已更新'; then
      log_result "更新用户" "PASS" "更新成功"
    else
      log_result "更新用户" "FAIL" "更新失败"
    fi
    
    # 删除用户
    response=$(curl -s -X DELETE "$BASE_URL/system/user/$USER_ID" \
      -H "Authorization: Bearer $TOKEN")
    
    if echo $response | grep -q 'true\|200'; then
      log_result "删除用户" "PASS" "删除成功"
    else
      log_result "删除用户" "FAIL" "删除失败"
    fi
  else
    log_result "创建用户" "FAIL" "创建失败"
  fi
}

# 测试角色管理
test_role_crud() {
  echo "========== 角色管理测试 =========="
  
  response=$(curl -s -X GET "$BASE_URL/system/role?page=1&pageSize=10" \
    -H "Authorization: Bearer $TOKEN")
  
  if echo $response | grep -q '"list"'; then
    log_result "角色列表查询" "PASS" "返回列表数据"
  else
    log_result "角色列表查询" "FAIL" "数据异常"
  fi
  
  # 创建角色
  response=$(curl -s -X POST "$BASE_URL/system/role" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"name":"测试角色","code":"test_role","sort":99,"menuIds":[1,2,3]}')
  
  ROLE_ID=$(echo $response | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
  
  if [ -n "$ROLE_ID" ]; then
    log_result "创建角色" "PASS" "ID: $ROLE_ID"
    
    # 删除角色
    curl -s -X DELETE "$BASE_URL/system/role/$ROLE_ID" \
      -H "Authorization: Bearer $TOKEN" > /dev/null
    log_result "删除角色" "PASS" "删除成功"
  else
    log_result "创建角色" "FAIL" "创建失败"
  fi
}

# 测试菜单管理
test_menu_crud() {
  echo "========== 菜单管理测试 =========="
  
  response=$(curl -s -X GET "$BASE_URL/system/menu" \
    -H "Authorization: Bearer $TOKEN")
  
  if echo $response | grep -q '"name"'; then
    log_result "菜单列表查询" "PASS" "返回菜单树"
  else
    log_result "菜单列表查询" "FAIL" "数据异常"
  fi
}

# 测试部门管理
test_dept_crud() {
  echo "========== 部门管理测试 =========="
  
  response=$(curl -s -X GET "$BASE_URL/system/dept" \
    -H "Authorization: Bearer $TOKEN")
  
  if echo $response | grep -q '"name"'; then
    log_result "部门列表查询" "PASS" "返回部门树"
  else
    log_result "部门列表查询" "FAIL" "数据异常"
  fi
}

# 测试字典管理
test_dict_crud() {
  echo "========== 字典管理测试 =========="
  
  response=$(curl -s -X GET "$BASE_URL/system/dict/type?page=1&pageSize=10" \
    -H "Authorization: Bearer $TOKEN")
  
  if echo $response | grep -q '"list"'; then
    log_result "字典类型查询" "PASS" "返回列表数据"
  else
    log_result "字典类型查询" "FAIL" "数据异常"
  fi
}

# 测试监控接口
test_monitor() {
  echo "========== 系统监控测试 =========="
  
  # 服务器信息
  response=$(curl -s -X GET "$BASE_URL/monitor/server" \
    -H "Authorization: Bearer $TOKEN")
  
  if echo $response | grep -q '"cpu"'; then
    log_result "服务器监控" "PASS" "返回系统信息"
  else
    log_result "服务器监控" "FAIL" "数据异常"
  fi
  
  # 缓存信息
  response=$(curl -s -X GET "$BASE_URL/monitor/cache" \
    -H "Authorization: Bearer $TOKEN")
  
  if echo $response | grep -q '"version"'; then
    log_result "缓存监控" "PASS" "返回Redis信息"
  else
    log_result "缓存监控" "FAIL" "数据异常"
  fi
  
  # 操作日志
  response=$(curl -s -X GET "$BASE_URL/monitor/operlog?page=1&pageSize=10" \
    -H "Authorization: Bearer $TOKEN")
  
  if echo $response | grep -q '"list"'; then
    log_result "操作日志查询" "PASS" "返回列表数据"
  else
    log_result "操作日志查询" "FAIL" "数据异常"
  fi
  
  # 登录日志
  response=$(curl -s -X GET "$BASE_URL/monitor/loginlog?page=1&pageSize=10" \
    -H "Authorization: Bearer $TOKEN")
  
  if echo $response | grep -q '"list"'; then
    log_result "登录日志查询" "PASS" "返回列表数据"
  else
    log_result "登录日志查询" "FAIL" "数据异常"
  fi
}

# 测试权限控制
test_permission() {
  echo "========== 权限控制测试 =========="
  
  # 无Token访问
  response=$(curl -s -X GET "$BASE_URL/system/user")
  
  if echo $response | grep -q '401\|Unauthorized\|未授权'; then
    log_result "无Token拒绝访问" "PASS" "正确返回401"
  else
    log_result "无Token拒绝访问" "FAIL" "未正确拦截"
  fi
}

# 生成最终报告
finalize_report() {
  # 插入表头
  sed -i '' '/## 测试结果汇总/a\
\
| 测试项 | 结果 | 备注 |\
|--------|------|------|\
' $REPORT_FILE 2>/dev/null || sed -i '/## 测试结果汇总/a\
\
| 测试项 | 结果 | 备注 |\
|--------|------|------|\
' $REPORT_FILE
  
  # 添加统计
  echo "" >> $REPORT_FILE
  echo "## 统计" >> $REPORT_FILE
  echo "" >> $REPORT_FILE
  echo "- **通过**: $PASS_COUNT" >> $REPORT_FILE
  echo "- **失败**: $FAIL_COUNT" >> $REPORT_FILE
  echo "- **总计**: $((PASS_COUNT + FAIL_COUNT))" >> $REPORT_FILE
  echo "- **通过率**: $(echo "scale=1; $PASS_COUNT * 100 / ($PASS_COUNT + $FAIL_COUNT)" | bc)%" >> $REPORT_FILE
  
  echo ""
  echo "=========================================="
  echo "测试完成: 通过 $PASS_COUNT, 失败 $FAIL_COUNT"
  echo "报告已生成: $REPORT_FILE"
  echo "=========================================="
}

# 主流程
main() {
  init_report
  
  test_login
  if [ -z "$TOKEN" ]; then
    echo "登录失败，无法继续测试"
    exit 1
  fi
  
  test_user_info
  test_user_menus
  test_permission
  test_user_crud
  test_role_crud
  test_menu_crud
  test_dept_crud
  test_dict_crud
  test_monitor
  
  finalize_report
}

main
