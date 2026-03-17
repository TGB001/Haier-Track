import React, { useState, useRef } from "react";

const TimeRangeExport = ({ onQueryTimeRange, isLoading, isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    module_id: "",
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
      module_id: formData.module_id || undefined,
      duration: {
        start_time: formData.start_time
          ? new Date(formData.start_time).getTime()
          : undefined,
        end_time: formData.end_time
          ? new Date(formData.end_time).getTime()
          : undefined,
      },
    };

    onQueryTimeRange(params);
  };

  const handleReset = () => {
    setFormData({
      module_id: "",
      start_time: "",
      end_time: "",
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content time-range-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 className="modal-title">时间范围分析与导出</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="time_module_id">模块ID</label>
              <input
                id="time_module_id"
                name="module_id"
                type="text"
                value={formData.module_id}
                onChange={handleChange}
                placeholder="请输入模块ID"
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label htmlFor="time_start">开始时间</label>
              <input
                id="time_start"
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
              <label htmlFor="time_end">结束时间</label>
              <input
                id="time_end"
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
              {isLoading ? "分析中..." : "分析并导出"}
            </button>
            <button onClick={handleReset} className="btn btn-secondary">
              重置
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeRangeExport;
