import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_BASE_URL; // your backend base URL

// Fetch student count per course
export const fetchStudentCount = createAsyncThunk(
  "dashboard/fetchStudentCount",
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token; // get token from auth slice
      const response = await axios.get(`${API_URL}/api/courses/courses/student-count/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data; // API returns array of courses with student counts
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState: {
    chartData: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchStudentCount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudentCount.fulfilled, (state, action) => {
        state.loading = false;
        state.chartData = action.payload;
      })
      .addCase(fetchStudentCount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.detail || action.payload || "Error fetching data";
      });
  },
});

export default dashboardSlice.reducer;

