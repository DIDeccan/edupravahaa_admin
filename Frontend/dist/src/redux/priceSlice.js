import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiList from "../../api.json";
import api from "../utility/api";

const API_URL = import.meta.env.VITE_API_BASE_URL;

// --- Fetch Courses ---
export const fetchCourses = createAsyncThunk(
  "calculator/fetchCourses",
  async (_, { rejectWithValue, getState }) => {
    const { auth } = getState();
    const token = auth?.token || localStorage.getItem("access");
    try {
      const url = `${API_URL}${apiList.courses.coursesList}`;
      const response = await api.get(url, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          "Content-Type": "application/json",
        },
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// --- Submit Calculation ---
export const fetchCalculatePrice = createAsyncThunk(
  "calculator/fetchCalculatePrice",
  async ({ course, original_price, discount_percent, final_price },
    { rejectWithValue, getState }) => {
    const { auth } = getState();
    const token = auth?.token || localStorage.getItem("access");
    try {
      const url = `${API_URL}${apiList.calculator.price}`;
      const response = await api.post(
        url,
        { course, original_price, discount_percent, final_price },
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// --- Fetch Price List (table data) ---
export const fetchPriceList = createAsyncThunk(
  "calculator/fetchPriceList",
  async (_, { rejectWithValue, getState }) => {
    const { auth } = getState();
    const token = auth?.token || localStorage.getItem("access");
    try {
      const url = `${API_URL}${apiList.calculator.list}`;
      const response = await api.get(url, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          "Content-Type": "application/json",
        },
      });
      return response.data.results;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// --- Delete Price Record ---
export const deletePrice = createAsyncThunk(
  "calculator/deletePrice",
  async (id, { rejectWithValue, getState }) => {
    const { auth } = getState();
    const token = auth?.token || localStorage.getItem("access");
    try {
      const url = `${API_URL}${apiList.calculator.delete}${id}/`;
      await api.delete(url, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          "Content-Type": "application/json",
        },
      });
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const calculatorSlice = createSlice({
  name: "pricing",
  initialState: {
    classLevel: null,
    originalPrice: "",
    discount: "",
    finalPrice: null,
    loading: false,
    error: null,
    success: null,
    courses: [],
    list: [],
  },
  reducers: {
    setClassLevel: (state, action) => {
      state.classLevel = action.payload;
    },
    setOriginalPrice: (state, action) => {
      state.originalPrice = action.payload;
    },
    setDiscount: (state, action) => {
      state.discount = action.payload;
    },
    reset: (state) => {
      state.classLevel = "";
      state.originalPrice = "";
      state.discount = "";
      state.finalPrice = null;
      state.error = null;
      state.success = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // courses
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.courses = action.payload;
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.error = action.payload;
      })
      // calculation
      .addCase(fetchCalculatePrice.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(fetchCalculatePrice.fulfilled, (state, action) => {
        state.loading = false;
        state.finalPrice = action.meta.arg.final_price;
        state.success = action.payload.message || "Price calculated successfully!";
      })
      .addCase(fetchCalculatePrice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // price list
      .addCase(fetchPriceList.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPriceList.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchPriceList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // delete
      .addCase(deletePrice.fulfilled, (state, action) => {
        state.list = state.list.filter((item) => item.id !== action.payload);
      });
  },
});

export const { setClassLevel, setOriginalPrice, setDiscount, reset } = calculatorSlice.actions;

export default calculatorSlice.reducer;
