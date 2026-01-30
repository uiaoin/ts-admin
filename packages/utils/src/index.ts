/**
 * 列表转树形结构
 * @param list 原始列表
 * @param options 配置项
 */
export function listToTree<T extends Record<string, any>>(
  list: T[],
  options: {
    idKey?: string;
    parentKey?: string;
    childrenKey?: string;
    rootParentId?: number | null;
  } = {},
): T[] {
  const { idKey = 'id', parentKey = 'parentId', childrenKey = 'children', rootParentId = 0 } = options;

  const map = new Map<number, T>();
  const result: T[] = [];

  // 先建立映射
  list.forEach((item) => {
    map.set(item[idKey], { ...item, [childrenKey]: [] });
  });

  // 构建树
  list.forEach((item) => {
    const node = map.get(item[idKey])!;
    const parentId = item[parentKey];

    if (parentId === rootParentId || parentId === null) {
      result.push(node);
    } else {
      const parent = map.get(parentId);
      if (parent) {
        parent[childrenKey].push(node);
      }
    }
  });

  return result;
}

/**
 * 树形结构转列表
 * @param tree 树形数据
 * @param childrenKey 子节点key
 */
export function treeToList<T extends Record<string, any>>(
  tree: T[],
  childrenKey = 'children',
): Omit<T, typeof childrenKey>[] {
  const result: Omit<T, typeof childrenKey>[] = [];

  function traverse(nodes: T[]) {
    nodes.forEach((node) => {
      const { [childrenKey]: children, ...rest } = node;
      result.push(rest as Omit<T, typeof childrenKey>);
      if (children && children.length > 0) {
        traverse(children);
      }
    });
  }

  traverse(tree);
  return result;
}

/**
 * 查找树中的节点
 * @param tree 树形数据
 * @param predicate 判断函数
 * @param childrenKey 子节点key
 */
export function findTreeNode<T extends Record<string, any>>(
  tree: T[],
  predicate: (node: T) => boolean,
  childrenKey = 'children',
): T | null {
  for (const node of tree) {
    if (predicate(node)) {
      return node;
    }
    if (node[childrenKey] && node[childrenKey].length > 0) {
      const found = findTreeNode(node[childrenKey], predicate, childrenKey);
      if (found) {
        return found;
      }
    }
  }
  return null;
}

/**
 * 获取树节点的所有父节点ID
 * @param tree 树形数据
 * @param targetId 目标节点ID
 */
export function getTreeParentIds<T extends Record<string, any>>(
  tree: T[],
  targetId: number,
  idKey = 'id',
  childrenKey = 'children',
): number[] {
  const path: number[] = [];

  function traverse(nodes: T[], ancestors: number[]): boolean {
    for (const node of nodes) {
      if (node[idKey] === targetId) {
        path.push(...ancestors);
        return true;
      }
      if (node[childrenKey] && node[childrenKey].length > 0) {
        if (traverse(node[childrenKey], [...ancestors, node[idKey]])) {
          return true;
        }
      }
    }
    return false;
  }

  traverse(tree, []);
  return path;
}

/**
 * 过滤树节点
 * @param tree 树形数据
 * @param predicate 判断函数
 * @param childrenKey 子节点key
 */
export function filterTree<T extends Record<string, any>>(
  tree: T[],
  predicate: (node: T) => boolean,
  childrenKey = 'children',
): T[] {
  return tree
    .map((node) => {
      const newNode = { ...node };
      if (newNode[childrenKey] && newNode[childrenKey].length > 0) {
        (newNode as any)[childrenKey] = filterTree(newNode[childrenKey], predicate, childrenKey);
      }
      return newNode;
    })
    .filter((node) => predicate(node) || (node[childrenKey] && node[childrenKey].length > 0));
}

/**
 * 休眠函数
 * @param ms 毫秒
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 生成随机字符串
 * @param length 长度
 */
export function randomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * 深拷贝
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * 判断是否为空
 */
export function isEmpty(value: any): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string' && value.trim() === '') return true;
  if (Array.isArray(value) && value.length === 0) return true;
  if (typeof value === 'object' && Object.keys(value).length === 0) return true;
  return false;
}
