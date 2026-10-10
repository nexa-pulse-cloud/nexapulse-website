
import React, { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";

const emptyForm = {
  name: "",
  category: "Smartwatches",
  description: "",
  price: "",
  stock: "0",
  image_url: "",
};

export default function AdminPanel() {
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [products, setProducts] = useState([]);
  
const [orders, setOrders] = useState([]);
const [ordersLoading, setOrdersLoading] = useState(false);
const [orderSearch, setOrderSearch] = useState("");
const [orderStatusFilter, setOrderStatusFilter] = useState("All");

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    const checkAdmin = async (currentSession) => {
      if (!active) return;

      setSession(currentSession);
      setIsAdmin(false);

      if (!currentSession) {
        setChecking(false);
        return;
      }

      setChecking(true);
      const { data, error } = await supabase.rpc("is_admin");

      if (!active) return;

      setIsAdmin(!error && data === true);
      setChecking(false);
    };

    supabase.auth.getSession().then(({ data }) => {
      checkAdmin(data.session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, currentSession) => {
        checkAdmin(currentSession);
      }
    );

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

useEffect(() => {
  if (session && isAdmin) {
    loadProducts();
    loadOrders();
  }
}, [session, isAdmin]);

  async function loadProducts() {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setMessage("Products load হয়নি: " + error.message);
      return;
    }

    setProducts(data || []);
  }


async function loadOrders() {
  setOrdersLoading(true);

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    setMessage("Orders load failed: " + error.message);
    console.error("Orders load failed:", error);
  } else {
    setOrders(data || []);
  }

  setOrdersLoading(false);
}

  async function updateOrderStatus(orderId, newStatus) {
    const allowedStatuses = [
      "Pending",
      "Processing",
      "Shipped",
      "Delivered",
      "Cancelled",
    ];

    if (!allowedStatuses.includes(newStatus)) return;

    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);

    if (error) {
      setMessage("Order status update failed: " + error.message);
      return;
    }

    setMessage("Order status updated successfully.");
    await loadOrders();
  }

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) setMessage("Login হয়নি: " + error.message);

    setLoading(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setProducts([]);
    setForm(emptyForm);
    setEditingId(null);
    setMessage("");
  }

  async function saveProduct(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      let imageUrl = form.image_url.trim();

      if (imageFile) {
        const extension = imageFile.name.split(".").pop();
        const filePath = `${crypto.randomUUID()}.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(filePath, imageFile, {
            upsert: false,
            contentType: imageFile.type,
          });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from("product-images")
          .getPublicUrl(filePath);

        imageUrl = data.publicUrl;
      }

      const productData = {
        name: form.name.trim(),
        category: form.category,
        description: form.description.trim(),
        price: Number(form.price),
        stock: Number(form.stock),
        image_url: imageUrl,
      };

      const result = editingId
        ? await supabase
            .from("products")
            .update(productData)
            .eq("id", editingId)
        : await supabase.from("products").insert(productData);

      if (result.error) throw result.error;

      setMessage(editingId ? "Product update হয়েছে!" : "Product যোগ হয়েছে!");
      setForm(emptyForm);
      setEditingId(null);
      setImageFile(null);
      await loadProducts();
    } catch (error) {
      setMessage("সমস্যা হয়েছে: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  function editProduct(product) {
    setEditingId(product.id);
    setForm({
      name: product.name || "",
      category: product.category || "Smartwatches",
      description: product.description || "",
      price: String(product.price ?? ""),
      stock: String(product.stock ?? 0),
      image_url: product.image_url || "",
    });
    setImageFile(null);
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deleteProduct(product) {
    if (!window.confirm(`"${product.name}" ডিলিট করতে চাও?`)) return;

    setLoading(true);
    setMessage("");

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", product.id);

    if (error) {
      setMessage("Delete হয়নি: " + error.message);
    } else {
      setMessage("Product ডিলিট হয়েছে!");
      await loadProducts();
    }

    setLoading(false);
  }

  const inputStyle = {
    width: "100%",
    boxSizing: "border-box",
    padding: "11px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    marginTop: "6px",
    font: "inherit",
  };

  const labelStyle = {
    display: "block",
    marginBottom: "14px",
    fontWeight: 600,
  };

  const buttonStyle = {
    padding: "10px 15px",
    border: 0,
    borderRadius: "8px",
    background: "#0891b2",
    color: "white",
    fontWeight: 700,
    cursor: "pointer",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f3f6fa",
        color: "#172033",
        padding: "24px 16px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
            marginBottom: 24,
          }}
        >
          <div>
            <h1 style={{ margin: 0 }}>NEXAPULSE Admin</h1>
            <p style={{ color: "#64748b" }}>
              Product and inventory management
            </p>
          </div>

          {session && (
            <button style={buttonStyle} onClick={handleLogout}>
              Logout
            </button>
          )}
        </header>

        {checking ? (
          <p>Admin access যাচাই হচ্ছে...</p>
        ) : !session ? (
          <form
            onSubmit={handleLogin}
            style={{
              background: "white",
              padding: 24,
              borderRadius: 14,
              maxWidth: 420,
              boxShadow: "0 4px 20px #0000000a",
            }}
          >
            <h2>Admin Login</h2>

            <label style={labelStyle}>
              Email
              <input
                style={inputStyle}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="username"
              />
            </label>

            <label style={labelStyle}>
              Password
              <input
                style={inputStyle}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </label>

            <button style={buttonStyle} disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        ) : !isAdmin ? (
          <p>
            এই account-এ Admin permission নেই। Supabase-এর admin_users
            তালিকায় account-এর user ID যুক্ত আছে কি না যাচাই করো।
          </p>
        ) : (
          <>
            <form
              onSubmit={saveProduct}
              style={{
                background: "white",
                padding: 24,
                borderRadius: 14,
                marginBottom: 28,
              }}
            >
              <h2>{editingId ? "Edit Product" : "Add New Product"}</h2>

              <label style={labelStyle}>
                Product Name
                <input
                  style={inputStyle}
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                  required
                />
              </label>

              <label style={labelStyle}>
                Category
                <select
                  style={inputStyle}
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                >
                  <option>Smartwatches</option>
                  <option>Headphones</option>
                  <option>Mobile Accessories</option>
                  <option>Other</option>
                </select>
              </label>

              <label style={labelStyle}>
                Description
                <textarea
                  style={inputStyle}
                  rows={3}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </label>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: 16,
                }}
              >
                <label style={labelStyle}>
                  Price (৳)
                  <input
                    style={inputStyle}
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={(e) =>
                      setForm({ ...form, price: e.target.value })
                    }
                    required
                  />
                </label>

                <label style={labelStyle}>
                  Stock
                  <input
                    style={inputStyle}
                    type="number"
                    min="0"
                    step="1"
                    value={form.stock}
                    onChange={(e) =>
                      setForm({ ...form, stock: e.target.value })
                    }
                    required
                  />
                </label>
              </div>

              <label style={labelStyle}>
                Product Image
                <input
                  style={{ ...inputStyle, border: "none", paddingLeft: 0 }}
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setImageFile(e.target.files?.[0] || null)
                  }
                />
              </label>

              {form.image_url && !imageFile && (
                <p>
                  Current image:{" "}
                  <a href={form.image_url} target="_blank" rel="noreferrer">
                    View image
                  </a>
                </p>
              )}

              <label style={labelStyle}>
                Or Image URL
                <input
                  style={inputStyle}
                  type="url"
                  value={form.image_url}
                  onChange={(e) =>
                    setForm({ ...form, image_url: e.target.value })
                  }
                  placeholder="https://..."
                />
              </label>

              <button style={buttonStyle} disabled={loading}>
                {loading
                  ? "Saving..."
                  : editingId
                    ? "Update Product"
                    : "Add Product"}
              </button>

              {editingId && (
                <button
                  type="button"
                  style={{ ...buttonStyle, background: "#64748b", marginLeft: 8 }}
                  onClick={() => {
                    setEditingId(null);
                    setForm(emptyForm);
                    setImageFile(null);
                  }}
                >
                  Cancel
                </button>
              )}
            </form>

            <section
              style={{
                background: "white",
                padding: 24,
                borderRadius: 14,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  alignItems: "center",
                }}
              >
                <h2>Products ({products.length})</h2>
                <button style={buttonStyle} onClick={loadProducts}>
                  Refresh
                </button>
              </div>

              {products.length === 0 ? (
                <p>এখনও কোনো product যোগ করা হয়নি।</p>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      textAlign: "left",
                    }}
                  >
                    <thead>
                      <tr>
                        <th style={{ padding: 10 }}>Product</th>
                        <th style={{ padding: 10 }}>Price</th>
                        <th style={{ padding: 10 }}>Stock</th>
                        <th style={{ padding: 10 }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product) => (
                        <tr key={product.id}>
                          <td style={{ padding: 10, borderTop: "1px solid #e2e8f0" }}>
                            {product.image_url && (
                              <img
                                src={product.image_url}
                                alt={product.name}
                                style={{
                                  width: 48,
                                  height: 48,
                                  objectFit: "cover",
                                  borderRadius: 8,
                                  display: "block",
                                  marginBottom: 6,
                                }}
                              />
                            )}
                            <strong>{product.name}</strong>
                            <br />
                            <small>{product.category}</small>
                          </td>
                          <td style={{ padding: 10, borderTop: "1px solid #e2e8f0" }}>
                            ৳{Number(product.price).toLocaleString("en-BD")}
                          </td>
                          <td style={{ padding: 10, borderTop: "1px solid #e2e8f0" }}>
                            {product.stock}
                          </td>
                          <td style={{ padding: 10, borderTop: "1px solid #e2e8f0" }}>
                            <button
                              style={buttonStyle}
                              onClick={() => editProduct(product)}
                            >
                              Edit
                            </button>
                            <button
                              style={{
                                ...buttonStyle,
                                background: "#dc2626",
                                marginLeft: 6,
                                marginTop: 6,
                              }}
                              disabled={loading}
                              onClick={() => deleteProduct(product)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section> ```jsx
<section
  style={{
    background: "white",
    padding: 20,
    borderRadius: 12,
    marginTop: 24,
    overflowX: "auto",
  }}
>
  <h2>Order Management</h2>

  <div
    style={{
      display: "flex",
      gap: 10,
      flexWrap: "wrap",
      marginBottom: 16,
    }}
  >
    <input
      type="text"
      placeholder="Search customer, phone or order ID"
      value={orderSearch}
      onChange={(e) => setOrderSearch(e.target.value)}
      style={{ padding: 10, minWidth: 220, flex: 1 }}
    />

    <select
      value={orderStatusFilter}
      onChange={(e) => setOrderStatusFilter(e.target.value)}
      style={{ padding: 10 }}
    >
      <option value="All">All statuses</option>
      <option value="Pending">Pending</option>
      <option value="Processing">Processing</option>
      <option value="Shipped">Shipped</option>
      <option value="Delivered">Delivered</option>
      <option value="Cancelled">Cancelled</option>
    </select>

    <button
      type="button"
      style={buttonStyle}
      disabled={ordersLoading}
      onClick={loadOrders}
    >
      {ordersLoading ? "Loading..." : "Refresh Orders"}
    </button>
  </div>

  {ordersLoading ? (
    <p>Loading orders...</p>
  ) : (
    <table
      style={{
        width: "100%",
        borderCollapse: "collapse",
        minWidth: 750,
      }}
    >
      <thead>
        <tr>
          <th style={{ padding: 10, textAlign: "left" }}>Order ID</th>
          <th style={{ padding: 10, textAlign: "left" }}>Customer</th>
          <th style={{ padding: 10, textAlign: "left" }}>Phone</th>
          <th style={{ padding: 10, textAlign: "left" }}>Address</th>
          <th style={{ padding: 10, textAlign: "left" }}>Total</th>
          <th style={{ padding: 10, textAlign: "left" }}>Date</th>
          <th style={{ padding: 10, textAlign: "left" }}>Status</th>
        </tr>
      </thead>

      <tbody>
        {orders
          .filter((order) => {
            const query = orderSearch.trim().toLowerCase();

            const matchesSearch =
              !query ||
              String(order.id ?? "").toLowerCase().includes(query) ||
              String(order.customer_name ?? "").toLowerCase().includes(query) ||
              String(order.phone ?? "").toLowerCase().includes(query);

            const matchesStatus =
              orderStatusFilter === "All" ||
              order.status === orderStatusFilter;

            return matchesSearch && matchesStatus;
          })
          .map((order) => (
            <tr key={order.id}>
              <td style={{ padding: 10, borderTop: "1px solid #e2e8f0" }}>
                {String(order.id).slice(0, 8)}
              </td>

              <td style={{ padding: 10, borderTop: "1px solid #e2e8f0" }}>
                {order.customer_name}
              </td>

              <td style={{ padding: 10, borderTop: "1px solid #e2e8f0" }}>
                {order.phone}
              </td>

              <td style={{ padding: 10, borderTop: "1px solid #e2e8f0" }}>
                {order.address}
              </td>

             
<td style={{ padding: 10, borderTop: "1px solid #e2e8f0" }}>
  <div>পণ্য: ৳{Number(order.subtotal ?? 0).toLocaleString("en-BD")}</div>
  <div>ডেলিভারি: ৳{Number(order.delivery_charge ?? 120).toLocaleString("en-BD")}</div>
  <strong>
    সর্বমোট: ৳{Number(order.total).toLocaleString("en-BD")}
  </strong>
</td>

              <td style={{ padding: 10, borderTop: "1px solid #e2e8f0" }}>
                {order.created_at
                  ? new Date(order.created_at).toLocaleDateString("en-BD")
                  : "—"}
              </td>

              <td style={{ padding: 10, borderTop: "1px solid #e2e8f0" }}>
                <select
                  value={order.status || "Pending"}
                  disabled={ordersLoading}
                  onChange={(e) =>
                    updateOrderStatus(order.id, e.target.value)
                  }
                  style={{ padding: 8, minWidth: 125 }}
                >
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </td>
            </tr>
          ))}

        {orders.filter((order) => {
          const query = orderSearch.trim().toLowerCase();

          const matchesSearch =
            !query ||
            String(order.id ?? "").toLowerCase().includes(query) ||
            String(order.customer_name ?? "").toLowerCase().includes(query) ||
            String(order.phone ?? "").toLowerCase().includes(query);

          const matchesStatus =
            orderStatusFilter === "All" ||
            order.status === orderStatusFilter;

          return matchesSearch && matchesStatus;
        }).length === 0 && (
          <tr>
            <td colSpan={7} style={{ padding: 16, textAlign: "center" }}>
              No orders found.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  )}
</section>
```
          </>
        )}

        {message && (
          <p
            role="status"
            style={{
              background: "white",
              padding: 14,
              borderRadius: 8,
              marginTop: 18,
              overflowWrap: "anywhere",
            }}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
