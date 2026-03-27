import React, { useState } from "react";
import QueryForm from "./components/QueryForm";
import StatCards from "./components/StatCards";
import ActivityTable from "./components/ActivityTable";
import DetailModal from "./components/DetailModal";
import TimeRangeExport from "./components/TimeRangeExport";
import PageNavigation from "./components/PageNavigation";
import ZuhegouQueryForm from "./components/ZuhegouQueryForm";
import ZuhegouResult from "./components/ZuhegouResult";
import { queryUserData } from "./services/api";
import { zuhegouApi } from "./services/zuhegouApi";

const App = () => {
  const [currentPage, setCurrentPage] = useState("activity");

  // 用户行为查询页面状态
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [totalActivityData, setTotalActivityData] = useState(new Map());
  const [timeRangeData, setTimeRangeData] = useState([]);
  const [timeRangeStats, setTimeRangeStats] = useState(null);
  const [showTimeRangeModal, setShowTimeRangeModal] = useState(false);

  // 组合购查询页面状态
  const [zuhegouData, setZuhegouData] = useState(null);
  const [zuhegouQueryType, setZuhegouQueryType] = useState(null);
  const [zuhegouLoading, setZuhegouLoading] = useState(false);
  const [zuhegouError, setZuhegouError] = useState(null);

  // 用户行为查询功能
  const handleQuery = async (params) => {
    setLoading(true);
    setError(null);
    try {
      const totalResponse = await queryUserData({});
      const totalMap = new Map();

      totalResponse.forEach((item) => {
        if (!totalMap.has(item.activity_id)) {
          totalMap.set(item.activity_id, new Set());
        }
        totalMap.get(item.activity_id).add(item.pin);
      });
      setTotalActivityData(totalMap);

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
    let totalUserCount = 0;
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

    // 计算所有活动参与用户数的总和
    totalUserCount = activityList.reduce(
      (sum, activity) => sum + activity.user_count,
      0,
    );

    return {
      totalRecords,
      clickCount,
      orderCount,
      totalUserCount,
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
        const directoryHandle = await window.showDirectoryPicker({
          mode: "readwrite",
          id: "activity-export",
          startIn: "downloads",
        });

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

      const stats = calculateTimeRangeStats(response || []);
      setTimeRangeStats(stats);

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
    let totalUserCount = 0;
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

    // 计算所有活动参与用户数的总和
    totalUserCount = activityList.reduce(
      (sum, activity) => sum + activity.user_count,
      0,
    );

    return {
      totalClickCount,
      totalOrderCount,
      totalUserCount,
      totalRecords: data.length,
      activityList,
    };
  };

  const exportTimeRangeData = async (stats, params) => {
    let csvContent = "活动ID,点击数,订阅数,参与用户数\n";

    stats.activityList.forEach((activity) => {
      csvContent += `${activity.activity_id},${activity.click_count},${activity.order_count},${activity.user_count}\n`;
    });

    // 添加总计行
    csvContent += `总计,${stats.totalClickCount},${stats.totalOrderCount},${stats.totalUserCount}\n`;

    const getFileNamePrefix = () => {
      let prefix = "";

      if (params?.duration?.start_time && params?.duration?.end_time) {
        const startTime = new Date(params.duration.start_time);
        const endTime = new Date(params.duration.end_time);
        const startStr = `${startTime.getFullYear()}${String(startTime.getMonth() + 1).padStart(2, "0")}${String(startTime.getDate()).padStart(2, "0")}_${String(startTime.getHours()).padStart(2, "0")}${String(startTime.getMinutes()).padStart(2, "0")}`;
        const endStr = `${endTime.getFullYear()}${String(endTime.getMonth() + 1).padStart(2, "0")}${String(endTime.getDate()).padStart(2, "0")}_${String(endTime.getHours()).padStart(2, "0")}${String(endTime.getMinutes()).padStart(2, "0")}`;
        prefix += `${startStr}_${endStr}`;
      } else {
        prefix += "全部时间";
      }

      if (params?.module_id) {
        prefix += `_模块${params.module_id}`;
      } else {
        prefix += "_全module";
      }

      return prefix;
    };

    const fileNamePrefix = getFileNamePrefix();

    try {
      if ("showDirectoryPicker" in window) {
        const directoryHandle = await window.showDirectoryPicker({
          mode: "readwrite",
          id: "time-range-export",
          startIn: "downloads",
        });

        const summaryFileHandle = await directoryHandle.getFileHandle(
          `${fileNamePrefix}_计数汇总.csv`,
          { create: true },
        );
        const summaryWritable = await summaryFileHandle.createWritable();
        await summaryWritable.write("\uFEFF" + csvContent);
        await summaryWritable.close();

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
        const summaryCsv =
          "data:text/csv;charset=utf-8,\uFEFF" + encodeURIComponent(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", summaryCsv);
        link.setAttribute("download", `${fileNamePrefix}_计数汇总.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

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

  // 组合购查询功能
  const handleZuhegouQuery = async (queryType, params) => {
    setZuhegouLoading(true);
    setZuhegouError(null);
    try {
      let response;
      if (queryType === "count") {
        // 处理多个skuId的情况
        if (params.skuId && params.skuId.includes(",")) {
          const skuIds = params.skuId
            .split(",")
            .map((id) => id.trim())
            .filter((id) => id);
          if (skuIds.length === 0) {
            throw new Error("请输入有效的SKU ID");
          }

          // 按次序请求接口
          const responses = [];
          for (const skuId of skuIds) {
            const singleResponse = await zuhegouApi.queryProductCount({
              ...params,
              skuId,
            });
            responses.push({
              skuId,
              count: singleResponse.count || 0,
            });
          }
          response = { sku_count_list: responses };
        } else {
          response = await zuhegouApi.queryProductCount(params);
        }
      } else if (queryType === "pins") {
        response = await zuhegouApi.queryProductPins(params);
      } else if (queryType === "products") {
        response = await zuhegouApi.queryUserProducts(params);
      }
      setZuhegouData(response);
      setZuhegouQueryType(queryType);
    } catch (err) {
      console.error("Zuhegou query error:", err);
      setZuhegouError(err.message || "查询失败，请重试");
    } finally {
      setZuhegouLoading(false);
    }
  };

  const handleZuhegouExport = async (data) => {
    let content = "";
    let fileName = "";

    if (zuhegouQueryType === "count" && data.sku_count_list) {
      content = "SKU ID,查询次数\n";
      data.sku_count_list.forEach((item) => {
        content += `${item.skuId},${item.count}\n`;
      });
      fileName = "zuhegou_sku_counts.csv";
    } else if (zuhegouQueryType === "pins") {
      content = data.pin_list.join("\n");
      fileName = "zuhegou_users.csv";
    } else if (zuhegouQueryType === "products") {
      content = data.skuId_list.join("\n");
      fileName = "zuhegou_products.csv";
    }

    try {
      if ("showDirectoryPicker" in window) {
        const directoryHandle = await window.showDirectoryPicker({
          mode: "readwrite",
          id: "zuhegou-export",
          startIn: "downloads",
        });

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

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">
          {currentPage === "activity" ? "用户行为查询系统" : "组合购查询系统"}
        </h1>
      </header>

      <PageNavigation currentPage={currentPage} onPageChange={setCurrentPage} />

      <main className="app-main">
        {currentPage === "activity" ? (
          <>
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
          </>
        ) : (
          <>
            <div className="card">
              <ZuhegouQueryForm
                onQuery={handleZuhegouQuery}
                isLoading={zuhegouLoading}
              />
            </div>

            {zuhegouError && (
              <div className="error-message">{zuhegouError}</div>
            )}

            <div className="card">
              <ZuhegouResult
                data={zuhegouData}
                queryType={zuhegouQueryType}
                onExport={handleZuhegouExport}
              />
            </div>
          </>
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
