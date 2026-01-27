import baseApi from "./baseApi";

const settingsApi = {
  getGeneral: () => baseApi.get("/api/settings/general"),
  saveGeneral: data => baseApi.post("/api/settings/general", data),
  saveModules: data => baseApi.post("/api/settings/modules", data),
};

export default settingsApi;
