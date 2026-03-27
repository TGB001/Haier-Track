import React, { useState, useRef } from "react";

const ZuhegouQueryForm = ({ onQuery, isLoading }) => {
  const [queryType, setQueryType] = useState("count");
  const [formData, setFormData] = useState({
    module_Id: "",
    skuId: "",
    pin: "",
    type: "click",
    start_time: "",
    end_time: "",
  });

  const startTimeRef = useRef(null);
  const endTimeRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleQuery = () => {
    if (!formData.module_Id) {
      alert("请输入模块ID");
      return;
    }

    const params = {
      module_Id: formData.module_Id,
      type: formData.type,
    };

    if (queryType === "count" || queryType === "pins") {
      if (!formData.skuId) {
        alert("请输入商品SKU ID");
        return;
      }
      params.skuId = formData.skuId;
    } else if (queryType === "products") {
      if (!formData.pin) {
        alert("请输入用户PIN");
        return;
      }
      params.pin = formData.pin;
    }

    if (formData.start_time || formData.end_time) {
      params.duration = {
        start_time: formData.start_time
          ? new Date(formData.start_time).getTime()
          : undefined,
        end_time: formData.end_time
          ? new Date(formData.end_time).getTime()
          : undefined,
      };
    }

    onQuery(queryType, params);
  };

  const handleReset = () => {
    setFormData({
      module_Id: "",
      skuId: "",
      pin: "",
      type: "click",
      start_time: "",
      end_time: "",
    });
  };

  return (
    <div className="zuhegou-query-form">
      <div className="form-group">
        <label htmlFor="queryType">查询类型</label>
        <select
          id="queryType"
          name="queryType"
          value={queryType}
          onChange={(e) => setQueryType(e.target.value)}
          className="form-control"
        >
          <option value="count">查询商品次数</option>
          <option value="pins">查询商品用户列表</option>
          <option value="products">查询用户商品列表</option>
        </select>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="module_Id">模块ID *</label>
          <input
            id="module_Id"
            name="module_Id"
            type="text"
            value={formData.module_Id}
            onChange={handleChange}
            placeholder="请输入模块ID"
            className="form-control"
          />
        </div>

        <div className="form-group">
          <label htmlFor="type">事件类型</label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="form-control"
          >
            <option value="click">点击</option>
            <option value="add_cart">加购</option>
          </select>
        </div>
      </div>

      {(queryType === "count" || queryType === "pins") && (
        <div className="form-group">
          <label htmlFor="skuId">商品SKU ID *</label>
          <input
            id="skuId"
            name="skuId"
            type="text"
            value={formData.skuId}
            onChange={handleChange}
            placeholder="请输入商品SKU ID"
            className="form-control"
          />
        </div>
      )}

      {queryType === "products" && (
        <div className="form-group">
          <label htmlFor="pin">用户PIN *</label>
          <input
            id="pin"
            name="pin"
            type="text"
            value={formData.pin}
            onChange={handleChange}
            placeholder="请输入用户PIN"
            className="form-control"
          />
        </div>
      )}

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="start_time">开始时间</label>
          <input
            id="start_time"
            name="start_time"
            type="datetime-local"
            value={formData.start_time}
            onChange={handleChange}
            className="form-control"
            ref={startTimeRef}
            onClick={() => startTimeRef.current?.showPicker?.()}
          />
        </div>

        <div className="form-group">
          <label htmlFor="end_time">结束时间</label>
          <input
            id="end_time"
            name="end_time"
            type="datetime-local"
            value={formData.end_time}
            onChange={handleChange}
            className="form-control"
            ref={endTimeRef}
            onClick={() => endTimeRef.current?.showPicker?.()}
          />
        </div>
      </div>

      <div className="form-actions">
        <button
          onClick={handleQuery}
          disabled={isLoading}
          className={`btn btn-primary ${isLoading ? "loading" : ""}`}
        >
          {isLoading ? "查询中..." : "查询"}
        </button>
        <button onClick={handleReset} className="btn btn-secondary">
          重置
        </button>
      </div>
    </div>
  );
};

export default ZuhegouQueryForm;
