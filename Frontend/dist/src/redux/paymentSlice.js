
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// ✅ Mock API call (no network request, returns fake data)
export const fetchPayments = createAsyncThunk("payments/fetch", async () => {
  return [
    {
      id: 1,
      start_date: "2025-09-01T10:00:00",
      end_date: "2025-09-01T12:00:00",
      course: "ReactJS",
      status: "Paid"
    },
    {
      id: 2,
      start_date: "2025-09-02T14:00:00",
      end_date: "2025-09-02T16:00:00",
      course: "NodeJS",
      status: "Pending"
    },
    {
      id: 3,
      start_date: "2025-09-03T09:00:00",
      end_date: "2025-09-03T11:00:00",
      course: "Python",
      status: "Failed"
    }
  ];
});

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
      })
      .addCase(fetchPayments.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload; // assign dummy data
      })
      .addCase(fetchPayments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default paymentSlice.reducer;
