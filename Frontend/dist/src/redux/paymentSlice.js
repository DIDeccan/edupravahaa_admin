// redux/paymentSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import apiList from "../../api.json"; 

const API_URL = import.meta.env.VITE_API_BASE_URL;

// Fetch payments from backend
export const fetchPayments = createAsyncThunk(
  "payments/fetch",
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState(); // grab token from auth slice
      const token = auth?.token || localStorage.getItem("access");

      const response = await axios.get(
        `${API_URL}${apiList.payment.paymentList}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
// Always return an array
      if (response.data?.results) {
        return response.data.results;
      }

      // Some APIs wrap data differently
      if (Array.isArray(response.data)) {
        return response.data;
      }

      return [];
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const paymentSlice = createSlice({
  name: "payments",
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPayments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPayments.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload; // assign backend data
      })
      .addCase(fetchPayments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default paymentSlice.reducer;
