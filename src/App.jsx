import React, { useState } from "react";
import QueryForm from "./components/QueryForm";
import StatCards from "./components/StatCards";
import ActivityTable from "./components/ActivityTable";
import DetailModal from "./components/DetailModal";
import TimeRangeExport from "./components/TimeRangeExport";
import { queryUserData } from "./services/api";

const App = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [totalActivityData, setTotalActivityData] = useState(new Map());
  const [timeRangeData, setTimeRangeData] = useState([]);
  const [timeRangeStats, setTimeRangeStats] = useState(null);
  const [showTimeRangeModal, setShowTimeRangeModal] = useState(false);

  const handleQuery = async (params) => {
    setLoading(true);
    setError(null);
    try {
      // 首先获取所有数据用于计算活动的总用户数
      const totalResponse = await queryUserData({});
      const totalMap = new Map();

      totalResponse.forEach((item) => {
        if (!totalMap.has(item.activity_id)) {
          totalMap.set(item.activity_id, new Set());
        }
        totalMap.get(item.activity_id).add(item.pin);
      });
      setTotalActivityData(totalMap);

      // 然后获取筛选后的数据
      const filteredResponse = await queryUserData(params);
      setData(filteredResponse || []);
    } catch (err) {
      console.error("Query error:", err);
      setError(err.message || "查询失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const totalRecords = data.length;
    let clickCount = 0;
    let orderCount = 0;
    const activityMap = new Map();

    data.forEach((item) => {
      if (item.type === "click") {
        clickCount++;
      } else if (item.type === "order") {
        orderCount++;
      }

      if (!activityMap.has(item.activity_id)) {
        activityMap.set(item.activity_id, {
          activity_id: item.activity_id,
          click_count: 0,
          order_count: 0,
          pins: new Set(),
        });
      }

      const activity = activityMap.get(item.activity_id);
      if (item.type === "click") {
        activity.click_count++;
      } else if (item.type === "order") {
        activity.order_count++;
      }
      activity.pins.add(item.pin);
    });

    const activityList = Array.from(activityMap.values()).map((item) => ({
      ...item,
      user_count: item.pins.size,
    }));

    return {
      totalRecords,
      clickCount,
      orderCount,
      activityCount: activityMap.size,
      activityList,
    };
  };

  const stats = calculateStats();

  const handleSeeDetails = (activity) => {
    setSelectedActivity(activity);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedActivity(null);
  };

  const handleExportUsers = async (activity) => {
    const pins = Array.from(activity.pins);
    const content = pins.join("\n");
    const fileName = `activity_${activity.activity_id}_users.csv`;

    try {
      if ("showDirectoryPicker" in window) {
        // 让用户选择保存文件夹（只选择一次）
        const directoryHandle = await window.showDirectoryPicker({
          mode: "readwrite",
          id: "activity-export",
          startIn: "downloads",
        });

        // 保存文件
        const fileHandle = await directoryHandle.getFileHandle(fileName, {
          create: true,
        });
        const writable = await fileHandle.createWritable();
        await writable.write("\uFEFF" + content);
        await writable.close();

        alert("文件已成功导出到选定的文件夹");
      } else if ("showSaveFilePicker" in window) {
        const handle = await window.showSaveFilePicker({
          suggestedName: fileName,
          types: [
            {
              description: "CSV Files",
              accept: {
                "text/csv": [".csv"],
              },
            },
          ],
        });
        const writable = await handle.createWritable();
        await writable.write("\uFEFF" + content);
        await writable.close();
      } else {
        const csvContent =
          "data:text/csv;charset=utf-8,\uFEFF" + encodeURIComponent(content);
        const link = document.createElement("a");
        link.setAttribute("href", csvContent);
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      console.error("Export error:", err);
      if (err.name !== "AbortError") {
        alert("导出失败，请重试");
      }
    }
  };

  const handleQueryTimeRange = async (params) => {
    setLoading(true);
    setError(null);
    try {
      const response = await queryUserData(params);
      setTimeRangeData(response || []);

      // 计算时间范围内的统计数据
      const stats = calculateTimeRangeStats(response || []);
      setTimeRangeStats(stats);

      // 导出数据，传递查询参数以便在文件名中使用
      exportTimeRangeData(stats, params);
    } catch (err) {
      console.error("Query error:", err);
      setError(err.message || "查询失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  const calculateTimeRangeStats = (data) => {
    let totalClickCount = 0;
    let totalOrderCount = 0;
    const activityMap = new Map();

    data.forEach((item) => {
      if (item.type === "click") {
        totalClickCount++;
      } else if (item.type === "order") {
        totalOrderCount++;
      }

      if (!activityMap.has(item.activity_id)) {
        activityMap.set(item.activity_id, {
          activity_id: item.activity_id,
          click_count: 0,
          order_count: 0,
          pins: new Set(),
        });
      }

      const activity = activityMap.get(item.activity_id);
      if (item.type === "click") {
        activity.click_count++;
      } else if (item.type === "order") {
        activity.order_count++;
      }
      activity.pins.add(item.pin);
    });

    const activityList = Array.from(activityMap.values()).map((item) => ({
      ...item,
      user_count: item.pins.size,
    }));

    return {
      totalClickCount,
      totalOrderCount,
      totalRecords: data.length,
      activityList,
    };
  };

  const exportTimeRangeData = async (stats, params) => {
    // 导出活动数据（包含click和order次数）
    let csvContent = "活动ID,点击数,订阅数,参与用户数\n";

    stats.activityList.forEach((activity) => {
      csvContent += `${activity.activity_id},${activity.click_count},${activity.order_count},${activity.user_count}\n`;
    });

    // 生成文件名前缀
    const getFileNamePrefix = () => {
      let prefix = "";

      // 添加时间范围
      if (params?.duration?.start_time && params?.duration?.end_time) {
        const startTime = new Date(params.duration.start_time);
        const endTime = new Date(params.duration.end_time);
        const startStr = `${startTime.getFullYear()}${String(startTime.getMonth() + 1).padStart(2, "0")}${String(startTime.getDate()).padStart(2, "0")}_${String(startTime.getHours()).padStart(2, "0")}${String(startTime.getMinutes()).padStart(2, "0")}`;
        const endStr = `${endTime.getFullYear()}${String(endTime.getMonth() + 1).padStart(2, "0")}${String(endTime.getDate()).padStart(2, "0")}_${String(endTime.getHours()).padStart(2, "0")}${String(endTime.getMinutes()).padStart(2, "0")}`;
        prefix += `${startStr}_${endStr}`;
      } else {
        prefix += "全部时间";
      }

      // 添加module_id
      if (params?.module_id) {
        prefix += `_模块${params.module_id}`;
      } else {
        prefix += "_全module";
      }

      return prefix;
    };

    const fileNamePrefix = getFileNamePrefix();

    // 导出汇总数据
    try {
      if ("showDirectoryPicker" in window) {
        // 让用户选择保存文件夹（只选择一次）
        const directoryHandle = await window.showDirectoryPicker({
          mode: "readwrite",
          id: "time-range-export",
          startIn: "downloads",
        });

        // 保存汇总文件
        const summaryFileHandle = await directoryHandle.getFileHandle(
          `${fileNamePrefix}_计数汇总.csv`,
          { create: true },
        );
        const summaryWritable = await summaryFileHandle.createWritable();
        await summaryWritable.write("\uFEFF" + csvContent);
        await summaryWritable.close();

        // 保存每个活动的pin文件
        for (const activity of stats.activityList) {
          const pins = Array.from(activity.pins);
          const content = pins.join("\n");
          const fileName = `${fileNamePrefix}_${activity.activity_id}_用户.csv`;

          try {
            const pinFileHandle = await directoryHandle.getFileHandle(
              fileName,
              { create: true },
            );
            const pinWritable = await pinFileHandle.createWritable();
            await pinWritable.write("\uFEFF" + content);
            await pinWritable.close();
          } catch (err) {
            console.error("Export error:", err);
            if (err.name !== "AbortError") {
              alert(`导出 ${fileName} 失败，请重试`);
            }
          }
        }

        alert("所有文件已成功导出到选定的文件夹");
      } else if ("showSaveFilePicker" in window) {
        // 降级方案：使用文件选择器（每个文件都需要选择）
        // 让用户选择保存位置（第一次）
        const handle = await window.showSaveFilePicker({
          suggestedName: `${fileNamePrefix}_计数汇总.csv`,
          types: [
            {
              description: "CSV Files",
              accept: {
                "text/csv": [".csv"],
              },
            },
          ],
        });
        const writable = await handle.createWritable();
        await writable.write("\uFEFF" + csvContent);
        await writable.close();

        // 对于剩余的文件，使用相同的默认路径（用户只需要点击保存）
        for (const activity of stats.activityList) {
          const pins = Array.from(activity.pins);
          const content = pins.join("\n");
          const fileName = `${fileNamePrefix}_${activity.activity_id}_用户.csv`;

          try {
            const pinHandle = await window.showSaveFilePicker({
              suggestedName: fileName,
              types: [
                {
                  description: "CSV Files",
                  accept: {
                    "text/csv": [".csv"],
                  },
                },
              ],
            });
            const pinWritable = await pinHandle.createWritable();
            await pinWritable.write("\uFEFF" + content);
            await pinWritable.close();
          } catch (err) {
            console.error("Export error:", err);
            if (err.name !== "AbortError") {
              alert(`导出 ${fileName} 失败，请重试`);
            }
          }
        }
      } else {
        // 传统下载方式
        const summaryCsv =
          "data:text/csv;charset=utf-8,\uFEFF" + encodeURIComponent(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", summaryCsv);
        link.setAttribute("download", `${fileNamePrefix}_计数汇总.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // 导出每个活动的pin
        stats.activityList.forEach((activity) => {
          const pins = Array.from(activity.pins);
          const content = pins.join("\n");
          const fileName = `${fileNamePrefix}_${activity.activity_id}_用户.csv`;
          const pinCsv =
            "data:text/csv;charset=utf-8,\uFEFF" + encodeURIComponent(content);
          const link = document.createElement("a");
          link.setAttribute("href", pinCsv);
          link.setAttribute("download", fileName);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        });
      }
    } catch (err) {
      console.error("Export error:", err);
      if (err.name !== "AbortError") {
        alert("导出失败，请重试");
      }
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">用户行为查询系统</h1>
      </header>

      <main className="app-main">
        <div className="card">
          <QueryForm onQuery={handleQuery} isLoading={loading} />
        </div>

        <div className="card">
          <button
            onClick={() => setShowTimeRangeModal(true)}
            className="btn btn-primary"
            style={{ width: "100%" }}
          >
            时间范围分析与导出
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        {data.length > 0 && (
          <>
            <div className="card">
              <StatCards data={stats} />
            </div>

            <div className="card">
              <ActivityTable
                data={stats.activityList}
                onSeeDetails={handleSeeDetails}
                onExportUsers={handleExportUsers}
              />
            </div>
          </>
        )}

        {data.length === 0 && !loading && (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <p className="empty-text">请输入查询条件开始查询</p>
          </div>
        )}
      </main>

      <DetailModal
        isOpen={showModal}
        onClose={handleCloseModal}
        data={selectedActivity}
      />

      <TimeRangeExport
        isOpen={showTimeRangeModal}
        onClose={() => setShowTimeRangeModal(false)}
        onQueryTimeRange={handleQueryTimeRange}
        isLoading={loading}
      />
    </div>
  );
};

export default App;
