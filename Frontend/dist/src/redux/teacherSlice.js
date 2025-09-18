import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import apiList from "../../api.json"

const API_URL = import.meta.env.VITE_API_BASE_URL;

// Fetch all teachers
export const fetchTeachers = createAsyncThunk(
  "teachers/fetchTeachers",
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState()
      const token = auth?.token || localStorage.getItem("access");

      console.log("token", token)
      console.log("Token in localStorage:", localStorage.getItem("access"))


      const response = await axios.get(`${API_URL}${apiList.teacher.teacherList}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("API response:", response.data);

      return response.data.data; // assuming API returns array of teachers
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const registerTeacher = createAsyncThunk(
  "teachers/registerTeacher",
  async (teacherData, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const token = auth?.token || localStorage.getItem("access");

      console.log("Token in registerTeacher:", token);

      const response = await axios.post(
        `${API_URL}/api/auth/register/teacher/`,
        teacherData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const teacherSlice = createSlice({
  name: "teachers",
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // --- Fetch Teachers ---
      .addCase(fetchTeachers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTeachers.fulfilled, (state, action) => {
        state.loading = false;
        console.log("Fetched Teachers:", action.payload);
        state.list = action.payload; 
      })
      .addCase(fetchTeachers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // --- Register Teacher ---
      .addCase(registerTeacher.fulfilled, (state, action) => {
        state.loading = false;

        let newTeacher = action.payload?.data || action.payload;

        if (newTeacher?.course_assignments) {
          // Map backend `course_assignments` into UI-friendly fields
          newTeacher.course_assigned = newTeacher.course_assignments.map(ca => ca.course_name);
          newTeacher.batches = newTeacher.course_assignments.flatMap(ca => ca.batches);
        } else {
          newTeacher.course_assigned = [];
          newTeacher.batches = [];
        }

        state.list.push(newTeacher);
      })
      .addCase(registerTeacher.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});
export default teacherSlice.reducer;
