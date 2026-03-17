import React, { useState, useRef } from "react";

const QueryForm = ({ onQuery, isLoading }) => {
  const [formData, setFormData] = useState({
    type: "",
    module_id: "",
    activity_id: "",
    user_id: "",
    pin: "",
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
    const params = {
      type: formData.type || undefined,
      module_id: formData.module_id || undefined,
      activity_id: formData.activity_id || undefined,
      user_id: formData.user_id || undefined,
      pin: formData.pin || undefined,
      duration: {
        start_time: formData.start_time
          ? new Date(formData.start_time).getTime()
          : undefined,
        end_time: formData.end_time
          ? new Date(formData.end_time).getTime()
          : undefined,
      },
    };

    onQuery(params);
  };

  const handleReset = () => {
    setFormData({
      type: "",
      module_id: "",
      activity_id: "",
      user_id: "",
      pin: "",
      start_time: "",
      end_time: "",
    });
  };

  return (
    <div className="query-form">
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="type">类型</label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="form-control"
          >
            <option value="">全部</option>
            <option value="click">点击(click)</option>
            <option value="order">订阅(order)</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="module_id">模块ID</label>
          <input
            id="module_id"
            name="module_id"
            type="text"
            value={formData.module_id}
            onChange={handleChange}
            placeholder="请输入模块ID"
            className="form-control"
          />
        </div>

        <div className="form-group">
          <label htmlFor="activity_id">活动ID</label>
          <input
            id="activity_id"
            name="activity_id"
            type="text"
            value={formData.activity_id}
            onChange={handleChange}
            placeholder="请输入活动ID"
            className="form-control"
          />
        </div>

        <div className="form-group">
          <label htmlFor="user_id">用户ID</label>
          <input
            id="user_id"
            name="user_id"
            type="text"
            value={formData.user_id}
            onChange={handleChange}
            placeholder="请输入用户ID"
            className="form-control"
          />
        </div>

        <div className="form-group">
          <label htmlFor="pin">用户PIN</label>
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

export default QueryForm;
