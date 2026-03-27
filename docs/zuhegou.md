# 海尔组合购接口文档

## 代码分支

功能在 `jd/interact` 分支下新增。

## 接口说明

### 1. 记录用户点击或加购商品

**功能描述**：记录用户对商品的点击或加购行为。

**请求数据**：

```json
{
  "module_id": "", // string, 模块Id，每个客户的项目有一个不同的模块Id
  "pin": "xxx", // string, 用户的pin
  "skuIds": ["skuId1", "skuId2"], // string[], 商品的skuId列表，用户一次性可加购大量商品，点击和加购的次数为列表长度
  "timestamp": 1773727450275, // number, 时间戳单位ms
  "type": "add_cart" // string, 事件类型 可选参数为add_cart和click，分别代表加购事件和点击事件
}
```

**响应数据**：

```json
{}
```

### 2. 查询商品的被点击或加购的次数

**功能描述**：查询指定商品在指定时间范围内的被点击或加购次数。

**请求参数**：

```json
{
  "module_Id": "", // string, 必填项, 要查询哪个模块下的数据
  "skuId": "", // string, 必填项, 要查询的商品skuId
  "type": "", // string, 必填项，要查询的事件类型 可选参数为add_cart和click，分别代表加购事件和点击事件
  "duration": {
    "start_time": 1773727450275, // number, 时间戳单位ms 查询的开始时间
    "end_time": 1773727450275 // number, 时间戳单位ms 查询的结束时间
  } // 选填
}
```

**响应数据**：

```json
{
  "count": 10 // 查询结果的次数
}
```

### 3. 查询某个商品有哪些pin加购或点击

**功能描述**：查询指定商品在指定时间范围内被哪些用户加购或点击。

**请求参数**：

```json
{
  "module_Id": "", // string, 必填项, 要查询哪个模块下的数据
  "skuId": "", // string, 必填项, 要查询的商品skuId
  "type": "", // string, 必填项，要查询的事件类型 可选参数为add_cart和click，分别代表加购事件和点击事件
  "duration": {
    "start_time": 1773727450275, // number, 时间戳单位ms 查询的开始时间
    "end_time": 1773727450275 // number, 时间戳单位ms 查询的结束时间
  } // 选填
}
```

**响应数据**：

```json
{
  "pin_list": ["xxxpin1xx", "xxxpin2xx"] // string[]，用户pin的数组
}
```

### 4. 查询某个用户pin点击或加购了哪些商品

**功能描述**：查询指定用户在指定时间范围内点击或加购了哪些商品。

**请求参数**：

```json
{
  "module_Id": "", // string, 必填项, 要查询哪个模块下的数据
  "pin": "", // string, 必填项, 要查询的用户pin
  "type": "", // string, 必填项，要查询的事件类型 可选参数为add_cart和click，分别代表加购事件和点击事件
  "duration": {
    "start_time": 1773727450275, // number, 时间戳单位ms 查询的开始时间
    "end_time": 1773727450275 // number, 时间戳单位ms 查询的结束时间
  } // 选填
}
```

**响应数据**：

```json
{
  "skuId_list": ["xxxskuid1xxx", "xxxskuid2xx"] // string[]，商品Id
}
```

## 注意事项

1. 所有时间戳参数均为毫秒级时间戳
2. `module_id` 为必填参数，每个客户项目有唯一的模块Id
3. 事件类型 `type` 只支持 `add_cart`（加购）和 `click`（点击）两种类型
4. `duration` 参数为选填，不填则查询所有时间范围的数据
5. 对于 `record` 接口，一次请求中的点击和加购商品次数等于 `skuIds` 数组的长度
