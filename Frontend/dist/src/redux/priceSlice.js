import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import apiList from "../../api.json";
const API_URL = import.meta.env.VITE_API_BASE_URL;

// --- Submit Calculation ---
export const fetchCalculatePrice = createAsyncThunk(
    "calculator/fetchCalculatePrice",
    async ({ course, original_price, discount_percent, final_price }, { rejectWithValue,getState }) => {
        const { auth } = getState(); // get token if needed
      const token = auth?.token || localStorage.getItem("access");
      console.log("Access inside thunk:",token);
        try {
            const url = `${API_URL}${apiList.calculator.price}`;

            
            

            console.log("POST URL:", url);
            // console.log("Payload:", { course, original_price, discount_percent, final_price });

            const response = await axios.post(
                url,
                { course, original_price, discount_percent, final_price },
                {
                    headers: {
                        Authorization: token ? `Bearer ${token}` : "",  // ✅ or `Token ${token}` if Django REST
                        "Content-Type": "application/json",
                    },
                }
            );
            console.log("Access token:",token);
            

            return response.data;
        } catch (error) {
            console.error("API Error:", error);
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
            .addCase(fetchCalculatePrice.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = null;
            })
            .addCase(fetchCalculatePrice.fulfilled, (state, action) => {
                state.loading = false;
                state.finalPrice = action.meta.arg.final_price;
                state.success =
                    action.payload.message || "Price calculated successfully!";
            })
            .addCase(fetchCalculatePrice.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { setClassLevel, setOriginalPrice, setDiscount, reset } =
    calculatorSlice.actions;

export default calculatorSlice.reducer;