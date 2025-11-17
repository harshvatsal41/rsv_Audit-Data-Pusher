"use client";

import { useEffect, useState } from "react";

const API_URL = "https://script.google.com/macros/s/AKfycbzK_Eyki-wXdzxzrkW5iOa5qnIVacRqSkgmD1cVY0WrteJNqaindOBASPp-trdpxaiI/exec";
const PARTY_URL = "https://gsx2json.com/api?id=1bShbRh33vHhY15HDREB2ZiOJR8vbZXSct7DugMzGTfw&sheet=party";
const PRODUCT_BATCH_URL = "https://gsx2json.com/api?id=1bShbRh33vHhY15HDREB2ZiOJR8vbZXSct7DugMzGTfw&sheet=batch";

export default function Home() {
  const [items, setItems] = useState([]);
  const [partyList, setPartyList] = useState([]);
  const [productList, setProductList] = useState([]);
  const [allBatches, setAllBatches] = useState([]);
  const [batchList, setBatchList] = useState([]);
  const [apiCalled, setApiCalled] = useState(false);
  const [apiCalledsingle, setApiCalledsingle] = useState(false);

  const [loading, setLoading] = useState(true);
  const [editSrNo, setEditSrNo] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [batchLoading, setBatchLoading] = useState(false);

  // Search states for dropdowns
  const [productSearch, setProductSearch] = useState("");
  const [vendorSearch, setVendorSearch] = useState("");
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [showVendorDropdown, setShowVendorDropdown] = useState(false);

  // Manual entry states
  const [manualBatch, setManualBatch] = useState(false);
  const [manualProduct, setManualProduct] = useState(false);
  const [manualVendor, setManualVendor] = useState(false);

  // Refresh state
  const [refreshingBatches, setRefreshingBatches] = useState(false);

  // FORM DATA
  const [form, setForm] = useState({
    product_id: "",
    product_name: "",
    Batch_no: "",
    Quantity: "",
    Location: "",
    expiryDate: "",
    MRP: "",
    Unit_Price: "",
    Column1: "",
    vendor_id: "",
    vendor_name: "",
  });

  // Multiple items state
  const [multipleItems, setMultipleItems] = useState([]);
  const [currentMultipleItem, setCurrentMultipleItem] = useState({
    product_id: "",
    product_name: "",
    Batch_no: "",
    Quantity: "",
    expiryDate: "",
    MRP: "",
    Unit_Price: "",
    Column1: "",
    vendor_id: "",
    vendor_name: "",
  });

  /* ------------------------------------------------------------
     FETCH ALL DATA
  ------------------------------------------------------------ */
  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_URL, {
        method: "POST",
        body: JSON.stringify({ action: "read" }),
      });

      const json = await res.json();
      if (json.status === "success") setItems(json.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchParty = async () => {
    try {
      const res = await fetch(PARTY_URL);
      const data = await res.json();
      setPartyList(data.rows || []);
    } catch (error) {
      console.error("Error fetching party data:", error);
    }
  };

  const fetchProductsAndBatches = async () => {
    try {
      setBatchLoading(true);
      const res = await fetch(PRODUCT_BATCH_URL);
      const data = await res.json();

      console.log("Fetched batch data:", data.rows);

      // Extract unique products
      const uniqueProducts = [
        ...new Map(
          data.rows.map((i) => [i["Product ID"], i])
        ).values(),
      ];

      setProductList(uniqueProducts);
      setAllBatches(data.rows || []);
    } catch (error) {
      console.error("Error fetching products and batches:", error);
    } finally {
      setBatchLoading(false);
    }
  };

  // Refresh batches function
  const refreshBatches = async () => {
    try {
      setRefreshingBatches(true);
      await fetchProductsAndBatches();
      alert("Batches refreshed successfully!");
    } catch (error) {
      console.error("Error refreshing batches:", error);
      alert("Error refreshing batches. Please try again.");
    } finally {
      setRefreshingBatches(false);
    }
  };

  useEffect(() => {
    fetchItems();
    fetchParty();
    fetchProductsAndBatches();
  }, []);

  /* ------------------------------------------------------------
     FILTERED LISTS FOR DROPDOWNS
  ------------------------------------------------------------ */
  const filteredProducts = productList.filter(product =>
    product.Product?.toLowerCase().includes(productSearch.toLowerCase()) ||
    product["Product ID"]?.toLowerCase().includes(productSearch.toLowerCase())
  );

  const filteredVendors = partyList.filter(vendor =>
    vendor.partyName?.toLowerCase().includes(vendorSearch.toLowerCase())
  );

  /* ------------------------------------------------------------
     HANDLE INPUT
  ------------------------------------------------------------ */
  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleMultipleItemChange = (e) => {
    setCurrentMultipleItem((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  /* ------------------------------------------------------------
     SELECT PRODUCT → LOAD ONLY ITS BATCHES
  ------------------------------------------------------------ */
  const handleProductSelect = (product_id, product_name = "") => {
    const product = productList.find((p) => p["Product ID"] === product_id);
    const selectedProductName = product_name || product?.Product || "";

    setForm((p) => ({
      ...p,
      product_id,
      product_name: selectedProductName,
      Batch_no: "",
      Quantity: "",
      expiryDate: "",
      MRP: "",
      Unit_Price: "",
    }));

    setProductSearch(selectedProductName);
    setShowProductDropdown(false);
    setManualProduct(false);

    // Filter batches from pre-loaded allBatches
    const batches = allBatches.filter((b) => b["Product ID"] === product_id);
    const batchMap = new Map();
    batches.forEach(batch => {
      const batchKey = batch.Batch || `BATCH_${batch.dATA_ID}`;
      if (!batchMap.has(batchKey)) {
        batchMap.set(batchKey, batch);
      }
    });
    setBatchList(Array.from(batchMap.values()));
  };

  const handleMultipleProductSelect = (product_id, product_name = "") => {
    const product = productList.find((p) => p["Product ID"] === product_id);
    const selectedProductName = product_name || product?.Product || "";

    setCurrentMultipleItem((p) => ({
      ...p,
      product_id,
      product_name: selectedProductName,
      Batch_no: "",
      Quantity: "",
      expiryDate: "",
      MRP: "",
      Unit_Price: "",
    }));

    setProductSearch(selectedProductName);
    setShowProductDropdown(false);
    setManualProduct(false);

    // Filter batches from pre-loaded allBatches
    const batches = allBatches.filter((b) => b["Product ID"] === product_id);
    const batchMap = new Map();
    batches.forEach(batch => {
      const batchKey = batch.Batch || `BATCH_${batch.dATA_ID}`;
      if (!batchMap.has(batchKey)) {
        batchMap.set(batchKey, batch);
      }
    });
    setBatchList(Array.from(batchMap.values()));
  };

  /* ------------------------------------------------------------
     SELECT BATCH → AUTO FILL DETAILS (FIXED VERSION)
  ------------------------------------------------------------ */
  const handleBatchSelect = (batchId) => {
    console.log("Selected batch id (single):", batchId);
    
    if (!batchId || batchId === "manual") {
      setForm((p) => ({
        ...p,
        Quantity: "",
        expiryDate: "",
        MRP: "",
        Unit_Price: "",
      }));
      return;
    }

    // Find batch by dATA_ID only
    const batch = batchList.find((b) => String(b.dATA_ID) === String(batchId));

    console.log("Found batch (single):", batch);

    if (!batch) {
      console.log("No batch found for id:", batchId);
      setForm((p) => ({
        ...p,
        Quantity: "",
        expiryDate: "",
        MRP: "",
        Unit_Price: "",
      }));
      return;
    }

    // Format date properly to prevent any parsing issues
    let expiryDate = batch["Expiry Date"] || batch.Expiry || "";

    setForm((p) => ({
      ...p,
      Batch_no: `BATCH_${batch.dATA_ID}`,
      Quantity: batch.Quantity || batch["Current Stock"] || batch.quantity || "",
      expiryDate: expiryDate,
      MRP: batch.MRP || batch.mrp || "",
      Unit_Price: batch.Cost || batch["Unit Cost"] || batch.cost || "",
    }));
  };

  const handleMultipleBatchSelect = (batchId) => {
    console.log("Multiple selected batch id:", batchId);
    
    if (!batchId || batchId === "manual") {
      setCurrentMultipleItem((p) => ({
        ...p,
        Quantity: "",
        expiryDate: "",
        MRP: "",
        Unit_Price: "",
      }));
      return;
    }

    // Find batch by dATA_ID only
    const batch = batchList.find((b) => String(b.dATA_ID) === String(batchId));

    console.log("Multiple found batch:", batch);

    if (!batch) {
      setCurrentMultipleItem((p) => ({
        ...p,
        Quantity: "",
        expiryDate: "",
        MRP: "",
        Unit_Price: "",
      }));
      return;
    }

    // Format date properly
    let expiryDate = batch["Expiry Date"] || batch.Expiry || "";

    setCurrentMultipleItem((p) => ({
      ...p,
      Batch_no: `BATCH_${batch.dATA_ID}`,
      Quantity: batch.Quantity || batch["Current Stock"] || batch.quantity || "",
      expiryDate: expiryDate,
      MRP: batch.MRP || batch.mrp || "",
      Unit_Price: batch.Cost || batch["Unit Cost"] || batch.cost || "",
    }));
  };

  /* ------------------------------------------------------------
     MANUAL ENTRY HANDLERS
  ------------------------------------------------------------ */
  const handleManualProductEntry = () => {
    setManualProduct(true);
    setForm((p) => ({
      ...p,
      product_id: "MANUAL",
      product_name: "",
    }));
    setProductSearch("");
    setShowProductDropdown(false);
    setBatchList([]);
  };

  const handleManualMultipleProductEntry = () => {
    setManualProduct(true);
    setCurrentMultipleItem((p) => ({
      ...p,
      product_id: "MANUAL",
      product_name: "",
    }));
    setProductSearch("");
    setShowProductDropdown(false);
    setBatchList([]);
  };

  const handleManualBatchEntry = () => {
    setManualBatch(true);
    setForm((p) => ({
      ...p,
      Batch_no: "",
      Quantity: "",
      expiryDate: "",
      MRP: "",
      Unit_Price: "",
    }));
  };

  const handleManualMultipleBatchEntry = () => {
    setManualBatch(true);
    setCurrentMultipleItem((p) => ({
      ...p,
      Batch_no: "",
      Quantity: "",
      expiryDate: "",
      MRP: "",
      Unit_Price: "",
    }));
  };

  const handleManualVendorEntry = () => {
    setManualVendor(true);
    setForm((p) => ({
      ...p,
      vendor_id: "MANUAL",
      vendor_name: "",
    }));
    setVendorSearch("");
    setShowVendorDropdown(false);
  };

  const handleManualMultipleVendorEntry = () => {
    setManualVendor(true);
    setCurrentMultipleItem((p) => ({
      ...p,
      vendor_id: "MANUAL",
      vendor_name: "",
    }));
    setVendorSearch("");
    setShowVendorDropdown(false);
  };

  /* ------------------------------------------------------------
     VENDOR SELECTION HANDLERS
  ------------------------------------------------------------ */
  const handleVendorSelect = (vendor_id, vendor_name = "") => {
    const vendor = partyList.find((p) => p._id === vendor_id);
    const selectedVendorName = vendor_name || vendor?.partyName || "";

    setForm((p) => ({
      ...p,
      vendor_id: vendor_id || "",
      vendor_name: selectedVendorName,
    }));

    setVendorSearch(selectedVendorName);
    setShowVendorDropdown(false);
    setManualVendor(false);
  };

  const handleMultipleVendorSelect = (vendor_id, vendor_name = "") => {
    const vendor = partyList.find((p) => p._id === vendor_id);
    const selectedVendorName = vendor_name || vendor?.partyName || "";

    setCurrentMultipleItem((p) => ({
      ...p,
      vendor_id: vendor_id || "",
      vendor_name: selectedVendorName,
    }));

    setVendorSearch(selectedVendorName);
    setShowVendorDropdown(false);
    setManualVendor(false);
  };

  /* ------------------------------------------------------------
     CREATE ITEM (Single)
  ------------------------------------------------------------ */
  const createItem = async () => {
    setApiCalledsingle(true);
    // Required fields validation
    const requiredFields = ['product_id', 'Batch_no', 'Quantity', 'Location', 'vendor_id'];
    const missingFields = requiredFields.filter(field => !form[field]);

    if (missingFields.length > 0) {
      alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
      setApiCalledsingle(false);
      return;
    }

    try {
      await fetch(API_URL, {
        method: "POST",
        body: JSON.stringify({
          action: "create",
          data: form
        }),
      });

      resetForm();
      fetchItems();
      alert("Item added successfully!");
    } catch (error) {
      console.error("Error creating item:", error);
      alert("Error creating item. Please try again.");
    } finally {
      setApiCalledsingle(false);
    }
  };

  /* ------------------------------------------------------------
     CREATE MULTIPLE ITEMS
  ------------------------------------------------------------ */
  const createMultipleItems = async () => {
    setApiCalled(true);

    console.log("Multiple items to create:", multipleItems);
    if (!form.Location || multipleItems.length === 0) {
      alert("Please set Location and add at least one item");
      setApiCalled(false);
      return;
    }

    // Validate each item has required fields
    const invalidItems = multipleItems.filter(item =>
      !item.product_id || !item.Batch_no || !item.Quantity || !item.vendor_id
    );

    if (invalidItems.length > 0) {
      alert("Some items are missing required fields (Product, Batch, Quantity, or Vendor). Please check all items.");
      setApiCalled(false);
      return;
    }

    try {
      // Create items with common location but individual vendors
      const itemsToCreate = multipleItems.map(item => ({
        ...item,
        Location: form.Location,
      }));

      // Send each item individually to maintain Excel format
      for (const item of itemsToCreate) {
        await fetch(API_URL, {
          method: "POST",
          body: JSON.stringify({
            action: "create",
            data: item
          }),
        });
      }

      resetMultipleItems();
      fetchItems();
      alert(`Successfully added ${itemsToCreate.length} items to ${form.Location}`);
    } catch (error) {
      console.error("Error creating multiple items:", error);
      alert("Error creating multiple items. Please try again.");
    } finally {
      setApiCalled(false);
    }
  };

  /* ------------------------------------------------------------
     ADD ITEM TO MULTIPLE ITEMS LIST - FIXED
  ------------------------------------------------------------ */
  const addToMultipleItems = () => {
    const requiredFields = ['product_id', 'Batch_no', 'Quantity', 'vendor_id'];
    const missingFields = requiredFields.filter(field => !currentMultipleItem[field]);

    if (missingFields.length > 0) {
      alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    setMultipleItems(prev => [...prev, { ...currentMultipleItem }]);

    // Store vendor info before resetting
    const currentVendorName = currentMultipleItem.vendor_name;

    // Reset current multiple item but keep vendor selection for convenience
    setCurrentMultipleItem({
      product_id: "",
      product_name: "",
      Batch_no: "",
      Quantity: "",
      expiryDate: "",
      MRP: "",
      Unit_Price: "",
      Column1: "",
      vendor_id: currentMultipleItem.vendor_id,
      vendor_name: currentMultipleItem.vendor_name,
    });

    setBatchList([]);
    setManualBatch(false);
    setManualProduct(false);

    setProductSearch("");
    setVendorSearch(currentVendorName || "");
    setShowProductDropdown(false);
    setShowVendorDropdown(false);
  };

  /* ------------------------------------------------------------
     REMOVE ITEM FROM MULTIPLE ITEMS LIST
  ------------------------------------------------------------ */
  const removeFromMultipleItems = (index) => {
    setMultipleItems(prev => prev.filter((_, i) => i !== index));
  };

  /* ------------------------------------------------------------
     UPDATE ITEM
  ------------------------------------------------------------ */
  const updateItem = async () => {
    setApiCalledsingle(true);

    const requiredFields = ['product_id', 'Batch_no', 'Quantity', 'Location', 'vendor_id'];
    const missingFields = requiredFields.filter(field => !form[field]);

    if (missingFields.length > 0) {
      alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
      setApiCalledsingle(false);
      return;
    }

    try {
      await fetch(API_URL, {
        method: "POST",
        body: JSON.stringify({ action: "update", data: { ...form, srNo: editSrNo } }),
      });

      setEditSrNo(null);
      resetForm();
      fetchItems();
      alert("Item updated successfully!");
    } catch (error) {
      console.error("Error updating item:", error);
      alert("Error updating item. Please try again.");
    } finally {
      setApiCalledsingle(false);
    }
  };

  /* ------------------------------------------------------------
     DELETE
  ------------------------------------------------------------ */
  const deleteItem = async (srNo) => {
    if (confirm("Are you sure you want to delete this item?")) {
      try {
        await fetch(API_URL, {
          method: "POST",
          body: JSON.stringify({ action: "delete", query: { srNo } }),
        });
        fetchItems();
        alert("Item deleted successfully!");
      } catch (error) {
        console.error("Error deleting item:", error);
        alert("Error deleting item. Please try again.");
      }
    }
  };

  /* ------------------------------------------------------------
     LOAD FOR EDIT
  ------------------------------------------------------------ */
  const loadForEdit = (item) => {
    console.log("Loading for edit:", item);

    setEditSrNo(item.srNo);

    setForm({
      product_id: item.product_id || "",
      product_name: item.product_name || "",
      Batch_no: item.Batch_no || "",
      Quantity: item.Quantity || "",
      Location: item.Location || "",
      expiryDate: item.expiryDate || "",
      MRP: item.MRP || "",
      Unit_Price: item.Unit_Price || "",
      Column1: item.Column1 || "",
      vendor_id: item.vendor_id || "",
      vendor_name: item.vendor_name || "",
    });

    setProductSearch(item.product_name || "");
    setVendorSearch(item.vendor_name || "");

    // Load batches for the product
    if (item.product_id && item.product_id !== "MANUAL") {
      const batches = allBatches.filter((b) => b["Product ID"] === item.product_id);
      const batchMap = new Map();
      batches.forEach(batch => {
        const batchKey = batch.Batch || `BATCH_${batch.dATA_ID}`;
        if (!batchMap.has(batchKey)) {
          batchMap.set(batchKey, batch);
        }
      });
      setBatchList(Array.from(batchMap.values()));
    }
  };

  /* ------------------------------------------------------------
     RESET FUNCTIONS
  ------------------------------------------------------------ */
  const resetForm = () => {
    setForm({
      product_id: "",
      product_name: "",
      Batch_no: "",
      Quantity: "",
      Location: "",
      expiryDate: "",
      MRP: "",
      Unit_Price: "",
      Column1: "",
      vendor_id: "",
      vendor_name: "",
    });
    setBatchList([]);
    setEditSrNo(null);
    setProductSearch("");
    setVendorSearch("");
    setShowProductDropdown(false);
    setShowVendorDropdown(false);
    setManualBatch(false);
    setManualProduct(false);
    setManualVendor(false);
  };

  const resetMultipleItems = () => {
    setMultipleItems([]);
    setCurrentMultipleItem({
      product_id: "",
      product_name: "",
      Batch_no: "",
      Quantity: "",
      expiryDate: "",
      MRP: "",
      Unit_Price: "",
      Column1: "",
      vendor_id: "",
      vendor_name: "",
    });
    setBatchList([]);
    setProductSearch("");
    setVendorSearch("");
    setManualBatch(false);
    setManualProduct(false);
    setManualVendor(false);
  };

  /* ------------------------------------------------------------
     FILTERED ITEMS FOR SEARCH
  ------------------------------------------------------------ */
  const filteredItems = items.filter(item =>
    Object.values(item).some(value =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-8 px-4">
      <main className="max-w-9xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 dark:text-white mb-2">
            Inventory Manager
          </h1>
          <p className="text-slate-600 dark:text-slate-300">
            Manage your inventory efficiently and effectively
          </p>
        </div>

        <div className="grid lg:grid-cols-1 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-1 space-y-6">

            {/* Multiple Items Form */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-slate-800 dark:text-white">
                  Add Multiple Items
                </h2>
                <button
                  onClick={refreshBatches}
                  disabled={refreshingBatches}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg font-medium transition-colors text-sm"
                >
                  {refreshingBatches ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Refreshing...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Refresh Batches
                    </>
                  )}
                </button>
              </div>

              <div className="space-y-4">
                {/* Common Location */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Location *
                  </label>
                  <input
                    name="Location"
                    value={form.Location || ""}
                    onChange={handleChange}
                    placeholder="Location"
                    className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                {/* Item Details */}
                <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-700/30 rounded-lg">
                  <h3 className="font-medium text-slate-700 dark:text-slate-300">Add Item</h3>

                  {/* Product with Search */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Product *
                    </label>
                    {manualProduct ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          name="product_name"
                          value={currentMultipleItem.product_name || ""}
                          onChange={handleMultipleItemChange}
                          placeholder="Enter product name"
                          className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                        <input
                          type="text"
                          name="product_id"
                          value={currentMultipleItem.product_id || ""}
                          onChange={handleMultipleItemChange}
                          placeholder="Enter product ID"
                          className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                        <button
                          onClick={() => setManualProduct(false)}
                          className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400"
                        >
                          ← Select from list
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={productSearch}
                          onChange={(e) => {
                            setProductSearch(e.target.value);
                            setShowProductDropdown(true);
                          }}
                          onFocus={() => setShowProductDropdown(true)}
                          placeholder="Search or select product"
                          className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                        <button
                          onClick={handleManualMultipleProductEntry}
                          className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400"
                        >
                          + Add product manually
                        </button>
                      </div>
                    )}

                    {showProductDropdown && !manualProduct && (
                      <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {filteredProducts.map((product) => (
                          <div
                            key={product["Product ID"]}
                            onClick={() => handleMultipleProductSelect(product["Product ID"], product.Product)}
                            className="p-3 hover:bg-slate-100 dark:hover:bg-slate-600 cursor-pointer border-b border-slate-200 dark:border-slate-600 last:border-b-0"
                          >
                            <div className="font-medium text-slate-900 dark:text-white">
                              {product.Product}
                            </div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">
                              {product["Product ID"]}
                            </div>
                          </div>
                        ))}
                        {filteredProducts.length === 0 && (
                          <div className="p-3 text-slate-500 dark:text-slate-400 text-center">
                            No products found
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Batch Selection - FIXED */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Batch No *
                    </label>
                    {manualBatch ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          name="Batch_no"
                          value={currentMultipleItem.Batch_no || ""}
                          onChange={handleMultipleItemChange}
                          placeholder="Enter batch number"
                          className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                        <button
                          onClick={() => setManualBatch(false)}
                          className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400"
                        >
                          ← Select from list
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <select
                          name="Batch_no"
                          value={
                            currentMultipleItem.Batch_no
                              ? String(currentMultipleItem.Batch_no).replace(/^BATCH_/, "")
                              : ""
                          }
                          onChange={(e) => {
                            if (e.target.value === "manual") {
                              handleManualMultipleBatchEntry();
                            } else {
                              handleMultipleBatchSelect(e.target.value);
                            }
                          }}
                          className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          disabled={batchLoading || !currentMultipleItem.product_id}
                        >
                          <option value="">
                            {batchLoading ? "Loading..." : !currentMultipleItem.product_id ? "Select product first" : "Select Batch"}
                          </option>
                          {batchList.map((b, i) => {
                            return (
                              <option key={i} value={b.dATA_ID}>
                                {`${b.Batch}`} {b.Quantity ? `(Qty: ${b.Quantity})` : ''}
                              </option>
                            );
                          })}
                          <option value="manual">+ Add batch manually</option>
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Quantity and Vendor */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Quantity *
                      </label>
                      <input
                        type="number"
                        name="Quantity"
                        value={currentMultipleItem.Quantity || ""}
                        onChange={handleMultipleItemChange}
                        placeholder="Quantity"
                        className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>

                    {/* Vendor with Search */}
                    <div className="relative">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Vendor *
                      </label>
                      {manualVendor ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            name="vendor_name"
                            value={currentMultipleItem.vendor_name || ""}
                            onChange={handleMultipleItemChange}
                            placeholder="Enter vendor name"
                            className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          />
                          <button
                            onClick={() => setManualVendor(false)}
                            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400"
                          >
                            ← Select from list
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={vendorSearch}
                            onChange={(e) => {
                              setVendorSearch(e.target.value);
                              setShowVendorDropdown(true);
                            }}
                            onFocus={() => setShowVendorDropdown(true)}
                            placeholder="Search vendor"
                            className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          />
                          <button
                            onClick={handleManualMultipleVendorEntry}
                            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400"
                          >
                            + Add vendor manually
                          </button>
                        </div>
                      )}

                      {showVendorDropdown && !manualVendor && (
                        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {filteredVendors.map((vendor) => (
                            <div
                              key={vendor._id}
                              onClick={() => handleMultipleVendorSelect(vendor._id, vendor.partyName)}
                              className="p-3 hover:bg-slate-100 dark:hover:bg-slate-600 cursor-pointer border-b border-slate-200 dark:border-slate-600 last:border-b-0"
                            >
                              <div className="font-medium text-slate-900 dark:text-white">
                                {vendor.partyName}
                              </div>
                            </div>
                          ))}
                          {filteredVendors.length === 0 && (
                            <div className="p-3 text-slate-500 dark:text-slate-400 text-center">
                              No vendors found
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Additional Fields */}
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="date"
                      name="expiryDate"
                      value={currentMultipleItem.expiryDate || ""}
                      onChange={handleMultipleItemChange}
                      placeholder="Expiry Date"
                      className="p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                    <input
                      type="number"
                      name="MRP"
                      value={currentMultipleItem.MRP || ""}
                      onChange={handleMultipleItemChange}
                      placeholder="MRP"
                      className="p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      name="Unit_Price"
                      value={currentMultipleItem.Unit_Price || ""}
                      onChange={handleMultipleItemChange}
                      placeholder="Unit Price"
                      className="p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                    <input
                      name="Column1"
                      value={currentMultipleItem.Column1 || ""}
                      onChange={handleMultipleItemChange}
                      placeholder="Notes"
                      className="p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <button
                    onClick={addToMultipleItems}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                  >
                    Add to List
                  </button>
                </div>

                {/* Items List */}
                {multipleItems.length > 0 && (
                  <div className="border border-slate-200 dark:border-slate-600 rounded-lg">
                    <div className="p-3 bg-slate-50 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
                      <h3 className="font-medium text-slate-700 dark:text-slate-300">
                        Items to Add ({multipleItems.length})
                      </h3>
                    </div>
                    <div className="max-h-40 overflow-y-auto">
                      {multipleItems.map((item, index) => (
                        <div key={index} className="p-3 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                          <div className="flex-1">
                            <div className="font-medium text-slate-700 dark:text-slate-300">{item.product_name}</div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">
                              Batch: {item.Batch_no} | Qty: {item.Quantity} | Vendor: {item.vendor_name}
                            </div>
                          </div>
                          <button
                            onClick={() => removeFromMultipleItems(index)}
                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 ml-2"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Submit Multiple Items */}
                <button
                  onClick={createMultipleItems}
                  disabled={multipleItems.length === 0 || !form.Location || apiCalled}
                  className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add {multipleItems.length} Items to {form.Location || "Location"}
                </button>
              </div>
            </div>

            {/* Single Item Form */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-slate-800 dark:text-white">
                  {editSrNo ? "Edit Item" : "Add Single Item"}
                </h2>
                {editSrNo && (
                  <button
                    onClick={resetForm}
                    className="px-3 py-1 text-sm text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white border border-slate-300 dark:border-slate-600 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Location *
                  </label>
                  <input
                    name="Location"
                    value={form.Location || ""}
                    onChange={handleChange}
                    placeholder="Enter location"
                    className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                {/* Product Selection with Search */}
                <div className="relative">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Product *
                  </label>
                  {manualProduct ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        name="product_name"
                        value={form.product_name || ""}
                        onChange={handleChange}
                        placeholder="Enter product name"
                        className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                      <input
                        type="text"
                        name="product_id"
                        value={form.product_id || ""}
                        onChange={handleChange}
                        placeholder="Enter product ID"
                        className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                      <button
                        onClick={() => setManualProduct(false)}
                        className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400"
                      >
                        ← Select from list
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={productSearch}
                        onChange={(e) => {
                          setProductSearch(e.target.value);
                          setShowProductDropdown(true);
                        }}
                        onFocus={() => setShowProductDropdown(true)}
                        placeholder="Search or select product"
                        className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                      <button
                        onClick={handleManualProductEntry}
                        className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400"
                      >
                        + Add product manually
                      </button>
                    </div>
                  )}

                  {showProductDropdown && !manualProduct && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {filteredProducts.map((product) => (
                        <div
                          key={product["Product ID"]}
                          onClick={() => handleProductSelect(product["Product ID"], product.Product)}
                          className="p-3 hover:bg-slate-100 dark:hover:bg-slate-600 cursor-pointer border-b border-slate-200 dark:border-slate-600 last:border-b-0"
                        >
                          <div className="font-medium text-slate-900 dark:text-white">
                            {product.Product}
                          </div>
                          <div className="text-sm text-slate-500 dark:text-slate-400">
                            {product["Product ID"]}
                          </div>
                        </div>
                      ))}
                      {filteredProducts.length === 0 && (
                        <div className="p-3 text-slate-500 dark:text-slate-400 text-center">
                          No products found
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Batch Selection - FIXED */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Batch No *
                  </label>
                  {manualBatch ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        name="Batch_no"
                        value={form.Batch_no || ""}
                        onChange={handleChange}
                        placeholder="Enter batch number"
                        className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                      <button
                        onClick={() => setManualBatch(false)}
                        className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400"
                      >
                        ← Select from list
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <select
                        name="Batch_no"
                        value={
                          form.Batch_no ? String(form.Batch_no).replace(/^BATCH_/, "") : ""
                        }
                        onChange={(e) => {
                          if (e.target.value === "manual") {
                            handleManualBatchEntry();
                          } else {
                            handleBatchSelect(e.target.value);
                          }
                        }}
                        className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        disabled={batchLoading || !form.product_id}
                      >
                        <option value="">
                          {batchLoading ? "Loading batches..." : !form.product_id ? "Select product first" : "Select Batch"}
                        </option>
                        {batchList.map((b, i) => {
                          return (
                            <option key={i} value={b.dATA_ID}>
                              {`BATCH_${b.Batch}`} {b.Quantity ? `(Qty: ${b.Quantity})` : ''}
                            </option>
                          );
                        })}
                        <option value="manual">+ Add batch manually</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* Input Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Quantity *
                    </label>
                    <input
                      type="number"
                      name="Quantity"
                      value={form.Quantity || ""}
                      onChange={handleChange}
                      placeholder="Quantity"
                      className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Expiry Date
                    </label>
                    <input
                      type="date"
                      name="expiryDate"
                      value={form.expiryDate || ""}
                      onChange={handleChange}
                      placeholder="Expiry Date"
                      className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      MRP
                    </label>
                    <input
                      type="number"
                      name="MRP"
                      value={form.MRP || ""}
                      onChange={handleChange}
                      placeholder="MRP"
                      className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Unit Price
                    </label>
                    <input
                      type="number"
                      name="Unit_Price"
                      value={form.Unit_Price || ""}
                      onChange={handleChange}
                      placeholder="Unit Price"
                      className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Vendor Selection with Search */}
                <div className="relative">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Vendor *
                  </label>
                  {manualVendor ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        name="vendor_name"
                        value={form.vendor_name || ""}
                        onChange={handleChange}
                        placeholder="Enter vendor name"
                        className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                      <button
                        onClick={() => setManualVendor(false)}
                        className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400"
                      >
                        ← Select from list
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={vendorSearch}
                        onChange={(e) => {
                          setVendorSearch(e.target.value);
                          setShowVendorDropdown(true);
                        }}
                        onFocus={() => setShowVendorDropdown(true)}
                        placeholder="Search or select vendor"
                        className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                      <button
                        onClick={handleManualVendorEntry}
                        className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400"
                      >
                        + Add vendor manually
                      </button>
                    </div>
                  )}

                  {showVendorDropdown && !manualVendor && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {filteredVendors.map((vendor) => (
                        <div
                          key={vendor._id}
                          onClick={() => handleVendorSelect(vendor._id, vendor.partyName)}
                          className="p-3 hover:bg-slate-100 dark:hover:bg-slate-600 cursor-pointer border-b border-slate-200 dark:border-slate-600 last:border-b-0"
                        >
                          <div className="font-medium text-slate-900 dark:text-white">
                            {vendor.partyName}
                          </div>
                        </div>
                      ))}
                      {filteredVendors.length === 0 && (
                        <div className="p-3 text-slate-500 dark:text-slate-400 text-center">
                          No vendors found
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Notes
                  </label>
                  <input
                    name="Column1"
                    value={form.Column1 || ""}
                    onChange={handleChange}
                    placeholder="Additional notes"
                    className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                {/* Action Button */}
                <div className="flex gap-3 pt-4">
                  {editSrNo ? (
                    <button
                      onClick={updateItem}
                      disabled={apiCalledsingle}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      {apiCalledsingle ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Updating...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Update Item
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={createItem}
                      disabled={apiCalledsingle}
                      className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      {apiCalledsingle ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Adding...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          Add Single Item
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* Table Section */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden">
              {/* Table Header */}
              <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-800 dark:text-white">
                      Inventory Items
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      {filteredItems.length} items found
                    </p>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search inventory..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full sm:w-64 pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto max-h-[600px]">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : filteredItems.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m8-8V4a1 1 0 00-1-1h-2a1 1 0 00-1 1v1M9 7h6" />
                    </svg>
                    <h3 className="mt-4 text-lg font-medium text-slate-900 dark:text-white">No items found</h3>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                      {searchTerm ? "Try adjusting your search term" : "Get started by adding your first inventory item"}
                    </p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-slate-50 dark:bg-slate-700 sticky top-0">
                      <tr>
                        {["srNo", "Product", "Batch", "Qty", "Location", "Expiry", "MRP", "Price", "Vendor", "Actions"].map((h) => (
                          <th
                            key={h}
                            className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                      {filteredItems.map((item, i) => (
                        <tr
                          key={i}
                          className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                        >
                          <td className="px-4 py-3 text-sm text-slate-900 dark:text-white font-medium">
                            {item.srNo}
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm font-medium text-slate-900 dark:text-white">
                              {item.product_name}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              {item.product_id}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-900 dark:text-white">
                            {item.Batch_no}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-900 dark:text-white">
                            {item.Quantity}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-900 dark:text-white max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap" title={item.Location}>
                            {item.Location}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-900 dark:text-white">
                            {item.expiryDate}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-900 dark:text-white">
                            ₹{item.MRP}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-900 dark:text-white">
                            ₹{item.Unit_Price}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-900 dark:text-white">
                            {item.vendor_name}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => loadForEdit(item)}
                                className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => deleteItem(item.srNo)}
                                className="inline-flex items-center px-2 py-1 text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}